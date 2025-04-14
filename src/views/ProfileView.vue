<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isEditing = ref(false)
const userName = ref('')
const userEmail = ref('')
const activeTab = ref('personal')

// Verifica se o usuário está autenticado
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // Preenche os campos com os dados do usuário
  if (authStore.user) {
    userName.value = authStore.user.name
    userEmail.value = authStore.user.email
  }
})

const userInitials = computed(() => {
  if (!authStore.user?.name) return '?'
  return authStore.user.name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const startEditing = () => {
  isEditing.value = true
}

const saveChanges = () => {
  if (authStore.user) {
    // Em um aplicativo real, você enviaria essas alterações para um backend
    // Aqui apenas simulamos a atualização
    authStore.user.name = userName.value
    
    // Atualiza no localStorage também
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }
  isEditing.value = false
}

const cancelEditing = () => {
  // Restaura os valores originais
  if (authStore.user) {
    userName.value = authStore.user.name
    userEmail.value = authStore.user.email
  }
  isEditing.value = false
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}
</script>

<template>
  <div v-if="authStore.user" class="profile-container">
    <div class="profile-header">
      <h1>Meu Perfil</h1>
      <p>Gerencie suas informações e configurações de conta</p>
    </div>
    
    <div class="profile-content">
      <div class="profile-sidebar">
        <div class="profile-sidebar-header">
          <div class="profile-avatar-wrapper">
            <div v-if="authStore.user.avatar" class="profile-avatar">
              <img :src="authStore.user.avatar" :alt="authStore.user.name" />
            </div>
            <div v-else class="profile-avatar profile-avatar-initials">
              {{ userInitials }}
            </div>
            <div class="profile-avatar-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
          </div>
          <h2 class="profile-name">{{ authStore.user.name }}</h2>
          <p class="profile-email">{{ authStore.user.email }}</p>
        </div>
        
        <div class="profile-navigation">
          <button 
            class="profile-nav-item" 
            :class="{ active: activeTab === 'personal' }"
            @click="setActiveTab('personal')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Informações Pessoais</span>
          </button>
          
          <button 
            class="profile-nav-item" 
            :class="{ active: activeTab === 'account' }"
            @click="setActiveTab('account')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Conta e Segurança</span>
          </button>
          
          <div class="profile-nav-divider"></div>
          
          <button class="profile-nav-item logout-item" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
      
      <div class="profile-details">
        <!-- Tab: Informações Pessoais -->
        <div v-if="activeTab === 'personal'" class="profile-tab">
          <div class="profile-tab-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Informações Pessoais
            </h3>
            <p>Atualize seus dados pessoais</p>
          </div>
          
          <div class="profile-card">
            <form @submit.prevent="saveChanges" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Nome
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="text" 
                      id="name" 
                      v-model="userName" 
                      :disabled="!isEditing"
                      placeholder="Seu nome completo"
                    />
                    <div v-if="isEditing" class="input-decoration"></div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="email">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="email" 
                      id="email" 
                      v-model="userEmail" 
                      disabled
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div class="input-hint">O email não pode ser alterado</div>
                </div>
              </div>
              
              <div class="form-actions">
                <template v-if="isEditing">
                  <button type="submit" class="primary-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Salvar Alterações
                  </button>
                  <button type="button" class="secondary-button" @click="cancelEditing">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancelar
                  </button>
                </template>
                <button v-else type="button" class="primary-button" @click="startEditing">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Tab: Conta e Segurança -->
        <div v-if="activeTab === 'account'" class="profile-tab">
          <div class="profile-tab-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Conta e Segurança
            </h3>
            <p>Gerencie as configurações da sua conta</p>
          </div>
          
          <div class="profile-card">
            <div class="account-section">
              <h4>Sessão</h4>
              <p>Você está conectado neste dispositivo. Pode encerrar a sessão a qualquer momento.</p>
              
              <div class="current-session">
                <div class="session-info">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <div>
                    <strong>Sessão Atual</strong>
                    <p>Iniciada em {{ new Date().toLocaleString() }}</p>
                  </div>
                </div>
              </div>
              
              <div class="account-options">
                <button class="danger-button" @click="handleLogout">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Encerrar Sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.profile-header p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.profile-content {
  display: flex;
  gap: 2rem;
}

.profile-sidebar {
  width: 320px;
  flex-shrink: 0;
}

.profile-sidebar-header {
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  padding: 2rem;
  text-align: center;
  position: relative;
}

.profile-avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto 1.5rem;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  background-color: white;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: var(--primary-color);
  font-size: 3rem;
  font-weight: 700;
}

.profile-avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: var(--transition);
  opacity: 0.9;
}

.profile-avatar-overlay:hover {
  transform: scale(1.1);
  opacity: 1;
}

.profile-avatar-overlay svg {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.profile-name {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.profile-email {
  font-size: 0.95rem;
  opacity: 0.9;
}

.profile-navigation {
  background-color: white;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.profile-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-color);
  border-left: 3px solid transparent;
}

.profile-nav-item svg {
  width: 20px;
  height: 20px;
  color: var(--text-light);
  transition: var(--transition);
}

.profile-nav-item.active {
  background-color: #f9fafb;
  border-left-color: var(--primary-color);
}

.profile-nav-item.active svg {
  color: var(--primary-color);
}

.profile-nav-item:hover:not(.active) {
  background-color: #f3f4f6;
}

.profile-nav-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.profile-nav-item.logout-item {
  color: #dc2626;
}

.profile-nav-item.logout-item svg {
  color: #dc2626;
}

.profile-nav-item.logout-item:hover {
  background-color: #fee2e2;
}

.profile-details {
  flex: 1;
}

.profile-tab-header {
  margin-bottom: 1.5rem;
}

.profile-tab-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.35rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.profile-tab-header h3 svg {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.profile-tab-header p {
  color: var(--text-light);
  padding-left: 2.25rem;
}

.profile-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: var(--text-light);
}

.input-wrapper {
  position: relative;
}

.form-group input {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  transition: var(--transition);
  width: 100%;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(91, 97, 217, 0.15);
}

.form-group input:disabled {
  background-color: var(--background-alt);
  opacity: 0.75;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-top: -0.25rem;
}

.input-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.form-group input:focus + .input-decoration {
  transform: scaleX(1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-button, .secondary-button, .danger-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
}

.primary-button svg {
  width: 16px;
  height: 16px;
}

.primary-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.secondary-button {
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.secondary-button svg {
  width: 16px;
  height: 16px;
}

.secondary-button:hover {
  background-color: var(--background-alt);
}

.danger-button {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.danger-button svg {
  width: 16px;
  height: 16px;
}

.danger-button:hover {
  background-color: #fecaca;
}

.account-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.account-section h4 {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.account-section p {
  color: var(--text-light);
  font-size: 0.95rem;
}

.current-session {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background-color: #f9fafb;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.session-info svg {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.session-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.session-info p {
  font-size: 0.85rem;
}

.account-options {
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 