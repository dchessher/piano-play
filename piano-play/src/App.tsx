import { useCallback, useEffect, useRef, useState } from 'react'
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
ALL_NOTES.forEach((note) => {
  KEY_LOOKUP.set(note.keyTrigger.toLowerCase(), note)
})

function App() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(() => new Set())
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef(
    new Map<string, { oscillator: OscillatorNode; gain: GainNode }>(),
  )

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

      if (oscillatorsRef.current.has(note.id)) {
        return
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = note.frequency

      gainNode.gain.value = 0
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const now = audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.9, now + 0.02)

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
  }, [setNoteActive, startNote, stopNote])

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
      audioContextRef.current?.close()
    }
  }, [])

  const handlePointerDown = useCallback(
    (note: NoteDefinition) => {
      startNote(note)
      setNoteActive(note, true)
    },
    [setNoteActive, startNote],
  )

  const handlePointerUp = useCallback(
    (note: NoteDefinition) => {
      stopNote(note)
      setNoteActive(note, false)
    },
    [setNoteActive, stopNote],
  )

  const keyboardGuide = ALL_NOTES.map((note) => note.keyLabel).join(' · ')

  return (
    <div className="app">
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
      <div className="piano" role="application" aria-label="Virtual piano keyboard">
        {KEYBOARD_LAYOUT.map(({ white, black }) => {
          const whiteActive = activeNotes.has(white.id)
          const blackActive = black ? activeNotes.has(black.id) : false

          return (
            <div className="key-column" key={white.id}>
              <button
                type="button"
                className={`key white ${whiteActive ? 'active' : ''}`}
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
                  className={`key black ${blackActive ? 'active' : ''}`}
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
      <footer className="footer">
        <p>
          Tip: you can layer harmonies by holding multiple keys. Refresh the page to
          reinitialize the instrument if the browser suspends audio.
        </p>
      </footer>
    </div>
  )
}

export default App
