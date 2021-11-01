# CPR

## Introduction

First Past The Post (FPTP) constituency-based electoral systems (UK & USA) are simple, archaic, easy to administer, winner takes all seat allocations that over-represent large national parties and regional parties and seriously under-represent smaller national parties. 

CPR takes FPTP raw results, breathes life into them, and transforms them into a fair, proportional electoral system where every votes counts. 

## CPR Rules 

The steps to allot seats is as follows

### Step 1

Conduct an FPTP election as usual, except that no constituency is automatically declared. Tabulate in csv format:

* (onsid) Constiuecy Identification - In UK this is the ONS ID
* (constituency) Constuency Name 
* (name) Candidate Name
* (partycode) Party Code (up to 4 characters) ie CON, LAB, LD, GRN etc. IND inidcates an independent candidate
* (partyname) Party Name 
* (validvotes) Valid votes cast for the candidate

### Step 2

Calculate valid votes cast in each constuency. This is the number of votes required to be awarded that constituency.

### Step 3

Initially, let adjusted votes per candidate be equivalent to the valid votes per candidate.

### Step 4 

Declare one constituency; this being the constituency whose leading candidate has the highest proportion of adjusted votes in that contituency compared to candidates in all undeclared constiuencies.

### Step 5

The candidate in the declared constituency with the most adjusted votes is elected. All other candidates in the constituency are eliminated.

### Step 6
If the adjusted votes of the elected candidate is less than the votes required to win the constituency, then:

        i) The shortfall must be transferred from every candidate of the same party in undeclared constituencies.
        ii) If there are no other party candidates remaining, or the winner is an independent, or if not all the
        required votes could be transferred from other party candidates then the shortfall must be proportionally 
        transferred from every other remaining candidate in undeclared constituencies, regardless of party.
        iii) Fractional votes are transferred in proportion to the currently adjusted vote tally of the doner.
  
### Step 7 

For each eliminated candidate, their losing votes 

        i) must be transferred to every other candidate of the same party in undeclared constituencies.
        ii) If there are no other party candidates remaining, or the candidate is an independent, then the votes
        must be transferred to every other remaining candidate in undeclared constituencies, regardless of party.
        iii) Fractional votes are transferred in proportion to the currently adjusted vote tally of the beneficiary.
        
### Step 8

Repeat from Step 4 until all continuencies are declared.

## Notes

From the perspective of a remaining candidate - as another member of your party is elected, you have to contribute some of your votes to make up their shortfall (since an elected candidate needs 100% of the votes cast in their constituency). The more successful other members of your party are the greater the penalty becomes. On the other hand, when a member of your party is eliminated, you receive a share of their losing votes. The less successful other members of your party are, the greater this bonus becomes for you. If at some point, you become the candidate with the greatest proportion of adjusted votes in your constituency compared to all undeclared constituencies, you are elected.  If at some point, one of your rivals in your constituency becomes that person, you are eliminated.

The proportionality of the party seat allocation vs party votes cast is close but not perfect. It would be perfect if all constituencies returned the same number of valid votes. Typically, sizes of constituencies totals can vary widely. For example, those parties (SNP and LAB) who do well in smaller constituencies will get a greater allocation of seats than those parties (CON and LD) whose supporters are concentrated in larger constituencies. By having constituencies of similar size, proportionality in the outcome is improved. 

Every vote counts. When the final constuency is evaluated, the sum of the adjusted votes is equal to the sum of the cast votes. No accumulation or leakage of votes occurs thoughout the process. Every vote has resulted in a candidate being elected, mostly, but not always from the same party that was voted for.

The system is equally fair to independent candidates as it is to party candidates.



## Undestanding the output

