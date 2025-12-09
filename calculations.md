# Men’s Slowpitch Softball Statistics PRD: `calculations.md`

This document defines the **core statistics and formulas for men’s slowpitch softball** used by this app. It is intentionally focused on the **simplest, most common stats** a recreational slowpitch team cares about.

All formulas are written conceptually (rounding, null-handling, and edge cases are left to implementation). This file should be treated as the **source of truth for stat names and formulas**.

---

## 1. Core Counting Stats (Batters)

These are the basic per-player counting stats tracked by the scorer during and after each game.

- **Games Played (`G`)**  
  Number of games in which the player appears for at least one plate appearance or defensive inning.

- **Plate Appearances (`PA`)**  
  Total completed batting turns:  
  `PA = AB + BB + HBP + other rule-based appearances (league-specific)`

- **At Bats (`AB`)**  
  Plate appearances **excluding** walks and hit-by-pitch.  
  (Sacrifice bunts/flies are rare in men’s slowpitch and can be folded into outs; no special stat needed.)

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
  Hits where batter scores on the play (over-the-fence or inside-the-park, per league scoring rules).

- **Runs (`R`)**  
  Times the player safely crosses home plate and scores.

- **Runs Batted In (`RBI`)**  
  Runs that score as a direct result of the batter's plate appearance (subject to league/scorekeeper rules).

- **Walks (`BB`)**  
  Plate appearances ending in a four-ball walk (including intentional walks if your league uses them; the app does not need a separate `IBB` stat).

- **Hit by Pitch (`HBP`)**  
  Plate appearances where batter is awarded first base after being hit by a pitch.

- **Strikeouts (`SO` or `K`)**  
  Plate appearances ending in strike three (swinging, looking, or league-specific courtesy-strike rules).

- **Total Bases (`TB`)**  
  Weighted total of bases from hits:  
  `TB = 1B + 2×2B + 3×3B + 4×HR`

> **Deliberately not tracked for slowpitch:** Stolen bases (`SB`), caught stealing (`CS`), sacrifice bunts/flies as separate stats. Most men’s slowpitch leagues either disallow or rarely use these; they would add complexity for little benefit.

---

## 2. Core Rate Stats (Batters)

These are the primary **performance metrics** for hitters in men’s slowpitch.

- **Batting Average (`AVG` or `BA`)**  
  Measures hits per at-bat:  
  `BA = H / AB`  
  *Defined only when `AB > 0`.*

- **On-Base Percentage (`OBP`)**  
  Measures how often a batter reaches base safely:  
  `OBP = (H + BB + HBP) / (AB + BB + HBP)`  
  *Defined only when denominator > 0.*  
  (Sacrifice flies are not broken out as a separate stat in this app.)

- **Slugging Percentage (`SLG`)**  
  Measures power via bases per at-bat:  
  `SLG = TB / AB`  
  *Defined only when `AB > 0`.*

- **On-base Plus Slugging (`OPS`)**  
  Combination of on-base and power:  
  `OPS = OBP + SLG`

- **Strikeout Rate (`K%`)**  
  Percentage of plate appearances ending in strikeout:  
  `K% = SO / PA`  
  *Defined only when `PA > 0`.*

- **Walk Rate (`BB%`)**  
  Percentage of plate appearances ending in a walk:  
  `BB% = BB / PA`  
  *Defined only when `PA > 0`.*

These are the main per-player rate stats surfaced in the UI and reports.

---

## 3. Team-Level Game Stats

Most teams care about **scoreboard-style stats** by game and season, not detailed pitcher lines. This app focuses on simple team-level metrics.

- **Runs Scored (`RS`)**  
  Total runs scored by the team in a game (or across games).

- **Runs Allowed (`RA`)**  
  Total runs the opponents score against this team in a game (or across games).

- **Run Differential (`RD`)**  
  Measures overall scoring margin:  
  `RD = RS − RA`

- **Games Won (`W`)**  
  Games where this team finishes with more runs than the opponent.

- **Games Lost (`L`)**  
  Games where this team finishes with fewer runs than the opponent.

- **Games Tied (`T`)** (optional, league-specific)  
  Games ending with equal runs.

- **Winning Percentage (`WIN%`)**  
  `WIN% = (W + 0.5 × T) / (W + L + T)`  
  If ties are not tracked, use `WIN% = W / (W + L)`.

- **Runs Per Game (`R/G`)**  
  Average runs scored per game:  
  `R/G = RS / G_team`  
  where `G_team` is number of games played by the team.

- **Runs Allowed Per Game (`RA/G`)**  
  `RA/G = RA / G_team`

> Note: We do **not** track saves, blown saves, pitcher wins/losses, or pitcher WHIP/K/9-style stats; these are overkill for most slowpitch teams.

---

## 4. Optional Pitching and Defensive Stats (Simplified)

Men’s slowpitch often uses a single primary pitcher and does not emphasize detailed pitching metrics. However, some leagues/teams may still want a basic view.

The app may optionally support:

- **Innings Pitched (`IP`)**  
  Total outs recorded by a pitcher divided by 3.  
  Implementation can track `outs_pitched` and present `IP = outs_pitched / 3`.

- **Runs Allowed by Pitcher (`R_p`)**  
  Runs scored while this pitcher is in the game.

- **Earned Runs by Pitcher (`ER_p`)**  
  Subset of runs charged as earned to the pitcher (if the league or team wants to track errors vs earned runs).

- **Earned Run Average (`ERA`)** *(optional)*  
  `ERA = (ER_p × 7) / IP` or `(ER_p × 9) / IP` depending on official game length.  
  The app should pick one convention and use it consistently (7 for typical slowpitch games is acceptable).

Defensive team stats can be kept simple:

- **Errors (`E`)**  
  Misplays that extend an at-bat or allow runners to advance when an average fielder would have recorded an out.

If we track `E` at the team level, it can be displayed with the scoreboard totals (`R`, `H`, `E`). Individual fielder stats (putouts, assists) are **not required** for this app.

---

## 5. Implementation Notes & Assumptions

- **Rounding & Display**  
  - Typical displays:  
    - `BA`, `OBP`, `SLG`, `OPS` → 3 decimal places (e.g., .650, .720, 1.350).  
    - `ERA`, `R/G`, `RA/G` → 2 decimal places.  
  - Internally, retain more precision and round only for display.

- **Division-by-zero Handling**  
  - If any denominator is `0`, the stat should be represented as `null`/`undefined` (or a sentinel) rather than `0`, unless we explicitly define a different convention.

- **Data Model Expectations**  
  - Batting stats will typically be computed per:  
    - Single game, season, and career for each player.  
  - Team stats will be computed both per game and aggregated by season.

- **Deliberately Excluded for Slowpitch**  
  - Stolen base metrics (`SB`, `CS`, `SB%`).  
  - Detailed pitcher stats such as `WHIP`, `K/9`, `BB/9`, `HR/9`, `K/BB`.  
  - Saves, blown saves, and individual pitcher wins/losses.  
  - Advanced sabermetric stats of any kind.

