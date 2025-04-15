<template>
  <div class="audio-uploader">
    <div class="dropzone" :class="{ 'is-dragging': isDragging, 'has-file': !!audioFile }" @dragenter="onDragEnter"
      @dragleave="onDragLeave" @dragover="onDragOver" @drop="onFileDrop" @click="triggerFileInput">
      <input type="file" ref="fileInput" class="file-input" accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm"
        @change="onFileSelected" />

      <div v-if="!audioFile" class="upload-prompt">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </div>
        <div class="upload-text">
          <p class="primary-text">Arraste um arquivo de áudio ou clique para selecionar</p>
          <p class="upload-hint">Formatos suportados: MP3, WAV, OGG, WEBM (max 25MB)</p>
        </div>
      </div>

      <div v-else class="file-info">
        <div class="file-preview">
          <audio controls :src="audioUrl" class="audio-preview"></audio>
        </div>
        <div class="file-details">
          <p class="file-name">{{ audioFile.name }}</p>
          <p class="file-size">{{ formattedSize }}</p>
          <button class="remove-file" @click.stop="resetFile">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Remover
          </button>
        </div>
      </div>
    </div>

    <div v-if="fileError" class="error-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ fileError }}
    </div>

    <div v-if="audioFile && !isTranscribing && !transcription" class="action-buttons">
      <button class="transcribe-button" @click="startTranscription" :disabled="!isValidFile">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Transcrever Áudio
      </button>
    </div>

    <div v-if="isTranscribing" class="processing-indicator">
      <svg class="animated-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
      </svg>
      <p>Transcrevendo áudio...</p>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: transcriptionProgress + '%' }"></div>
      </div>
    </div>

    <!-- Botão para abrir o modal quando a transcrição estiver pronta -->
    <div v-if="transcription && !isModalOpen" class="view-transcription-button">
      <button class="view-button" @click="openModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        Ver Transcrição Completa
      </button>
    </div>

    <!-- Modal de Transcrição -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Transcrição do Áudio
          </h3>
          <button class="close-button" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="transcription-text markdown-content" v-html="renderedMarkdown"></div>
          <div class="transcription-actions">
            <div class="action-buttons-group">
              <button class="action-button copy-button" @click="copyTranscription" title="Copiar texto">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copiar</span>
              </button>
              <button class="action-button download-button" @click="downloadTranscription"
                title="Baixar como arquivo de texto">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Baixar</span>
              </button>
              <button class="action-button new-transcription" @click="resetFile" title="Iniciar nova transcrição">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
                <span>Nova Transcrição</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import audioTranscriptionService from '../services/audioTranscriptionService'

const emit = defineEmits(['transcription-start', 'transcription-complete'])

const isDragging = ref(false)
const audioFile = ref<File | null>(null)
const audioUrl = ref('')
const fileError = ref('')
const isTranscribing = ref(false)
const transcription = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const transcriptionProgress = ref(0)
const isModalOpen = ref(false)

// Rendereiza o markdown da transcrição
const renderedMarkdown = computed(() => {
  if (!transcription.value) return ''

  // Configura opções do marked para melhor segurança e personalização
  marked.setOptions({
    breaks: true,     // Quebras de linha são convertidas em <br>
    gfm: true,        // GitHub Flavored Markdown
    headerIds: false, // Desativa IDs automáticos nos cabeçalhos
    mangle: false,    // Não escapa HTML
    sanitize: false   // Não remove HTML (cuidado!)
  })

  return marked.parse(transcription.value)
})

// Constantes
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const VALID_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']

// Valores computados
const formattedSize = computed(() => {
  if (!audioFile.value) return ''
  const size = audioFile.value.size
  if (size < 1024) return size + ' bytes'
  else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  else return (size / (1024 * 1024)).toFixed(2) + ' MB'
})

const isValidFile = computed(() => {
  if (!audioFile.value) return false
  return VALID_AUDIO_TYPES.includes(audioFile.value.type) && audioFile.value.size <= MAX_FILE_SIZE
})

