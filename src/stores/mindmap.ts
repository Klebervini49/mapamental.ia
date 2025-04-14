import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMindMapStore = defineStore('mindmap', () => {
  const isProcessing = ref(false)
  const currentMapData = ref(null)
  const processingError = ref('')
  const history = ref([])

  function startProcessing() {
    isProcessing.value = true
    processingError.value = ''
  }

  function setMapData(data) {
    currentMapData.value = data
    isProcessing.value = false

    // Adicionar ao histórico
    const timestamp = new Date().toISOString()
    const title = data?.v?.text || 'Mapa sem título'
    history.value.push({
      id: timestamp,
      title,
      timestamp,
      preview: title,
    })
  }

  function setError(message) {
    processingError.value = message
    isProcessing.value = false
  }

  function clearMapData() {
    currentMapData.value = null
  }

  function clearHistory() {
    history.value = []
  }

  return {
    isProcessing,
    currentMapData,
    processingError,
    history,
    startProcessing,
    setMapData,
    setError,
    clearMapData,
    clearHistory,
  }
})
