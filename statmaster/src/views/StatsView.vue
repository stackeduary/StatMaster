<script setup>
import { ref } from 'vue'
import AppBar from '../components/AppBar.vue'
import { useGameStore } from '../stores/gameStore'

const { teams } = useGameStore()

const selectedTeamId = ref(teams.value[0]?.id || '')
const selectedSeason = ref('2024')

// Mock stats data
const teamStats = {
  record: '8-2',
  runsFor: 124,
  runsAgainst: 78
}

const playerStats = [
  { name: 'Bill Smith', avg: '.425', obp: '.512', slg: '.725', hr: 5, rbi: 18 },
  { name: 'Dave Williams', avg: '.400', obp: '.480', slg: '.680', hr: 4, rbi: 22 },
  { name: 'Mike Johnson', avg: '.375', obp: '.450', slg: '.550', hr: 2, rbi: 12 },
  { name: 'Chris Davis', avg: '.350', obp: '.420', slg: '.500', hr: 1, rbi: 10 },
  { name: 'Tom Brown', avg: '.325', obp: '.380', slg: '.450', hr: 1, rbi: 8 },
  { name: 'John Miller', avg: '.300', obp: '.360', slg: '.420', hr: 0, rbi: 6 },
  { name: 'Steve Wilson', avg: '.290', obp: '.350', slg: '.400', hr: 0, rbi: 5 },
  { name: 'Dan Moore', avg: '.275', obp: '.340', slg: '.380', hr: 0, rbi: 4 }
]
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <AppBar title="Stats" />
    
    <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
      <!-- Filters -->
      <div class="flex gap-3 mb-4">
        <select 
          v-model="selectedTeamId"
          class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
        <select 
          v-model="selectedSeason"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>
      
      <!-- Team Summary Tiles -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-xs text-gray-500 uppercase mb-1">Record</p>
          <p class="text-xl font-bold text-gray-900">{{ teamStats.record }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-xs text-gray-500 uppercase mb-1">Runs For</p>
          <p class="text-xl font-bold text-green-600">{{ teamStats.runsFor }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm text-center">
          <p class="text-xs text-gray-500 uppercase mb-1">Runs Against</p>
          <p class="text-xl font-bold text-red-600">{{ teamStats.runsAgainst }}</p>
        </div>
      </div>
      
      <!-- Player Stats List -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Batting Leaders</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left font-medium text-gray-500">Player</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">AVG</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">OBP</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">SLG</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">HR</th>
                <th class="px-2 py-2 text-center font-medium text-gray-500">RBI</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(player, index) in playerStats" 
                :key="index"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <td class="px-3 py-3 font-medium text-gray-900">{{ player.name }}</td>
                <td class="px-2 py-3 text-center text-gray-600 font-mono">{{ player.avg }}</td>
                <td class="px-2 py-3 text-center text-gray-600 font-mono">{{ player.obp }}</td>
                <td class="px-2 py-3 text-center text-gray-600 font-mono">{{ player.slg }}</td>
                <td class="px-2 py-3 text-center text-gray-600">{{ player.hr }}</td>
                <td class="px-2 py-3 text-center text-gray-600">{{ player.rbi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
