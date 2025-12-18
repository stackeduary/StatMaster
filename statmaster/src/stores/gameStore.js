import { reactive, computed, ref } from 'vue'
import { supabase } from '../lib/supabase'

// Reactive state
const state = reactive({
  games: [],
  activeGameId: null,
  teams: [],
  loading: false,
  error: null
})

// Current game state for live scoring
const currentGame = reactive({
  id: null,
  myTeam: { name: '', score: 0, lineup: [], pitcher: null },
  opponent: { name: '', score: 0, lineup: [], pitcher: null },
  inning: 1,
  isTop: true,
  outs: 0,
  balls: 1, // Starts with 1-1 count per league rules
  strikes: 1,
  bases: { first: null, second: null, third: null },
  currentBatterIndex: 0,
  plays: [],
  inningScores: { away: [], home: [] },
  pitchingStats: { myTeam: null, opponent: null }
})

export function useGameStore() {
  const games = computed(() => state.games)
  const teams = computed(() => state.teams)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)
  
  const activeGame = computed(() => 
    state.games.find(g => g.id === state.activeGameId)
  )

  // Fetch all teams from Supabase
  async function fetchTeams() {
    state.loading = true
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        players (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      state.error = error.message
      console.error('Error fetching teams:', error)
    } else {
      // Transform to match existing format
      state.teams = data.map(team => ({
        id: team.id,
        name: team.name,
        players: (team.players || []).map(p => ({
          id: p.id,
          number: p.number || '',
          firstName: p.name?.split(' ')[0] || '',
          lastName: p.name?.split(' ').slice(1).join(' ') || '',
          position: p.position || ''
        })).sort((a, b) => (a.batting_order || 0) - (b.batting_order || 0))
      }))
    }
    state.loading = false
  }

  // Fetch all games from Supabase
  async function fetchGames() {
    state.loading = true
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      state.error = error.message
      console.error('Error fetching games:', error)
    } else {
      // Transform to match existing format
      state.games = data.map(game => ({
        id: game.id,
        date: game.date,
        time: game.time || '',
        myTeam: { name: state.teams.find(t => t.id === game.my_team_id)?.name || 'My Team', score: game.my_score },
        myTeamId: game.my_team_id,
        opponent: { name: game.opponent_name, score: game.opponent_score },
        field: game.field || '',
        status: game.status,
        inning: game.current_inning,
        isTop: game.is_top_inning,
        outs: game.outs,
        balls: game.balls,
        strikes: game.strikes,
        bases: game.bases || { first: null, second: null, third: null }
      }))
    }
    state.loading = false
  }

  // Create a new team
  async function createTeam(name) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating team:', error)
      return null
    }
    
    const newTeam = { id: data.id, name: data.name, players: [] }
    state.teams.unshift(newTeam)
    return newTeam
  }

  // Add player to team
  async function addPlayer(teamId, playerData) {
    const fullName = `${playerData.firstName} ${playerData.lastName}`.trim()
    const { data, error } = await supabase
      .from('players')
      .insert({
        team_id: teamId,
        name: fullName,
        number: playerData.number,
        position: playerData.position,
        batting_order: playerData.battingOrder || 0
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding player:', error)
      return null
    }
    
    const team = state.teams.find(t => t.id === teamId)
    if (team) {
      team.players.push({
        id: data.id,
        number: data.number || '',
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        position: data.position || ''
      })
    }
    return data
  }

  // Remove player from team
  async function removePlayer(teamId, playerId) {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
    
    if (error) {
      console.error('Error removing player:', error)
      return false
    }
    
    const team = state.teams.find(t => t.id === teamId)
    if (team) {
      team.players = team.players.filter(p => p.id !== playerId)
    }
    return true
  }

  // Create a new game
  async function createGame(gameData) {
    const { data, error } = await supabase
      .from('games')
      .insert({
        my_team_id: gameData.myTeamId,
        opponent_name: gameData.opponent?.name || gameData.opponentName,
        date: gameData.date,
        time: gameData.time,
        field: gameData.field,
        status: 'scheduled',
        my_score: 0,
        opponent_score: 0,
        current_inning: 1,
        is_top_inning: true,
        outs: 0,
        balls: 1,
        strikes: 1,
        bases: { first: null, second: null, third: null },
        my_pitcher_id: gameData.myPitcherId || null,
        opponent_pitcher_name: gameData.opponentPitcherName || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating game:', error)
      return null
    }
    
    const newGame = {
      id: data.id,
      date: data.date,
      time: data.time || '',
      myTeam: { name: state.teams.find(t => t.id === data.my_team_id)?.name || 'My Team', score: 0 },
      myTeamId: data.my_team_id,
      opponent: { name: data.opponent_name, score: 0 },
      field: data.field || '',
      status: data.status,
      inning: 1,
      isTop: true,
      outs: 0
    }
    state.games.unshift(newGame)
    return newGame
  }

  // Start a game (transition to in_progress)
  async function startGame(gameId, myTeamLineup, opponentLineup, pitchers = {}) {
    const game = state.games.find(g => g.id === gameId)
    if (!game) return null
    
    // Update game status in Supabase
    const { error } = await supabase
      .from('games')
      .update({ status: 'in_progress' })
      .eq('id', gameId)
    
    if (error) {
      console.error('Error starting game:', error)
      return null
    }
    
    game.status = 'in_progress'
    state.activeGameId = gameId
    
    // Initialize current game state
    currentGame.id = gameId
    currentGame.myTeam = { ...game.myTeam, lineup: myTeamLineup, pitcher: pitchers.myPitcher || null }
    currentGame.opponent = { ...game.opponent, lineup: opponentLineup, pitcher: pitchers.opponentPitcher || null }
    currentGame.inning = 1
    currentGame.isTop = true
    currentGame.outs = 0
    currentGame.balls = 1
    currentGame.strikes = 1
    currentGame.bases = { first: null, second: null, third: null }
    currentGame.currentBatterIndex = 0
    currentGame.plays = []
    currentGame.inningScores = { away: [0], home: [0] }
    
    // Initialize pitching stats
    currentGame.pitchingStats = {
      myTeam: {
        pitcher: pitchers.myPitcher,
        inningsPitched: 0,
        hitsAllowed: 0,
        runsAllowed: 0,
        earnedRuns: 0,
        walks: 0,
        strikeouts: 0,
        homeRunsAllowed: 0,
        battersFaced: 0
      },
      opponent: {
        pitcher: pitchers.opponentPitcher,
        inningsPitched: 0,
        hitsAllowed: 0,
        runsAllowed: 0,
        earnedRuns: 0,
        walks: 0,
        strikeouts: 0,
        homeRunsAllowed: 0,
        battersFaced: 0
      }
    }
    
    // Create pitching stats records in Supabase
    if (pitchers.myPitcher) {
      await supabase.from('pitching_stats').insert({
        game_id: gameId,
        pitcher_id: pitchers.myPitcher.id,
        is_my_team: true
      })
    }
    if (pitchers.opponentPitcher) {
      await supabase.from('pitching_stats').insert({
        game_id: gameId,
        pitcher_name: `${pitchers.opponentPitcher.firstName} ${pitchers.opponentPitcher.lastName}`.trim(),
        is_my_team: false
      })
    }
    
    return game
  }

  async function recordPlay(playType, details = {}) {
    const batter = getCurrentBatter()
    const play = {
      id: Date.now().toString(),
      type: playType,
      inning: currentGame.inning,
      isTop: currentGame.isTop,
      batter,
      timestamp: new Date().toISOString(),
      ...details
    }
    
    // Save play to Supabase
    const { error } = await supabase
      .from('plays')
      .insert({
        game_id: currentGame.id,
        inning: play.inning,
        is_top: play.isTop,
        batter_id: batter?.id || null,
        play_type: playType,
        runs_scored: details.runsScored || 0,
        outs_recorded: details.outsRecorded || 0,
        bases_before: { ...currentGame.bases },
        bases_after: details.newBases || currentGame.bases
      })
    
    if (error) {
      console.error('Error recording play:', error)
    }
    
    currentGame.plays.push(play)
    await processPlay(play)
    return play
  }

  async function processPlay(play) {
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
    
    // Update pitching stats
    updatePitchingStats(play)

    // Handle outs
    if (play.outsRecorded) {
      currentGame.outs += play.outsRecorded
      if (currentGame.outs >= 3) {
        await endHalfInning()
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
    
    // Sync game state to Supabase
    await syncGameState()
  }
  
  // Update pitching stats based on play type
  function updatePitchingStats(play) {
    // Determine which pitcher's stats to update
    // If top of inning (opponent batting), update MY pitcher's stats
    // If bottom of inning (my team batting), update OPPONENT pitcher's stats
    const stats = currentGame.isTop 
      ? currentGame.pitchingStats.myTeam 
      : currentGame.pitchingStats.opponent
    
    if (!stats) return
    
    // Increment batters faced for most plays (not balls/strikes)
    if (!['ball', 'strike'].includes(play.type)) {
      stats.battersFaced++
    }
    
    // Update based on play type
    switch (play.type) {
      case 'single':
      case 'double':
      case 'triple':
        stats.hitsAllowed++
        break
      case 'homerun':
        stats.hitsAllowed++
        stats.homeRunsAllowed++
        break
      case 'strikeout':
        stats.strikeouts++
        break
      case 'walk':
        stats.walks++
        break
    }
    
    // Track runs allowed
    if (play.runsScored) {
      stats.runsAllowed += play.runsScored
      stats.earnedRuns += play.runsScored // Simplified - all runs are earned for now
    }
  }

  function advanceBatter() {
    const lineup = currentGame.isTop ? currentGame.opponent.lineup : currentGame.myTeam.lineup
    currentGame.currentBatterIndex = (currentGame.currentBatterIndex + 1) % lineup.length
  }

  async function endHalfInning() {
    // Update innings pitched for the pitcher who just finished
    const stats = currentGame.isTop 
      ? currentGame.pitchingStats.myTeam 
      : currentGame.pitchingStats.opponent
    if (stats) {
      stats.inningsPitched += 1
    }
    
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
    
    // Sync to Supabase
    await syncGameState()
    await syncPitchingStats()
  }
  
  // Sync pitching stats to Supabase
  async function syncPitchingStats() {
    if (!currentGame.id) return
    
    const myStats = currentGame.pitchingStats.myTeam
    const oppStats = currentGame.pitchingStats.opponent
    
    if (myStats?.pitcher) {
      await supabase
        .from('pitching_stats')
        .update({
          innings_pitched: myStats.inningsPitched,
          hits_allowed: myStats.hitsAllowed,
          runs_allowed: myStats.runsAllowed,
          earned_runs: myStats.earnedRuns,
          walks: myStats.walks,
          strikeouts: myStats.strikeouts,
          home_runs_allowed: myStats.homeRunsAllowed,
          batters_faced: myStats.battersFaced
        })
        .eq('game_id', currentGame.id)
        .eq('is_my_team', true)
    }
    
    if (oppStats?.pitcher) {
      await supabase
        .from('pitching_stats')
        .update({
          innings_pitched: oppStats.inningsPitched,
          hits_allowed: oppStats.hitsAllowed,
          runs_allowed: oppStats.runsAllowed,
          earned_runs: oppStats.earnedRuns,
          walks: oppStats.walks,
          strikeouts: oppStats.strikeouts,
          home_runs_allowed: oppStats.homeRunsAllowed,
          batters_faced: oppStats.battersFaced
        })
        .eq('game_id', currentGame.id)
        .eq('is_my_team', false)
    }
  }

  // Sync current game state to Supabase
  async function syncGameState() {
    if (!currentGame.id) return
    
    const { error } = await supabase
      .from('games')
      .update({
        my_score: currentGame.myTeam.score,
        opponent_score: currentGame.opponent.score,
        current_inning: currentGame.inning,
        is_top_inning: currentGame.isTop,
        outs: currentGame.outs,
        balls: currentGame.balls,
        strikes: currentGame.strikes,
        bases: currentGame.bases
      })
      .eq('id', currentGame.id)
    
    if (error) {
      console.error('Error syncing game state:', error)
    }
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

  async function endGame() {
    const game = state.games.find(g => g.id === currentGame.id)
    if (game) {
      game.status = 'final'
      game.myTeam.score = currentGame.myTeam.score
      game.opponent.score = currentGame.opponent.score
      
      // Update in Supabase
      await supabase
        .from('games')
        .update({
          status: 'final',
          my_score: currentGame.myTeam.score,
          opponent_score: currentGame.opponent.score
        })
        .eq('id', currentGame.id)
      
      // Final sync of pitching stats
      await syncPitchingStats()
    }
    state.activeGameId = null
  }

  return {
    games,
    teams,
    loading,
    error,
    activeGame,
    currentGame,
    fetchTeams,
    fetchGames,
    createTeam,
    addPlayer,
    removePlayer,
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
