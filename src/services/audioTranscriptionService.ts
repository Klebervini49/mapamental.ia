/**
 * Serviço para transcrição de áudio utilizando API Whisper e
 * formatação com Ollama
 */

// Importando o serviço Ollama
import { ollamaService } from './ollama'

// Interface para as opções de transcrição
interface TranscriptionOptions {
  language?: string
  prompt?: string
}

// Interface para o resultado da transcrição
interface TranscriptionResult {
  text: string
  segments?: {
    start: number
    end: number
    text: string
  }[]
}

// Configuração padrão
const DEFAULT_LANGUAGE = 'pt-BR'
const WHISPER_API_URL = 'http://127.0.0.1:5001/transcrever'

/**
 * Envia o arquivo de áudio para a API Whisper e obtém a transcrição
 * @param audioFile Arquivo de áudio para transcrição
 * @returns Texto transcrito
 */
async function transcribeWithWhisperAPI(audioFile: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioFile)

    console.log('Enviando áudio para API Whisper...')

    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro na API de transcrição: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Erro retornado pela API: ${data.error}`)
    }

    // A API retorna { texto: "conteúdo transcrito" }
    const transcribedText = data.texto || ''
    console.log('Transcrição recebida da API Whisper:', transcribedText)

    return transcribedText
  } catch (error) {
    console.error('Erro ao transcrever com API Whisper:', error)
    return `Erro ao transcrever o áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
  }
}

/**
 * Realiza a transcrição de um arquivo de áudio usando a API Whisper e formata o resultado com Ollama
 *
 * @param audioFile Arquivo de áudio para transcrição
 * @param options Opções de configuração
 * @returns Resultado da transcrição ou null em caso de erro
 */
export async function transcribeAudio(
  audioFile: File,
  options: TranscriptionOptions = {},
): Promise<TranscriptionResult | null> {
  try {
    // Verifica se o arquivo é um formato de áudio válido
    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
    if (
      !validAudioTypes.includes(audioFile.type) &&
      !audioFile.name.endsWith('.mp3') &&
      !audioFile.name.endsWith('.wav')
    ) {
      throw new Error('Formato de áudio não suportado. Use MP3, WAV, OGG ou WEBM.')
    }

    // Transcrever o áudio com a API Whisper
    const transcribedText = await transcribeWithWhisperAPI(audioFile)

    if (!transcribedText || transcribedText.startsWith('Erro')) {
      throw new Error(transcribedText || 'A transcrição falhou sem mensagem de erro específica')
    }

    // Enviar a transcrição bruta para o Ollama formatar
    const messages = [
      {
        role: 'user' as const,
        content: `Você é um especialista em transcrições de áudio. Seu trabalho é formatar e organizar transcrições brutas em português, mantendo EXATAMENTE as mesmas palavras e conteúdo, mas melhorando pontuação, parágrafos e formatação, sem alterar nenhuma palavra ou significado do texto original. somente retorne o texto formatado, entre as tags <TRANSCRICAO> e </TRANSCRICAO>, sem nenhum outro texto. O seu trabalho vai ser fazer uma Transcrição narrativa do texto transcrito. Tente adicionar antes dos textos os nomes dos personagens, se houver. Retorne o texto formatado em markdown. Não retorne nada além do texto formatado. Um exemplo de texto formatado: 
        <b>João:</b> Olá, como você está?
        <b>Maria:</b> Estou bem, obrigada. E você?
        <b>João:</b> Estou bem, obrigado.
        <b>Maria:</b> Estou bem, obrigada. E você?
        <b>João:</b> Estou bem, obrigado.

        Texto a ser formatado:
        ${transcribedText}
        `,
      },
    ]

    // Enviar para o Ollama formatar
    const formattedResponse = await ollamaService.sendChatMessage(messages)

    // Prepara o resultado final
    const finalText = formattedResponse.content.trim()

    const result: TranscriptionResult = {
      text: finalText,
      segments: [
        {
          start: 0,
          end: 60,
          text: finalText,
        },
      ],
    }

    return result
  } catch (error) {
    console.error('Erro na transcrição de áudio:', error)
    return null
  }
}

export default {
  transcribeAudio,
}
