<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleResetPassword = async () => {
  if (!email.value) {
    error.value = 'Por favor, informe seu email'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Simulação de envio de email - aqui você conectaria com sua API
    await new Promise(resolve => setTimeout(resolve, 1000))
    success.value = true
  } catch (e) {
    error.value = 'Falha ao enviar o email de recuperação. Tente novamente.'
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
        <h2>Recuperar Senha</h2>
        <p>Enviaremos instruções para redefinir sua senha</p>
      </div>
      
      <div v-if="success" class="success-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3>Email enviado com sucesso!</h3>
        <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
        <div class="action-buttons">
          <RouterLink to="/login" class="auth-button">Voltar para Login</RouterLink>
        </div>
      </div>
      
      <form v-else @submit.prevent="handleResetPassword" class="auth-form">
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
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="auth-button" 
          :disabled="loading"
        >
          <span v-if="loading">Enviando...</span>
          <span v-else>Enviar instruções</span>
        </button>
        
        <div class="auth-footer">
          <p>Lembrou sua senha? <RouterLink to="/login">Voltar para login</RouterLink></p>
        </div>
      </form>
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
  margin-bottom: 1.5rem;
}

.action-buttons {
  margin-top: 1rem;
  width: 100%;
}

.auth-button {
  display: block;
  width: 100%;
  padding: 0.85rem 1rem;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
  text-align: center;
  text-decoration: none;
}

.auth-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.5rem;
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