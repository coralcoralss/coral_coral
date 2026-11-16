<script setup lang="ts">
const { hours, minutes, seconds, dateLabel } = useClock()
const { alarms, addAlarm, formatTime } = useAlarms()

const hour = ref(7)
const minute = ref(30)
const label = ref('')
const justAdded = ref(false)

const nextAlarm = computed(() => {
  const enabled = alarms.value.filter(a => a.enabled)
  if (!enabled.length) return null
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const ranked = [...enabled].sort((a, b) => {
    const am = a.hour * 60 + a.minute
    const bm = b.hour * 60 + b.minute
    const ad = am >= nowMins ? am - nowMins : am + 1440 - nowMins
    const bd = bm >= nowMins ? bm - nowMins : bm + 1440 - nowMins
    return ad - bd
  })
  return ranked[0]
})

function onSubmit() {
  addAlarm({
    hour: hour.value,
    minute: minute.value,
    label: label.value,
  })
  label.value = ''
  justAdded.value = true
  window.setTimeout(() => {
    justAdded.value = false
  }, 1600)
}

onMounted(() => {
  const n = new Date()
  hour.value = n.getHours()
  minute.value = Math.ceil((n.getMinutes() + 1) / 5) * 5 % 60
  if (minute.value === 0 && n.getMinutes() > 54) {
    hour.value = (hour.value + 1) % 24
  }
})
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Coral Clock</p>
      <h1 class="time" aria-live="polite">
        <span>{{ hours }}</span><span class="colon" :class="{ dim: Number(seconds) % 2 === 1 }">:</span><span>{{ minutes }}</span>
        <span class="seconds">{{ seconds }}</span>
      </h1>
      <p class="date">{{ dateLabel }}</p>
      <p v-if="nextAlarm" class="next">
        下一个闹钟 · {{ nextAlarm.label }} · {{ formatTime(nextAlarm.hour, nextAlarm.minute) }}
      </p>
      <p v-else class="next muted">还没有启用的闹钟</p>
    </div>

    <form class="setter" @submit.prevent="onSubmit">
      <h2 class="setter-title">设定闹钟</h2>
      <p class="setter-sub">选一个时间，让早晨准时到达。</p>

      <div class="fields">
        <label class="field">
          <span>时</span>
          <input v-model.number="hour" type="number" min="0" max="23" required>
        </label>
        <span class="sep" aria-hidden="true">:</span>
        <label class="field">
          <span>分</span>
          <input v-model.number="minute" type="number" min="0" max="59" required>
        </label>
      </div>

      <label class="label-field">
        <span>名称（可选）</span>
        <input v-model="label" type="text" maxlength="32" placeholder="例如：起床 / 开会">
      </label>

      <button type="submit" class="submit">
        {{ justAdded ? '已添加' : '添加闹钟' }}
      </button>

      <NuxtLink to="/alarms" class="manage">管理全部闹钟 →</NuxtLink>
    </form>
  </section>
</template>

<style scoped>
.hero {
  min-height: calc(100vh - 6rem);
  display: grid;
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  grid-template-columns: 1.2fr 0.9fr;
}

.hero-copy {
  position: relative;
}

.eyebrow {
  margin: 0 0 0.75rem;
  font-family: 'Fraunces', serif;
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  background: linear-gradient(120deg, var(--foam) 20%, var(--amber) 70%, var(--coral));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: reveal 0.9s var(--ease-out);
}

.time {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: clamp(3.4rem, 10vw, 6.5rem);
  letter-spacing: -0.04em;
  line-height: 1;
  animation: reveal 1s var(--ease-out) 0.08s both;
}

.colon {
  transition: opacity 0.2s ease;
}

.colon.dim {
  opacity: 0.28;
}

.seconds {
  margin-left: 0.55rem;
  font-size: 0.34em;
  color: var(--mist);
  font-weight: 500;
}

.date,
.next {
  margin: 0.85rem 0 0;
  color: var(--mist);
  font-size: 1.05rem;
  animation: reveal 1s var(--ease-out) 0.16s both;
}

.next.muted {
  opacity: 0.7;
}

.setter {
  padding: 1.75rem;
  border: 1px solid rgba(232, 244, 242, 0.1);
  background: rgba(11, 31, 42, 0.45);
  backdrop-filter: blur(8px);
  animation: rise-in 0.8s var(--ease-out) 0.12s both;
}

.setter-title {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-size: 1.65rem;
}

.setter-sub {
  margin: 0.4rem 0 1.4rem;
  color: var(--mist);
}

.fields {
  display: flex;
  align-items: end;
  gap: 0.65rem;
}

.field {
  display: grid;
  gap: 0.4rem;
  flex: 1;
}

.field span,
.label-field span {
  font-size: 0.8rem;
  color: var(--mist);
  letter-spacing: 0.04em;
}

.field input,
.label-field input {
  width: 100%;
  border: 1px solid rgba(232, 244, 242, 0.14);
  background: rgba(6, 19, 26, 0.55);
  color: var(--foam);
  padding: 0.85rem 0.9rem;
  border-radius: 0.65rem;
  outline: none;
}

.field input:focus,
.label-field input:focus {
  border-color: var(--teal-bright);
  box-shadow: 0 0 0 3px rgba(42, 155, 148, 0.2);
}

.sep {
  font-size: 1.8rem;
  padding-bottom: 0.55rem;
  color: var(--mist);
}

.label-field {
  display: grid;
  gap: 0.4rem;
  margin-top: 1rem;
}

.submit {
  margin-top: 1.25rem;
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 0.95rem 1.2rem;
  font-weight: 700;
  color: #14100a;
  background: linear-gradient(135deg, var(--teal-bright), var(--amber));
  transition: transform 0.2s var(--ease-out), filter 0.2s ease;
}

.submit:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.manage {
  display: inline-block;
  margin-top: 1rem;
  color: var(--mist);
  transition: color 0.2s ease;
}

.manage:hover {
  color: var(--foam);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 0.5rem;
  }

  .eyebrow {
    font-size: clamp(2.2rem, 12vw, 3.4rem);
  }
}
</style>
