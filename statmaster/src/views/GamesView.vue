<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppBar from '../components/AppBar.vue'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const { games } = useGameStore()

const todayGames = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return games.value.filter(g => 
    g.date === today && ['upcoming', 'in_progress'].includes(g.status)
  )
})

const recentGames = computed(() => {
  return games.value.filter(g => g.status === 'final').slice(0, 5)
})

function getStatusColor(status) {
  switch (status) {
    case 'upcoming': return 'bg-gray-100 text-gray-700'
    case 'in_progress': return 'bg-green-100 text-green-700'
    case 'final': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'upcoming': return 'Upcoming'
    case 'in_progress': return 'In Progress'
    case 'final': return 'Final'
    default: return status
  }
}

function handleGameClick(game) {
  if (game.status === 'in_progress') {
    router.push(`/game/${game.id}/score`)
  } else if (game.status === 'final') {
    router.push(`/game/${game.id}/summary`)
  } else {
    router.push('/game/new')
  }
}

function createNewGame() {
  router.push('/game/new')
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <AppBar title="Games" right-icon="plus" @right-action="createNewGame" />
    
    <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
      <!-- Empty state -->
      <div v-if="games.length === 0" class="flex flex-col items-center justify-center py-16">
        <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <path stroke-linecap="round" stroke-width="2" d="M12 2c-2 4-2 8 0 10s2 6 0 10" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">No games yet.</p>
        <button 
          @click="createNewGame"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all touch-target"
        >
          Create Your First Game
        </button>
      </div>
      
      <!-- Games list -->
      <div v-else>
        <!-- Today / Upcoming section -->
        <section v-if="todayGames.length > 0" class="mb-6">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Today</h2>
          <div class="space-y-3">
            <button
              v-for="game in todayGames"
              :key="game.id"
              @click="handleGameClick(game)"
              class="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md active:scale-[0.98] transition-all touch-target"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ game.time }}</span>
                <span 
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getStatusColor(game.status)"
                >
                  {{ getStatusLabel(game.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ game.myTeam.name }}</p>
                  <p class="text-gray-600 dark:text-gray-300">vs {{ game.opponent.name }}</p>
                </div>
                <div v-if="game.status !== 'upcoming'" class="text-right">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ game.myTeam.score }} - {{ game.opponent.score }}
                  </p>
                </div>
              </div>
              <p v-if="game.field" class="text-sm text-gray-400 dark:text-gray-500 mt-2">{{ game.field }}</p>
            </button>
          </div>
        </section>
        
        <!-- Recent games section -->
        <section v-if="recentGames.length > 0">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent Games</h2>
          <div class="space-y-2">
            <button
              v-for="game in recentGames"
              :key="game.id"
              @click="handleGameClick(game)"
              class="w-full bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md active:scale-[0.98] transition-all touch-target"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ game.date }}</p>
                  <p class="font-medium text-gray-900 dark:text-white">vs {{ game.opponent.name }}</p>
                </div>
                <div class="text-right">
                  <span 
                    class="text-lg font-bold"
                    :class="game.myTeam.score > game.opponent.score ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                  >
                    {{ game.myTeam.score > game.opponent.score ? 'W' : 'L' }}
                    {{ game.myTeam.score }}-{{ game.opponent.score }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>
        
        <!-- Quick start button when no today games -->
        <div v-if="todayGames.length === 0" class="mt-6">
          <button 
            @click="createNewGame"
            class="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all touch-target flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Start New Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
