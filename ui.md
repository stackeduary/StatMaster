# UI PRD: Men’s Slowpitch Softball Scoring Web App (`ui.md`)

This PRD defines the **user interface** for a men’s slowpitch softball scoring **web app used on the scorer’s phone**. It is frontend-focused and assumes implementation with **Vue.js** and **Tailwind CSS** (styling can start basic/unstyled and be iterated later).

> Non-UI requirements (backend, data, performance, auth, etc.) are defined separately in `requirements.md`.

---

## 1. Product & UI Goals

- **Purpose:**
  - Allow a scorekeeper to **score live games** directly on their **phone’s web browser**.
  - Provide simple access to **game summaries and stats** after scoring.
- **Primary device:**
  - Mobile phone (portrait orientation first). Tablet and desktop views are secondary.
- **Framework intentions (for later implementation):**
  - Frontend: Vue.js + Tailwind CSS.
  - Backend: FastAPI; DB: Postgres; in-memory store: KeyDB (details in `requirements.md`).

- **UI priorities:**
  - **Fast, low-friction scoring** with big tap targets.
  - **Minimal navigation depth** during scoring; keep all essential controls within one or two taps.
  - **Readable in outdoor light**: high contrast, uncluttered layout.

---

## 2. Target Users & Context of Use

- **Users:**
  - Men’s slowpitch scorekeepers, coaches, or players scoring their own games.
- **Context:**
  - Standing/sitting near the field, using a **phone browser**, possibly with one hand.
  - Limited time between pitches; UI must minimize scrolling and complex dialogs.

---

## 3. High-Level Navigation & Information Architecture

### 3.1 Global Navigation Structure

Because this is **phone-first**, the UI should avoid a heavy desktop-style nav. Instead, use:

- **Top app bar** (per screen):
  - Left: optional back button or menu icon (if needed).
  - Center: screen title (e.g., `Score Game`, `Games`, `Stats`).
  - Right: context-specific action (e.g., `End Game`, `Save`).

- **Bottom navigation bar** (persistent on most screens, hidden on some modals):
  - Tabs (icon + label):
    - `Games` (home) – list of past and upcoming games.
    - `Score` – current/active game scoring (or prompt to start a game).
    - `Stats` – quick access to per-team / per-player stats.
    - `More` – secondary items: Teams, Settings, About.

> Note: On the **live scoring** screen, the bottom nav may optionally be minimized or hidden when scrolling, but still accessible.

### 3.2 Primary Screens

1. **Games List / Home** – starting point, list of games.
2. **Game Setup** – pre-game flow for defining teams, lineups, basic settings.
3. **Scoring Screen (Live Scoring)** – core screen for scoring pitches/at-bats/plays.
4. **Game Summary / Box Score** – post-game overview.
5. **Stats Screens** – per-team, per-player stat summaries.
6. **Teams & Players Management** – simple roster management UI.
7. **Settings / Profile (later login)** – barebones until auth is added.

---

## 4. Screen-by-Screen UI Specifications

### 4.1 Games List / Home Screen

**Entry point:** Bottom nav `Games` tab.

**Goals:**
- Quickly find today’s game or start a new one.
- See recent results (final games) for reference.

**Layout (mobile):**
- **Top app bar:**
  - Title: `Games`.
  - Right action: `+ New Game` icon/button.

- **Content:**
  - **Section: Today / Upcoming**
    - Card-style list of games:
      - Each item shows:
        - Date & time.
        - Opponent/team label (e.g., `My Team vs Opponent`).
        - Status chip: `Upcoming`, `In Progress`, `Final`.
        - Compact score if `In Progress` or `Final` (e.g., `12–9`).
      - Primary tap action:
        - `Upcoming` → `Game Setup` or `Score Game` (depending on setup state).
        - `In Progress` → `Scoring Screen`.
        - `Final` → `Game Summary`.
  - **Section: Recent Games**
    - List of recent final games.
    - Each item: date, opponent, result (`W 12–9`, `L 5–7`).

**Empty states:**
- If no games exist:
  - Centered message: `No games yet.`
  - Primary button: `Create Your First Game` → `Game Setup`.

---

### 4.2 Game Setup Screen

**Purpose:** Configure basic game info and lineups **before** scoring starts.

**Entry points:**
- `+ New Game` on `Games`.
- `Score` tab when no active game exists.

**Layout (stepper-style, but minimal):**
- **App bar:**
  - Back button.
  - Title: `New Game`.

- **Section 1: Game Info**
  - Inputs (stacked vertical):
    - `Date` (defaults to today).
    - `Time` (optional).
    - `My Team` selector (dropdown from teams; simple text if only one team).
    - `Opponent` text input (freeform).
    - `Field` (optional text input).

