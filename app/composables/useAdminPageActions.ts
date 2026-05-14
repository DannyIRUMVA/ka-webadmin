type AdminActionHandler = () => void | Promise<void>

const ACTION_EVENT = 'kakofi-admin-action'

export const useAdminPageActions = () => {
  const emit = (action: string) => {
    if (!import.meta.client) {
      return
    }

    window.dispatchEvent(new CustomEvent(ACTION_EVENT, {
      detail: { action }
    }))
  }

  const onAction = (action: string, handler: AdminActionHandler) => {
    if (!import.meta.client) {
      return
    }

    const listener = async (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: string }>
      if (customEvent.detail?.action !== action) {
        return
      }

      await handler()
    }

    onMounted(() => {
      window.addEventListener(ACTION_EVENT, listener as EventListener)
    })

    onBeforeUnmount(() => {
      window.removeEventListener(ACTION_EVENT, listener as EventListener)
    })
  }

  const downloadJson = (filename: string, data: unknown) => {
    if (!import.meta.client) {
      return
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return {
    emit,
    onAction,
    downloadJson
  }
}
