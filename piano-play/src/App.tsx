import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'

type NoteDefinition = {
  id: string
  note: string
  keyTrigger: string
  keyLabel: string
  displayName: string
  frequency: number
  type: 'white' | 'black'
}

type SongNoteEvent = {
  time: number
  noteId: string
  duration?: number
}

type SongPreset = {
  id: string
  name: string
  notes: SongNoteEvent[]
}

const HERO_SPEED_OPTIONS = [
  { id: 'slow', label: 'Slow', multiplier: 0.75 },
  { id: 'normal', label: 'Normal', multiplier: 1 },
  { id: 'fast', label: 'Fast', multiplier: 1.25 },
] as const

type HeroSpeedOption = (typeof HERO_SPEED_OPTIONS)[number]

type KeyColumn = {
  white: NoteDefinition
  black?: NoteDefinition
}

const KEYBOARD_LAYOUT: KeyColumn[] = [
  {
    white: {
      id: 'C4',
      note: 'C4',
      keyTrigger: 'a',
      keyLabel: 'A',
      displayName: 'C',
      frequency: 261.63,
      type: 'white',
    },
    black: {
      id: 'C#4',
      note: 'C♯4',
      keyTrigger: 'w',
      keyLabel: 'W',
      displayName: 'C♯',
      frequency: 277.18,
      type: 'black',
    },
  },
  {
    white: {
      id: 'D4',
      note: 'D4',
      keyTrigger: 's',
      keyLabel: 'S',
      displayName: 'D',
      frequency: 293.66,
      type: 'white',
    },
    black: {
      id: 'D#4',
      note: 'D♯4',
      keyTrigger: 'e',
      keyLabel: 'E',
      displayName: 'D♯',
      frequency: 311.13,
      type: 'black',
    },
  },
  {
    white: {
      id: 'E4',
      note: 'E4',
      keyTrigger: 'd',
      keyLabel: 'D',
      displayName: 'E',
      frequency: 329.63,
      type: 'white',
    },
  },
  {
    white: {
      id: 'F4',
      note: 'F4',
      keyTrigger: 'f',
      keyLabel: 'F',
      displayName: 'F',
      frequency: 349.23,
      type: 'white',
    },
    black: {
      id: 'F#4',
      note: 'F♯4',
      keyTrigger: 't',
      keyLabel: 'T',
      displayName: 'F♯',
      frequency: 369.99,
      type: 'black',
    },
  },
  {
    white: {
      id: 'G4',
      note: 'G4',
      keyTrigger: 'g',
      keyLabel: 'G',
      displayName: 'G',
      frequency: 392.0,
      type: 'white',
    },
    black: {
      id: 'G#4',
      note: 'G♯4',
      keyTrigger: 'y',
      keyLabel: 'Y',
      displayName: 'G♯',
      frequency: 415.3,
      type: 'black',
    },
  },
  {
    white: {
      id: 'A4',
      note: 'A4',
      keyTrigger: 'h',
      keyLabel: 'H',
      displayName: 'A',
      frequency: 440.0,
      type: 'white',
    },
    black: {
      id: 'A#4',
      note: 'A♯4',
      keyTrigger: 'u',
      keyLabel: 'U',
      displayName: 'A♯',
      frequency: 466.16,
      type: 'black',
    },
  },
  {
    white: {
      id: 'B4',
      note: 'B4',
      keyTrigger: 'j',
      keyLabel: 'J',
      displayName: 'B',
      frequency: 493.88,
      type: 'white',
    },
  },
  {
    white: {
      id: 'C5',
      note: 'C5',
      keyTrigger: 'k',
      keyLabel: 'K',
      displayName: 'C',
      frequency: 523.25,
      type: 'white',
    },
    black: {
      id: 'C#5',
      note: 'C♯5',
      keyTrigger: 'o',
      keyLabel: 'O',
      displayName: 'C♯',
      frequency: 554.37,
      type: 'black',
    },
  },
  {
    white: {
      id: 'D5',
      note: 'D5',
      keyTrigger: 'l',
      keyLabel: 'L',
      displayName: 'D',
      frequency: 587.33,
      type: 'white',
    },
    black: {
      id: 'D#5',
      note: 'D♯5',
      keyTrigger: 'p',
      keyLabel: 'P',
      displayName: 'D♯',
      frequency: 622.25,
      type: 'black',
    },
  },
  {
    white: {
      id: 'E5',
      note: 'E5',
      keyTrigger: ';',
      keyLabel: ';',
      displayName: 'E',
      frequency: 659.25,
      type: 'white',
    },
  },
]

