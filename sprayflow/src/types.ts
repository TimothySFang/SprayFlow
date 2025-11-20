export type MovementCategory = 
  | 'body-positions'
  | 'footwork'
  | 'hand-positions'
  | 'transitions'
  | 'balance'

export interface Movement {
  id: string
  name: string
  category: MovementCategory
}

export interface Settings {
  interval: number // seconds
  duration: number // minutes
  enabledCategories: MovementCategory[]
  useVoice: boolean
  useBeep: boolean
}

export interface SessionStats {
  totalCues: number
  categoryCounts: Record<MovementCategory, number>
  movements: Movement[]
}