Under CPR in 2015UK, the first seat to be declared is Liverpool Walton, with Steve Rotheram (LAB) winning 81.3% of the vote

    -------------------------------------------------------------------------------------------------
    1 Steve Rotheram (LAB) is elected for Liverpool, Walton (31222.00).
    Liverpool, Walton votes cast: 38403 evaluated: 38403.00 final: 38403
    * Steve Rotheram                  LAB      31222 ( 81.30%)   31222.00 ( 81.30%)    38403 (100%)
      Steven Flatman                 UKIP       3445 (  8.97%)    3445.00 (  8.97%)        0 (  0%)
      Norsheen Bhatti                 CON       1802 (  4.69%)    1802.00 (  4.69%)        0 (  0%)
      Jonathan Clatworthy             GRN        956 (  2.49%)     956.00 (  2.49%)        0 (  0%)
      Pat Moloney                      LD        899 (  2.34%)     899.00 (  2.34%)        0 (  0%)
      Alexander Karran                IND         56 (  0.15%)      56.00 (  0.15%)        0 (  0%)
      Jonathan Bishop Dzon            TPP         23 (  0.06%)      23.00 (  0.06%)        0 (  0%)
    -------------------------------------------------------------------------------------------------
    Vote shortfall (7181.00) for Steve Rotheram (LAB) transferred from 630 other party candidates.
    Losing votes (3445.00) for Steven Flatman (UKIP) transferred to 623 other party candidates.
    Losing votes (1802.00) for Norsheen Bhatti (CON) transferred to 646 other party candidates.
    Losing votes (956.00) for Jonathan Clatworthy (GRN) transferred to 572 other party candidates.
    Losing votes (899.00) for Pat Moloney (LD) transferred to 630 other party candidates.
    Losing votes (56.00) for Alexander Karran (IND) transferred to 3789 other candidates.
    Losing votes (23.00) for Jonathan Bishop Dzon (TPP) transferred to 4 other party candidates.

Steve Rotheram requires 38403 votes to be elected, but he only polled 31222, so the shorfall (7181) is transferred from all the Labour candidates in undeclared constiuencies. Their contribution to this win is in proportion to the number of votes they obtained. On average this is 11.4 votes per candidate.  

Votes for losing candidates are transferred to party candidates in undeclared constituencies. They benefit in poroportion to the votes they already have. 

In the case of Alexander Karran, an independent without party affiliation, his 56 votes are transferred to all 3789 candidates in undeclared constituencies. On avarage 0.0148 votes per candidate.

At the end, Steve Rotheram is elected in this constiuency with 100% of the vote, 81.7% coming from this constiuency, 18.3% from Labour candidates elsewhere. All votes for losing candidates have been transferred out to help candidates in other constituencies. No votes are wasted.

Initially, constituency outcomes will favour the candiate who polled the most votes. After 188 declarations, the successes of SNP and the losses of LD have swung the contest in East Dunbartonshire around:

    -------------------------------------------------------------------------------------------------
    189 Jo Swinson (LD) is elected for East Dunbartonshire (25141.78).
    East Dunbartonshire votes cast: 54871 evaluated: 52357.70 final: 54871
      John  Nicolson                  SNP      22093 ( 40.26%)   14954.46 ( 28.56%)        0 (  0%)
    * Jo Swinson                       LD      19926 ( 36.31%)   25141.78 ( 48.02%)    54871 (100%)
      Amanjit  Jhund                  LAB       6754 ( 12.31%)    6216.89 ( 11.87%)        0 (  0%)
      Andrew  Polson                  CON       4727 (  8.61%)    4140.73 (  7.91%)        0 (  0%)
      Ross  Greer                     GRN        804 (  1.47%)    1147.18 (  2.19%)        0 (  0%)
      Wilfred  Arasaratnam           UKIP        567 (  1.03%)     756.65 (  1.45%)        0 (  0%)
    -------------------------------------------------------------------------------------------------
    Vote shortfall (29729.22) for Jo Swinson (LD) transferred from 448 other party candidates.
    Losing votes (14954.46) for John  Nicolson (SNP) transferred to 41 other party candidates.
    Losing votes (6216.89) for Amanjit  Jhund (LAB) transferred to 448 other party candidates.
    Losing votes (4140.73) for Andrew  Polson (CON) transferred to 460 other party candidates.
    Losing votes (1147.18) for Ross  Greer (GRN) transferred to 408 other party candidates.
    Losing votes (756.65) for Wilfred  Arasaratnam (UKIP) transferred to 446 other party candidates.