- **Section 2: Lineups**
  - Two collapsible cards: `My Team Lineup` and `Opponent Lineup`.
  - Each card:
    - `Add Player` button.
    - List items (draggable order if feasible, otherwise up/down arrows):
      - `Jersey #`, `Name`, `Position` (e.g., `C, 1B, OF`), optional `Sub` flag.
    - Tap player row → small form for editing.

- **Primary action:**
  - Sticky bottom bar: `Start Scoring` (primary button). Disabled until minimal required info is filled: `My Team`, `Opponent`, at least one player for `My Team`.

**Validation / UI feedback:**
- Simple inline messages (no heavy dialogs): e.g., `Please add at least one player to your lineup to start scoring.`

---

### 4.3 Live Scoring Screen (Core Screen)

**Most critical screen. Must be optimized for one-hand phone use.**

**Entry points:**
- `Score` tab (if active game exists).
- From `Game Setup` via `Start Scoring`.
- From `Games` list tapping `In Progress` game.

**High-level layout (vertical stack):**

1. **Top Game Bar**
   - Back/close icon (to go back to `Games`), with a confirmation dialog if leaving might discard unsaved actions.
   - Title: `Top 3rd – 1 Out` (dynamic; inning & outs).
   - Right action: `⋮` menu icon with menu items: `End Inning`, `End Game`, `Edit Lineups`.

2. **Score & Inning Summary Strip**
   - Compact horizontal bar showing:
     - `Away Team Name` score.
     - `Home Team Name` score.
     - Inning indicator: `Top 3rd`, `Bottom 4th`, etc.
   - Tapping this opens a **full scoreboard modal** (optional later) with inning-by-inning view.

3. **Base State + Count Panel**

   - **Base state diagram** (centered, above controls):
     - Simple diamond representing bases:
       - Home at bottom, 1B right, 2B top, 3B left.
     - Occupied bases highlighted.
   - **Count and outs row:**
     - E.g., `Balls: ●●○○   Strikes: ●●○   Outs: ✖✖○` (or numeric counters with icons).
   - Tap-to-toggle is **not** primary; count should be primarily updated through scoring actions (but an edit option is available via overflow menu).

4. **Current Batter Panel**

   Located right under the base state/count.

   - Shows:
     - `Current batter name`.
     - Batting order position (e.g., `#5 of 12`).
     - If relevant: simple per-game stat line: `H: 1, AB: 2, RBI: 2`.
   - Arrows or swipe gesture (optional) to review previous / next batters, but main flow is automatic.

5. **Scoring Actions Grid**

   **Large tap targets arranged in a grid**, minimal scrolling required on most phones.

   Suggested layout (2–3 columns of large buttons):

   - **Hit outcomes:**
     - `1B`, `2B`, `3B`, `HR`.
   - **Non-hit outcomes (reaching base):**
     - `Walk`, `HBP`, `Reach on Error`.
   - **Outs:**
     - `Strikeout`, `Ground Out`, `Fly Out` (could also be generic `Out` initially).
   - **Special plays:**
     - `Sac Fly`, `FC` (fielder’s choice), `Double Play` (optional first pass or abstracted behind a `More` button).
   - **Other controls:**
     - `Substitution` button (opens lineup management modal).

   If there are more options than comfortably fit, group under a `More` or `Other` button which opens a sheet with additional play types.

6. **Play-by-Play Log (Bottom Section)**

   - Scrollable list of most recent plays.
   - Each entry:
     - Inning label (e.g., `Top 3rd`).
     - Text description: `Smith singled to center. Runner on 2nd scored.`
   - The log should auto-scroll to the latest play but allow manual scrolling.

7. **Undo / Redo Controls**

   - Fixed at the bottom or integrated as small buttons near the actions grid.
   - Buttons: `Undo` (primary), `Redo` (secondary/optional).
   - Always visible on screen without scrolling.

**Modals / Sheets:**

- **Play Details Sheet:**
  - For complex events from generic buttons like `Out` or `Reach on Error`, open a bottom sheet:
    - Select fielder(s) involved.
    - Confirm number of outs and runner advances.
  - UI must allow quick defaults: pre-filled suggestions so the scorer typically just taps `Save`.

- **Lineup / Substitutions Sheet:**
  - List current batting order.
  - Tap a player to substitute or re-order if allowed.

---

### 4.4 Game Summary / Box Score Screen

**Entry points:**
- From `Games` list (tap `Final` or `In Progress` game).
- From live scoring (`⋮` menu → `Game Summary`).

**Goals:**
- Provide a clean summary of the game in a phone-friendly layout.

**Layout (vertical, scrollable):**

