import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)
  
  // Mock user data
  const mockUser: User = {
    id: '1',
    name: 'Usuário de Teste',
    email: 'teste@exemplo.com',
    avatar: 'https://ui-avatars.com/api/?name=Usuario+Teste&background=5B61D9&color=fff'
  }
  
  function login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'teste@exemplo.com' && password === '123456') {
          user.value = mockUser
          // Salvar no localStorage para persistir entre recarregamentos
          localStorage.setItem('user', JSON.stringify(mockUser))
          resolve(true)
        } else {
          resolve(false)
        }
      }, 1000)
    })
  }
  
  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }
  
  function checkAuth() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Erro ao restaurar usuário do localStorage:', e)
        localStorage.removeItem('user')
      }
    }
  }
  
  // Verificar autenticação ao inicializar a store
  checkAuth()
  
  return { 
    user, 
    isLoggedIn, 
    login, 
    logout,
    checkAuth
  }
}) 