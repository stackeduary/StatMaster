<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDiamond from '../components/BaseDiamond.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const { currentGame, getCurrentBatter, recordPlay, undoLastPlay, updateBases, endGame, endHalfInning } = useGameStore()

const showMenu = ref(false)
const showRunnerModal = ref(false)
const showPitchingStats = ref(false)
const pendingPlay = ref(null)

// Computed values
const inningDisplay = computed(() => {
  const half = currentGame.isTop ? 'Top' : 'Bot'
  const inning = currentGame.inning
  const suffix = inning === 1 ? 'st' : inning === 2 ? 'nd' : inning === 3 ? 'rd' : 'th'
  return `${half} ${inning}${suffix}`
})

const currentBatter = computed(() => getCurrentBatter())

const batterDisplay = computed(() => {
  const batter = currentBatter.value
  if (!batter) return { name: 'Unknown', stats: '' }
  return {
    name: `#${batter.number} ${batter.firstName} ${batter.lastName}`,
    initials: `${batter.number} ${batter.firstName?.[0] || ''}${batter.lastName?.[0] || ''}`
  }
})

const battingTeamLineup = computed(() => 
  currentGame.isTop ? currentGame.opponent.lineup : currentGame.myTeam.lineup
)

// Play actions
const hitActions = [
  { type: '1B', label: '1B', color: 'bg-green-500' },
  { type: '2B', label: '2B', color: 'bg-green-600' },
  { type: '3B', label: '3B', color: 'bg-green-700' },
  { type: 'HR', label: 'HR', color: 'bg-green-800' }
]

const outActions = [
  { type: 'strikeout', label: 'K', color: 'bg-red-500' },
  { type: 'groundout', label: 'GO', color: 'bg-red-500' },
  { type: 'flyout', label: 'FO', color: 'bg-red-500' },
  { type: 'lineout', label: 'LO', color: 'bg-red-500' }
]

const otherActions = [
  { type: 'walk', label: 'BB', color: 'bg-blue-500' },
  { type: 'error', label: 'E', color: 'bg-yellow-500' },
  { type: 'fc', label: 'FC', color: 'bg-orange-500' },
  { type: 'sac', label: 'SAC', color: 'bg-purple-500' }
]

function handlePlay(action) {
  // For simple plays, record directly
  // For plays with runners, show modal
  const hasRunners = currentGame.bases.first || currentGame.bases.second || currentGame.bases.third
  
  if (hasRunners && ['1B', '2B', '3B', 'HR', 'walk', 'error'].includes(action.type)) {
    pendingPlay.value = action
    showRunnerModal.value = true
    return
  }
  
  executePlay(action.type, getDefaultPlayResult(action.type))
}

function getDefaultPlayResult(type) {
  switch (type) {
    case '1B':
      return { outsRecorded: 0, runsScored: 0, newBases: advanceRunners(1) }
    case '2B':
      return { outsRecorded: 0, runsScored: countRunnersScoring(2), newBases: advanceRunners(2) }
    case '3B':
      return { outsRecorded: 0, runsScored: countRunnersScoring(3), newBases: advanceRunners(3) }
    case 'HR':
      return { outsRecorded: 0, runsScored: countRunnersScoring(4) + 1, newBases: { first: null, second: null, third: null } }
    case 'walk':
      return { outsRecorded: 0, runsScored: 0, newBases: advanceRunnersForWalk() }
    case 'strikeout':
    case 'groundout':
    case 'flyout':
    case 'lineout':
      return { outsRecorded: 1, runsScored: 0 }
    case 'error':
      return { outsRecorded: 0, runsScored: 0, newBases: advanceRunners(1) }
    case 'fc':
      return { outsRecorded: 1, runsScored: 0, newBases: { first: currentBatter.value, second: null, third: null } }
    case 'sac':
      return { outsRecorded: 1, runsScored: currentGame.bases.third ? 1 : 0, newBases: advanceRunners(1, true) }
    default:
      return { outsRecorded: 0, runsScored: 0 }
  }
}

