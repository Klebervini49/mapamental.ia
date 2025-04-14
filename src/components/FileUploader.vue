<script setup lang="ts">
import { ref, computed } from 'vue'
import { saveAs } from 'file-saver'
import * as pdfjsLib from 'pdfjs-dist'
import * as markmapLib from 'markmap-lib'
import { Transformer } from 'markmap-lib'

// Configuração do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const emit = defineEmits(['processing-start', 'file-processed'])

const isDragging = ref(false)
const file = ref(null)
const fileUrl = ref('')
const fileContent = ref('')
const isProcessing = ref(false)
const fileError = ref('')
const uploadProgress = ref(0)

const validFileTypes = ['application/pdf', 'text/plain']
const maxFileSize = 10 * 1024 * 1024 // 10MB

const formattedSize = computed(() => {
  if (!file.value) return ''
  const size = file.value.size
  if (size < 1024) return size + ' bytes'
  else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  else return (size / (1024 * 1024)).toFixed(2) + ' MB'
})

const isValidFile = computed(() => {
  if (!file.value) return false
  return validFileTypes.includes(file.value.type) && file.value.size <= maxFileSize
})

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

function resetFile() {
  file.value = null
  fileUrl.value = ''
  fileContent.value = ''
  fileError.value = ''
  uploadProgress.value = 0
}

async function onFileDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  fileError.value = ''
  
  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles || droppedFiles.length === 0) return
  
  const droppedFile = droppedFiles[0]
  
  if (!validFileTypes.includes(droppedFile.type)) {
    fileError.value = 'Tipo de arquivo não suportado. Por favor, use PDF ou TXT.'
    return
  }
  
  if (droppedFile.size > maxFileSize) {
    fileError.value = 'Arquivo muito grande. O tamanho máximo é 10MB.'
    return
  }
  
  file.value = droppedFile
  await handleFile()
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  fileError.value = ''
  
  if (!target.files || target.files.length === 0) return
  
  const selectedFile = target.files[0]
  
  if (!validFileTypes.includes(selectedFile.type)) {
    fileError.value = 'Tipo de arquivo não suportado. Por favor, use PDF ou TXT.'
    return
  }
  
  if (selectedFile.size > maxFileSize) {
    fileError.value = 'Arquivo muito grande. O tamanho máximo é 10MB.'
    return
  }
  
  file.value = selectedFile
  handleFile()
}

async function handleFile() {
  const selectedFile = file.value
  if (!selectedFile) return
  
  try {
    uploadProgress.value = 0
    
    // Simulate file upload progress
    const interval = setInterval(() => {
      uploadProgress.value += Math.random() * 15
      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100
        clearInterval(interval)
      }
    }, 200)
    
    // Read file content
    const reader = new FileReader()
    
    const fileReadPromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'))
      }
    })
    
    if (selectedFile.type === 'application/pdf') {
      reader.readAsArrayBuffer(selectedFile)
    } else {
      reader.readAsText(selectedFile)
    }
    
    const content = await fileReadPromise
    fileContent.value = content as string
    fileUrl.value = URL.createObjectURL(selectedFile)
    
    // Complete upload simulation
    uploadProgress.value = 100
    clearInterval(interval)
    
    // Process the file
    processFile()
  } catch (error) {
    fileError.value = 'Erro ao processar o arquivo. Por favor, tente novamente.'
    console.error('File handling error:', error)
  }
}

function processFile() {
  try {
    emit('processing-start')
    isProcessing.value = true
    
    // Simulate AI processing
    setTimeout(() => {
      const mockData = {
        root: {
          label: file.value?.name || 'Documento',
          children: [
            {
              label: 'Conceitos Principais',
              children: [
                { label: 'Conceito 1', children: [] },
                { label: 'Conceito 2', children: [] },
                { label: 'Conceito 3', children: [] }
              ]
            },
            {
              label: 'Ideias Secundárias',
              children: [
                { label: 'Ideia 1', children: [] },
                { label: 'Ideia 2', children: [] }
              ]
            },
            {
              label: 'Conclusões',
              children: [
                { label: 'Conclusão 1', children: [] },
                { label: 'Conclusão 2', children: [] }
              ]
            }
          ]
        }
      }
      
      emit('file-processed', mockData)
      isProcessing.value = false
    }, 2000)
  } catch (error) {
    fileError.value = 'Erro ao processar o arquivo. Por favor, tente novamente.'
    isProcessing.value = false
    console.error('File processing error:', error)
  }
}
</script>

<template>
  <div class="file-uploader">
    <div 
      class="upload-area" 
      :class="{ 'drag-over': isDragging, 'has-file': file, 'has-error': fileError }"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave" 
      @dragover="onDragOver"
      @drop="onFileDrop"
    >
      <div v-if="!file || fileError" class="upload-placeholder">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p class="upload-text">Arraste e solte seu arquivo aqui ou</p>
        <label class="file-select-button">
          Selecionar arquivo
          <input type="file" accept=".pdf,.txt" @change="onFileSelected" />
        </label>
        <p class="file-types">PDF, TXT (máx. 10MB)</p>
        <p v-if="fileError" class="error-message">{{ fileError }}</p>
      </div>
      
      <div v-else-if="uploadProgress < 100" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <p class="progress-text">Fazendo upload... {{ Math.round(uploadProgress) }}%</p>
      </div>
      
      <div v-else class="file-preview">
        <div class="file-info">
          <div class="file-icon">
            <svg v-if="file.type === 'application/pdf'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formattedSize }}</div>
          </div>
        </div>
        
        <div class="file-actions">
          <button class="action-button process" @click="processFile" :disabled="isProcessing || !isValidFile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            {{ isProcessing ? 'Processando...' : 'Gerar mapa mental' }}
          </button>
          <button class="action-button remove" @click="resetFile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  </div>
</template>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-area {
  width: 100%;
  min-height: 300px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 2rem;
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.upload-area.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(109, 40, 217, 0.05);
  transform: scale(1.01);
}

.upload-area.has-file {
  border-style: solid;
  background-color: white;
}

.upload-area.has-error {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.upload-icon {
  width: 4rem;
  height: 4rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.upload-text {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.file-select-button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 1rem;
}

.file-select-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.file-select-button input {
  display: none;
}

.file-types {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  max-width: 80%;
}

.upload-progress {
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: var(--text-light);
  font-size: 0.95rem;
}

.file-preview {
  width: 100%;
  max-width: 500px;
}

.file-info {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.file-icon {
  width: 3rem;
  height: 3rem;
  color: var(--primary-color);
  margin-right: 1rem;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--text-light);
  font-size: 0.9rem;
}

.file-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  font-size: 0.95rem;
}

.action-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.action-button.process {
  background-color: var(--primary-color);
  color: white;
  flex: 1;
}

.action-button.process:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-button.process:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-button.remove {
  background-color: transparent;
  color: var(--text-light);
  border: 1px solid var(--border-color);
}

.action-button.remove:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #ef4444;
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .file-actions {
    flex-direction: column;
  }
  
  .upload-area {
    min-height: 250px;
    padding: 1.5rem;
  }
  
  .upload-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
  }
  
  .upload-text {
    font-size: 1rem;
  }
}
</style> 