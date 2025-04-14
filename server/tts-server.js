const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

const app = express()
const PORT = 11435

// Configuração de middleware
app.use(cors())
app.use(express.json())

// Pasta para armazenar os arquivos de áudio
const AUDIO_DIR = path.join(__dirname, 'audio-cache')

// Criar a pasta de áudio se não existir
const ensureAudioDir = async () => {
  try {
    await fs.mkdir(AUDIO_DIR, { recursive: true })
    console.log(`Diretório de cache criado: ${AUDIO_DIR}`)
  } catch (err) {
    console.error(`Erro ao criar diretório de cache: ${err.message}`)
  }
}

// Endpoint para síntese de voz
app.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'pt_female', speed = 1.0 } = req.body

    if (!text) {
      return res.status(400).json({ error: 'O texto é obrigatório' })
    }

    // Gerar um ID único para o arquivo de áudio baseado no texto
    const fileId = Buffer.from(text).toString('base64').substring(0, 32)
    const audioFilePath = path.join(AUDIO_DIR, `${fileId}.mp3`)

    // Verificar se já temos o áudio em cache
    try {
      await fs.access(audioFilePath)
      console.log(`Usando áudio em cache: ${fileId}`)
    } catch (err) {
      // Se o arquivo não existir, gerar novo áudio usando síntese TTS

      // Aqui, em uma implementação real, você usaria uma biblioteca TTS neural como:
      // - gTTS (Google TTS) para Python
      // - AWS Polly
      // - Azure Speech Service
      // - etc.

      // Para este exemplo, vamos simular gerando um áudio básico usando a API Web Speech
      console.log(`Gerando novo áudio para: "${text.substring(0, 50)}..."`)

      // Usando um fallback básico apenas para simular - em produção usar uma API de TTS neural
      // Neste caso estamos apenas criando um texto para falar sobre o áudio
      const audioContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Áudio sintético</title>
          <script>
            window.onload = function() {
              const synth = window.speechSynthesis;
              const utterance = new SpeechSynthesisUtterance('${text.replace(/'/g, "\\'")}');
              utterance.lang = 'pt-BR';
              utterance.rate = ${speed};
              synth.speak(utterance);
            }
          </script>
        </head>
        <body>
          <p>Esse áudio foi sintetizado para: ${text.substring(0, 100)}</p>
        </body>
        </html>
      `

      // Escrever um arquivo HTML simulando áudio (apenas para exemplo)
      await fs.writeFile(audioFilePath, audioContent)
    }

    // Em uma implementação real, aqui retornaríamos o arquivo de áudio
    const fileStats = await fs.stat(audioFilePath)
    const audioBuffer = await fs.readFile(audioFilePath)

    // Configurar cabeçalhos para áudio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': fileStats.size,
      'Cache-Control': 'public, max-age=86400',
    })

    // Enviar o arquivo de áudio
    res.send(audioBuffer)
  } catch (err) {
    console.error(`Erro na síntese de voz: ${err.message}`)
    res.status(500).json({ error: 'Erro ao processar a síntese de voz' })
  }
})

// Iniciar o servidor
app.listen(PORT, async () => {
  await ensureAudioDir()
  console.log(`Servidor TTS rodando na porta ${PORT}`)
  console.log(`Endpoint TTS: http://localhost:${PORT}/tts`)
})
