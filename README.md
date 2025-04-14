# 🧠 MapaMental.IA

## Crie mapas mentais interativos com Inteligência Artificial

![MapaMental.IA](https://i.ibb.co/SD7mNrcY/LOGO-mapamental-ia.png)

O **MapaMental.IA** é uma plataforma inovadora que utiliza inteligência artificial para criar mapas mentais a partir de textos, documentos e conversas. Com uma interface intuitiva e recursos avançados de voz, transforme suas ideias em visualizações estruturadas instantaneamente.

## ✨ Recursos Principais

- **Geração automática de mapas mentais** a partir de textos e documentos
- **Chat interativo com IA** para auxiliar na criação de conteúdo
- **Síntese de voz neural** de alta qualidade para interação por voz
- **Processamento de documentos** (PDF, DOC, DOCX, TXT)
- **Editor visual intuitivo** para personalizar seus mapas mentais
- **Histórico de conversas e mapas** para acesso rápido
- **Integração com LLMs** (Large Language Models) para análise de conteúdo

## 🛠️ Tecnologias

- **Frontend**: Vue.js 3, TypeScript, Composition API
- **Estilização**: CSS personalizado com variáveis para temas
- **Processamento de IA**: Integração com Ollama
- **Voz**: ElevenLabs API para síntese de voz neural
- **Visualização**: Mind-Elixir para renderização de mapas mentais
- **Armazenamento**: Local Storage para persistência de dados

## 📋 Requisitos

- Node.js 16+
- pnpm
- Ollama instalado localmente (ou endpoint remoto configurado)
- Acesso à Internet para integração com ElevenLabs (síntese de voz)
- Navegador moderno com suporte a WebSpeech API

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mapamental.ia.git

# Entre no diretório
cd mapamental.ia

# Instale as dependências com pnpm
pnpm install

# Configure as variáveis de ambiente (opcional)
cp .env.example .env

# Inicie o servidor de desenvolvimento
pnpm dev
```

## 🔧 Configuração

### API ElevenLabs (voz neural)

Para ativar a síntese de voz neural de alta qualidade:

1. Crie uma conta em [elevenlabs.io](https://elevenlabs.io)
2. Obtenha sua API key no painel de controle
3. Configure a chave no componente de chat de voz ou nas configurações da aplicação

### Ollama (IA local)

Certifique-se de que o Ollama esteja rodando localmente:

```bash
# Inicie o serviço do Ollama
ollama serve

# Verifique se o modelo está disponível
ollama list
```

## 💡 Como Usar

### Criando um Mapa Mental

1. **Inicie uma nova conversa** clicando em "Novo Chat"
2. **Envie um texto** ou **faça upload de um documento**
3. O sistema processará o conteúdo e gerará automaticamente um mapa mental
4. Visualize e edite o mapa na seção de Mapas Mentais

### Usando o Chat de Voz

1. Clique no ícone de microfone na interface de chat
2. Fale sua mensagem quando solicitado
3. A IA processará sua solicitação e responderá com texto e áudio
4. Ajuste as configurações de voz conforme necessário

## 🗂️ Estrutura do Projeto

```
src/
├── components/       # Componentes Vue
│   ├── MindMapViewer.vue
│   ├── VoiceChat.vue
│   └── ...
├── services/         # Serviços e integrações
│   ├── elevenlabsService.ts
│   ├── mindMapGenerator.ts
│   ├── documentProcessor.ts
│   └── ...
├── stores/           # Estado global (Pinia)
│   ├── chat.ts
│   └── auth.ts
├── views/            # Páginas da aplicação
└── App.vue           # Componente raiz
```

## 🔊 Recursos de Voz

O MapaMental.IA utiliza tecnologias avançadas de síntese e reconhecimento de voz:

- **Reconhecimento de Voz**: Captura sua voz e converte em texto através da WebSpeech API
- **Síntese de Voz Neural**: Converte respostas da IA em áudio de alta qualidade usando ElevenLabs
- **Vozes Naturais**: Múltiplas opções de vozes em português com entonação natural
- **Fallback Nativo**: Utiliza síntese nativa do navegador quando necessário

## 🧩 Mapas Mentais

Os mapas mentais gerados pelo sistema são interativos e completamente personalizáveis:

- **Visualização Hierárquica**: Organização clara dos conceitos e suas relações
- **Editor Visual**: Arraste e solte para reorganizar nós
- **Personalização**: Altere cores, estilos e estrutura dos mapas
- **Exportação**: Salve seus mapas em diferentes formatos

## 📊 Processamento de Documentos

Suporte a diversos formatos de documentos:

- PDFs
- Documentos Word (DOC, DOCX)
- Arquivos de texto (TXT)
- Tamanho máximo de 25MB por arquivo

## 🔄 Integração com IA

O sistema utiliza modelos de linguagem avançados para:

- Analisar o conteúdo de textos e documentos
- Extrair conceitos-chave e suas relações
- Estruturar informações em formato hierárquico
- Responder perguntas sobre o conteúdo processado

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Desenvolvido com 💙 por [Sua Equipe](https://github.com/seu-usuario)