// Funções para controlar o modal
function openModal() {
  isModalOpen.value = true
  // Impede rolagem da página quando o modal está aberto
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  isModalOpen.value = false
  // Restaura rolagem quando o modal é fechado
  document.body.style.overflow = 'auto'
}

// Detecta tecla ESC para fechar o modal
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

// Adiciona e remove listeners de teclado
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// Manipuladores de eventos
function onDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function triggerFileInput() {
  fileInput.value?.click()
}

function resetFile(e?: Event) {
  if (e) e.stopPropagation()

  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }

  audioFile.value = null
  audioUrl.value = ''
  fileError.value = ''
  transcription.value = ''
  transcriptionProgress.value = 0
  isModalOpen.value = false

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onFileDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  fileError.value = ''

  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles || droppedFiles.length === 0) return

  const droppedFile = droppedFiles[0]

  if (!VALID_AUDIO_TYPES.includes(droppedFile.type)) {
    fileError.value = 'Formato de áudio não suportado. Por favor, use MP3, WAV, OGG ou WEBM.'
    return
  }

  if (droppedFile.size > MAX_FILE_SIZE) {
    fileError.value = 'Arquivo muito grande. O tamanho máximo é 25MB.'
    return
  }

  audioFile.value = droppedFile
  audioUrl.value = URL.createObjectURL(droppedFile)
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  fileError.value = ''

  if (!target.files || target.files.length === 0) return

  const selectedFile = target.files[0]

  if (!VALID_AUDIO_TYPES.includes(selectedFile.type)) {
    fileError.value = 'Formato de áudio não suportado. Por favor, use MP3, WAV, OGG ou WEBM.'
    return
  }

  if (selectedFile.size > MAX_FILE_SIZE) {
    fileError.value = 'Arquivo muito grande. O tamanho máximo é 25MB.'
    return
  }

  audioFile.value = selectedFile
  audioUrl.value = URL.createObjectURL(selectedFile)
}

// Simula o progresso da transcrição
function simulateProgress() {
  let progress = 0
  const interval = setInterval(() => {
    progress += 2
    if (progress >= 95) {
      clearInterval(interval)
      progress = 95
    }
    transcriptionProgress.value = progress
  }, 300)

  return interval
}

async function startTranscription() {
  if (!audioFile.value || !isValidFile.value) return

  try {
    isTranscribing.value = true
    emit('transcription-start')

    // Simulação de progresso
    const progressInterval = simulateProgress()

    // Fazer a transcrição com a API nativa e formatar com Ollama
    const result = await audioTranscriptionService.transcribeAudio(audioFile.value, {
      language: 'pt-BR'
    })

    clearInterval(progressInterval)
    transcriptionProgress.value = 100

    if (!result) {
      throw new Error('Falha na transcrição')
    }

    // Usar o texto formatado
    transcription.value = result.text

    // Abrir o modal automaticamente quando a transcrição terminar
    setTimeout(() => {
      openModal()
    }, 500)

    emit('transcription-complete', transcription.value)
  } catch (error) {
    console.error('Erro na transcrição:', error)
    fileError.value = 'Erro ao transcrever o áudio. Por favor, tente novamente.'
  } finally {
    setTimeout(() => {
      isTranscribing.value = false
    }, 500)
  }
}

function copyTranscription() {
  if (!transcription.value) return

  navigator.clipboard.writeText(transcription.value)
    .then(() => {
      // Feedback visual opcional de sucesso (poderia ser um toast)
      const copyButton = document.querySelector('.copy-button')
      if (copyButton) {
        copyButton.classList.add('success')
        setTimeout(() => {
          copyButton.classList.remove('success')
        }, 2000)
      }
    })
    .catch(err => {
      console.error('Erro ao copiar:', err)
      fileError.value = 'Não foi possível copiar a transcrição.'
    })
}

function downloadTranscription() {
  if (!transcription.value || !audioFile.value) return

  // Cria um nome de arquivo baseado no original
  const originalName = audioFile.value.name
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
  const fileName = `${baseName}_transcricao.md`

  // Cria um blob e faz o download
  const blob = new Blob([transcription.value], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, fileName)

  // Feedback visual
  const downloadButton = document.querySelector('.download-button')
  if (downloadButton) {
    downloadButton.classList.add('success')
    setTimeout(() => {
      downloadButton.classList.remove('success')
    }, 2000)
  }
}
</script>

