const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'views', 'ChatView.vue')

// Ler o arquivo
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erro ao ler o arquivo:', err)
    return
  }

  // Padrão para encontrar o bloco else que contém a chamada para generateMindMapFromChat
  const pattern =
    /} else {\s*\/\/ Se não encontrou o JSON mas mencionou mapa mental[\s\S]*?generateMindMapFromChat\(\);\s*\}/

  // Substituição para remover o bloco else
  const replacement = '}'

  // Fazer a substituição
  const result = data.replace(pattern, replacement)

  // Verificar se houve alterações
  if (result === data) {
    console.log('Nenhuma alteração foi feita. Padrão não encontrado.')
    return
  }

  // Escrever o resultado de volta no arquivo
  fs.writeFile(filePath, result, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Erro ao escrever o arquivo:', writeErr)
      return
    }
    console.log('ChatView.vue foi atualizado com sucesso!')
  })
})
