import type { Movement, MovementCategory } from './types'

export const MOVEMENT_CATEGORIES: MovementCategory[] = [
  'body-positions',
  'footwork',
  'hand-positions',
  'transitions',
  'balance',
]

export const CATEGORY_LABELS: Record<MovementCategory, string> = {
  'body-positions': 'Body Positions',
  'footwork': 'Footwork',
  'hand-positions': 'Hand Positions',
  'transitions': 'Transitions',
  'balance': 'Balance',
}

export const MOVEMENTS: Movement[] = [
  // Body Positions
  { id: '1', name: 'Drop-knee', category: 'body-positions' },
  { id: '2', name: 'Backflag', category: 'body-positions' },
  { id: '3', name: 'High-step', category: 'body-positions' },
  { id: '4', name: 'Side-pull', category: 'body-positions' },
  { id: '5', name: 'Gastón', category: 'body-positions' },
  { id: '6', name: 'Mantle', category: 'body-positions' },
  { id: '7', name: 'Undercling', category: 'body-positions' },
  { id: '8', name: 'Layback', category: 'body-positions' },
  
  // Footwork
  { id: '9', name: 'Toe hook', category: 'footwork' },
  { id: '10', name: 'Heel hook', category: 'footwork' },
  { id: '11', name: 'Knee bar', category: 'footwork' },
  { id: '12', name: 'Smear', category: 'footwork' },
  { id: '13', name: 'Pogo', category: 'footwork' },
  { id: '14', name: 'Flag', category: 'footwork' },
  { id: '15', name: 'Drop-knee foot', category: 'footwork' },
  { id: '16', name: 'Outside edge', category: 'footwork' },
  
  // Hand Positions
  { id: '17', name: 'Crimp', category: 'hand-positions' },
  { id: '18', name: 'Open hand', category: 'hand-positions' },
  { id: '19', name: 'Pinch', category: 'hand-positions' },
  { id: '20', name: 'Sloper', category: 'hand-positions' },
  { id: '21', name: 'Mono', category: 'hand-positions' },
  { id: '22', name: 'Sidepull', category: 'hand-positions' },
  { id: '23', name: 'Gaston', category: 'hand-positions' },
  { id: '24', name: 'Mantle', category: 'hand-positions' },
  
  // Transitions
  { id: '25', name: 'Cross-through', category: 'transitions' },
  { id: '26', name: 'Match', category: 'transitions' },
  { id: '27', name: 'Bump', category: 'transitions' },
  { id: '28', name: 'Deadpoint', category: 'transitions' },
  { id: '29', name: 'Dyno', category: 'transitions' },
  { id: '30', name: 'Cut loose', category: 'transitions' },
  { id: '31', name: 'Rock over', category: 'transitions' },
  { id: '32', name: 'Drop knee transition', category: 'transitions' },
  
  // Balance
  { id: '33', name: 'Static balance', category: 'balance' },
  { id: '34', name: 'Slow movement', category: 'balance' },
  { id: '35', name: 'Controlled reach', category: 'balance' },
  { id: '36', name: 'Precision foot', category: 'balance' },
  { id: '37', name: 'Body tension', category: 'balance' },
  { id: '38', name: 'Core engagement', category: 'balance' },
]

export const DEFAULT_SETTINGS = {
  interval: 5,
  duration: 300, // 5 minutes in seconds
  enabledCategories: MOVEMENT_CATEGORIES,
  useVoice: true,
  useBeep: false,
} as const

