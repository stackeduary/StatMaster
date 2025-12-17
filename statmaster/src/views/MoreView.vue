<script setup>
import { useRouter } from 'vue-router'
import AppBar from '../components/AppBar.vue'

const router = useRouter()

const menuItems = [
  { 
    label: 'Teams & Players', 
    icon: 'users',
    path: '/teams',
    description: 'Manage your teams and rosters'
  },
  { 
    label: 'Settings', 
    icon: 'settings',
    path: null,
    description: 'App preferences'
  },
  { 
    label: 'About', 
    icon: 'info',
    path: null,
    description: 'Version 1.0.0'
  }
]

function handleItemClick(item) {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 theme-transition">
    <AppBar title="More" />
    
    <div class="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          v-for="(item, index) in menuItems"
          :key="item.label"
          @click="handleItemClick(item)"
          class="w-full px-4 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
          :class="{ 'border-t border-gray-100': index > 0 }"
        >
          <!-- Users icon -->
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg v-if="item.icon === 'users'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            
            <!-- Settings icon -->
            <svg v-else-if="item.icon === 'settings'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            
            <!-- Info icon -->
            <svg v-else-if="item.icon === 'info'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ item.label }}</p>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </div>
          
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- App branding -->
      <div class="mt-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-3">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path stroke-linecap="round" stroke-width="2" d="M12 2c-2 4-2 8 0 10s2 6 0 10" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-gray-900">StatMaster</h2>
        <p class="text-sm text-gray-500">Softball Scoring Made Easy</p>
      </div>
    </div>
  </div>
</template>
