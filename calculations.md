# Baseball Statistics PRD: `calculations.md`

This document defines the **core, commonly used baseball player and pitcher statistics** to support future calculation logic. It intentionally **omits advanced sabermetrics** (e.g., wRC+, WAR, FIP, xwOBA) and focuses on traditional box-score stats and a few widely understood rate stats.

All formulas are written in conceptual form, not implementation form (e.g., rounding rules and edge-case handling are left to code design).

---

## 1. Core Counting Stats (Batters)

- **Games Played (`G`)**  
  Number of games in which the player appears.

- **Plate Appearances (`PA`)**  
  Total completed batting turns:  
  `PA = AB + BB + HBP + SF + SH + other rule-based appearances`

- **At Bats (`AB`)**  
  Plate appearances **excluding** walks, hit-by-pitch, sacrifices, catcher interference, etc.

- **Hits (`H`)**  
  Any fair ball allowing the batter to reach at least first base **without** an error or fielder's choice.

- **Singles (`1B`)**  
  Hits where batter safely reaches first base only.  
  `1B = H − 2B − 3B − HR`

- **Doubles (`2B`)**  
  Hits where batter safely reaches second base.

- **Triples (`3B`)**  
  Hits where batter safely reaches third base.

- **Home Runs (`HR`)**  
  Hits where batter scores on the play.

- **Runs (`R`)**  
  Times the player safely crosses home plate and scores.

- **Runs Batted In (`RBI`)**  
  Runs that score as a direct result of the batter's plate appearance (subject to official scoring rules).

- **Walks / Base on Balls (`BB`)**  
  Plate appearances ending in a four-ball walk (unintentional and intentional).

- **Intentional Walks (`IBB`)**  
  Subset of `BB` where walk is awarded intentionally.

- **Hit by Pitch (`HBP`)**  
  Plate appearances where batter is awarded first base after being hit by a pitch.

- **Strikeouts (`SO` or `K`)**  
  Plate appearances ending in strike three.

- **Stolen Bases (`SB`)**  
  Successful advances to the next base while ball is not in play and without benefit of a hit or error.

- **Caught Stealing (`CS`)**  
  Attempts to steal where runner is put out.

- **Sacrifice Flies (`SF`)**  
  Fly-ball outs where a run scores and batter is credited with a sacrifice fly.

- **Sacrifice Hits / Bunts (`SH`)**  
  Bunts where batter is sacrificed to advance a runner.

- **Total Bases (`TB`)**  
  Weighted total of bases from hits:  
  `TB = 1B + 2×2B + 3×3B + 4×HR`

---

## 2. Core Rate Stats (Batters)

- **Batting Average (`AVG` or `BA`)**  
  Measures hits per at-bat:  
  `BA = H / AB`  
  *Defined only when `AB > 0`.*

- **On-Base Percentage (`OBP`)**  
  Measures how often a batter reaches base safely:  
  `OBP = (H + BB + HBP) / (AB + BB + HBP + SF)`  
  *Defined only when denominator > 0.*

- **Slugging Percentage (`SLG`)**  
  Measures power via bases per at-bat:  
  `SLG = TB / AB`  
  *Defined only when `AB > 0`.*

- **On-base Plus Slugging (`OPS`)**  
  Simple combination of on-base and slugging:  
  `OPS = OBP + SLG`

- **Strikeout Rate (`K%` or `SO%`)**  
  Percentage of plate appearances ending in strikeout:  
  `K% = SO / PA`

- **Walk Rate (`BB%`)**  
  Percentage of plate appearances ending in walk:  
  `BB% = BB / PA`

- **Stolen Base Percentage (`SB%`)**  
  Success rate on steal attempts:  
  `SB% = SB / (SB + CS)`  
  *Defined only when `SB + CS > 0`.*

---

## 3. Core Counting Stats (Pitchers)

- **Games Pitched (`G`)**  
  Number of games in which the pitcher appears.

- **Games Started (`GS`)**  
  Subset of `G` where pitcher is the starting pitcher.

- **Innings Pitched (`IP`)**  
  Total outs recorded divided by 3.  
  Stored either as:
  - Decimal (e.g., 5.2 = 5 and 2/3 innings), or  
  - Outs (`outs_pitched`) for precise calculation, then `IP = outs_pitched / 3`.

- **Batters Faced (`BF`)**  
  Total plate appearances against the pitcher.

- **Hits Allowed (`H`)**  
  Hits surrendered by the pitcher.

