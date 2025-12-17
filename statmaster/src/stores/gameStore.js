import { reactive, computed } from 'vue'

// Mock data store - will be replaced with backend API calls
const state = reactive({
  games: [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      time: '7:00 PM',
      myTeam: { name: 'Thunder', score: 0 },
      opponent: { name: 'Lightning', score: 0 },
      field: 'Field 1',
      status: 'upcoming', // upcoming, in_progress, final
      inning: 1,
      isTop: true,
      outs: 0
    }
  ],
  activeGameId: null,
  teams: [
    {
      id: '1',
      name: 'Thunder',
      players: [
        { id: '1', number: '13', firstName: 'Bill', lastName: 'Smith', position: 'SS' },
        { id: '2', number: '7', firstName: 'Mike', lastName: 'Johnson', position: 'CF' },
        { id: '3', number: '22', firstName: 'Dave', lastName: 'Williams', position: '1B' },
        { id: '4', number: '5', firstName: 'Tom', lastName: 'Brown', position: 'C' },
        { id: '5', number: '11', firstName: 'Chris', lastName: 'Davis', position: '3B' },
        { id: '6', number: '33', firstName: 'John', lastName: 'Miller', position: 'LF' },
        { id: '7', number: '8', firstName: 'Steve', lastName: 'Wilson', position: 'RF' },
        { id: '8', number: '15', firstName: 'Dan', lastName: 'Moore', position: '2B' },
        { id: '9', number: '21', firstName: 'Rob', lastName: 'Taylor', position: 'P' },
        { id: '10', number: '44', firstName: 'Jim', lastName: 'Anderson', position: 'EH' }
      ]
    }
  ]
})

// Current game state for live scoring
const currentGame = reactive({
  id: null,
  myTeam: { name: '', score: 0, lineup: [] },
  opponent: { name: '', score: 0, lineup: [] },
  inning: 1,
  isTop: true,
  outs: 0,
  balls: 1, // Starts with 1-1 count per league rules
  strikes: 1,
  bases: { first: null, second: null, third: null },
  currentBatterIndex: 0,
  plays: [],
  inningScores: { away: [], home: [] }
})

export function useGameStore() {
  const games = computed(() => state.games)
  const teams = computed(() => state.teams)
  
  const activeGame = computed(() => 
    state.games.find(g => g.id === state.activeGameId)
  )

  function createGame(gameData) {
    const newGame = {
      id: Date.now().toString(),
      ...gameData,
      status: 'upcoming',
      inning: 1,
      isTop: true,
      outs: 0
    }
    state.games.unshift(newGame)
    return newGame
  }

  function startGame(gameId, myTeamLineup, opponentLineup) {
    const game = state.games.find(g => g.id === gameId)
    if (game) {
      game.status = 'in_progress'
      state.activeGameId = gameId
      
      // Initialize current game state
      currentGame.id = gameId
      currentGame.myTeam = { ...game.myTeam, lineup: myTeamLineup }
      currentGame.opponent = { ...game.opponent, lineup: opponentLineup }
      currentGame.inning = 1
      currentGame.isTop = true
      currentGame.outs = 0
      currentGame.balls = 1
      currentGame.strikes = 1
      currentGame.bases = { first: null, second: null, third: null }
      currentGame.currentBatterIndex = 0
      currentGame.plays = []
      currentGame.inningScores = { away: [0], home: [0] }
    }
    return game
  }

  function recordPlay(playType, details = {}) {
    const play = {
      id: Date.now().toString(),
      type: playType,
      inning: currentGame.inning,
      isTop: currentGame.isTop,
      batter: getCurrentBatter(),
      timestamp: new Date().toISOString(),
      ...details
    }
    
    currentGame.plays.push(play)
    processPlay(play)
    return play
  }

  function processPlay(play) {
    const runsScored = play.runsScored || 0
    
    // Update score
    if (currentGame.isTop) {
      currentGame.opponent.score += runsScored
      currentGame.inningScores.away[currentGame.inning - 1] = 
        (currentGame.inningScores.away[currentGame.inning - 1] || 0) + runsScored
    } else {
      currentGame.myTeam.score += runsScored
      currentGame.inningScores.home[currentGame.inning - 1] = 
        (currentGame.inningScores.home[currentGame.inning - 1] || 0) + runsScored
    }

    // Handle outs
    if (play.outsRecorded) {
      currentGame.outs += play.outsRecorded
      if (currentGame.outs >= 3) {
        endHalfInning()
        return
      }
    }

    // Advance batter (for most plays)
    if (!['ball', 'strike'].includes(play.type)) {
      advanceBatter()
    }

    // Reset count for new batter
    currentGame.balls = 1
    currentGame.strikes = 1
  }

  function advanceBatter() {
    const lineup = currentGame.isTop ? currentGame.opponent.lineup : currentGame.myTeam.lineup
    currentGame.currentBatterIndex = (currentGame.currentBatterIndex + 1) % lineup.length
  }

  function endHalfInning() {
    currentGame.outs = 0
    currentGame.bases = { first: null, second: null, third: null }
    currentGame.balls = 1
    currentGame.strikes = 1
    
    if (currentGame.isTop) {
      currentGame.isTop = false
      // Initialize home half score
      if (!currentGame.inningScores.home[currentGame.inning - 1]) {
        currentGame.inningScores.home[currentGame.inning - 1] = 0
      }
    } else {
      currentGame.isTop = true
      currentGame.inning++
      // Initialize next inning scores
      currentGame.inningScores.away[currentGame.inning - 1] = 0
      
      // Extra innings rule: runner on second
      if (currentGame.inning > 7) {
        const lineup = currentGame.opponent.lineup
        if (lineup.length > 0) {
          // Put last out on second
          currentGame.bases.second = lineup[lineup.length - 1]
        }
      }
    }
    
    // Reset batter index for the team now batting
    currentGame.currentBatterIndex = 0
  }

  function getCurrentBatter() {
    const lineup = currentGame.isTop ? currentGame.opponent.lineup : currentGame.myTeam.lineup
    return lineup[currentGame.currentBatterIndex] || null
  }

  function undoLastPlay() {
    if (currentGame.plays.length > 0) {
      currentGame.plays.pop()
      // In a real app, we'd recalculate state from plays
      // For now, this is a simplified undo
    }
  }

  function updateBases(newBases) {
    currentGame.bases = { ...newBases }
  }

  function endGame() {
    const game = state.games.find(g => g.id === currentGame.id)
    if (game) {
      game.status = 'final'
      game.myTeam.score = currentGame.myTeam.score
      game.opponent.score = currentGame.opponent.score
    }
    state.activeGameId = null
  }

  return {
    games,
    teams,
    activeGame,
    currentGame,
    createGame,
    startGame,
    recordPlay,
    getCurrentBatter,
    undoLastPlay,
    updateBases,
    endGame,
    endHalfInning
  }
}
