<script setup lang="ts">
const { alarms, hydrate, toggleAlarm, removeAlarm, updateLabel, formatTime, startRinging } = useAlarms()

onMounted(() => hydrate())

function onLabelBlur(id: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  updateLabel(id, value)
}
</script>

<template>
  <section class="alarms">
    <header class="head">
      <h1>闹钟列表</h1>
      <p>启用、改名、删除，或立即试响一次。</p>
    </header>

    <div v-if="!alarms.length" class="empty">
      <p>还没有闹钟。</p>
      <NuxtLink to="/" class="back">回到时钟添加 →</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="alarm in alarms" :key="alarm.id" class="item" :class="{ off: !alarm.enabled }">
        <div class="left">
          <p class="clock">{{ formatTime(alarm.hour, alarm.minute) }}</p>
          <input
            class="name"
            :value="alarm.label"
            maxlength="32"
            aria-label="闹钟名称"
            @blur="onLabelBlur(alarm.id, $event)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          >
        </div>
        <div class="actions">
          <button type="button" class="chip" @click="startRinging(alarm.id)">试响</button>
          <button type="button" class="chip" @click="toggleAlarm(alarm.id)">
            {{ alarm.enabled ? '关闭' : '启用' }}
          </button>
          <button type="button" class="chip danger" @click="removeAlarm(alarm.id)">删除</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.alarms {
  max-width: 42rem;
  margin: 0 auto;
  padding-top: 1rem;
}

.head h1 {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-size: clamp(2rem, 5vw, 2.8rem);
}

.head p {
  margin: 0.5rem 0 1.75rem;
  color: var(--mist);
}

.empty {
  padding: 2rem 0;
  color: var(--mist);
}

.back {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--amber);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  border: 1px solid rgba(232, 244, 242, 0.1);
  background: rgba(11, 31, 42, 0.42);
  animation: item-in 0.45s var(--ease-out) both;
}

.item.off {
  opacity: 0.55;
}

.clock {
  margin: 0;
  font-size: 1.85rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.name {
  margin-top: 0.35rem;
  width: min(100%, 16rem);
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--mist);
  padding: 0.15rem 0;
  outline: none;
}

.name:focus {
  border-bottom-color: var(--teal-bright);
  color: var(--foam);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: flex-end;
}

.chip {
  border: 1px solid rgba(232, 244, 242, 0.14);
  background: rgba(232, 244, 242, 0.05);
  color: var(--foam);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.chip:hover {
  background: rgba(232, 244, 242, 0.12);
}

.chip.danger:hover {
  border-color: rgba(212, 99, 74, 0.55);
  background: rgba(212, 99, 74, 0.18);
}

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .item {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
