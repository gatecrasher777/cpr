const csv = require('csv-parser');
const fs = require('fs');

const election = process.argv[2];

try{
	fs.unlinkSync(`./cpr_${election}.db`);
} catch(e) {}

const db = require('better-sqlite3')(`./cpr_${election}.db`);

let dbCreate = function() {
    let create = `
        CREATE TABLE "candidate" (
			"id" INTEGER NOT NULL,
			"onsid" VARCHAR(9) NOT NULL DEFAULT '',
            "constituency" TEXT NOT NULL DEFAULT '',
			"partycode" VARCHAR(4) NOT NULL DEFAULT '',
			"partyname" TEXT NOT NULL DEFAULT '',
			"name" TEXT NOT NULL DEFAULT '',
			"validvotes" INTEGER NOT NULL DEFAULT 0,
			"ctotal" INTEGER NOT NULL DEFAULT 0,
			"atotal" INTEGER NOT NULL DEFAULT 0,
			"adjusted" INTEGER NOT NULL DEFAULT 0,
			"elected" INTEGER NOT NULL DEFAULT 0,
			"eliminated" INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY ("id")
        );
  	`;
    db.exec(create);
}

db.pragma('journal_mode = WAL');

dbCreate();

let sql = {
	add : db.prepare(`
		INSERT OR IGNORE INTO candidate
		(onsid,constituency,partycode,partyname,name,validvotes)
		VALUES
		(:onsid,:constituency,:partycode,:partyname,:name,:validvotes);
	`),
	constituencies : db.prepare(`
		SELECT onsid
		FROM candidate
		GROUP BY onsid;
	`),
	totalvotes : db.prepare(`
		SELECT SUM(validvotes) AS total
		FROM candidate;
	`),
	cvotes : db.prepare(`
		SELECT SUM(validvotes) AS total
		FROM candidate
		WHERE onsid = :onsid;
	`),
	setcvotes: db.prepare(`
		UPDATE candidate
		SET ctotal = :ctotal,
		atotal = :ctotal
		WHERE onsid = :onsid;
	`),
	start : db.prepare(`
		UPDATE candidate
		SET adjusted = validvotes;
	`),
	elect : db.prepare(`
		UPDATE candidate
		SET elected = 1
		WHERE id = :id;
	`),
	eliminate : db.prepare(`
		UPDATE candidate
		SET eliminated = 1
		WHERE id = :id;
	`),
	getparty: db.prepare(`
		SELECT *
		FROM candidate
		WHERE elected = 0
		AND eliminated = 0
		AND partycode = :partycode
		AND partycode != 'IND'
		AND onsid != :onsid;
	`),
	getother: db.prepare(`
		SELECT *
		FROM candidate
		WHERE elected = 0
		AND eliminated = 0
		AND partycode != :partycode
		AND onsid != :onsid;
	`),
	eliminations: db.prepare(`
		SELECT *,
		(100.0 * adjusted / atotal) AS pc
		FROM candidate
		WHERE elected = 0
		AND eliminated = 0
		AND onsid = :onsid
		ORDER BY adjusted DESC;
	`),
	electone: db.prepare(`
		SELECT *,
		(100.0 * adjusted / atotal) AS pc
		FROM candidate
		WHERE elected = 0
		AND eliminated = 0
		ORDER BY pc DESC
		LIMIT 1;
	`),
	candidatesleft: db.prepare(`
		SELECT COUNT(*) AS Left
		FROM candidate
		WHERE eliminated = 0
		AND onsid = :onsid;
	`),
	retotal: db.prepare(`
		UPDATE candidate
		SET atotal = atotal + :adjust
		WHERE onsid = :onsid
	`),
	adjust: db.prepare(`
		UPDATE candidate
		SET adjusted = adjusted + :adjust
		WHERE id = :id
	`),
	constituencyresult: db.prepare(`
		SELECT *
		FROM candidate
		WHERE onsid = :onsid
		ORDER BY validvotes DESC;
	`),
	summary: db.prepare(`
		SELECT partyname,
		SUM(validvotes) AS votes,
		SUM(elected) AS seats,
		CASE WHEN b.FPTP IS NULL THEN 0 ELSE b.FPTP END AS FPTP
		FROM candidate AS a
		LEFT JOIN (
			SELECT partycode, COUNT(partycode) AS FPTP
			FROM (
				SELECT max(c.Validvotes), b.partycode
				FROM candidate AS c
				LEFT JOIN candidate AS b ON c.onsid = b.onsid AND c.validvotes = b.validvotes
				GROUP BY c.onsid
			)
			GROUP BY partycode
		) AS b ON a.partycode = b.partycode
		GROUP BY a.partycode
		ORDER BY votes DESC;
	`)
};

