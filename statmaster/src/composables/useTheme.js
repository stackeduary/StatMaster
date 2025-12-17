import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  // Initialize from localStorage or system preference
  function initTheme() {
    const stored = localStorage.getItem('statmaster-theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('statmaster-theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  // Watch for changes
  watch(isDark, applyTheme)

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
