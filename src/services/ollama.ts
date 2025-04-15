/**
 * Serviço para comunicação com a API Ollama
 */

/**
 * Interface para representar uma mensagem no formato da API Ollama
 */
interface OllamaMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Interface para a resposta da API Ollama
 */
interface OllamaResponse {
  model: string
  created_at: string
  message: {
    role: 'assistant'
    content: string
  }
  done: boolean
}

/**
 * Configurações padrão para a API Ollama
 */
const OLLAMA_API_URL = 'http://localhost:11434/api/chat'
const MODEL = 'llama3'

/**
 * Classe para gerenciar a comunicação com a API Ollama
 */
export class OllamaService {
  private readonly model: string = MODEL

  constructor() {
    // Modelo fixo como llama3:8b
  }

  /**
   * Envia uma mensagem para a API Ollama e retorna a resposta
   * @param messages Lista de mensagens da conversa
   * @returns Promessa com a resposta da API
   */
  async sendChatMessage(messages: OllamaMessage[]): Promise<OllamaMessage> {
    try {
      // Adicionar instrução para responder em português caso não exista mensagem de sistema
      let hasSystemMessage = false
      for (const msg of messages) {
        if (msg.role === 'system') {
          hasSystemMessage = true
          break
        }
      }

      // Se não houver mensagem de sistema, adiciona uma instrução para responder em português
      const messagesWithLanguage = [...messages]
      if (!hasSystemMessage) {
        messagesWithLanguage.unshift({
          role: 'system',
          content:
            'Você é um assistente útil e sempre responde em português. Use uma linguagem clara e direta.',
        } as any)
      }

      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messagesWithLanguage,
          raw: true,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API Ollama: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as OllamaResponse

      return {
        role: 'assistant',
        content: data.message.content,
      }
    } catch (error) {
      console.error('Erro ao comunicar com Ollama:', error)
      throw error
    }
  }

  /**
   * Retorna o modelo utilizado
   */
  getModel(): string {
    return this.model
  }
}

// Exporta uma instância singleton do serviço
export const ollamaService = new OllamaService()