- **Runs Allowed (`R`)**  
  Total runs scored by opponents while this pitcher is in the game.

- **Earned Runs (`ER`)**  
  Subset of `R` that are charged as earned to the pitcher (no major assistance from errors or passed balls, per scoring rules).

- **Home Runs Allowed (`HR`)**  
  Home runs given up by the pitcher.

- **Walks Allowed (`BB`)**  
  Base on balls issued by the pitcher.

- **Strikeouts (`SO` or `K`)**  
  Outs recorded via strikeout by the pitcher.

- **Hit Batters (`HBP`)**  
  Batters awarded first base after being hit by a pitch from this pitcher.

- **Wild Pitches (`WP`)**  
  Pitches that are too high/low/wide for the catcher to handle with ordinary effort, allowing runners to advance (scorer judgment).

- **Balks (`BK`)**  
  Illegal motions by the pitcher with runners on base, advancing runners.

- **Saves (`SV`)**  
  Credited when a relief pitcher finishes a game under specific conditions while maintaining the lead.

- **Blown Saves (`BS`)**  
  Relief opportunities where the pitcher loses a lead in a save situation.

- **Wins (`W`)**  
  Games in which pitcher is the pitcher of record when team takes a lead it never relinquishes.

- **Losses (`L`)**  
  Games in which pitcher is the pitcher of record when opponents take a lead they never relinquish.

---

## 4. Core Rate Stats (Pitchers)

- **Earned Run Average (`ERA`)**  
  Earned runs allowed per 9 innings pitched:  
  `ERA = (ER × 9) / IP`  
  - Use `IP` in innings; ideally calculate from outs to avoid rounding errors.  
  - Only defined when `IP > 0`.

- **Walks plus Hits per Inning Pitched (`WHIP`)**  
  Base runners allowed per inning (walks + hits):  
  `WHIP = (BB + H) / IP`  
  *Defined only when `IP > 0`.*

- **Strikeouts per 9 Innings (`K/9`)**  
  `K/9 = (SO × 9) / IP`

- **Walks per 9 Innings (`BB/9`)**  
  `BB/9 = (BB × 9) / IP`

- **Home Runs per 9 Innings (`HR/9`)**  
  `HR/9 = (HR × 9) / IP`

- **Strikeout-to-Walk Ratio (`K/BB`)**  
  `K/BB = SO / BB`  
  *Defined only when `BB > 0`.*

---

## 5. Fielding / Defensive Basics

(Include only the most standard counting stats; advanced fielding metrics are omitted.)

- **Putouts (`PO`)**  
  Outs recorded by a fielder catching a ball or tagging a runner.

- **Assists (`A`)**  
  Fielders who touch the ball prior to a putout.

- **Errors (`E`)**  
  Misplays that prolong an at-bat or allow runners to advance when an average fielder would have recorded an out.

- **Chances / Total Chances (`TC`)**  
  Opportunities to make a play:  
  `TC = PO + A + E`

- **Fielding Percentage (`FPCT` or `FLD%`)**  
  Basic measure of error avoidance:  
  `FPCT = (PO + A) / (PO + A + E)`  
  *Defined only when `PO + A + E > 0`.*

---

## 6. Implementation Notes & Assumptions

- **Rounding & Display**  
  - Typical displays:  
    - `BA`, `OBP`, `SLG`, `OPS`, `WHIP` → 3 decimal places (e.g., .275, .345, 1.105, 1.23).  
    - `ERA`, `K/9`, `BB/9`, `HR/9` → 2 decimal places.
  - Underlying calculations should retain more precision and round only for display.

- **Division-by-zero Handling**  
  - If any denominator is `0`, result should be `null`/`undefined` (or a sentinel) rather than `0`, unless we explicitly decide otherwise in implementation.

- **Data Model Expectations**  
  - Batting stats will likely be computed per:  
    - Single game, series, season, and career.  
  - Pitching stats will follow the same levels.  
  - `outs_pitched` is recommended internally; convert to `IP` only for display and user-facing formulas.

- **Scope Deliberately Excluded (for now)**  
  - Advanced sabermetric stats: WAR, WAA, wOBA, wRC+, OPS+, FIP, xFIP, etc.  
  - Park/era-adjusted stats.  
  - Batted-ball profile metrics (GB%, FB%, LD%).

This document should be treated as the **source of truth for variable names and formulas** for basic baseball calculations in this project.
