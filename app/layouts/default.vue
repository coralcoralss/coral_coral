<script setup lang="ts">
const route = useRoute()
const { ringingAlarm, dismiss, snooze, startWatcher, stopWatcher } = useAlarms()

onMounted(() => startWatcher())
onBeforeUnmount(() => stopWatcher())
</script>

<template>
  <div class="shell">
    <header class="top">
      <NuxtLink to="/" class="brand" :aria-current="route.path === '/' ? 'page' : undefined">
        <span class="brand-mark" aria-hidden="true" />
        <span class="brand-name">Coral Clock</span>
      </NuxtLink>
      <nav class="nav">
        <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">时钟</NuxtLink>
        <NuxtLink to="/alarms" class="nav-link" :class="{ active: route.path.startsWith('/alarms') }">闹钟</NuxtLink>
      </nav>
    </header>

    <main class="main">
      <slot />
    </main>

    <Teleport to="body">
      <div v-if="ringingAlarm" class="ring-overlay" role="dialog" aria-modal="true" aria-label="闹钟响起">
        <div class="ring-card">
          <p class="ring-kicker">该起床了</p>
          <h2 class="ring-title">{{ ringingAlarm.label }}</h2>
          <p class="ring-time">{{ String(ringingAlarm.hour).padStart(2, '0') }}:{{ String(ringingAlarm.minute).padStart(2, '0') }}</p>
          <div class="ring-actions">
            <button type="button" class="btn ghost" @click="snooze(5)">稍后 5 分钟</button>
            <button type="button" class="btn primary" @click="dismiss">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem clamp(1.25rem, 4vw, 3rem);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--amber-hot), var(--coral));
  box-shadow: 0 0 0 6px var(--ring);
  animation: pulse 2.4s var(--ease-out) infinite;
}

.brand-name {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.nav {
  display: flex;
  gap: 0.35rem;
}

.nav-link {
  padding: 0.55rem 0.95rem;
  color: var(--mist);
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--foam);
  background: rgba(232, 244, 242, 0.08);
}

.main {
  padding: 0 clamp(1.25rem, 4vw, 3rem) 3rem;
}

.ring-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(6, 19, 26, 0.72);
  backdrop-filter: blur(10px);
  animation: fade-in 0.35s var(--ease-out);
}

.ring-card {
  width: min(100%, 28rem);
  padding: 2.25rem 1.75rem;
  text-align: center;
  border: 1px solid rgba(232, 244, 242, 0.12);
  background:
    radial-gradient(500px 220px at 50% 0%, rgba(232, 162, 58, 0.22), transparent 70%),
    var(--glass);
  animation: rise 0.45s var(--ease-out);
}

.ring-kicker {
  margin: 0 0 0.5rem;
  color: var(--amber);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
}

.ring-title {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  font-weight: 700;
}

.ring-time {
  margin: 0.75rem 0 1.75rem;
  font-variant-numeric: tabular-nums;
  font-size: 1.35rem;
  color: var(--mist);
}

.ring-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  border: 0;
  min-width: 8.5rem;
  padding: 0.85rem 1.15rem;
  border-radius: 999px;
  transition: transform 0.2s var(--ease-out), background 0.2s ease, color 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.primary {
  background: linear-gradient(135deg, var(--amber), var(--coral));
  color: #1a1208;
  font-weight: 700;
}

.btn.ghost {
  background: rgba(232, 244, 242, 0.08);
  color: var(--foam);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 6px var(--ring);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(232, 162, 58, 0.12);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