function advanceRunners(bases, excludeBatter = false) {
  const newBases = { first: null, second: null, third: null }
  
  // Place batter on the appropriate base
  if (!excludeBatter) {
    if (bases === 1) {
      newBases.first = currentBatter.value
    } else if (bases === 2) {
      newBases.second = currentBatter.value
    } else if (bases === 3) {
      newBases.third = currentBatter.value
    }
  }
  
  // Advance existing runners
  // Single: runners advance 1 base (runner on 2nd goes to 3rd, runner on 1st goes to 2nd)
  // Double: runners advance 2 bases (all runners score except runner on 1st goes to 3rd)
  // Triple: all runners score
  
  if (bases === 1) {
    // Single - advance runners 1 base
    if (currentGame.bases.second) {
      newBases.third = currentGame.bases.second
    }
    if (currentGame.bases.first) {
      newBases.second = currentGame.bases.first
    }
  } else if (bases === 2) {
    // Double - runner on 1st goes to 3rd, others score
    if (currentGame.bases.first) {
      newBases.third = currentGame.bases.first
    }
    // Runner on 2nd and 3rd score
  } else if (bases === 3) {
    // Triple - all runners score, batter on 3rd
    // All existing runners score, no one left on base except batter
  }
  
  return newBases
}

function advanceRunnersForWalk() {
  const newBases = { ...currentGame.bases }
  
  // Force runners if bases loaded
  if (currentGame.bases.first) {
    if (currentGame.bases.second) {
      if (currentGame.bases.third) {
        // Bases loaded - run scores
      }
      newBases.third = currentGame.bases.second
    }
    newBases.second = currentGame.bases.first
  }
  newBases.first = currentBatter.value
  
  return newBases
}

function countRunnersScoring(basesAdvanced) {
  let runs = 0
  if (basesAdvanced >= 4) runs++ // Batter scores on HR
  if (currentGame.bases.third && basesAdvanced >= 1) runs++
  if (currentGame.bases.second && basesAdvanced >= 2) runs++
  if (currentGame.bases.first && basesAdvanced >= 3) runs++
  return runs
}

function executePlay(type, result) {
  recordPlay(type, result)
  
  if (result.newBases) {
    updateBases(result.newBases)
  }
  
  showRunnerModal.value = false
  pendingPlay.value = null
}

function confirmRunnerAdvancement(runsScored, newBases) {
  if (pendingPlay.value) {
    executePlay(pendingPlay.value.type, {
      outsRecorded: 0,
      runsScored,
      newBases
    })
  }
}

function handleUndo() {
  undoLastPlay()
}

function handleEndInning() {
  endHalfInning()
  showMenu.value = false
}

function handleEndGame() {
  if (confirm('Are you sure you want to end this game?')) {
    endGame()
    router.push('/')
  }
  showMenu.value = false
}

function goBack() {
  if (confirm('Leave scoring? Your progress is saved.')) {
    router.push('/')
  }
}

