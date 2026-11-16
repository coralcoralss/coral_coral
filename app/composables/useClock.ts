export function useClock() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  const hours = computed(() => String(now.value.getHours()).padStart(2, '0'))
  const minutes = computed(() => String(now.value.getMinutes()).padStart(2, '0'))
  const seconds = computed(() => String(now.value.getSeconds()).padStart(2, '0'))
  const dateLabel = computed(() =>
    now.value.toLocaleDateString('zh-CN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  function tick() {
    now.value = new Date()
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, 250)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { now, hours, minutes, seconds, dateLabel }
}
