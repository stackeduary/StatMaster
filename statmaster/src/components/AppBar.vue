<script setup>
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  rightAction: { type: String, default: null },
  rightIcon: { type: String, default: null },
  showThemeToggle: { type: Boolean, default: true }
})

const emit = defineEmits(['right-action'])

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top theme-transition">
    <div class="flex items-center justify-between h-14 px-3 max-w-lg mx-auto">
      <!-- Left: Back button or theme toggle -->
      <div class="flex items-center gap-1">
        <button
          v-if="showBack"
          @click="goBack"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-target flex items-center justify-center"
        >
          <svg class="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <ThemeToggle v-if="showThemeToggle && !showBack" />
      </div>
      
      <!-- Center: Title -->
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 text-center px-2">{{ title }}</h1>
      
      <!-- Right: Action button or theme toggle -->
      <div class="flex items-center gap-1">
        <ThemeToggle v-if="showThemeToggle && showBack" />
        <button
          v-if="rightAction || rightIcon"
          @click="$emit('right-action')"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-target flex items-center justify-center"
        >
          <!-- Plus icon -->
          <svg v-if="rightIcon === 'plus'" class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          
          <!-- Menu icon -->
          <svg v-else-if="rightIcon === 'menu'" class="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          
          <!-- Text action -->
          <span v-else-if="rightAction" class="text-blue-600 dark:text-blue-400 font-medium text-sm">{{ rightAction }}</span>
        </button>
        <!-- Spacer when no right action -->
        <div v-else-if="!showBack" class="w-10" />
      </div>
    </div>
  </header>
</template>