// Get play description for log
function getPlayDescription(play) {
  const batter = play.batter
  const name = batter ? `${batter.firstName} ${batter.lastName?.[0]}.` : 'Batter'
  
  switch (play.type) {
    case '1B': return `${name} singled`
    case '2B': return `${name} doubled`
    case '3B': return `${name} tripled`
    case 'HR': return `${name} homered`
    case 'walk': return `${name} walked`
    case 'strikeout': return `${name} struck out`
    case 'groundout': return `${name} grounded out`
    case 'flyout': return `${name} flied out`
    case 'lineout': return `${name} lined out`
    case 'error': return `${name} reached on error`
    case 'fc': return `${name} reached on FC`
    case 'sac': return `${name} sacrifice`
    default: return `${name} - ${play.type}`
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white theme-transition">
    <!-- Top Game Bar -->
    <header class="bg-white dark:bg-gray-800 px-3 py-3 flex items-center justify-between safe-area-top border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1">
        <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
      
      <div class="text-center">
        <p class="text-lg font-bold">{{ inningDisplay }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ currentGame.outs }} Out{{ currentGame.outs !== 1 ? 's' : '' }}</p>
      </div>
      
      <div class="relative">
        <button @click="showMenu = !showMenu" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <div 
          v-if="showMenu"
          class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 min-w-48 z-50 border border-gray-200 dark:border-gray-600"
        >
          <button 
            @click="showPitchingStats = true; showMenu = false"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
          >
            View Pitching Stats
          </button>
          <button 
            @click="handleEndInning"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
          >
            End Inning
          </button>
          <button 
            @click="handleEndGame"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-red-600 dark:text-red-400"
          >
            End Game
          </button>
        </div>
      </div>
    </header>
    
    <!-- Score Strip -->
    <div class="bg-gray-200 dark:bg-gray-800 px-4 py-2 flex items-center justify-center gap-8 border-b border-gray-300 dark:border-gray-700">
      <div class="text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">{{ currentGame.opponent.name || 'Away' }}</p>
        <p class="text-2xl font-bold">{{ currentGame.opponent.score }}</p>
        <p v-if="currentGame.opponent.pitcher" class="text-xs text-gray-400 dark:text-gray-500">
          P: {{ currentGame.opponent.pitcher.firstName }} {{ currentGame.opponent.pitcher.lastName?.charAt(0) || '' }}
        </p>
      </div>
      <div class="text-gray-400 dark:text-gray-500">-</div>
      <div class="text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">{{ currentGame.myTeam.name || 'Home' }}</p>
        <p class="text-2xl font-bold">{{ currentGame.myTeam.score }}</p>
        <p v-if="currentGame.myTeam.pitcher" class="text-xs text-gray-400 dark:text-gray-500">
          P: {{ currentGame.myTeam.pitcher.firstName }} {{ currentGame.myTeam.pitcher.lastName?.charAt(0) || '' }}
        </p>
      </div>
    </div>
    
    <!-- Base State & Count Panel -->
    <div class="bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-around border-b border-gray-200 dark:border-gray-700">
      <!-- Base Diamond -->
      <BaseDiamond :bases="currentGame.bases" size="md" />
      
      <!-- Count Display -->
      <div class="text-center">
        <div class="flex items-center gap-4 mb-2">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Balls</p>
            <div class="flex gap-1">
              <span 
                v-for="i in 4" 
                :key="'b'+i"
                class="w-3 h-3 rounded-full"
                :class="i <= currentGame.balls ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
              />
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Strikes</p>
            <div class="flex gap-1">
              <span 
                v-for="i in 3" 
                :key="'s'+i"
                class="w-3 h-3 rounded-full"
                :class="i <= currentGame.strikes ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'"
              />
            </div>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Outs</p>
          <div class="flex gap-1 justify-center">
            <span 
              v-for="i in 3" 
              :key="'o'+i"
              class="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white"
              :class="i <= currentGame.outs ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'"
            >
              {{ i <= currentGame.outs ? '✕' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Current Batter Panel -->
    <div class="bg-blue-600 px-4 py-3">
      <div class="flex items-center justify-between text-white">
        <div>
          <p class="text-xs text-blue-200 uppercase">Now Batting</p>
          <p class="text-lg font-bold">{{ batterDisplay.name }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-blue-200">
            #{{ currentGame.currentBatterIndex + 1 }} of {{ battingTeamLineup.length }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Scoring Actions Grid -->
    <div class="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-y-auto">
      <!-- Hit outcomes -->
      <div class="mb-4">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">Hits</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="action in hitActions"
            :key="action.type"
            @click="handlePlay(action)"
            :class="action.color"
            class="py-4 rounded-xl font-bold text-xl text-white hover:opacity-90 active:scale-95 transition-transform touch-target shadow-sm"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Out outcomes -->
      <div class="mb-4">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">Outs</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="action in outActions"
            :key="action.type"
            @click="handlePlay(action)"
            :class="action.color"
            class="py-4 rounded-xl font-bold text-xl text-white hover:opacity-90 active:scale-95 transition-transform touch-target shadow-sm"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Other outcomes -->
      <div class="mb-4">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">Other</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="action in otherActions"
            :key="action.type"
            @click="handlePlay(action)"
            :class="action.color"
            class="py-4 rounded-xl font-bold text-xl text-white hover:opacity-90 active:scale-95 transition-transform touch-target shadow-sm"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Play-by-Play Log -->
      <div class="mt-4">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">Recent Plays</p>
        <div class="bg-white dark:bg-gray-800 rounded-xl max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div v-if="currentGame.plays.length === 0" class="p-4 text-center text-gray-400 text-sm">
            No plays yet
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div 
              v-for="play in [...currentGame.plays].reverse().slice(0, 5)" 
              :key="play.id"
              class="px-4 py-2 text-sm"
            >
              <span class="text-gray-500 dark:text-gray-400">{{ play.isTop ? 'T' : 'B' }}{{ play.inning }}:</span>
              {{ getPlayDescription(play) }}
              <span v-if="play.runsScored" class="text-green-600 dark:text-green-400 ml-1">
                (+{{ play.runsScored }} R)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Undo Button -->
    <div class="bg-white dark:bg-gray-800 px-4 py-3 safe-area-bottom border-t border-gray-200 dark:border-gray-700">
      <button 
        @click="handleUndo"
        :disabled="currentGame.plays.length === 0"
        class="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Undo Last Play
      </button>
    </div>
    
    <!-- Runner Advancement Modal -->
    <div 
      v-if="showRunnerModal"
      class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      @click.self="showRunnerModal = false"
    >
      <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-4 pb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Runner Advancement</h3>
          <button @click="showRunnerModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {{ pendingPlay?.label }} by {{ batterDisplay.name }}
        </p>
        
        <!-- Quick options -->
        <div class="space-y-2">
          <button 
            @click="confirmRunnerAdvancement(0, getDefaultPlayResult(pendingPlay?.type).newBases)"
            class="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all"
          >
            No runs scored
          </button>
          <button 
            @click="confirmRunnerAdvancement(1, getDefaultPlayResult(pendingPlay?.type).newBases)"
            class="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-500 active:scale-95 transition-all"
          >
            1 run scored
          </button>
          <button 
            v-if="currentGame.bases.second || currentGame.bases.third"
            @click="confirmRunnerAdvancement(2, getDefaultPlayResult(pendingPlay?.type).newBases)"
            class="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-500 active:scale-95 transition-all"
          >
            2 runs scored
          </button>
        </div>
      </div>
    </div>
    
    <!-- Pitching Stats Modal -->
    <div 
      v-if="showPitchingStats"
      class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      @click.self="showPitchingStats = false"
    >
      <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-4 pb-8 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pitching Stats</h3>
          <button @click="showPitchingStats = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- My Team Pitcher Stats -->
        <div v-if="currentGame.pitchingStats.myTeam?.pitcher" class="mb-6">
          <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            {{ currentGame.myTeam.name }} Pitcher
          </h4>
          <div class="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
            <p class="font-medium text-gray-900 dark:text-white mb-3">
              #{{ currentGame.pitchingStats.myTeam.pitcher.number }} 
              {{ currentGame.pitchingStats.myTeam.pitcher.firstName }} 
              {{ currentGame.pitchingStats.myTeam.pitcher.lastName }}
            </p>
            <div class="grid grid-cols-4 gap-3 text-center">
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.inningsPitched }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">IP</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.hitsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">H</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.runsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">R</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.earnedRuns }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">ER</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.walks }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">BB</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.strikeouts }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">K</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.homeRunsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">HR</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.myTeam.battersFaced }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">BF</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Opponent Pitcher Stats -->
        <div v-if="currentGame.pitchingStats.opponent?.pitcher">
          <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            {{ currentGame.opponent.name }} Pitcher
          </h4>
          <div class="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
            <p class="font-medium text-gray-900 dark:text-white mb-3">
              {{ currentGame.pitchingStats.opponent.pitcher.firstName }} 
              {{ currentGame.pitchingStats.opponent.pitcher.lastName }}
            </p>
            <div class="grid grid-cols-4 gap-3 text-center">
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.inningsPitched }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">IP</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.hitsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">H</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.runsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">R</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.earnedRuns }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">ER</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.walks }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">BB</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.strikeouts }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">K</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.homeRunsAllowed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">HR</p>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ currentGame.pitchingStats.opponent.battersFaced }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">BF</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No pitchers message -->
        <div v-if="!currentGame.pitchingStats.myTeam?.pitcher && !currentGame.pitchingStats.opponent?.pitcher" 
             class="text-center py-8 text-gray-500 dark:text-gray-400">
          No pitchers selected for this game
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
