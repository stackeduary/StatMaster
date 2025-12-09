# Functional & Non-UI Requirements (`requirements.md`)

This document complements `ui.md` and captures **non-UI** requirements (functional, technical, and architectural) for the men’s slowpitch softball scoring app.

## 1. Tech Stack (Planned)

- **Frontend:** Vue.js + Tailwind CSS.
- **Backend:** FastAPI.
- **Database:** PostgreSQL.
- **In-memory store / cache:** KeyDB.

Further requirements to be detailed as implementation progresses.


## App specific requirements:

- The model diamond on the app should show the batter's number and first and last initials, e.g., '13 BS' at the appropriate the base the runner is on

## League specific rules:

- Each batter begins with a one-and-one count
- Extra innings starts with a man on second
- HBP is not allowed
- 10 players play on defense