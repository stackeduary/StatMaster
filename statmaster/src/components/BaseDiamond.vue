<script setup>
const props = defineProps({
  bases: {
    type: Object,
    default: () => ({ first: null, second: null, third: null })
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
})

function getPlayerLabel(player) {
  if (!player) return ''
  const firstInitial = player.firstName?.[0] || ''
  const lastInitial = player.lastName?.[0] || ''
  return `${player.number} ${firstInitial}${lastInitial}`
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-40 h-40'
}
</script>

<template>
  <div class="relative" :class="sizeClasses[size]">
    <!-- Diamond shape -->
    <svg viewBox="0 0 100 100" class="w-full h-full">
      <!-- Base paths (lines connecting bases) -->
      <path 
        d="M50 85 L85 50 L50 15 L15 50 Z" 
        fill="none" 
        stroke="#d1d5db" 
        stroke-width="2"
      />
      
      <!-- Home plate -->
      <polygon 
        points="50,90 45,85 45,80 55,80 55,85" 
        fill="#6b7280"
      />
      
      <!-- First base -->
      <rect 
        x="80" y="45" width="10" height="10" 
        :fill="bases.first ? '#3b82f6' : '#e5e7eb'"
        stroke="#9ca3af"
        stroke-width="1"
        transform="rotate(45 85 50)"
      />
      
      <!-- Second base -->
      <rect 
        x="45" y="10" width="10" height="10" 
        :fill="bases.second ? '#3b82f6' : '#e5e7eb'"
        stroke="#9ca3af"
        stroke-width="1"
        transform="rotate(45 50 15)"
      />
      
      <!-- Third base -->
      <rect 
        x="10" y="45" width="10" height="10" 
        :fill="bases.third ? '#3b82f6' : '#e5e7eb'"
        stroke="#9ca3af"
        stroke-width="1"
        transform="rotate(45 15 50)"
      />
    </svg>
    
    <!-- Runner labels -->
    <div 
      v-if="bases.first"
      class="absolute text-xs font-bold text-white bg-blue-600 px-1 rounded"
      style="right: -5px; top: 50%; transform: translateY(-50%);"
    >
      {{ getPlayerLabel(bases.first) }}
    </div>
    
    <div 
      v-if="bases.second"
      class="absolute text-xs font-bold text-white bg-blue-600 px-1 rounded"
      style="left: 50%; top: -5px; transform: translateX(-50%);"
    >
      {{ getPlayerLabel(bases.second) }}
    </div>
    
    <div 
      v-if="bases.third"
      class="absolute text-xs font-bold text-white bg-blue-600 px-1 rounded"
      style="left: -5px; top: 50%; transform: translateY(-50%);"
    >
      {{ getPlayerLabel(bases.third) }}
    </div>
  </div>
</template>
