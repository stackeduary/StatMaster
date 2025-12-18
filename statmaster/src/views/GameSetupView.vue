<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppBar from '../components/AppBar.vue'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const { teams, createGame, startGame, fetchTeams } = useGameStore()

onMounted(async () => {
  await fetchTeams()
  // Set default team after fetching
  if (teams.value.length > 0 && !selectedTeamId.value) {
    selectedTeamId.value = teams.value[0].id
    initializeLineup()
  }
})

// Form state
const gameDate = ref(new Date().toISOString().split('T')[0])
const gameTime = ref('7:00 PM')
const selectedTeamId = ref('')
const opponentName = ref('')
const fieldName = ref('')

// Lineup state
const myTeamLineup = ref([])
const opponentLineup = ref([])
const showMyTeamLineup = ref(true)
const showOpponentLineup = ref(false)

// Pitcher state
const myPitcherId = ref('')
const opponentPitcher = ref({ firstName: '', lastName: '' })

// Player form
const showAddPlayer = ref(false)
const addingToTeam = ref('my') // 'my' or 'opponent'
const newPlayer = ref({ number: '', firstName: '', lastName: '', position: '' })

const selectedTeam = computed(() => 
  teams.value.find(t => t.id === selectedTeamId.value)
)

const myPitcher = computed(() => 
  myTeamLineup.value.find(p => p.id === myPitcherId.value)
)

const canStartGame = computed(() => 
  selectedTeamId.value && opponentName.value.trim() && myTeamLineup.value.length > 0
)

// Initialize lineup from selected team
function initializeLineup() {
  if (selectedTeam.value) {
    myTeamLineup.value = [...selectedTeam.value.players]
  }
}

// Watch for team selection changes
initializeLineup()

function addPlayer() {
  const player = {
    id: Date.now().toString(),
    ...newPlayer.value
  }
  
  if (addingToTeam.value === 'my') {
    myTeamLineup.value.push(player)
  } else {
    opponentLineup.value.push(player)
  }
  
  newPlayer.value = { number: '', firstName: '', lastName: '', position: '' }
  showAddPlayer.value = false
}

function removePlayer(lineup, index) {
  lineup.splice(index, 1)
}

function movePlayer(lineup, index, direction) {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < lineup.length) {
    const temp = lineup[index]
    lineup[index] = lineup[newIndex]
    lineup[newIndex] = temp
  }
}

function openAddPlayer(team) {
  addingToTeam.value = team
  showAddPlayer.value = true
}