const ALL_NOTES: NoteDefinition[] = KEYBOARD_LAYOUT.flatMap((column) =>
  column.black ? [column.white, column.black] : [column.white],
)

const KEY_LOOKUP = new Map<string, NoteDefinition>()
const NOTE_BY_ID = new Map<string, NoteDefinition>()
ALL_NOTES.forEach((note) => {
  KEY_LOOKUP.set(note.keyTrigger.toLowerCase(), note)
  NOTE_BY_ID.set(note.id, note)
})

const SONG_LIBRARY: SongPreset[] = [
  {
    id: 'ode-to-joy',
    name: 'Ode to Joy (Full Theme)',
    notes: [
      { noteId: 'E4', time: 0 },
      { noteId: 'E4', time: 0.5 },
      { noteId: 'F4', time: 1 },
      { noteId: 'G4', time: 1.5 },
      { noteId: 'G4', time: 2 },
      { noteId: 'F4', time: 2.5 },
      { noteId: 'E4', time: 3 },
      { noteId: 'D4', time: 3.5 },
      { noteId: 'C4', time: 4 },
      { noteId: 'C4', time: 4.5 },
      { noteId: 'D4', time: 5 },
      { noteId: 'E4', time: 5.5 },
      { noteId: 'E4', time: 6 },
      { noteId: 'D4', time: 6.5 },
      { noteId: 'C4', time: 7 },
      { noteId: 'C4', time: 7.5 },
      { noteId: 'D4', time: 8 },
      { noteId: 'D4', time: 8.5 },
      { noteId: 'E4', time: 9 },
      { noteId: 'C4', time: 9.5 },
      { noteId: 'D4', time: 10 },
      { noteId: 'E4', time: 10.5 },
      { noteId: 'F4', time: 11 },
      { noteId: 'E4', time: 11.5 },
      { noteId: 'C4', time: 12 },
      { noteId: 'C4', time: 12.5 },
      { noteId: 'D4', time: 13 },
      { noteId: 'E4', time: 13.5 },
      { noteId: 'D4', time: 14 },
      { noteId: 'C4', time: 14.5 },
      { noteId: 'C4', time: 15 },
      { noteId: 'C4', time: 15.5, duration: 1 },
      { noteId: 'E4', time: 16 },
      { noteId: 'E4', time: 16.5 },
      { noteId: 'F4', time: 17 },
      { noteId: 'G4', time: 17.5 },
      { noteId: 'G4', time: 18 },
      { noteId: 'F4', time: 18.5 },
      { noteId: 'E4', time: 19 },
      { noteId: 'D4', time: 19.5 },
      { noteId: 'C4', time: 20 },
      { noteId: 'C4', time: 20.5 },
      { noteId: 'D4', time: 21 },
      { noteId: 'E4', time: 21.5 },
      { noteId: 'D4', time: 22 },
      { noteId: 'C4', time: 22.5 },
      { noteId: 'C4', time: 23 },
      { noteId: 'C4', time: 23.5, duration: 1.5 },
    ],
  },
  {
    id: 'canon-in-d',
    name: 'Canon in D (Melody)',
    notes: [
      { noteId: 'D4', time: 0 },
      { noteId: 'F#4', time: 0.5 },
      { noteId: 'A4', time: 1 },
      { noteId: 'D5', time: 1.5 },
      { noteId: 'F#4', time: 2 },
      { noteId: 'G4', time: 2.5 },
      { noteId: 'A4', time: 3 },
      { noteId: 'B4', time: 3.5 },
      { noteId: 'G4', time: 4 },
      { noteId: 'F#4', time: 4.5 },
      { noteId: 'E4', time: 5 },
      { noteId: 'D4', time: 5.5 },
      { noteId: 'E4', time: 6 },
      { noteId: 'F#4', time: 6.5 },
      { noteId: 'G4', time: 7 },
      { noteId: 'A4', time: 7.5 },
      { noteId: 'F#4', time: 8 },
      { noteId: 'E4', time: 8.5 },
      { noteId: 'D4', time: 9 },
      { noteId: 'E4', time: 9.5 },
      { noteId: 'F#4', time: 10 },
      { noteId: 'G4', time: 10.5 },
      { noteId: 'A4', time: 11 },
      { noteId: 'D5', time: 11.5 },
      { noteId: 'B4', time: 12 },
      { noteId: 'A4', time: 12.5 },
      { noteId: 'G4', time: 13 },
      { noteId: 'F#4', time: 13.5 },
      { noteId: 'E4', time: 14 },
      { noteId: 'D4', time: 14.5 },
      { noteId: 'A4', time: 15 },
      { noteId: 'B4', time: 15.5 },
      { noteId: 'C#5', time: 16 },
      { noteId: 'D5', time: 16.5 },
      { noteId: 'B4', time: 17 },
      { noteId: 'A4', time: 17.5 },
      { noteId: 'G4', time: 18 },
      { noteId: 'F#4', time: 18.5 },
      { noteId: 'E4', time: 19 },
      { noteId: 'F#4', time: 19.5 },
      { noteId: 'G4', time: 20 },
      { noteId: 'A4', time: 20.5 },
      { noteId: 'B4', time: 21 },
      { noteId: 'D5', time: 21.5 },
      { noteId: 'C#5', time: 22 },
      { noteId: 'B4', time: 22.5 },
      { noteId: 'A4', time: 23 },
      { noteId: 'G4', time: 23.5 },
      { noteId: 'F#4', time: 24 },
      { noteId: 'E4', time: 24.5 },
      { noteId: 'D4', time: 25, duration: 1.5 },
    ],
  },
  {
    id: 'brahms-lullaby',
    name: "Brahms' Lullaby",
    notes: [
      { noteId: 'G4', time: 0 },
      { noteId: 'G4', time: 0.5 },
      { noteId: 'A4', time: 1 },
      { noteId: 'G4', time: 1.5 },
      { noteId: 'B4', time: 2 },
      { noteId: 'A4', time: 2.5 },
      { noteId: 'G4', time: 3 },
      { noteId: 'G4', time: 3.5 },
      { noteId: 'A4', time: 4 },
      { noteId: 'G4', time: 4.5 },
      { noteId: 'C5', time: 5 },
      { noteId: 'B4', time: 5.5 },
      { noteId: 'G4', time: 6 },
      { noteId: 'G4', time: 6.5 },
      { noteId: 'D5', time: 7 },
      { noteId: 'B4', time: 7.5 },
      { noteId: 'G4', time: 8 },
      { noteId: 'C5', time: 8.5 },
      { noteId: 'B4', time: 9 },
      { noteId: 'A4', time: 9.5 },
      { noteId: 'G4', time: 10 },
      { noteId: 'G4', time: 10.5 },
      { noteId: 'A4', time: 11 },
      { noteId: 'G4', time: 11.5 },
      { noteId: 'B4', time: 12 },
      { noteId: 'A4', time: 12.5 },
      { noteId: 'G4', time: 13 },
      { noteId: 'G4', time: 13.5 },
      { noteId: 'D5', time: 14 },
      { noteId: 'B4', time: 14.5 },
      { noteId: 'C5', time: 15 },
      { noteId: 'C5', time: 15.5 },
      { noteId: 'B4', time: 16 },
      { noteId: 'A4', time: 16.5 },
      { noteId: 'G4', time: 17 },
      { noteId: 'G4', time: 17.5 },
      { noteId: 'C5', time: 18 },
      { noteId: 'B4', time: 18.5 },
      { noteId: 'A4', time: 19 },
      { noteId: 'A4', time: 19.5 },
      { noteId: 'F4', time: 20 },
      { noteId: 'D4', time: 20.5 },
      { noteId: 'E4', time: 21 },
      { noteId: 'C4', time: 21.5 },
      { noteId: 'C4', time: 22 },
      { noteId: 'G4', time: 22.5 },
      { noteId: 'A4', time: 23 },
      { noteId: 'G4', time: 23.5 },
      { noteId: 'G4', time: 24, duration: 1.5 },
    ],
  },
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle (Opening)',
    notes: [
      { noteId: 'C4', time: 0 },
      { noteId: 'C4', time: 0.6 },
      { noteId: 'G4', time: 1.2 },
      { noteId: 'G4', time: 1.8 },
      { noteId: 'A4', time: 2.4 },
      { noteId: 'A4', time: 3 },
      { noteId: 'G4', time: 3.6, duration: 0.6 },
      { noteId: 'F4', time: 4.6 },
      { noteId: 'F4', time: 5.2 },
      { noteId: 'E4', time: 5.8 },
      { noteId: 'E4', time: 6.4 },
      { noteId: 'D4', time: 7 },
      { noteId: 'D4', time: 7.6 },
      { noteId: 'C4', time: 8.2, duration: 0.8 },
    ],
  },
  {
    id: 'happy-birthday',
    name: 'Happy Birthday (Opening)',
    notes: [
      { noteId: 'G4', time: 0 },
      { noteId: 'G4', time: 0.55 },
      { noteId: 'A4', time: 1.1 },
      { noteId: 'G4', time: 1.65 },
      { noteId: 'C5', time: 2.4 },
      { noteId: 'B4', time: 3 },
      { noteId: 'G4', time: 4.2 },
      { noteId: 'G4', time: 4.75 },
      { noteId: 'A4', time: 5.3 },
      { noteId: 'G4', time: 5.9 },
      { noteId: 'D5', time: 6.6 },
      { noteId: 'C5', time: 7.3 },
    ],
  },
]