<style scoped>
.audio-uploader {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dropzone {
  position: relative;
  padding: 2.5rem;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: #f9f9fb;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.dropzone:hover {
  background-color: #f0f4fd;
  border-color: #5B61D9;
}

.is-dragging {
  background-color: #e9f0ff;
  border-color: #5B61D9;
}

.has-file {
  background-color: #f0f7ff;
  border-color: #5B61D9;
  border-style: solid;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: -1;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.upload-icon {
  color: #5B61D9;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.dropzone:hover .upload-icon {
  transform: scale(1.05);
  opacity: 1;
}

.upload-text {
  color: #333;
}

.primary-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.upload-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.2rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.file-preview {
  width: 100%;
  padding: 0.5rem 0;
}

.audio-preview {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.file-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.file-name {
  font-weight: 600;
  word-break: break-all;
  color: #333;
}

.file-size {
  font-size: 0.85rem;
  color: #666;
}

.remove-file {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.8rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.remove-file:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d32f2f;
  margin-top: 1rem;
  font-size: 0.9rem;
  padding: 0.8rem;
  background-color: #ffebee;
  border-radius: 8px;
}

.action-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.transcribe-button,
.view-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.8rem 1.5rem;
  background-color: #5B61D9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(91, 97, 217, 0.2);
}

.transcribe-button:hover,
.view-button:hover {
  background-color: #4B4DC7;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(91, 97, 217, 0.3);
}

.transcribe-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.view-transcription-button {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.processing-indicator {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.animated-icon {
  color: #5B61D9;
  animation: pulse 1.5s ease infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }

  100% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.progress-bar-container {
  width: 100%;
  max-width: 300px;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #5B61D9;
  transition: width 0.3s ease;
}

/* Estilos do Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(16, 24, 40, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.15s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  animation: modalIn 0.2s ease-out forwards;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
  color: #111827;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-header svg {
  color: #4b5563;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.modal-content {
  padding: 1.75rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: white;
}

.transcription-text {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 1.75rem;
  overflow-y: auto;
  line-height: 1.7;
  border: 1px solid #e5e7eb;
  flex: 1;
  max-height: 60vh;
  font-size: 1rem;
  color: #374151;
}

/* Estilos para markdown */
.markdown-content {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.markdown-content :deep(h1) {
  font-size: 1.75rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.markdown-content :deep(h2) {
  font-size: 1.4rem;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
  font-weight: 600;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.2rem;
  margin-bottom: 0.7rem;
  color: #374151;
}

.markdown-content :deep(h4) {
  font-size: 1.1rem;
  margin-top: 1rem;
  margin-bottom: 0.6rem;
  color: #4b5563;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #9ca3af;
  padding: 0.75rem 1rem;
  margin: 1.25rem 0;
  background-color: #f9fafb;
  color: #4b5563;
  font-style: italic;
}

.markdown-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background-color: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #334155;
}

.markdown-content :deep(pre) {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(b) {
  color: #000000;
  font-weight: 600;
}

.transcription-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 0.5rem;
  padding-top: 1.25rem;
}

.action-buttons-group {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.action-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}

.action-button:active {
  transform: translateY(1px);
}

.action-button svg {
  color: #6b7280;
}

.copy-button {
  background-color: white;
  color: #4b5563;
}

.download-button {
  background-color: white;
  color: #4b5563;
}

.new-transcription {
  background-color: white;
  color: #4b5563;
}

.copy-button.success,
.download-button.success {
  background-color: #f0fdf4;
  color: #16a34a;
  border-color: #dcfce7;
}

/* Estilos para scrollbar personalizado na área de texto */
.transcription-text::-webkit-scrollbar {
  width: 6px;
}

.transcription-text::-webkit-scrollbar-track {
  background-color: #f9fafb;
}

.transcription-text::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 6px;
}

.transcription-text::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

@media (max-width: 600px) {
  .action-buttons-group {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .transcription-text {
    padding: 1rem;
  }
}
</style>