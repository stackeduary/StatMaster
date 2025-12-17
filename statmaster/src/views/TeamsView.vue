<script setup>
import { ref, onMounted } from 'vue'
import AppBar from '../components/AppBar.vue'
import { useGameStore } from '../stores/gameStore'

const { teams, fetchTeams, createTeam, addPlayer: addPlayerToTeam, removePlayer: removePlayerFromTeam } = useGameStore()

const selectedTeam = ref(null)
const showAddTeam = ref(false)
const showAddPlayer = ref(false)
const newTeamName = ref('')
const newPlayer = ref({ number: '', firstName: '', lastName: '', position: '' })

onMounted(async () => {
  await fetchTeams()
})

function selectTeam(team) {
  selectedTeam.value = team
}

function goBack() {
  selectedTeam.value = null
}

async function addTeam() {
  if (newTeamName.value.trim()) {
    const team = await createTeam(newTeamName.value.trim())
    if (team) {
      newTeamName.value = ''
      showAddTeam.value = false
    }
  }
}

async function addPlayer() {
  if (selectedTeam.value && newPlayer.value.firstName) {
    await addPlayerToTeam(selectedTeam.value.id, newPlayer.value)
    newPlayer.value = { number: '', firstName: '', lastName: '', position: '' }
    showAddPlayer.value = false
  }
}

async function removePlayer(index) {
  if (selectedTeam.value) {
    const player = selectedTeam.value.players[index]
    await removePlayerFromTeam(selectedTeam.value.id, player.id)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <!-- Team List View -->
    <template v-if="!selectedTeam">
      <AppBar title="Teams" right-icon="plus" @right-action="showAddTeam = true" />
      
      <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <div v-if="teams.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500 mb-4">No teams yet</p>
          <button 
            @click="showAddTeam = true"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Create Your First Team
          </button>
        </div>
        
        <div v-else class="space-y-3">
          <button
            v-for="team in teams"
            :key="team.id"
            @click="selectTeam(team)"
            class="w-full bg-white rounded-xl p-4 shadow-sm text-left hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <p class="font-semibold text-gray-900">{{ team.name }}</p>
              <p class="text-sm text-gray-500">{{ team.players.length }} players</p>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </template>
    
    <!-- Team Detail / Roster View -->
    <template v-else>
      <AppBar :title="selectedTeam.name" show-back @click="goBack" />
      
      <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Roster</h3>
            <button 
              @click="showAddPlayer = true"
              class="text-blue-600 font-medium text-sm flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Player
            </button>
          </div>
          
          <div v-if="selectedTeam.players.length === 0" class="p-8 text-center text-gray-400">
            No players yet. Add your first player!
          </div>
          
          <div v-else class="divide-y divide-gray-100">
            <div 
              v-for="(player, index) in selectedTeam.players" 
              :key="player.id"
              class="px-4 py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                  {{ player.number || '?' }}
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ player.firstName }} {{ player.lastName }}</p>
                  <p class="text-sm text-gray-500">{{ player.position || 'No position' }}</p>
                </div>
              </div>
              <button 
                @click="removePlayer(index)"
                class="p-2 hover:bg-red-50 rounded-full text-red-500"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Add Team Modal -->
    <div 
      v-if="showAddTeam"
      class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      @click.self="showAddTeam = false"
    >
      <div class="bg-white w-full max-w-lg rounded-t-2xl p-4 pb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Add Team</h3>
          <button @click="showAddTeam = false" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input 
              v-model="newTeamName"
              type="text" 
              placeholder="Enter team name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            @click="addTeam"
            :disabled="!newTeamName.trim()"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Player Modal -->
    <div 
      v-if="showAddPlayer"
      class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      @click.self="showAddPlayer = false"
    >
      <div class="bg-white w-full max-w-lg rounded-t-2xl p-4 pb-8">
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
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
