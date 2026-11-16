export type Alarm = {
  id: string
  label: string
  hour: number
  minute: number
  enabled: boolean
  lastFiredKey?: string
}

const STORAGE_KEY = 'coral-clock-alarms'

function loadAlarms(): Alarm[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Alarm[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAlarms(alarms: Alarm[]) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
}

function createTone() {
  if (!import.meta.client) return null
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  return new AudioCtx()
}

export function useAlarms() {
  const alarms = useState<Alarm[]>('alarms', () => [])
  const ringingId = useState<string | null>('ringing-id', () => null)
  const hydrated = useState('alarms-hydrated', () => false)

  let watchTimer: ReturnType<typeof setInterval> | null = null
  let audioCtx: AudioContext | null = null
  let beepTimer: ReturnType<typeof setInterval> | null = null

  const ringingAlarm = computed(() => alarms.value.find(a => a.id === ringingId.value) ?? null)

  function persist() {
    saveAlarms(alarms.value)
  }

  function hydrate() {
    if (hydrated.value) return
    alarms.value = loadAlarms()
    hydrated.value = true
  }

  function formatTime(hour: number, minute: number) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  function addAlarm(input: { hour: number; minute: number; label?: string }) {
    const alarm: Alarm = {
      id: crypto.randomUUID(),
      label: input.label?.trim() || '闹钟',
      hour: input.hour,
      minute: input.minute,
      enabled: true,
    }
    alarms.value = [...alarms.value, alarm].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
    persist()
    return alarm
  }

  function toggleAlarm(id: string) {
    alarms.value = alarms.value.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    if (ringingId.value === id) stopRinging()
    persist()
  }

  function removeAlarm(id: string) {
    alarms.value = alarms.value.filter(a => a.id !== id)
    if (ringingId.value === id) stopRinging()
    persist()
  }

  function updateLabel(id: string, label: string) {
    alarms.value = alarms.value.map(a => (a.id === id ? { ...a, label: label.trim() || '闹钟' } : a))
    persist()
  }

  function fireKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`
  }

  function playBeep() {
    if (!audioCtx) audioCtx = createTone()
    if (!audioCtx) return
    if (audioCtx.state === 'suspended') void audioCtx.resume()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.0001
    osc.connect(gain)
    gain.connect(audioCtx.destination)

    const t = audioCtx.currentTime
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    osc.start(t)
    osc.stop(t + 0.4)
  }

  function startRinging(id: string) {
    ringingId.value = id
    playBeep()
    if (beepTimer) clearInterval(beepTimer)
    beepTimer = setInterval(playBeep, 900)
  }

  function stopRinging() {
    ringingId.value = null
    if (beepTimer) {
      clearInterval(beepTimer)
      beepTimer = null
    }
  }

  function dismiss() {
    if (!ringingId.value) return
    const id = ringingId.value
    const key = fireKey(new Date())
    alarms.value = alarms.value.map(a => (a.id === id ? { ...a, lastFiredKey: key } : a))
    persist()
    stopRinging()
  }

  function snooze(minutes = 5) {
    if (!ringingId.value) return
    const current = alarms.value.find(a => a.id === ringingId.value)
    if (!current) return

    const now = new Date()
    now.setSeconds(0, 0)
    now.setMinutes(now.getMinutes() + minutes)

    alarms.value = alarms.value.map(a =>
      a.id === current.id
        ? {
            ...a,
            hour: now.getHours(),
            minute: now.getMinutes(),
            lastFiredKey: fireKey(new Date()),
            label: a.label.includes('稍后') ? a.label : `${a.label} · 稍后`,
          }
        : a,
    )
    persist()
    stopRinging()
  }

  function checkAlarms() {
    if (ringingId.value) return
    const now = new Date()
    if (now.getSeconds() > 2) return
    const key = fireKey(now)

    for (const alarm of alarms.value) {
      if (!alarm.enabled) continue
      if (alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) continue
      if (alarm.lastFiredKey === key) continue
      alarms.value = alarms.value.map(a => (a.id === alarm.id ? { ...a, lastFiredKey: key } : a))
      persist()
      startRinging(alarm.id)
      break
    }
  }

  function startWatcher() {
    if (!import.meta.client || watchTimer) return
    hydrate()
    checkAlarms()
    watchTimer = setInterval(checkAlarms, 500)
  }

  function stopWatcher() {
    if (watchTimer) {
      clearInterval(watchTimer)
      watchTimer = null
    }
    stopRinging()
  }

  return {
    alarms,
    ringingAlarm,
    ringingId,
    hydrate,
    addAlarm,
    toggleAlarm,
    removeAlarm,
    updateLabel,
    formatTime,
    dismiss,
    snooze,
    startWatcher,
    stopWatcher,
    startRinging,
  }
}