let app = {
	totalVotes : 0,
	count: 0,
	constituencies: [],
	allocating: true,
	lf : fs.openSync(`./${election}.txt`,'w')
}

// read csv and convert to db
fs.createReadStream(`${election}.csv`)
  .pipe(csv())
  .on('data', (row) => {
    sql.add.run(row);
  })
  .on('end', () => {
    app.log(`Election ${election} under CPR rules`);
	app.main();
  });

// Main method
app.main = function() {
	app.totalVotes = sql.totalvotes.get().total;
	app.log(`total valid votes: ${app.totalVotes}`);
	app.constituencies = sql.constituencies.all();
	app.log(`total number of constituencies: ${app.constituencies.length}`);
	sql.start.run();
	app.constituencies.forEach(con=>{
		let ctotal = sql.cvotes.get({
			onsid: con.onsid
		}).total;
		sql.setcvotes.run({
			ctotal: ctotal,
			onsid: con.onsid
		});
	});
	app.log(`Ordinary seat allocation (quotas & transfers)`)
	while (app.allocating) {
		let elected = sql.electone.get();
		(elected) ?	app.electedProcess(elected) : app.allocating = false;
	}
	app.log('Seat allocations completed.')
	app.electionSummary();
	fs.closeSync(app.lf);
}

// Elect the candidate with the highest percentage of adjusted constituency votes.
// Make up the shortfall between votes required vs votes obtained.
app.electedProcess = function(elected) {
	sql.elect.run(elected);
	app.count++;
	app.log(`-------------------------------------------------------------------------------------------------`);
	app.log(`${app.count} ${elected.name} (${elected.
		partycode}) is elected for ${elected.constituency} (${elected.
			adjusted.toFixed(2)}).`);
	let result = sql.constituencyresult.all(elected);
	app.log(`${elected.constituency} Total votes: cast: ${elected.ctotal} evaluated: ${elected.
		atotal.toFixed(2)} final: ${elected.ctotal}`);
	app.log(`  ${'Candidate'.padEnd(30,' ')} ${'Prty'.padStart(4)} ${'Votes Cast'.
		padStart(20,' ')} ${'Evaluation'.padStart(20,' ')} ${'Final'.padStart(15,' ')}`);
	result.forEach(row=>{
		let prefix = ' ';
		if (elected.name === row.name) prefix = '*';
		app.log(`${prefix} ${row.name.padEnd(30,' ')} ${row.partycode.padStart(4)} ${row.
			validvotes.toFixed(0).padStart(10,' ')} (${((100.0*row.
				validvotes/row.ctotal).toFixed(2)+'%').padStart(7)}) ${row.
					adjusted.toFixed(2).padStart(10,' ')} (${((100.0*row.
						adjusted/row.atotal).toFixed(2)+'%').padStart(7)}) ${prefix==='*' ?
							row.ctotal.toFixed(0).padStart(8,' ')+' (100%)' :
							0.0.toFixed(0).padStart(8,' ')+' (  0%)'}`);
	});
	app.log(`-------------------------------------------------------------------------------------------------`);
	app.redistribute(elected.adjusted-elected.ctotal,elected);
	let eliminations = sql.eliminations.all(elected);
	eliminations.forEach(eliminated=>app.eliminatedProcess(eliminated,true));
}

