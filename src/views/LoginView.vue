<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Credenciais de teste fictícias
const TEST_CREDENTIALS = {
  email: 'teste@exemplo.com',
  password: '123456'
}

// Função para preencher automaticamente as credenciais de teste
const fillTestCredentials = () => {
  email.value = TEST_CREDENTIALS.email
  password.value = TEST_CREDENTIALS.password
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Usando a store de autenticação para login
    const loginSuccess = await authStore.login(email.value, password.value)
    
    if (loginSuccess) {
      success.value = true
      setTimeout(() => {
        router.push('/perfil')
      }, 1500)
    } else {
      error.value = 'Credenciais inválidas. Use as credenciais de teste.'
    }
  } catch (e) {
    error.value = 'Falha ao fazer login. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          <h1>Mapa<span>Mental</span>.IA</h1>
        </div>
        <h2>Login</h2>
        <p>Entre na sua conta para acessar os recursos</p>
      </div>
      
      <div v-if="success" class="success-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3>Login realizado com sucesso!</h3>
        <p>Você será redirecionado para a página inicial em instantes...</p>
      </div>
      
      <form v-else @submit.prevent="handleLogin" class="auth-form">
        <div class="test-credentials">
          <p>Credenciais de teste:</p>
          <p><strong>Email:</strong> {{ TEST_CREDENTIALS.email }}</p>
          <p><strong>Senha:</strong> {{ TEST_CREDENTIALS.password }}</p>
          <button type="button" class="test-button" @click="fillTestCredentials">
            Preencher credenciais de teste
          </button>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="seu@email.com" 
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-options">
          <RouterLink to="/recuperar-senha" class="forgot-link">Esqueceu a senha?</RouterLink>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="auth-button" 
          :disabled="loading"
        >
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Não tem uma conta? <RouterLink to="/cadastro">Cadastre-se</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.auth-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--border-color);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: var(--primary-color);
}

.auth-header h1 {
  font-size: 1.25rem;
}

.auth-header h2 {
  font-size: 1.75rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-light);
}

.test-credentials {
  background-color: #ecfdf5;
  border: 1px dashed #10b981;
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.test-credentials p {
  margin-bottom: 0.5rem;
}

.test-button {
  background-color: #10b981;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
}

.test-button:hover {
  background-color: #059669;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  transition: var(--transition);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(91, 97, 217, 0.2);
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.5rem;
}

.forgot-link {
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.auth-button {
  padding: 0.85rem 1rem;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
}

.auth-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius-sm);
  color: #ef4444;
  font-size: 0.9rem;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background-color: #ecfdf5;
  border: 1px solid #d1fae5;
  border-radius: var(--border-radius-sm);
}

.success-icon {
  width: 3rem;
  height: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.success-message h3 {
  font-size: 1.25rem;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #047857;
  margin-bottom: 0.5rem;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-light);
}

.auth-footer a {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 520px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style> 