import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

// Configuração básica do i18n
const i18n = createI18n({
  legacy: false, // usar a API de Composição
  locale: 'pt-BR', // idioma padrão
  fallbackLocale: 'en', // idioma de fallback
  messages: {
    'pt-BR': {
      welcome: 'Bem-vindo ao Mapamente.IA',
      // Adicione mais traduções aqui
    },
    'en': {
      welcome: 'Welcome to Mapamente.IA',
      // Adicione mais traduções aqui
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
