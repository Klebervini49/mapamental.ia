/**
 * Serviço para integração com a API ElevenLabs para síntese de voz realista
 */

// API URL base
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

// Modelo de voz multilíngue
const DEFAULT_MODEL = 'eleven_multilingual_v2'

// Vozes femininas de alta qualidade em português
export const AVAILABLE_VOICES = [
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Feminina Natural', language: 'pt-BR' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Feminina Clara', language: 'pt-BR' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Masculina Natural', language: 'pt-BR' },
]

/**
 * Configurações para a síntese de voz
 */
interface VoiceSettings {
  stability: number // 0-1: Estabilidade da voz (menor = mais variação)
  similarityBoost: number // 0-1: Semelhança com a voz original
  style: number // 0-1: Ênfase no estilo
  useSpeakerBoost: boolean // Melhora a clareza da voz
}

/**
 * Opções para o serviço de síntese de voz
 */
interface TTSOptions {
  apiKey: string
  voiceId: string
  text: string
  model?: string
  voiceSettings?: Partial<VoiceSettings>
}

/**
 * Configurações padrão para vozes naturais
 */
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true,
}

/**
 * Verifica se a API Key é válida
 * @param apiKey Chave de API do ElevenLabs
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao verificar API key:', error)
    return false
  }
}

/**
 * Converte texto para fala usando a API ElevenLabs
 * @param options Opções para a síntese de voz
 * @returns URL do áudio gerado ou null em caso de erro
 */
export async function textToSpeech(options: TTSOptions): Promise<string | null> {
  try {
    const { apiKey, voiceId, text, model = DEFAULT_MODEL, voiceSettings = {} } = options

    // Combina as configurações padrão com as personalizadas
    const finalVoiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      ...voiceSettings,
    }

    // Prepara o corpo da requisição
    const requestBody = {
      text,
      model_id: model,
      voice_settings: {
        stability: finalVoiceSettings.stability,
        similarity_boost: finalVoiceSettings.similarityBoost,
        style: finalVoiceSettings.style,
        use_speaker_boost: finalVoiceSettings.useSpeakerBoost,
      },
    }

    // Faz a requisição para a API
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Erro na API do ElevenLabs:', errorData || response.status)
      throw new Error(`Erro na API TTS: ${response.status}`)
    }

    // Processa o blob de áudio
    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  } catch (error) {
    console.error('Erro na síntese de voz:', error)
    return null
  }
}

/**
 * Limpa recursos de URL criados para evitar vazamento de memória
 * @param audioUrl URL criada pelo URL.createObjectURL
 */
export function cleanupAudioUrl(audioUrl: string): void {
  try {
    URL.revokeObjectURL(audioUrl)
  } catch (error) {
    console.error('Erro ao limpar URL de áudio:', error)
  }
}

export default {
  textToSpeech,
  verifyApiKey,
  cleanupAudioUrl,
  AVAILABLE_VOICES,
}