// Eliminate a losing candidate and redistribute losing votes
app.eliminatedProcess = function(eliminated,forced = false) {
	let left = sql.candidatesleft.get(eliminated).Left - 1;
	if (left || forced) {
		sql.eliminate.run(eliminated);
		app.redistribute(eliminated.adjusted,eliminated);
	} else {
		app.electedProcess(eliminated);
	}
}

// redistribute votes from candidate (or to candidate if amount is negative)
// first to party candidates and if not fully distributed to all candidates
app.redistribute = function(amount, cand) {
	let prefix = 'Losing votes';
	let tofrom = 'to';
	let sign = 1;
	if (amount<0) {
		prefix = 'Vote shortfall';
		tofrom = 'from';
		sign = -1;
	}
	let party = sql.getparty.all(cand);
	let remaining = app.transfer(amount, cand, party);
	let actual = amount - remaining;
	if (Math.abs(actual)>0.005) app.log(`${prefix} (${(sign * actual).toFixed(2)}) for ${cand.
		name} (${cand.partycode}) transferred ${tofrom} ${party.length} other party candidates.`);
	if (Math.abs(remaining)>0.005) {
		let other = sql.getother.all(cand);
		let final = app.transfer(remaining,cand,other);
		actual = remaining - final;
		if (actual !== 0) app.log(`${prefix} (${(sign * actual).toFixed(2)}) for ${cand.name} (${cand.
			partycode}) transferred ${tofrom} ${other.length} other candidates.`);
	}
}

//transfer amount votes from candidate to others
app.transfer = function(amount,from,to) {
	//nothing to transfer
	if (amount === 0) return 0;
	//nobody to transfer to
	if (!to.length) return amount;
	let actual = 0;
	let toVotes = 0;
	to.forEach(ben=>toVotes+=ben.adjusted);
	to.forEach(ben=>{
		let share = (toVotes) ? amount * ben.adjusted / toVotes : amount / to.length;
		// can't be left with negative votes
		if (( share + ben.adjusted ) < 0) share = -ben.adjusted;
		actual += share;
		sql.adjust.run({
			id: ben.id,
			adjust: share
		});
		sql.retotal.run({
			onsid: ben.onsid,
			adjust: share
		});
	});
	sql.adjust.run({
		id: from.id,
		adjust: -actual
	});
	sql.retotal.run({
		onsid: from.onsid,
		adjust: -actual
	});
	//return amount that was not transferred
	return amount - actual;
}

//party votes/seat summary
app.electionSummary = function() {
	let summary = sql.summary.all();
	app.log(`-------------------------------------------------------------------------------------------------`);
	app.log(`${'Party'.padEnd(50,' ')} ${'Votes'.padStart(10,' ')}  ${'%Share'.
		padStart(7)}  ${'CPR'.padStart(7,' ')}  ${'Seats'.padStart(7)}  ${'FPTP'.
		padStart(7,' ')}  ${'Seats'.padStart(7)} `);
	summary.forEach(party=>{
		app.log(`${party.partyname.padEnd(50,' ')} ${(party.
			votes).toFixed(0).padStart(10,' ')} (${((100*party.
			votes/app.totalVotes).toFixed(2)+'%').padStart(7)}) ${party.
			seats.toFixed(0).padStart(7,' ')} (${((100*party.
			seats/app.constituencies.length).toFixed(2)+'%').padStart(7)}) ${party.
			FPTP.toFixed(0).padStart(7,' ')} (${((100*party.
			FPTP/app.constituencies.length).toFixed(2)+'%').padStart(7)})`);
	});
	app.log(`-------------------------------------------------------------------------------------------------`);
	app.log('CPR homepage : https://github.com/gatecrasher777/cpr');
}

//output to console and file
app.log = function(output) {
	fs.writeSync(app.lf,`\n${output}`,'utf8');
	console.log(output);
}
