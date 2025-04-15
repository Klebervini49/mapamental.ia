<template>
  <div class="transcricao-container">
    <div class="header">
      <h1>Transcrição de Áudio</h1>
      <p class="subtitle">
        Transforme sua gravação em texto de forma rápida e clara
      </p>
    </div>

    <div class="content">
      <div class="info-panel">
        <h2>Como funciona</h2>
        <div class="steps">
          <div class="step">
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="step-content">
              <h3>Carregue o Áudio</h3>
              <p>Arraste ou selecione seu arquivo de áudio nos formatos MP3, WAV, OGG ou WEBM</p>
            </div>
          </div>
          <div class="step">
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </div>
            <div class="step-content">
              <h3>Transcreva</h3>
              <p>Clique em "Transcrever Áudio" e aguarde o processo ser concluído</p>
            </div>
          </div>
          <div class="step">
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="step-content">
              <h3>Utilize o Texto</h3>
              <p>Copie, baixe ou edite a transcrição para suas necessidades</p>
            </div>
          </div>
        </div>

        <div class="browser-note">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Para melhor resultado, utilize o Google Chrome ou Microsoft Edge.</p>
        </div>
      </div>

      <div class="uploader-container">
        <AudioUploader @transcription-start="onTranscriptionStart" @transcription-complete="onTranscriptionComplete" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AudioUploader from '../components/AudioUploader.vue'

const isProcessing = ref(false)

function onTranscriptionStart() {
  isProcessing.value = true
}

function onTranscriptionComplete(text: string) {
  isProcessing.value = false
}
</script>

<style scoped>
.transcricao-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #5B61D9, #7378E8);
  border-radius: 2px;
}

.header h1 {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 700;
  background: linear-gradient(135deg, #5B61D9, #4B4DC7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.3rem;
  color: #555;
  max-width: 800px;
  margin: 0 auto;
  font-weight: 300;
  line-height: 1.5;
}

.content {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

@media (max-width: 1000px) {
  .content {
    flex-direction: column;
  }

  .header h1 {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }
}

.info-panel {
  flex: 1;
  background-color: #f9fafb;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.info-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #5B61D9, #6f76e2);
  border-radius: 4px 4px 0 0;
}

.info-panel h2 {
  font-size: 1.6rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
  position: relative;
  font-weight: 600;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  position: relative;
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: rgba(91, 97, 217, 0.1);
  color: #5B61D9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(91, 97, 217, 0.08);
}

.step-icon svg {
  width: 24px;
  height: 24px;
}

.step-content h3 {
  margin: 0 0 0.4rem 0;
  color: #444;
  font-size: 1.2rem;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.browser-note {
  background-color: rgba(91, 97, 217, 0.08);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.browser-note svg {
  width: 20px;
  height: 20px;
  color: #5B61D9;
  flex-shrink: 0;
}

.browser-note p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}

.uploader-container {
  flex: 1.5;
}

@media (max-width: 768px) {
  .header {
    margin-bottom: 2rem;
  }

  .info-panel {
    padding: 1.5rem;
  }

  .steps {
    gap: 1.5rem;
  }

  .step-icon {
    width: 40px;
    height: 40px;
  }
}
</style>