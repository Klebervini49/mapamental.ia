<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FileUploader from '../components/FileUploader.vue'
import MindMapViewer from '../components/MindMapViewer.vue'

const isLoading = ref(false)
const hasMap = ref(false)
const mindMapData = ref(null)
const uploaderSection = ref(null)
const activeTab = ref('upload')

function handleFileProcessed(data: any) {
  mindMapData.value = data
  hasMap.value = true
  isLoading.value = false
  activeTab.value = 'map'
}

function handleProcessStart() {
  isLoading.value = true
  hasMap.value = false
}

function scrollToUploader() {
  uploaderSection.value?.scrollIntoView({ behavior: 'smooth' })
  activeTab.value = 'upload'
}

function setTab(tab: string) {
  activeTab.value = tab
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Transforme documentos em <span>mapas mentais</span> com IA</h1>
          <p>
            Nossa plataforma utiliza inteligência artificial para analisar seus documentos
            e criar mapas mentais interativos que facilitam a compreensão e organização do conteúdo.
          </p>
          <div class="hero-buttons">
            <button @click="scrollToUploader" class="primary-button">Começar agora</button>
            <a href="#como-funciona" class="secondary-button">Saiba mais</a>
          </div>
        </div>
      </div>
      <div class="hero-features">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Múltiplos formatos</h3>
          <p>Suporte para PDF, Word, TXT e mais</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <h3>IA avançada</h3>
          <p>Análise inteligente de conteúdo</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <h3>Compartilhamento</h3>
          <p>Exporte e compartilhe seus mapas</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h3>Responsivo</h3>
          <p>Acesse de qualquer dispositivo</p>
        </div>
      </div>
    </section>

    <!-- How it Works Section -->
    <section id="como-funciona" class="how-it-works-section">
      <div class="section-header">
        <h2>Como funciona</h2>
        <p>Nossa tecnologia transforma seus documentos em mapas mentais em apenas três passos</p>
      </div>
      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Faça upload</h3>
          <p>Carregue seu documento PDF, Word, TXT ou outros formatos suportados.</p>
        </div>
        
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <h3>Processamento IA</h3>
          <p>Nossa inteligência artificial analisa o conteúdo e organiza as informações.</p>
        </div>
        
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <h3>Visualize e compartilhe</h3>
          <p>Explore seu mapa mental interativo, exporte e compartilhe com facilidade.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Pronto para organizar suas ideias?</h2>
        <p>Comece agora mesmo a transformar seus documentos em mapas mentais</p>
        <div class="cta-buttons">
          <button @click="scrollToUploader" class="primary-button">Comece gratuitamente</button>
          <button class="outline-button">Ver exemplos</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
}

/* Hero Section */
.hero-section {
  width: 100%;
  background: linear-gradient(145deg, rgba(109, 40, 217, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
  padding: 6rem 0 2rem;
  overflow: hidden;
  position: relative;
}

.hero-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-text {
  width: 100%;
  text-align: center;
}

.hero-text h1 {
  font-family: 'Sora', sans-serif;
  font-size: 3.25rem;
  line-height: 1.2;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.hero-text h1 span {
  color: var(--primary-color);
  position: relative;
  display: inline-block;
}

.hero-text h1 span::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: rgba(109, 40, 217, 0.15);
  border-radius: 4px;
  z-index: -1;
}

.hero-text p {
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;
}

.primary-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.secondary-button {
  background-color: transparent;
  color: var(--text-color);
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.secondary-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.outline-button {
  background-color: transparent;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;
}

.outline-button:hover {
  background-color: rgba(109, 40, 217, 0.05);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.hero-features {
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem 0;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.feature-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--primary-color);
  background-color: rgba(109, 40, 217, 0.1);
  border-radius: 50%;
  padding: 0.75rem;
}

.feature-card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.feature-card p {
  color: var(--text-light);
  font-size: 0.9rem;
}

/* App Section */
.app-section {
  padding: 5rem 0;
  background-color: var(--background-color);
}

.app-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.app-tabs {
  display: flex;
  background-color: white;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  border: 1px solid var(--border-color);
  border-bottom: none;
  overflow: hidden;
}

.tab-button {
  padding: 1rem 2rem;
  background-color: transparent;
  border: none;
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  font-weight: 500;
  color: var(--text-light);
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.tab-button:last-child {
  border-right: none;
}

.tab-button:hover {
  background-color: rgba(109, 40, 217, 0.05);
  color: var(--primary-color);
}

.tab-button.active {
  background-color: white;
  color: var(--primary-color);
  font-weight: 600;
  position: relative;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary-color);
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-content {
  background-color: white;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  border: 1px solid var(--border-color);
  min-height: 500px;
}

.tab-content {
  padding: 2rem;
}

.content-header {
  text-align: center;
  margin-bottom: 2rem;
}

.content-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.content-header p {
  color: var(--text-light);
}

.processing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  gap: 1.5rem;
}

.loader {
  width: 4rem;
  height: 4rem;
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loader svg {
  width: 100%;
  height: 100%;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  color: var(--text-light);
  font-size: 1.125rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-state svg {
  width: 5rem;
  height: 5rem;
  color: var(--text-light);
  opacity: 0.3;
  margin-bottom: 1.5rem;
}

.empty-state p {
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.empty-state .sub-text {
  font-size: 0.95rem;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  color: var(--text-light);
  opacity: 0.8;
}

/* How it Works Section */
.how-it-works-section {
  padding: 6rem 0;
  background-color: var(--background-alt);
}

.section-header {
  text-align: center;
  width: 100%;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
  font-family: 'Sora', sans-serif;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-light);
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
}

.steps-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.step-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2.5rem 2rem;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: var(--transition);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.step-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.step-number {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
}

.step-icon {
  width: 4rem;
  height: 4rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.step-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.step-card p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
  color: white;
  text-align: center;
}

.cta-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'Sora', sans-serif;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cta-section .primary-button {
  background-color: white;
  color: var(--primary-color);
}

.cta-section .primary-button:hover {
  background-color: var(--background-color);
  color: var(--primary-dark);
}

.cta-section .outline-button {
  border-color: white;
  color: white;
}

.cta-section .outline-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-features {
    flex-wrap: wrap;
  }
  
  .feature-card {
    min-width: 45%;
  }
  
  .steps-container {
    flex-direction: column;
    align-items: center;
  }
  
  .step-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .hero-features {
    flex-direction: column;
  }
  
  .feature-card {
    width: 100%;
  }
  
  .app-tabs {
    flex-direction: column;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tab-button {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tab-button:last-child {
    border-bottom: none;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
}
</style>