async function handleStartGame() {
  const game = await createGame({
    date: gameDate.value,
    time: gameTime.value,
    myTeamId: selectedTeamId.value,
    opponentName: opponentName.value,
    field: fieldName.value,
    myPitcherId: myPitcherId.value || null,
    opponentPitcherName: opponentPitcher.value.firstName ? 
      `${opponentPitcher.value.firstName} ${opponentPitcher.value.lastName}`.trim() : null
  })
  
  if (game) {
    const pitchers = {
      myPitcher: myPitcher.value || null,
      opponentPitcher: opponentPitcher.value.firstName ? opponentPitcher.value : null
    }
    await startGame(game.id, myTeamLineup.value, opponentLineup.value, pitchers)
    router.push(`/game/${game.id}/score`)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <AppBar title="New Game" show-back />
    
    <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
      <!-- Game Info Section -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Game Info</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input 
                v-model="gameDate"
                type="date" 
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input 
                v-model="gameTime"
                type="text" 
                placeholder="7:00 PM"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">My Team</label>
            <select 
              v-model="selectedTeamId"
              @change="initializeLineup"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Opponent *</label>
            <input 
              v-model="opponentName"
              type="text" 
              placeholder="Enter opponent team name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Field (optional)</label>
            <input 
              v-model="fieldName"
              type="text" 
              placeholder="Field 1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </section>
      
      <!-- Pitchers Section -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Pitchers</h2>
        
        <div class="space-y-4">
          <!-- My Team Pitcher -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">My Team's Pitcher</label>
            <select 
              v-model="myPitcherId"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select pitcher (optional)</option>
              <option v-for="player in myTeamLineup" :key="player.id" :value="player.id">
                #{{ player.number }} {{ player.firstName }} {{ player.lastName }}
              </option>
            </select>
          </div>
          
          <!-- Opponent Pitcher -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opponent's Pitcher</label>
            <div class="grid grid-cols-2 gap-2">
              <input 
                v-model="opponentPitcher.firstName"
                type="text" 
                placeholder="First name"
                class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <input 
                v-model="opponentPitcher.lastName"
                type="text" 
                placeholder="Last name"
                class="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>
      
      <!-- My Team Lineup Section -->
      <section class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <button 
          @click="showMyTeamLineup = !showMyTeamLineup"
          class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-700">My Team Lineup</h2>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {{ myTeamLineup.length }} players
            </span>
          </div>
          <svg 
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': showMyTeamLineup }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div v-if="showMyTeamLineup" class="border-t border-gray-100">
          <div class="divide-y divide-gray-100">
            <div 
              v-for="(player, index) in myTeamLineup" 
              :key="player.id"
              class="px-4 py-3 flex items-center gap-3"
            >
              <span class="text-sm text-gray-400 w-6">{{ index + 1 }}</span>
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  #{{ player.number }} {{ player.firstName }} {{ player.lastName }}
                </p>
                <p class="text-sm text-gray-500">{{ player.position }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  @click="movePlayer(myTeamLineup, index, -1)"
                  :disabled="index === 0"
                  class="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button 
                  @click="movePlayer(myTeamLineup, index, 1)"
                  :disabled="index === myTeamLineup.length - 1"
                  class="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button 
                  @click="removePlayer(myTeamLineup, index)"
                  class="p-1 rounded hover:bg-red-50 text-red-500"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <button 
            @click="openAddPlayer('my')"
            class="w-full px-4 py-3 text-blue-600 font-medium text-sm hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Player
          </button>
        </div>
      </section>
      
      <!-- Opponent Lineup Section -->
      <section class="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <button 
          @click="showOpponentLineup = !showOpponentLineup"
          class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-700">Opponent Lineup</h2>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {{ opponentLineup.length }} players
            </span>
          </div>
          <svg 
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': showOpponentLineup }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div v-if="showOpponentLineup" class="border-t border-gray-100">
          <p v-if="opponentLineup.length === 0" class="px-4 py-6 text-center text-gray-400 text-sm">
            Optional: Add opponent players for detailed tracking
          </p>
          <div v-else class="divide-y divide-gray-100">
            <div 
              v-for="(player, index) in opponentLineup" 
              :key="player.id"
              class="px-4 py-3 flex items-center gap-3"
            >
              <span class="text-sm text-gray-400 w-6">{{ index + 1 }}</span>
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  #{{ player.number }} {{ player.firstName }} {{ player.lastName }}
                </p>
              </div>
              <button 
                @click="removePlayer(opponentLineup, index)"
                class="p-1 rounded hover:bg-red-50 text-red-500"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="openAddPlayer('opponent')"
            class="w-full px-4 py-3 text-blue-600 font-medium text-sm hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Player
          </button>
        </div>
      </section>
      
      <!-- Validation message -->
      <p v-if="!canStartGame" class="text-sm text-amber-600 text-center mb-4">
        Please add opponent name and at least one player to your lineup
      </p>
    </div>
    
    <!-- Sticky start button -->
    <div class="sticky bottom-16 px-4 pb-4 bg-gradient-to-t from-gray-50 pt-4">
      <button 
        @click="handleStartGame"
        :disabled="!canStartGame"
        class="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed touch-target"
      >
        Start Scoring
      </button>
    </div>
    
    <!-- Add Player Modal -->
    <div 
      v-if="showAddPlayer"
      class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      @click.self="showAddPlayer = false"
    >
      <div class="bg-white w-full max-w-lg rounded-t-2xl p-4 pb-8 safe-area-bottom">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Add Player</h3>
          <button @click="showAddPlayer = false" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input 
                v-model="newPlayer.number"
                type="text" 
                placeholder="#"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input 
                v-model="newPlayer.position"
                type="text" 
                placeholder="SS, CF, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                v-model="newPlayer.firstName"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                v-model="newPlayer.lastName"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button 
            @click="addPlayer"
            :disabled="!newPlayer.firstName"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 touch-target"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
