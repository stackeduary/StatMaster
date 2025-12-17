<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBar from '../components/AppBar.vue'
import { useGameStore } from '../stores/gameStore'

const route = useRoute()
const router = useRouter()
const { games, currentGame } = useGameStore()

const game = computed(() => 
  games.value.find(g => g.id === route.params.id) || currentGame
)

const isWin = computed(() => 
  game.value?.myTeam?.score > game.value?.opponent?.score
)

const resultBadge = computed(() => {
  if (!game.value) return ''
  const myScore = game.value.myTeam?.score || 0
  const oppScore = game.value.opponent?.score || 0
  if (myScore > oppScore) return 'W'
  if (myScore < oppScore) return 'L'
  return 'T'
})

// Mock batting stats for display
const battingStats = [
  { name: 'Bill Smith', ab: 4, r: 2, h: 3, rbi: 2, '2b': 1, '3b': 0, hr: 1, bb: 0, so: 0 },
  { name: 'Mike Johnson', ab: 4, r: 1, h: 2, rbi: 1, '2b': 0, '3b': 0, hr: 0, bb: 1, so: 1 },
  { name: 'Dave Williams', ab: 3, r: 1, h: 1, rbi: 3, '2b': 0, '3b': 0, hr: 1, bb: 1, so: 0 },
  { name: 'Tom Brown', ab: 4, r: 0, h: 1, rbi: 0, '2b': 0, '3b': 0, hr: 0, bb: 0, so: 1 },
  { name: 'Chris Davis', ab: 3, r: 1, h: 2, rbi: 1, '2b': 1, '3b': 0, hr: 0, bb: 1, so: 0 }
]

function goToScoring() {
  router.push(`/game/${route.params.id}/score`)
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <AppBar :title="`${game?.myTeam?.name || 'My Team'} vs ${game?.opponent?.name || 'Opponent'}`" show-back />
    
    <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
      <!-- Header info -->
      <div class="text-center text-gray-500 text-sm mb-4">
        <p>{{ game?.date }} • {{ game?.field || 'Field' }}</p>
        <span 
          class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
          :class="game?.status === 'final' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
        >
          {{ game?.status === 'final' ? 'Final' : 'In Progress' }}
        </span>
      </div>
      
      <!-- Score Summary Card -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div class="flex items-center justify-center gap-6">
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">{{ game?.myTeam?.name || 'My Team' }}</p>
            <p class="text-4xl font-bold text-gray-900">{{ game?.myTeam?.score || 0 }}</p>
          </div>
          
          <div class="flex flex-col items-center">
            <span 
              class="text-2xl font-bold px-3 py-1 rounded"
              :class="isWin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ resultBadge }}
            </span>
          </div>
          
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-1">{{ game?.opponent?.name || 'Opponent' }}</p>
            <p class="text-4xl font-bold text-gray-900">{{ game?.opponent?.score || 0 }}</p>
          </div>
        </div>
      </div>
      
      <!-- Inning-by-Inning Score -->
      <div class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Line Score</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left font-medium text-gray-500">Team</th>
                <th v-for="i in 7" :key="i" class="px-2 py-2 text-center font-medium text-gray-500 w-8">{{ i }}</th>
                <th class="px-3 py-2 text-center font-bold text-gray-700">R</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500">H</th>
                <th class="px-3 py-2 text-center font-medium text-gray-500">E</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100">
                <td class="px-3 py-2 font-medium text-gray-900">{{ game?.opponent?.name || 'Away' }}</td>
                <td v-for="i in 7" :key="i" class="px-2 py-2 text-center text-gray-600">
                  {{ currentGame.inningScores?.away?.[i-1] ?? '-' }}
                </td>
                <td class="px-3 py-2 text-center font-bold">{{ game?.opponent?.score || 0 }}</td>
                <td class="px-3 py-2 text-center text-gray-600">8</td>
                <td class="px-3 py-2 text-center text-gray-600">1</td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-medium text-gray-900">{{ game?.myTeam?.name || 'Home' }}</td>
                <td v-for="i in 7" :key="i" class="px-2 py-2 text-center text-gray-600">
                  {{ currentGame.inningScores?.home?.[i-1] ?? '-' }}
                </td>
                <td class="px-3 py-2 text-center font-bold">{{ game?.myTeam?.score || 0 }}</td>
                <td class="px-3 py-2 text-center text-gray-600">12</td>
                <td class="px-3 py-2 text-center text-gray-600">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Batting Box Score -->
      <div class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">{{ game?.myTeam?.name || 'My Team' }} Batting</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left font-medium text-gray-500">Player</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">AB</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">R</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">H</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">RBI</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">2B</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">HR</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">BB</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">SO</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(player, index) in battingStats" 
                :key="index"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-3 py-2 font-medium text-gray-900">{{ player.name }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.ab }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.r }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.h }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.rbi }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player['2b'] }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.hr }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.bb }}</td>
                <td class="px-2 py-2 text-center text-gray-600">{{ player.so }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="space-y-3">
        <button 
          v-if="game?.status === 'in_progress'"
          @click="goToScoring"
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 touch-target"
        >
          Continue Scoring
        </button>
        <button 
          class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 touch-target"
        >
          Share / Export
        </button>
      </div>
    </div>
  </div>
</template>
