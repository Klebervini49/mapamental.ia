<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const route = useRoute()

// Verifica se o usuário está logado
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Verifica se está na página de chat para ocultar o footer
const isChat = computed(() => route.path === '/chat')

// Função para fazer logout
const handleLogout = () => {
  authStore.logout()
  window.location.href = '/'
}
</script>

<template>
  <div class="app-container" :class="{ 'chat-page': isChat }">
    <header :class="{ 'chat-header': isChat }">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
              <path d="M4.93 4.93l4.24 4.24"></path>
              <path d="M14.83 14.83l4.24 4.24"></path>
              <path d="M14.83 9.17l4.24-4.24"></path>
              <circle cx="12" cy="12" r="4" stroke="#22c55e" fill="none"></circle>
            </svg>
          </div>
          <h1>IA<span>Tools</span></h1>
        </div>

        <nav>
          <RouterLink to="/" class="nav-link">Início</RouterLink>
          <RouterLink to="/sobre" class="nav-link">Ferramentas</RouterLink>

          <!-- Menu para usuários não autenticados -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/transcricao" class="nav-link">Transcrição</RouterLink>
            <RouterLink to="/chat" class="nav-link">Chat IA</RouterLink>
            <RouterLink to="/login" class="auth-button">Entrar</RouterLink>
          </template>

          <!-- Menu para usuários autenticados -->
          <template v-else>
            <div class="user-menu">
              <RouterLink to="/chat" class="nav-link">Chat IA</RouterLink>
              <RouterLink to="/transcricao" class="nav-link">Transcrição</RouterLink>
              <RouterLink to="/mindmap" class="nav-link">Mapas Mentais</RouterLink>
              <RouterLink to="/perfil" class="nav-link">Meu Perfil</RouterLink>
              <button @click="handleLogout" class="logout-nav-button">Sair</button>
            </div>
          </template>
        </nav>
      </div>
    </header>

    <main :class="{ 'chat-main': isChat }">
      <RouterView />
    </main>

    <footer v-if="!isChat">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-logo">
            <h2>IA<span>Tools</span></h2>
            <p>Seu portal de ferramentas de inteligência artificial</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h3>Ferramentas</h3>
              <a href="/chat">Chat IA</a>
              <a href="/transcricao">Transcrição</a>
              <a href="/mindmap">Mapas Mentais</a>
            </div>
            <div class="footer-column">
              <h3>Empresa</h3>
              <a href="#">Sobre nós</a>
              <a href="#">Blog</a>
              <a href="#">Contato</a>
            </div>
            <div class="footer-column">
              <h3>Legal</h3>
              <a href="#">Termos</a>
              <a href="#">Privacidade</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} IATools - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

:root {
  --primary-color: #5B61D9;
  --primary-light: #7378E8;
  --primary-dark: #4B4DC7;
  --secondary-color: #22c55e;
  --accent-color: #f59e0b;
  --background-color: #f9fafb;
  --background-alt: #f3f4f6;
  --text-color: #1f2937;
  --text-light: #6b7280;
  --surface-color: #ffffff;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --border-radius-sm: 0.375rem;
  --border-radius: 0.75rem;
  --border-radius-lg: 1rem;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  background-image:
    radial-gradient(at 50% 0%, rgba(91, 97, 217, 0.05) 0px, transparent 50%),
    radial-gradient(at 90% 90%, rgba(34, 197, 94, 0.05) 0px, transparent 50%);
  background-attachment: fixed;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-container.chat-page {
  height: 100vh;
  overflow: hidden;
}

header {
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(229, 231, 235, 0.7);
}


.chat-main {
  flex: 1;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.header-container {
  width: 100%;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
}

.logo-icon {
  width: 2.2rem;
  height: 2.2rem;
  color: #5B61D9;
  filter: drop-shadow(0 0 8px rgba(91, 97, 217, 0.3));
  transition: transform 0.3s ease;
}

.logo-container:hover .logo-icon {
  transform: rotate(10deg);
}

h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.02em;
}

h1 span {
  color: #5B61D9;
  font-weight: 700;
}

nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: rgba(109, 40, 217, 0.05);
}

.auth-button {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.auth-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
  background-color: rgba(109, 40, 217, 0.05);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-nav-button {
  background-color: transparent;
  color: var(--text-light);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.logout-nav-button:hover {
  color: #dc2626;
  background-color: #fee2e2;
  border-color: #fecaca;
}

main {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

footer {
  background-color: #f3f4f6;
  border-top: 1px solid var(--border-color);
  padding: 3rem 0 1.5rem;
}

.footer-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  gap: 4rem;
}

.footer-logo {
  flex: 1;
}

.footer-logo h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.footer-logo span {
  color: var(--primary-color);
}

.footer-logo p {
  color: var(--text-light);
  max-width: 300px;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.footer-column h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-color);
}

.footer-column a {
  display: block;
  color: var(--text-light);
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: var(--transition);
}

.footer-column a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }

  nav {
    gap: 0.75rem;
  }

  .nav-link {
    padding: 0.5rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 2rem;
  }
}

/* Estilizando o scrollbar para WebKit (Chrome, Safari) */
::-webkit-scrollbar {
  width: 12px;
  /* Largura do scrollbar */
}

::-webkit-scrollbar-track {
  background: var(--background-alt);
  /* Cor do fundo do scrollbar */
  border-radius: 6px;
  /* Bordas arredondadas */
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  /* Cor do "thumb" do scrollbar */
  border-radius: 6px;
  /* Bordas arredondadas */
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
  /* Cor do "thumb" ao passar o mouse */
}

/* Estilizando o scrollbar para Firefox */
* {
  scrollbar-width: thin;
  /* Largura do scrollbar */
  scrollbar-color: var(--primary-color) var(--background-alt);
  /* Cor do "thumb" e do fundo */
}
</style>
