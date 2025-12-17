<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import { useTheme } from './composables/useTheme'

const route = useRoute()
const { initTheme } = useTheme()

// Initialize theme on app mount
onMounted(() => {
  initTheme()
})

// Hide bottom nav on live scoring screen to maximize space
const showBottomNav = computed(() => {
  return route.name !== 'LiveScoring'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col theme-transition">
    <!-- Main content area -->
    <main class="flex-1 pb-16" :class="{ 'pb-0': !showBottomNav }">
      <router-view />
    </main>
    
    <!-- Bottom navigation -->
    <BottomNav v-if="showBottomNav" />
  </div>
</template>
