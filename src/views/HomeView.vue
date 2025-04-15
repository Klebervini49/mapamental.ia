<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'

const activeCategory = ref('todas')

function setCategory(category: string) {
  activeCategory.value = category
}

const tools = [
  {
    id: 1,
    name: 'Chat IA',
    description: 'Converse com nossa IA avançada para obter respostas, ideias e soluções',
    icon: 'message-circle',
    category: 'comunicacao',
    url: '/chat',
    color: '#5B61D9'
  },
  {
    id: 2,
    name: 'Transcrição de Áudio',
    description: 'Transforme áudios em texto com alta precisão e rapidez',
    icon: 'mic',
    category: 'audio',
    url: '/transcricao',
    color: '#22c55e'
  },
  {
    id: 3,
    name: 'Mapas Mentais',
    description: 'Crie mapas mentais a partir de textos e documentos automaticamente',
    icon: 'git-branch',
    category: 'visual',
    url: '/mindmap',
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Gerador de Imagens',
    description: 'Crie imagens a partir de descrições textuais com IA generativa',
    icon: 'image',
    category: 'visual',
    url: '/imagens',
    color: '#EC4899'
  },
  {
    id: 5,
    name: 'Resumo de Textos',
    description: 'Resuma longos textos e documentos em poucos parágrafos',
    icon: 'file-text',
    category: 'texto',
    url: '/resumo',
    color: '#3B82F6'
  },
  {
    id: 6,
    name: 'Tradução Avançada',
    description: 'Traduza textos entre dezenas de idiomas com precisão contextual',
    icon: 'globe',
    category: 'texto',
    url: '/traducao',
    color: '#8B5CF6'
  }
]

const filteredTools = computed(() => {
  if (activeCategory.value === 'todas') return tools
  return tools.filter(tool => tool.category === activeCategory.value)
})
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Seu portal de <span>ferramentas IA</span> em um só lugar</h1>
          <p>
            Acesse diversas ferramentas de inteligência artificial para facilitar seu trabalho,
            aumentar sua produtividade e explorar o potencial da IA.
          </p>
          <div class="hero-buttons">
            <a href="#ferramentas" class="primary-button">Explorar ferramentas</a>
            <RouterLink to="/sobre" class="secondary-button">Saiba mais</RouterLink>
          </div>
        </div>
      </div>
      <div class="hero-features">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M12 18h.01"></path>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              <path d="M15.9 8.7a4 4 0 0 0-5.657-5.657"></path>
              <path d="M12 16v-4"></path>
              <path
                d="M8.5 8.5c-.964.968-1.5 2.304-1.5 3.664 0 2.767 2.23 5.336 5 5.336s5-2.57 5-5.336c0-1.36-.536-2.696-1.5-3.664-.964-.968-2.39-1.3-3.5-1.3s-2.536.332-3.5 1.3Z">
              </path>
            </svg>
          </div>
          <h3>IA Avançada</h3>
          <p>Modelos de IA de última geração</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"></path>
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"></path>
              <path d="M12 7v10"></path>
              <path d="m9 10 3-3 3 3"></path>
              <path d="m9 14 3 3 3-3"></path>
            </svg>
          </div>
          <h3>Integração</h3>
          <p>Conecte com seus apps favoritos</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3>Atualizações</h3>
          <p>Novas ferramentas regularmente</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h3>Desempenho</h3>
          <p>Respostas rápidas e precisas</p>
        </div>
      </div>
    </section>

    <!-- Tools Section -->
    <section id="ferramentas" class="tools-section">
      <div class="section-header">
        <h2>Nossas Ferramentas</h2>
        <p>Explore diversas ferramentas de IA para diferentes necessidades</p>
      </div>

      <div class="tools-categories">
        <button @click="setCategory('todas')" class="category-button" :class="{ active: activeCategory === 'todas' }">
          Todas
        </button>
        <button @click="setCategory('comunicacao')" class="category-button"
          :class="{ active: activeCategory === 'comunicacao' }">
          Comunicação
        </button>
        <button @click="setCategory('visual')" class="category-button" :class="{ active: activeCategory === 'visual' }">
          Visual
        </button>
        <button @click="setCategory('texto')" class="category-button" :class="{ active: activeCategory === 'texto' }">
          Texto
        </button>
        <button @click="setCategory('audio')" class="category-button" :class="{ active: activeCategory === 'audio' }">
          Áudio
        </button>
      </div>

      <div class="tools-grid">
        <RouterLink v-for="tool in filteredTools" :key="tool.id" :to="tool.url" class="tool-card">
          <div class="tool-icon" :style="{ backgroundColor: `${tool.color}15`, color: tool.color }">
            <svg v-if="tool.icon === 'message-circle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
              </path>
            </svg>
            <svg v-if="tool.icon === 'mic'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <svg v-if="tool.icon === 'git-branch'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <line x1="6" y1="3" x2="6" y2="15"></line>
              <circle cx="18" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            <svg v-if="tool.icon === 'image'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <svg v-if="tool.icon === 'file-text'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <svg v-if="tool.icon === 'globe'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z">
              </path>
            </svg>
          </div>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
          <div class="tool-action">
            <span>Acessar</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Pronto para melhorar seu trabalho com IA?</h2>
        <p>Registre-se gratuitamente e tenha acesso a todas as ferramentas</p>
        <div class="cta-buttons">
          <RouterLink to="/registrar" class="primary-button">Criar conta grátis</RouterLink>
          <RouterLink to="/sobre" class="outline-button">Saiba mais</RouterLink>
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
  background: linear-gradient(145deg, rgba(91, 97, 217, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
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
  background-color: rgba(91, 97, 217, 0.15);
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
  display: inline-block;
  text-decoration: none;
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
  text-decoration: none;
  display: inline-block;
}

.outline-button:hover {
  background-color: rgba(91, 97, 217, 0.05);
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
  background-color: rgba(91, 97, 217, 0.1);
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

/* Tools Section */
.tools-section {
  padding: 5rem 2rem;
  background-color: var(--background-color);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
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
  max-width: 700px;
  margin: 0 auto;
}

.tools-categories {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.category-button {
  background-color: transparent;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-light);
}

.category-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.category-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.tool-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  border: 1px solid var(--border-color);
  transition: var(--transition);
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.tool-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.tool-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

.tool-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.tool-card p {
  color: var(--text-light);
  font-size: 0.95rem;
  line-height: 1.6;
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.tool-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.tool-action svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-action svg {
  transform: translateX(4px);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(145deg, rgba(91, 97, 217, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  padding: 5rem 2rem;
  margin-top: 3rem;
  border-radius: var(--border-radius);
  margin-bottom: 4rem;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-family: 'Sora', sans-serif;
}

.cta-content p {
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 2.5rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-features {
    flex-direction: column;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .hero-text h1 {
    font-size: 2.5rem;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
  }
}
</style>
