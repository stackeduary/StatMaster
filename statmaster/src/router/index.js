import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Games',
    component: () => import('../views/GamesView.vue')
  },
  {
    path: '/game/new',
    name: 'GameSetup',
    component: () => import('../views/GameSetupView.vue')
  },
  {
    path: '/game/:id/score',
    name: 'LiveScoring',
    component: () => import('../views/LiveScoringView.vue')
  },
  {
    path: '/game/:id/summary',
    name: 'GameSummary',
    component: () => import('../views/GameSummaryView.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsView.vue')
  },
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('../views/TeamsView.vue')
  },
  {
    path: '/more',
    name: 'More',
    component: () => import('../views/MoreView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
