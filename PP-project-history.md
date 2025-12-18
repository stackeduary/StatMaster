# StatMaster Project History

## 2024-12-18 - Supabase Backend & Pitcher Tracking

### Checkpoint 4: Pitcher Selection and Stats Tracking

**Implemented by:** Claude Opus 4.5

**What was added:**
- Pitcher selection for both teams during game setup
- Real-time pitching stats tracking (IP, H, R, ER, BB, K, HR, BF)
- Pitcher display in score strip during live scoring
- "View Pitching Stats" modal accessible from game menu
- Fixed base runner placement for doubles (batter on 2nd) and triples (batter on 3rd)

**Database changes (Supabase):**
- Added `my_pitcher_id` and `opponent_pitcher_name` columns to `games` table
- Created `pitching_stats` table for tracking pitcher performance

---

### Checkpoint 3: Supabase Integration

**Implemented by:** Claude Opus 4.5

**What was added:**
- Connected frontend to Supabase PostgreSQL backend
- Migrated from npm to yarn package manager
- Deployed frontend to Netlify (https://statmaster.netlify.app)
- All data now persists to Supabase database

**Database tables created:**
- `teams` - Team information
- `players` - Player rosters with team relationships
- `games` - Game state and scores
- `plays` - Play-by-play records
- `pitching_stats` - Pitcher performance tracking

**Files created/modified:**
- `src/lib/supabase.js` - Supabase client configuration
- `src/stores/gameStore.js` - Migrated to async Supabase operations
- `.env` - Environment variables for Supabase credentials
- `public/_redirects` - SPA routing for Netlify

**Environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Deployment:**
- Frontend: https://statmaster.netlify.app
- Backend: Supabase (project: StatMaster)

---

## 2024-12-18 - Light/Dark Mode Toggle Added

### Checkpoint 2: Theme System Implementation

**Implemented by:** Claude Opus 4.5

**What was added:**
- Global light/dark mode toggle on every screen
- Theme persists in localStorage
- Respects system preference on first load
- Smooth theme transitions

**Mobile optimizations added:**
- Prevented pull-to-refresh interference
- Prevented text selection on buttons (but allowed in inputs)
- Safe area padding for notched phones (iPhone X+)
- Prevented zoom on input focus (iOS)
- Added `active:scale-95` feedback on buttons for tactile response

**Files created:**
- `src/composables/useTheme.js` - Theme state management
- `src/components/ThemeToggle.vue` - Sun/moon toggle button

**All screens updated with dark mode support:**
- Games List, Game Setup, Live Scoring, Game Summary
- Stats, Teams, More views
- All modals and bottom sheets

---

## 2024-12-17 - Initial UI Implementation

### Checkpoint 1: Vue.js + Tailwind CSS Frontend Created

**Implemented by:** Claude Opus 4.5

**What was built:**
- Complete Vue.js 3 frontend with Vite build system
- Tailwind CSS v4 for styling
- Vue Router for navigation

**Screens implemented:**
1. **Games List (Home)** - Shows today's games and recent results
2. **Game Setup** - Configure game info, teams, and lineups before scoring
3. **Live Scoring** - Core scoring interface with:
   - Base diamond visualization showing runners (number + initials per requirements)
   - Ball/strike/out count display (starts at 1-1 per league rules)
   - Large tap targets for hit outcomes (1B, 2B, 3B, HR)
   - Out buttons (K, GO, FO, LO)
   - Other plays (BB, E, FC, SAC)
   - Play-by-play log
   - Undo functionality
4. **Game Summary** - Box score with line score and batting stats
5. **Stats View** - Team and player statistics
6. **Teams Management** - Roster management
7. **More Menu** - Settings and app info

**Key features:**
- Mobile-first design optimized for phone use
- Large touch targets (min 44px)
- High contrast for outdoor visibility
- Bottom navigation bar
- Dark theme for live scoring screen
- League-specific rules implemented:
  - 1-1 starting count
  - Extra innings runner on second (after 7th)
  - 10 players on defense

**Tech stack:**
- Vue.js 3.5 with Composition API
- Vite 7
- Tailwind CSS 4
- Vue Router 4
- @vueuse/core

**Project location:** `/home/bill/Documents/StatMaster/statmaster/`

**To run:**
```bash
cd statmaster
yarn dev
```

**Next steps:**
- ~~Connect to FastAPI backend~~ → Using Supabase instead
- ~~Implement data persistence~~ → Done (Checkpoint 3)
- Add authentication
- ~~Refine runner advancement logic~~ → Done (Checkpoint 4)
- Add substitution management
- Add batting stats tracking