When the last seat is declared, the initial vote leader's tally is entirely depleted by other successful DUP candidates. But with 32.68% you can hardly argue that the original vote casting demands a DUP winner in Upper Ban.

    -------------------------------------------------------------------------------------------------
    650 Jo-Anne Dobson (UUP) is elected for Upper Bann (18667.99).
    Upper Bann votes cast: 47219 evaluated: 47219.00 final: 47219
      David Simpson                   DUP      15430 ( 32.68%)       0.00 (  0.00%)        0 (  0%)
    * Jo-Anne Dobson                  UUP      13166 ( 27.88%)   18667.99 ( 39.53%)    47219 (100%)
      Catherine Seeley                 SF      11593 ( 24.55%)    6786.67 ( 14.37%)        0 (  0%)
      Dolores Kelly                  SDLP       4238 (  8.98%)   14103.92 ( 29.87%)        0 (  0%)
      Peter Lavery                   APNI       1780 (  3.77%)       0.00 (  0.00%)        0 (  0%)
      Martin Kelly                   CSAP        460 (  0.97%)    4640.72 (  9.83%)        0 (  0%)
      Damien Harte                     WP        351 (  0.74%)    1501.41 (  3.18%)        0 (  0%)
      Amandeep Singh Bhogal           CON        201 (  0.43%)    1518.28 (  3.22%)        0 (  0%)
    -------------------------------------------------------------------------------------------------
    
Note that cast = evaluated = final. A perfect transferance and rebalance of votes over 650 contests.

The Final Seats allocation in 2015 (The last numbers and % in each row is the actual FPTP allocation): 

    Party                                       Votes    %Share           CPR Seats          FPTP Seats
    Conservative                             11299609 ( 36.81%)        221 ( 34.00%)      330 ( 50.77%)
    Labour                                    9347273 ( 30.45%)        213 ( 32.77%)      232 ( 35.69%)
    UK Independence Party                     3881099 ( 12.64%)         87 ( 13.38%)        1 (  0.15%)
    Liberal Democrat                          2415916 (  7.87%)         50 (  7.69%)        8 (  1.24%)
    Scottish National Party                   1454436 (  4.74%)         30 (  4.62%)       56 (  8.62%)
    Green                                     1157630 (  3.77%)         23 (  3.54%)        1 (  0.15%)
    Democratic Unionist Party                  184260 (  0.60%)          5 (  0.77%)        8 (  1.24%)
    Plaid Cymru                                181704 (  0.59%)          6 (  0.92%)        3 (  0.46%)
    Sinn Fein                                  176232 (  0.57%)          4 (  0.62%)        4 (  0.62%)
    Ulster Unionist Party                      114935 (  0.37%)          3 (  0.46%)        2 (  0.31%)
    Independent                                104178 (  0.34%)          1 (  0.15%)        1 (  0.15%)
    Social Democratic and Labour Party          99809 (  0.33%)          2 (  0.31%)        3 (  0.46%)
    Alliance                                    61556 (  0.20%)          2 (  0.31%)        0 (  0.00%)
    Speaker                                     34617 (  0.11%)          1 (  0.15%)        1 (  0.15%)
    Trade Unionist and Socialist Coalition      34061 (  0.11%)          1 (  0.15%)        0 (  0.00%)
    Traditional Unionist Voice                  16538 (  0.05%)          1 (  0.15%)        0 (  0.00%)

## Examples 

Step by Step CPR output is provided for the 2019 UK General Election, 2017 UK General Election and the 2015 UK General Election.

## Install & Run

Clone the package. 

```bash
node index election
```
Where election is the name of the FPTP csv file (without extension) of candidates with the necessary fields. i.e 2019UK, 2017UK, 2015UK (provided) or using your own data.

## Disccusion

Use the discussion tab to discuss this CPR system and electoral systems in general.
