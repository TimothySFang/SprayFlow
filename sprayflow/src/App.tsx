import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Container,
  Title,
  Paper,
  Slider,
  Checkbox,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Divider,
  Card,
  Grid,
  ActionIcon,
} from '@mantine/core'
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconArrowRight } from '@tabler/icons-react'
import type { Settings, Movement, SessionStats, MovementCategory } from './types'
import { DEFAULT_SETTINGS, MOVEMENTS, MOVEMENT_CATEGORIES, CATEGORY_LABELS } from './constants'
import './App.css'

type SessionState = 'idle' | 'running' | 'paused' | 'completed'

const STORAGE_KEY = 'sprayflow-settings'

function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS
  })
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  
  const intervalRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  // Beep sound function
  const playBeep = useCallback(() => {
    if (!settings.useBeep) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.warn('Beep sound not available:', error)
    }
  }, [settings.useBeep])

  // Voice announcement
  const speakMovement = useCallback((movement: Movement) => {
    if (!settings.useVoice || !speechSynthesisRef.current) return
    
    try {
      speechSynthesisRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(movement.name)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      speechSynthesisRef.current.speak(utterance)
    } catch (error) {
      console.warn('Speech synthesis not available:', error)
    }
  }, [settings.useVoice])

  // Get random movement from enabled categories
  const getRandomMovement = useCallback((): Movement | null => {
    const availableMovements = MOVEMENTS.filter(m => 
      settings.enabledCategories.includes(m.category)
    )
    if (availableMovements.length === 0) return null
    return availableMovements[Math.floor(Math.random() * availableMovements.length)]
  }, [settings.enabledCategories])

  // Update movement cue
  const updateMovement = useCallback(() => {
    const movement = getRandomMovement()
    if (movement) {
      setCurrentMovement(movement)
      speakMovement(movement)
      playBeep()
      
      // Update stats
      setSessionStats(prev => {
        if (!prev) {
          return {
            totalCues: 1,
            categoryCounts: {
              'body-positions': 0,
              'footwork': 0,
              'hand-positions': 0,
              'transitions': 0,
              'balance': 0,
            },
            movements: [movement],
          }
        }
        const newCounts = { ...prev.categoryCounts }
        newCounts[movement.category] = (newCounts[movement.category] || 0) + 1
        return {
          totalCues: prev.totalCues + 1,
          categoryCounts: newCounts,
          movements: [...prev.movements, movement],
        }
      })
    }
  }, [getRandomMovement, speakMovement, playBeep])

  const startSession = useCallback(() => {
    setSessionState('running')
    setTimeRemaining(settings.duration * 60)
    setSessionStats({
      totalCues: 0,
      categoryCounts: {
        'body-positions': 0,
        'footwork': 0,
        'hand-positions': 0,
        'transitions': 0,
        'balance': 0,
      },
      movements: [],
    })
    
    updateMovement()
    
    intervalRef.current = window.setInterval(() => {
      updateMovement()
    }, settings.interval * 1000)
    
    // Set up timer for session duration
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopSession()
          setSessionState('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [settings, updateMovement])

  // Pause session
  const pauseSession = useCallback(() => {
    setSessionState('paused')
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
    }
  }, [])

  // Resume session
  const resumeSession = useCallback(() => {
    setSessionState('running')
    
    // Resume interval
    intervalRef.current = window.setInterval(() => {
      updateMovement()
    }, settings.interval * 1000)
    
    // Resume timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopSession()
          setSessionState('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [settings, updateMovement])

  // Stop session
  const stopSession = useCallback(() => {
    setSessionState('idle')
    setCurrentMovement(null)
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
    }
  }, [])

  // Skip to next movement
  const skipMovement = useCallback(() => {
    if (sessionState === 'running') {
      updateMovement()
    }
  }, [sessionState, updateMovement])

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCategoryToggle = (category: MovementCategory) => {
    setSettings(prev => ({
      ...prev,
      enabledCategories: prev.enabledCategories.includes(category)
        ? prev.enabledCategories.filter(c => c !== category)
        : [...prev.enabledCategories, category],
    }))
  }

  return (
    <Container size="sm" py="xl" className="app-container">
      <Stack gap="lg">
        <Title order={1} ta="center" c="blue">SprayFlow</Title>
        <Text ta="center" c="dimmed" size="sm">
          Movement metronome for spray wall warmups
        </Text>

        {sessionState === 'idle' && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Settings</Title>
              
      <div>
                <Text size="sm" fw={500} mb="xs">
                  Interval: {settings.interval}s
                </Text>
                <Slider
                  value={settings.interval}
                  onChange={(value) => setSettings(prev => ({ ...prev, interval: value }))}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '1s' },
                    { value: 5, label: '5s' },
                    { value: 10, label: '10s' },
                  ]}
                />
      </div>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Duration: {settings.duration} min
                </Text>
                <Slider
                  value={settings.duration}
                  onChange={(value) => setSettings(prev => ({ ...prev, duration: value }))}
                  min={1}
                  max={20}
                  step={1}
                  marks={[
                    { value: 1, label: '1m' },
                    { value: 10, label: '10m' },
                    { value: 20, label: '20m' },
                  ]}
                />
      </div>

              <Divider label="Movement Categories" labelPosition="center" />

              <Stack gap="xs">
                {MOVEMENT_CATEGORIES.map(category => (
                  <Checkbox
                    key={category}
                    label={CATEGORY_LABELS[category]}
                    checked={settings.enabledCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                ))}
              </Stack>

              <Divider />

              <Stack gap="xs">
                <Checkbox
                  label="Voice prompts"
                  checked={settings.useVoice}
                  onChange={(e) => setSettings(prev => ({ ...prev, useVoice: e.target.checked }))}
                />
                <Checkbox
                  label="Beep sound"
                  checked={settings.useBeep}
                  onChange={(e) => setSettings(prev => ({ ...prev, useBeep: e.target.checked }))}
                />
              </Stack>

              <Button
                size="lg"
                leftSection={<IconPlayerPlay size={20} />}
                onClick={startSession}
                disabled={settings.enabledCategories.length === 0}
                fullWidth
              >
                Start Session
              </Button>
            </Stack>
          </Paper>
        )}

        {(sessionState === 'running' || sessionState === 'paused') && (
          <Stack gap="md">
            <Card p="xl" withBorder className="cue-card">
              <Stack gap="md" align="center">
                <Text size="lg" c="dimmed">
                  {formatTime(timeRemaining)}
                </Text>
                {currentMovement && (
                  <>
                    <Badge size="lg" variant="light" color="blue">
                      {CATEGORY_LABELS[currentMovement.category]}
                    </Badge>
                    <Title order={1} className="movement-name">
                      {currentMovement.name}
                    </Title>
                  </>
                )}
              </Stack>
            </Card>

            <Group justify="center" gap="xs">
              {sessionState === 'running' ? (
                <ActionIcon
                  size="xl"
                  variant="filled"
                  color="blue"
                  onClick={pauseSession}
                >
                  <IconPlayerPause size={24} />
                </ActionIcon>
              ) : (
                <ActionIcon
                  size="xl"
                  variant="filled"
                  color="green"
                  onClick={resumeSession}
                >
                  <IconPlayerPlay size={24} />
                </ActionIcon>
              )}
              <ActionIcon
                size="xl"
                variant="filled"
                color="orange"
                onClick={skipMovement}
                disabled={sessionState === 'paused'}
              >
                <IconArrowRight size={24} />
              </ActionIcon>
              <ActionIcon
                size="xl"
                variant="filled"
                color="red"
                onClick={stopSession}
              >
                <IconPlayerStop size={24} />
              </ActionIcon>
            </Group>
          </Stack>
        )}

        {sessionState === 'completed' && sessionStats && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Session Summary</Title>
              
              <Card p="md" withBorder>
                <Text size="xl" fw={700} ta="center">
                  {sessionStats.totalCues} cues completed
                </Text>
              </Card>

              <Divider label="By Category" labelPosition="center" />

              <Grid>
                {MOVEMENT_CATEGORIES.map(category => (
                  <Grid.Col key={category} span={6}>
                    <Card p="sm" withBorder>
                      <Text size="sm" c="dimmed">{CATEGORY_LABELS[category]}</Text>
                      <Text size="xl" fw={700}>
                        {sessionStats.categoryCounts[category] || 0}
                      </Text>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              <Button
                size="lg"
                onClick={() => {
                  setSessionState('idle')
                  setSessionStats(null)
                  setCurrentMovement(null)
                }}
                fullWidth
              >
                New Session
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}

export default App