1. **Header**
   - Title: `My Team vs Opponent`.
   - Subheader: `Date`, `Field`, `Status (In Progress / Final)`.

2. **Score Summary Card**
   - Prominent display of final/current score: `My Team 12 – 9 Opponent`.
   - Simple badge for result: `W`, `L`, or `T`.

3. **Inning-by-inning Score (Collapsible Card)**
   - Table-style layout, but responsive:
     - Row 1: `Innings: 1 2 3 4 5 6 7 (… as needed)`.
     - Row 2: `Away runs by inning`.
     - Row 3: `Home runs by inning`.
     - Row 4: totals: `R`, `H`, `E`.
   - On narrow screens, allow horizontal scroll for many innings.

4. **Batting Box Score (Per Team)**

   - Two accordion cards: `My Team Batting`, `Opponent Batting`.
   - Each card:
     - Table: each row is a player.
     - Columns (phone-optimized set):
       - Always show: `Name`, `AB`, `R`, `H`, `RBI`.
       - Expand/collapse or horizontal scroll for extra: `2B`, `3B`, `HR`, `BB`, `SO`, `AVG`, `OBP`, `SLG`, `OPS`.

5. **Pitching Summary (Optional for slowpitch, but available)**
   - Simple card for pitchers with:
     - `Pitcher Name`, `IP`, `R`, `ER`, `H`, `BB`, `SO`, `HR`, `ERA`.

6. **Actions**
   - Buttons at bottom:
     - `Edit Game` (returns to scoring or a dedicated edit flow).
     - `Share / Export` (placeholder for later functionality).

---

### 4.5 Stats Screens

**Entry points:** Bottom nav `Stats` tab; links from Team/Player contexts.

#### 4.5.1 Team Stats Overview

**Layout:**
- App bar: `Stats`.
- Filters at top:
  - `Team` dropdown.
  - `Season` dropdown.
- Content:
  - **Summary tiles** at top (small cards):
    - `Record`, `Runs For`, `Runs Against`.
  - **Player stats list** (batting):
    - Each row: `Player Name`, plus a concise set of stats (e.g., `AVG`, `OBP`, `SLG`, `HR`, `RBI`).
    - Tap row → `Player Detail` stats.

#### 4.5.2 Player Detail Stats

**Layout:**
- App bar: `Player Name`.
- Top summary card:
  - Name, jersey number, primary team.
  - Key stats row: `AVG`, `OBP`, `SLG`, `OPS`.
- Tabs or segmented control (horizontally)
  - `Season Summary`, `Game Log`.

- **Season Summary tab:**
  - Section: batting totals table (e.g., `G`, `PA`, `AB`, `H`, `2B`, `3B`, `HR`, `RBI`, `BB`, `SO`, `SB`, `CS`).

- **Game Log tab:**
  - List of games with per-game batting lines.

---

### 4.6 Teams & Players Management

**Entry points:**
- From `More` tab.
- From Game Setup.

**Teams Screen:**
- List of teams with `Add Team` button.
- Each list item: `Team Name`, optional league.
- Tapping opens `Team Detail` (roster view).

**Team Detail / Roster Screen:**
- Header: `Team Name`.
- Button: `Add Player`.
- List of players:
  - `Name`, `Jersey #`, primary position.
- Tap to edit player info.

**Player Edit/Add Modal:**
- Fields: `Name`, `Jersey #`, `Positions`, optional notes.

---

### 4.7 Settings / Profile (Minimal for Now)

**Until login is implemented**, this area is lightweight.

- Accessible via `More` tab.
- Items: `App Info`, `Data & Storage` (e.g., hinting about sync/backups once backend is wired), `Feedback`.

---

## 5. Interaction & UX Guidelines

- **Touch targets:**
  - Minimum height ~44px for primary buttons and list items.
- **Scrolling:**
  - Minimize vertical scroll on live scoring.
  - Use sticky elements (e.g., top bar, Undo) where helpful.
- **Error handling (UI only):**
  - Inline messages; avoid modal errors during scoring unless critical.
- **Offline hints (visual only):**
  - Optional banner for connection status (details in `requirements.md`).

---

## 6. Styling Notes (Tailwind-Oriented, Basic For Now)

- **Initial styling goals:**
  - Use neutral, basic Tailwind classes for spacing, typography, and layout.
  - Polygon basepaths and icons can be simple placeholders at first.
- **Responsiveness:**
  - Primary layout: `w-full` mobile width, single-column layout.
  - Later: add `sm:`, `md:` responsive tweaks for tablets/desktop.

---

## 7. Out of Scope for `ui.md`

- Authentication and login flows.
- Data modeling, API endpoints, and persistence behavior.
- Performance constraints and concurrency (e.g., multi-device scoring).

All such details will go into `requirements.md`.
