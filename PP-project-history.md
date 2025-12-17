# StatMaster Project History

## 2024-12-18 - Light/Dark Mode Toggle Added

### Checkpoint 2: Theme System Implementation

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
npm run dev
```

**Next steps:**
- Connect to FastAPI backend
- Implement data persistence
- Add authentication
- Refine runner advancement logic
- Add substitution management