const HERO_FALL_TIME = 3.5
const HERO_PRESPAWN_LEAD = 1
const HERO_CLEANUP_BUFFER = 0.75
const HERO_SONG_START_OFFSET = 5
const HERO_HIT_WINDOW = 0.2

type HeroNoteStatus = 'pending' | 'hit' | 'miss'

type HeroNoteInstance = {
  id: string
  noteId: string
  progress: number
  travelProgress: number
  label: string
  type: 'white' | 'black'
  status: HeroNoteStatus
  scheduledTime: number
}

function App() {
  const [isHeroMode, setIsHeroMode] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState(SONG_LIBRARY[0]?.id ?? '')
  const [isHeroPlaying, setIsHeroPlaying] = useState(false)
  const [activeHeroNotes, setActiveHeroNotes] = useState<HeroNoteInstance[]>([])
  const [heroSpeedId, setHeroSpeedId] = useState<HeroSpeedOption['id']>('normal')
  const [heroScore, setHeroScore] = useState(0)
  const [activeNotes, setActiveNotes] = useState<Set<string>>(() => new Set())
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const dynamicsRef = useRef<DynamicsCompressorNode | null>(null)
  const oscillatorsRef = useRef(
    new Map<string, { oscillator: OscillatorNode; gain: GainNode }>(),
  )
  const heroAnimationRef = useRef<number | null>(null)
  const heroStartTimestampRef = useRef<number | null>(null)
  const heroPlaybackRateRef = useRef(1)
  const heroNoteStatusRef = useRef<Map<string, HeroNoteStatus>>(new Map())
  const activeHeroNotesRef = useRef<HeroNoteInstance[]>([])

  const heroPlaybackRate = useMemo(() => {
    return (
      HERO_SPEED_OPTIONS.find((option) => option.id === heroSpeedId)?.multiplier ?? 1
    )
  }, [heroSpeedId])

  useEffect(() => {
    heroPlaybackRateRef.current = heroPlaybackRate
  }, [heroPlaybackRate])

  const setNoteActive = useCallback((note: NoteDefinition, isActive: boolean) => {
    setActiveNotes((prev) => {
      const isAlreadyActive = prev.has(note.id)
      if ((isActive && isAlreadyActive) || (!isActive && !isAlreadyActive)) {
        return prev
      }

      const next = new Set(prev)
      if (isActive) {
        next.add(note.id)
      } else {
        next.delete(note.id)
      }
      return next
    })
  }, [])

  const startNote = useCallback(
    (note: NoteDefinition) => {
      let audioContext = audioContextRef.current
      if (!audioContext) {
        audioContext = new AudioContext()
        audioContextRef.current = audioContext
      }

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => null)
      }

      if (!masterGainRef.current || !dynamicsRef.current) {
        const masterGain = audioContext.createGain()
        masterGain.gain.value = 0.5

        const compressor = audioContext.createDynamicsCompressor()
        compressor.threshold.value = -28
        compressor.knee.value = 18
        compressor.ratio.value = 4
        compressor.attack.value = 0.01
        compressor.release.value = 0.25

        masterGain.connect(compressor)
        compressor.connect(audioContext.destination)

        masterGainRef.current = masterGain
        dynamicsRef.current = compressor
      }

      const masterGain = masterGainRef.current!

      if (oscillatorsRef.current.has(note.id)) {
        return
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = note.frequency

      gainNode.gain.value = 0
      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      const now = audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.03)

      oscillator.start(now)

      oscillatorsRef.current.set(note.id, { oscillator, gain: gainNode })
    },
    [],
  )

  const stopNote = useCallback((note: NoteDefinition) => {
    const nodes = oscillatorsRef.current.get(note.id)
    const audioContext = audioContextRef.current

    if (!nodes || !audioContext) {
      return
    }

    const { oscillator, gain } = nodes
    const now = audioContext.currentTime

    gain.gain.cancelScheduledValues(now)
    const currentValue = gain.gain.value
    gain.gain.setValueAtTime(currentValue, now)
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.12)

    oscillator.stop(now + 0.12)
    setTimeout(() => {
      oscillator.disconnect()
      gain.disconnect()
    }, 200)

    oscillatorsRef.current.delete(note.id)
  }, [])

  const registerHeroInteraction = useCallback(
    (note: NoteDefinition) => {
      if (!isHeroMode || !isHeroPlaying) {
        return
      }

      const startTimestamp = heroStartTimestampRef.current
      if (startTimestamp === null) {
        return
      }

      const elapsedSeconds =
        ((performance.now() - startTimestamp) / 1000) *
        heroPlaybackRateRef.current

      let closest: HeroNoteInstance | null = null
      let smallestDiff = Number.POSITIVE_INFINITY

      activeHeroNotesRef.current.forEach((heroNote) => {
        if (heroNote.noteId !== note.id) {
          return
        }

        if (heroNote.status !== 'pending') {
          return
        }

        const diff = elapsedSeconds - heroNote.scheduledTime
        const absDiff = Math.abs(diff)
        if (absDiff < smallestDiff) {
          smallestDiff = absDiff
          closest = heroNote
        }
      })

      if (!closest) {
        return
      }

      const selected = closest as HeroNoteInstance
      const diff = elapsedSeconds - selected.scheduledTime
      const absDiff = Math.abs(diff)
      const result: HeroNoteStatus = absDiff <= HERO_HIT_WINDOW ? 'hit' : 'miss'

      heroNoteStatusRef.current.set(selected.id, result)
      setActiveHeroNotes((prev) =>
        prev.map((heroNote) =>
          heroNote.id === selected.id ? { ...heroNote, status: result } : heroNote,
        ),
      )

      if (result === 'hit') {
        setHeroScore((prev) => prev + 1)
      }
    },
    [isHeroMode, isHeroPlaying, setActiveHeroNotes, setHeroScore],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const note = KEY_LOOKUP.get(event.key.toLowerCase())
      if (!note) {
        return
      }

      event.preventDefault()
      if (event.repeat) {
        return
      }

      startNote(note)
      setNoteActive(note, true)
      registerHeroInteraction(note)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = KEY_LOOKUP.get(event.key.toLowerCase())
      if (!note) {
        return
      }

      event.preventDefault()
      stopNote(note)
      setNoteActive(note, false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [registerHeroInteraction, setNoteActive, startNote, stopNote])

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(({ oscillator, gain }) => {
        try {
          oscillator.stop()
        } catch (error) {
          // ignore errors from already stopped oscillators
        }
        oscillator.disconnect()
        gain.disconnect()
      })
      oscillatorsRef.current.clear()
      if (audioContextRef.current) {
        if (dynamicsRef.current) {
          dynamicsRef.current.disconnect()
          dynamicsRef.current = null
        }
        if (masterGainRef.current) {
          masterGainRef.current.disconnect()
          masterGainRef.current = null
        }
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  const handlePointerDown = useCallback(
    (note: NoteDefinition) => {
      startNote(note)
      setNoteActive(note, true)
      registerHeroInteraction(note)
    },
    [registerHeroInteraction, setNoteActive, startNote],
  )

  const handlePointerUp = useCallback(
    (note: NoteDefinition) => {
      stopNote(note)
      setNoteActive(note, false)
    },
    [setNoteActive, stopNote],
  )

  const keyboardGuide = ALL_NOTES.map((note) => note.keyLabel).join(' · ')

  useEffect(() => {
    if (!isHeroMode) {
      setIsHeroPlaying(false)
      setActiveHeroNotes([])
    }
  }, [isHeroMode])

  useEffect(() => {
    activeHeroNotesRef.current = activeHeroNotes
  }, [activeHeroNotes])

  useEffect(() => {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      return
    }

    rootElement.classList.toggle('hero-mode-active', isHeroMode)

    return () => {
      rootElement.classList.remove('hero-mode-active')
    }
  }, [isHeroMode])

  useEffect(() => {
    if (!isHeroMode || !isHeroPlaying) {
      if (heroAnimationRef.current !== null) {
        cancelAnimationFrame(heroAnimationRef.current)
        heroAnimationRef.current = null
      }
      heroStartTimestampRef.current = null
      heroNoteStatusRef.current = new Map()
      setActiveHeroNotes([])
      return
    }

    const song = SONG_LIBRARY.find((preset) => preset.id === selectedSongId)
    if (!song) {
      setIsHeroPlaying(false)
      return
    }

    const startTimestamp = performance.now()
    heroStartTimestampRef.current = startTimestamp
    heroNoteStatusRef.current = new Map()

    const lastNoteTime = song.notes.reduce(
      (latest, note) =>
        Math.max(
          latest,
          note.time + HERO_SONG_START_OFFSET + (note.duration ?? 0),
        ),
      0,
    )

    const step = () => {
      const now = performance.now()
      const elapsedSeconds = (now - startTimestamp) / 1000
      const adjustedElapsed = elapsedSeconds * heroPlaybackRate

      const active: HeroNoteInstance[] = []

      song.notes.forEach((event, index) => {
        const note = NOTE_BY_ID.get(event.noteId)
        if (!note) return

        const heroLeadTime = HERO_PRESPAWN_LEAD * heroPlaybackRate
        const totalTravelTime = HERO_FALL_TIME + heroLeadTime
        const scheduledTime = event.time + HERO_SONG_START_OFFSET
        const topArrivalTime = scheduledTime - HERO_FALL_TIME
        const spawnTime = topArrivalTime - heroLeadTime
        const despawnTime =
          scheduledTime + (event.duration ?? 0) + HERO_CLEANUP_BUFFER
        const noteId = `${song.id}-${index}`

        if (adjustedElapsed < spawnTime || adjustedElapsed > despawnTime) {
          if (adjustedElapsed > despawnTime) {
            heroNoteStatusRef.current.delete(noteId)
          }
          return
        }

        const progress = (adjustedElapsed - topArrivalTime) / HERO_FALL_TIME
        const travelProgress = (adjustedElapsed - spawnTime) / totalTravelTime
        const status = heroNoteStatusRef.current.get(noteId) ?? 'pending'

        active.push({
          id: noteId,
          noteId: note.id,
          progress,
          travelProgress,
          label: note.displayName,
          type: note.type,
          status,
          scheduledTime,
        })
      })

      setActiveHeroNotes(active)

      if (adjustedElapsed > lastNoteTime + HERO_FALL_TIME + HERO_CLEANUP_BUFFER) {
        setIsHeroPlaying(false)
        return
      }

      heroAnimationRef.current = requestAnimationFrame(step)
    }

    heroAnimationRef.current = requestAnimationFrame(step)

    return () => {
      if (heroAnimationRef.current !== null) {
        cancelAnimationFrame(heroAnimationRef.current)
        heroAnimationRef.current = null
      }
      heroStartTimestampRef.current = null
    }
  }, [heroPlaybackRate, isHeroMode, isHeroPlaying, selectedSongId])

  const heroNoteBuckets = useMemo(() => {
    const bucket = new Map<string, HeroNoteInstance[]>()
    activeHeroNotes.forEach((note) => {
      if (!bucket.has(note.noteId)) {
        bucket.set(note.noteId, [])
      }
      bucket.get(note.noteId)!.push(note)
    })
    bucket.forEach((notes) => notes.sort((a, b) => a.travelProgress - b.travelProgress))
    return bucket
  }, [activeHeroNotes])

  const heroCueNotes = useMemo(() => {
    const cues = new Set<string>()
    activeHeroNotes.forEach((note) => {
      if (
        note.status === 'pending' &&
        note.progress >= 0.85 &&
        note.progress <= 1.1
      ) {
        cues.add(note.noteId)
      }
    })
    return cues
  }, [activeHeroNotes])

  const selectedSong = useMemo(
    () => SONG_LIBRARY.find((preset) => preset.id === selectedSongId) ?? SONG_LIBRARY[0],
    [selectedSongId],
  )

  const handleSongSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSongId(event.target.value)
    setIsHeroPlaying(false)
    setActiveHeroNotes([])
    heroNoteStatusRef.current = new Map()
    heroStartTimestampRef.current = null
    setHeroScore(0)
  }

  const handleHeroSpeedChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHeroSpeedId(event.target.value as HeroSpeedOption['id'])
    setActiveHeroNotes([])
    heroNoteStatusRef.current = new Map()
    heroStartTimestampRef.current = null
    setHeroScore(0)
  }

  const handleHeroModeToggle = () => {
    if (isHeroMode) {
      setIsHeroPlaying(false)
      setActiveHeroNotes([])
      heroStartTimestampRef.current = null
    }
    heroNoteStatusRef.current = new Map()
    setHeroScore(0)
    setIsHeroMode((prev) => !prev)
  }

  const handleHeroPlaybackToggle = () => {
    if (isHeroPlaying) {
      setIsHeroPlaying(false)
      heroStartTimestampRef.current = null
    } else {
      setActiveHeroNotes([])
      heroNoteStatusRef.current = new Map()
      heroStartTimestampRef.current = null
      setHeroScore(0)
      setIsHeroPlaying(true)
    }
  }

  const renderHeroNotes = (notes: HeroNoteInstance[]) =>
    notes.map((note) => {
      const isVisible = note.travelProgress >= -0.05 && note.travelProgress <= 1.05
      const topPercent = note.travelProgress * 100
      const statusClass = note.status !== 'pending' ? ` hero-note-${note.status}` : ''
      return (
        <button
          key={note.id}
          type="button"
          className={`hero-note hero-note-${note.type}${statusClass}`}
          tabIndex={-1}
          aria-hidden="true"
          disabled
          style={{ top: `${topPercent}%`, opacity: isVisible ? 1 : 0 }}
        >
          {note.label}
        </button>
      )
    })

  return (
    <div className={`app ${isHeroMode ? 'hero-mode' : ''}`}>
      <div className="mode-bar">
        <button
          type="button"
          className="mode-toggle"
          onClick={handleHeroModeToggle}
        >
          {isHeroMode ? 'Exit Hero Mode' : 'Enter Hero Mode'}
        </button>
        {isHeroMode ? (
          <div className="hero-bar-right">
            <div className="hero-controls">
              <label className="song-picker">
                <span>Song</span>
                <select value={selectedSong?.id ?? ''} onChange={handleSongSelect}>
                  {SONG_LIBRARY.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="speed-picker">
                <span>Speed</span>
                <select value={heroSpeedId} onChange={handleHeroSpeedChange}>
                  {HERO_SPEED_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="hero-play"
                onClick={handleHeroPlaybackToggle}
                disabled={!selectedSong}
              >
                {isHeroPlaying ? 'Stop' : 'Start'}
              </button>
            </div>
            <div className="hero-score" aria-live="polite">
              <span className="hero-score-label">Score</span>
              <span className="hero-score-value">{heroScore}</span>
            </div>
          </div>
        ) : null}
      </div>
      {!isHeroMode ? (
        <>
          <header className="header">
            <h1>Play It By Key</h1>
            <p className="description">
              Tap the keys below or use your computer keyboard to trigger real sine-wave
              notes. Hold a key to sustain a note and combine keys to create chords.
            </p>
            <p className="keyboard-guide">
              Keyboard mapping: <span>{keyboardGuide}</span>
            </p>
          </header>
        </>
      ) : null}
      <div
        className={`piano ${isHeroMode ? 'hero-mode' : ''}`}
        role="application"
        aria-label="Virtual piano keyboard"
      >
        {isHeroMode ? (
          <div className="hero-overlay" aria-hidden="true">
            <div className="hero-lanes">
              {KEYBOARD_LAYOUT.map(({ white, black }) => {
                const whiteLaneNotes = heroNoteBuckets.get(white.id) ?? []
                const blackLaneNotes = black ? heroNoteBuckets.get(black.id) ?? [] : []

                return (
                  <div className="hero-column" key={`lane-${white.id}`}>
                    <div className="hero-lane hero-lane-white">
                      <div className="hero-guideline" />
                      {renderHeroNotes(whiteLaneNotes)}
                    </div>
                    {black ? (
                      <div className="hero-lane hero-lane-black">
                        <div className="hero-guideline" />
                        {renderHeroNotes(blackLaneNotes)}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
        <div className="keybed">
          {KEYBOARD_LAYOUT.map(({ white, black }) => {
            const whiteActive = activeNotes.has(white.id)
            const blackActive = black ? activeNotes.has(black.id) : false

            return (
              <div className="key-column" key={white.id}>
                <button
                  type="button"
                  className={`key white ${whiteActive ? 'active' : ''} ${
                    heroCueNotes.has(white.id) ? 'hero-cue' : ''
                  }`}
                  aria-label={`${white.note} – press ${white.keyLabel}`}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    handlePointerDown(white)
                  }}
                  onPointerUp={() => handlePointerUp(white)}
                  onPointerLeave={(event) => {
                    if (event.buttons !== 1) return
                    handlePointerUp(white)
                  }}
                  onPointerCancel={() => handlePointerUp(white)}
                >
                  <span className="note-name">{white.displayName}</span>
                  <span className="key-label">{white.keyLabel}</span>
                </button>
                {black ? (
                  <button
                    type="button"
                    className={`key black ${blackActive ? 'active' : ''} ${
                      heroCueNotes.has(black.id) ? 'hero-cue' : ''
                    }`}
                    aria-label={`${black.note} – press ${black.keyLabel}`}
                    onPointerDown={(event) => {
                      event.preventDefault()
                      handlePointerDown(black)
                    }}
                    onPointerUp={() => handlePointerUp(black)}
                    onPointerLeave={(event) => {
                      if (event.buttons !== 1) return
                      handlePointerUp(black)
                    }}
                    onPointerCancel={() => handlePointerUp(black)}
                  >
                    <span className="note-name">{black.displayName}</span>
                    <span className="key-label">{black.keyLabel}</span>
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      {!isHeroMode ? (
        <footer className="footer">
          <p>
            Tip: you can layer harmonies by holding multiple keys. Refresh the page to
            reinitialize the instrument if the browser suspends audio.
          </p>
        </footer>
      ) : null}
    </div>
  )
}

export default App
