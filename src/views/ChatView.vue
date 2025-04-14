<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ollamaService } from '../services/ollama'
import { documentProcessor } from '../services/documentProcessor'
import { mindMapGenerator } from '../services/mindMapGenerator'
import MindMapViewer from '../components/MindMapViewer.vue'
import MindMapList from '../components/MindMapList.vue'
import VoiceChat from '../components/VoiceChat.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const router = useRouter()
const newMessage = ref('')
const showSidebar = ref(true)
const chatContainer = ref<HTMLElement | null>(null)
const renamingChatId = ref<string | null>(null)
const newChatTitle = ref('')
const isCreatingMap = ref(false)
const isMobile = ref(window.innerWidth < 768)
const documentFiles = ref<File[]>([])
const isUploadingDocuments = ref(false)
const dragActive = ref(false)
const isLoadingResponse = ref(false)
const isGeneratingMindMap = ref(false)
const showMindMapViewer = ref(false)
const showMindMapEditor = ref(false)

// Estados para chat de voz
const voiceChatActive = ref(false)
const voiceChatRef = ref<InstanceType<typeof VoiceChat> | null>(null)

// Adicionando os estados para o modal de status de voz
const isListening = ref(false)
const isResponseSpeaking = ref(false)
const isLoadingVoice = ref(false)
const transcript = ref('')
const errorMessage = ref('')

// Verificar autenticação
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // Atualiza o estado mobile ao redimensionar
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
    if (window.innerWidth >= 768) {
      showSidebar.value = true
    }
  })

  // Rola até o final da conversa quando carregada
  scrollToBottom()
})

// Verifica se existem chats e cria um novo se não existirem
const ensureActiveChat = () => {
  if (!chatStore.activeChat) {
    if (chatStore.chats.length === 0) {
      chatStore.createChat()
    } else {
      chatStore.setActiveChat(chatStore.chats[0].id)
    }
  }
}

ensureActiveChat()

// Computed properties para a UI
const currentChat = computed(() => chatStore.activeChat)
const sortedChats = computed(() => chatStore.sortedChats)
const chatIsEmpty = computed(() => !currentChat.value || currentChat.value.messages.length === 0)

// Rolar para o final da conversa
const scrollToBottom = async () => {
  if (!chatContainer.value) return

  await nextTick()
  const container = chatContainer.value as HTMLElement
  container.scrollTop = container.scrollHeight
}

// Observa mudanças nas mensagens para rolar para o final
watch(() => currentChat.value?.messages?.length, (newVal, oldVal) => {
  if (newVal && newVal > (oldVal || 0)) {
    scrollToBottom()
  }
})

// Formatação de data
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// Formatação de hora
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Manipulação de upload de documentos
const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)
    documentFiles.value = [...documentFiles.value, ...newFiles]
  }
}

const removeFile = (index: number) => {
  documentFiles.value.splice(index, 1)
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false

  if (e.dataTransfer?.files) {
    const newFiles = Array.from(e.dataTransfer.files)
    documentFiles.value = [...documentFiles.value, ...newFiles]
  }
}

const uploadDocuments = async () => {
  if (documentFiles.value.length === 0) return

  isUploadingDocuments.value = true

  try {
    // Adicionar mensagem informando sobre o upload
    const fileNames = documentFiles.value.map(file => file.name).join(', ')
    const messageContent = `Documentos enviados: ${fileNames}`

    if (currentChat.value) {
      chatStore.addMessage(currentChat.value.id, messageContent, 'user')
    }

    // Processar cada arquivo para extrair texto
    for (const file of documentFiles.value) {
      try {
        // Verifica se o arquivo é suportado
        if (!documentProcessor.isSupported(file)) {
          if (currentChat.value) {
            chatStore.addMessage(
              currentChat.value.id,
              `O arquivo ${file.name} não é suportado. Tipos suportados: TXT, PDF, DOC, DOCX.`,
              'assistant'
            )
          }
          continue
        }

        // Adiciona mensagem de processamento
        if (currentChat.value) {
          chatStore.addMessage(
            currentChat.value.id,
            `Processando ${file.name}...`,
            'assistant'
          )
        }

        // Extrai o texto do arquivo
        const extractedText = await documentProcessor.extractText(file)

        // Inicia geração de mapa mental
        if (currentChat.value) {
          isGeneratingMindMap.value = true

          chatStore.addMessage(
            currentChat.value.id,
            `Extraído conteúdo de ${file.name}. Gerando mapa mental...`,
            'assistant'
          )

          // Gera o mapa mental a partir do texto
          const { rootNode, title } = await mindMapGenerator.generateFromText(
            extractedText,
            `Mapa Mental - ${file.name}`
          )

          // Adiciona o mapa mental ao chat
          if (currentChat.value) {
            const mindMapId = chatStore.addMindMap(
              currentChat.value.id,
              title,
              rootNode,
              'document',
              file.name
            )

            chatStore.addMessage(
              currentChat.value.id,
              `Mapa mental gerado com sucesso para ${file.name}. Você pode visualizá-lo na seção de mapas mentais.`,
              'assistant'
            )
          }

          isGeneratingMindMap.value = false
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error)

        if (currentChat.value) {
          chatStore.addMessage(
            currentChat.value.id,
            `Ocorreu um erro ao processar o arquivo ${file.name}. Por favor, tente novamente.`,
            'assistant'
          )
        }
      }
    }
  } finally {
    documentFiles.value = []
    isUploadingDocuments.value = false
  }
}

// Envia uma mensagem
const sendMessage = async () => {
  if (!newMessage.value.trim() && documentFiles.value.length === 0) return
  if (!currentChat.value) return

  // Se tiver documentos, faz upload primeiro
  if (documentFiles.value.length > 0) {
    await uploadDocuments()
  }

  // Se tiver mensagem de texto, envia depois
  if (newMessage.value.trim()) {
    const messageContent = newMessage.value.trim()
    newMessage.value = ''

    // Adicionar mensagem do usuário
    chatStore.addMessage(currentChat.value.id, messageContent, 'user')

    // Envia para a API Ollama e processa a resposta
    await sendToOllama()
  }
}

// Envia mensagens para a API Ollama
const sendToOllama = async () => {
  if (!currentChat.value) return

  isLoadingResponse.value = true

  try {
    // Prepara as mensagens no formato esperado pela API
    const messages = currentChat.value.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Adicionar instrução para responder em português como mensagem de sistema
    const messagesWithLanguage = [
      {
        role: 'system',
        content: 'Você é um assistente útil e sempre responde em português. Se o usuário pedir para gerar um mapa mental, gere um JSON encapsulado entre as tags [JSON-MAPA-MENTAL] e [/JSON-MAPA-MENTAL], mas não mostre esse JSON na resposta visível.'
      },
      ...messages
    ]

    // Inicializa uma mensagem vazia para o assistente
    const messageId = await chatStore.addMessage(
      currentChat.value.id,
      '',
      'assistant'
    )

    // Esconde o indicador de carregamento agora que a mensagem está sendo criada
    isLoadingResponse.value = false

    // Envia para a API com streaming ativado
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:8b',
        messages: messagesWithLanguage,
        raw: true,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro na API Ollama: ${response.status} ${response.statusText}`)
    }

    // Lê a resposta como stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let streamingComplete = false;

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        streamingComplete = true;
        break;
      }

      try {
        // Decodifica o pedaço recebido
        const chunk = decoder.decode(value, { stream: true })

        // Processa cada linha do chunk (pode haver múltiplas respostas JSON)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)

            if (data.message && data.message.content) {
              // Atualiza o conteúdo completo
              fullContent += data.message.content

              // Atualiza a mensagem do assistente no chat
              chatStore.updateMessageContent(currentChat.value.id, messageId, fullContent)

              // Rola para o final da conversa
              await scrollToBottom()
            }
          } catch (jsonError) {
            console.error('Erro ao analisar JSON do streaming:', jsonError)
          }
        }
      } catch (chunkError) {
        console.error('Erro ao processar chunk do streaming:', chunkError)
      }
    }

    // Quando o streaming estiver completo, verifica se deve notificar o componente de voz
    if (streamingComplete && voiceChatActive.value && voiceChatRef.value) {
      const assistantMessage = currentChat.value.messages.find(msg => msg.id === messageId);
      if (assistantMessage) {
        console.log('Streaming completo, sintetizando resposta final em áudio');
        setTimeout(() => {
          if (voiceChatRef.value && typeof voiceChatRef.value.speakStreamingResponse === 'function') {
            voiceChatRef.value.speakStreamingResponse(assistantMessage.content, true);
          } else if (voiceChatRef.value && typeof voiceChatRef.value.speakResponse === 'function') {
            voiceChatRef.value.speakResponse(assistantMessage.content);
          }
        }, 500);
      }
    }

    // Verifica se a resposta contém JSON de mapa mental entre tags específicas
    const tagMatch = fullContent.match(/\[JSON-MAPA-MENTAL\]([\s\S]*?)\[\/JSON-MAPA-MENTAL\]/);
    if (tagMatch && tagMatch[1]) {
      try {
        // Extrai e processa o JSON do mapa mental
        let jsonContent = tagMatch[1].trim();
        console.log('Encontrado JSON de mapa mental:', jsonContent);

        // Remove marcadores de formatação e caracteres inválidos
        jsonContent = jsonContent.replace(/^\s*\*\*\s*/g, ''); // Remove ** no início
        jsonContent = jsonContent.replace(/\s*\*\*\s*$/g, ''); // Remove ** no final
        jsonContent = jsonContent.replace(/\.{3},?\s*(\]|\})/g, '$1');
        jsonContent = jsonContent.replace(/,\s*(\]|\})/g, '$1');
        jsonContent = jsonContent.replace(/\.{3}/g, '');

        // Parse do JSON
        const mindMapData = JSON.parse(jsonContent);

        // Converter formato de nodos para o formato MindMapNode
        let rootNode;

        // Se o JSON tem um array 'nodes' ou 'nodos', converte-o para o formato MindMapNode
        if ((mindMapData.nodes && Array.isArray(mindMapData.nodes)) ||
          (mindMapData.nodos && Array.isArray(mindMapData.nodos))) {
          const sourceNodes = mindMapData.nodes || mindMapData.nodos;

          // Criar nó raiz
          rootNode = {
            id: 'root',
            text: 'Mapa Mental - ' + currentChat.value.title,
            children: sourceNodes.map((nodo, index) => {
              return {
                id: `node-${index}`,
                text: nodo.name || nodo.nome || 'Sem nome',
                children: (nodo.children || nodo.filhos) ? (nodo.children || nodo.filhos).map((filho, childIndex) => ({
                  id: `node-${index}-${childIndex}`,
                  text: filho.name || filho.nome || 'Sem nome',
                  // Adiciona a descrição como um filho se existir
                  children: filho.description || filho.descricao ? [{
                    id: `node-${index}-${childIndex}-desc`,
                    text: filho.description || filho.descricao
                  }] : undefined
                })) : undefined
              };
            })
          };
        } else if (mindMapData.rootNode) {
          // Se já está no formato esperado, usa diretamente
          rootNode = mindMapData.rootNode;
        } else {
          // Tenta criar um formato básico a partir dos dados disponíveis
          rootNode = {
            id: 'root',
            text: mindMapData.title || `Mapa Mental - ${currentChat.value.title}`,
            children: Object.entries(mindMapData).filter(([key]) =>
              key !== 'title' && key !== 'edges' && typeof mindMapData[key] === 'object'
            ).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                return {
                  id: key,
                  text: key,
                  children: Object.entries(value).map(([subKey, subValue]) => ({
                    id: `${key}-${subKey}`,
                    text: subKey
                  }))
                };
              } else {
                return { id: key, text: `${key}: ${value}` };
              }
            })
          };
        }

        // Adiciona o mapa mental ao chat
        const mindMapId = chatStore.addMindMap(
          currentChat.value.id,
          mindMapData.title || `Mapa Mental - ${currentChat.value.title}`,
          rootNode,
          'chat'
        );

        // Limpa as tags e o JSON da resposta visível
        const cleanContent = fullContent.replace(/\[JSON-MAPA-MENTAL\][\s\S]*?\[\/JSON-MAPA-MENTAL\]/g, '').trim();
        chatStore.updateMessageContent(currentChat.value.id, messageId, cleanContent);

        // Notifica o usuário sobre o mapa mental criado
        chatStore.addMessage(
          currentChat.value.id,
          'Um mapa mental foi gerado e está disponível na seção de mapas mentais.',
          'assistant'
        );
      } catch (jsonError) {
        console.error('Erro ao processar JSON do mapa mental:', jsonError);
      }
    }
  } catch (error) {
    console.error('Erro ao comunicar com Ollama:', error)
    // Adiciona uma mensagem de erro
    if (currentChat.value) {
      chatStore.addMessage(
        currentChat.value.id,
        'Desculpe, ocorreu um erro na comunicação com o assistente. Por favor, tente novamente.',
        'assistant'
      )
    }
  } finally {
    isLoadingResponse.value = false
  }
}

// Gera um mapa mental a partir da conversa atual
const generateMindMapFromChat = async () => {
  if (!currentChat.value) return

  try {
    isGeneratingMindMap.value = true

    // Prepara o texto da conversa
    const chatText = currentChat.value.messages
      .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n\n')

    // Adiciona mensagem sobre geração do mapa mental
    chatStore.addMessage(
      currentChat.value.id,
      'Gerando mapa mental a partir da nossa conversa...',
      'assistant'
    )

    try {
      // Gera o mapa mental
      const { rootNode, title } = await mindMapGenerator.generateFromText(
        chatText,
        `Mapa Mental - ${currentChat.value.title}`
      )

      // Adiciona o mapa mental ao chat
      const mindMapId = chatStore.addMindMap(
        currentChat.value.id,
        title,
        rootNode,
        'chat'
      )

      // Adiciona mensagem de conclusão
      chatStore.addMessage(
        currentChat.value.id,
        'Mapa mental gerado com sucesso! Você pode visualizá-lo na seção de mapas mentais.',
        'assistant'
      )
    } catch (mapError) {
      console.error('Erro específico na geração do mapa mental:', mapError)

      if (mapError instanceof Error && mapError.message.includes('JSON válido entre as tags')) {
        // Erro específico quando não encontrou as tags do mapa mental
        chatStore.addMessage(
          currentChat.value.id,
          'Não foi possível gerar o mapa mental porque a resposta não contém o formato esperado. Por favor, peça explicitamente por um mapa mental no formato JSON.',
          'assistant'
        )
      } else {
        // Outros erros
        chatStore.addMessage(
          currentChat.value.id,
          'Desculpe, ocorreu um erro ao gerar o mapa mental. Por favor, tente novamente.',
          'assistant'
        )
      }
    }

  } catch (error) {
    console.error('Erro geral ao gerar mapa mental da conversa:', error)

    chatStore.addMessage(
      currentChat.value.id,
      'Desculpe, ocorreu um erro ao processar a solicitação de mapa mental. Por favor, tente novamente.',
      'assistant'
    )
  } finally {
    isGeneratingMindMap.value = false
  }
}

// Seleciona um mapa mental para visualização
const selectMindMap = (mindMapId: string) => {
  console.log('Selecionando mapa mental:', mindMapId)
  chatStore.setActiveMindMap(mindMapId)
}

// Botão para exibir mapas mentais
const toggleMindMapViewer = () => {
  try {
    console.log('Alternando visualização de mapa mental, valor atual:', showMindMapViewer.value);

    // Se estiver fechando o visualizador, simplesmente feche
    if (showMindMapViewer.value) {
      showMindMapViewer.value = false;
      console.log('Fechando visualizador de mapa mental');
      return;
    }

    // Se estiver abrindo o visualizador, verifique se existem mapas mentais
    // Verificando se há mapas mentais disponíveis
    if (!chatStore.chatMindMaps || chatStore.chatMindMaps.length === 0) {
      console.error('Nenhum mapa mental disponível para exibir');
      return;
    }

    // Se não há mapa ativo, seleciona o primeiro
    if (!chatStore.activeMindMapId && chatStore.chatMindMaps.length > 0) {
      console.log('Tentando selecionar o primeiro mapa mental:', chatStore.chatMindMaps[0]);
      try {
        chatStore.setActiveMindMap(chatStore.chatMindMaps[0].id);
      } catch (mapError) {
        console.error('Erro ao selecionar mapa mental:', mapError);
        return;
      }
    }

    // Verificando se o mapa mental ativo existe
    if (!chatStore.activeMindMap) {
      console.error('Mapa mental ativo não encontrado');
      return;
    }

    // Use setTimeout para separar a manipulação do DOM da mudança de estado
    // Isso ajuda a evitar problemas de renderização
    setTimeout(() => {
      // Alterna a visualização
      showMindMapViewer.value = true;
      console.log('Novo valor:', showMindMapViewer.value);
    }, 10);

  } catch (error) {
    console.error('Erro ao alternar visualização de mapa mental:', error);
    showMindMapViewer.value = false;
  }
};

// Inicia a edição de um mapa mental
const editMindMap = (mindMapId: string) => {
  chatStore.setActiveMindMap(mindMapId)
  showMindMapEditor.value = true
}

// Exclui um mapa mental
const deleteMindMap = (mindMapId: string) => {
  if (currentChat.value) {
    chatStore.deleteMindMap(currentChat.value.id, mindMapId)
  }
}

// Atualiza o nó de um mapa mental durante a edição
const updateMindMapNode = (updatedNode: any) => {
  if (currentChat.value && chatStore.activeMindMap) {
    chatStore.updateMindMap(currentChat.value.id, chatStore.activeMindMapId!, {
      rootNode: updatedNode
    })
  }
}

// Salva as alterações feitas no mapa mental
const saveMindMapChanges = () => {
  showMindMapEditor.value = false

  if (currentChat.value) {
    chatStore.addMessage(
      currentChat.value.id,
      'Mapa mental atualizado com sucesso!',
      'assistant'
    )
  }
}

// Cancela a edição do mapa mental
const cancelMindMapEdit = () => {
  showMindMapEditor.value = false
}

// Cria um novo chat
const createNewChat = () => {
  chatStore.createChat()
  if (isMobile.value) {
    showSidebar.value = false
  }
}

// Exclui um chat
const deleteCurrentChat = () => {
  if (currentChat.value) {
    chatStore.deleteChat(currentChat.value.id)
  }
}

// Inicia o processo de renomear chat
const startRenaming = (chatId: string) => {
  const chat = chatStore.chats.find(c => c.id === chatId)
  if (chat) {
    renamingChatId.value = chatId
    newChatTitle.value = chat.title
  }
}

// Confirma a renomeação do chat
const confirmRenaming = () => {
  if (renamingChatId.value && newChatTitle.value.trim()) {
    chatStore.renameChat(renamingChatId.value, newChatTitle.value.trim())
    renamingChatId.value = null
    newChatTitle.value = ''
  }
}

// Cancela a renomeação do chat
const cancelRenaming = () => {
  renamingChatId.value = null
  newChatTitle.value = ''
}

// Seleciona um chat
const selectChat = (chatId: string) => {
  chatStore.setActiveChat(chatId)
  if (isMobile.value) {
    showSidebar.value = false
  }
}

// Alterna a visibilidade da barra lateral no modo mobile
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// Alterna o modo de chamada de voz
const toggleVoiceChat = () => {
  voiceChatActive.value = !voiceChatActive.value
}

// Recebe mensagem de voz e envia para o chat
const handleVoiceMessage = (message: string) => {
  if (!message.trim() || !currentChat.value) return

  newMessage.value = message.trim()
  sendMessage()
}

// Observa mudanças no componente VoiceChat para atualizar o estado do modal
watch(() => voiceChatRef.value, () => {
  if (voiceChatRef.value) {
    // Proxy dos estados do VoiceChat para nosso modal
    const updateStates = () => {
      if (voiceChatRef.value) {
        isListening.value = voiceChatRef.value.isListening || false;
        isResponseSpeaking.value = voiceChatRef.value.isResponseSpeaking || false;
        isLoadingVoice.value = voiceChatRef.value.isLoadingVoice || false;
        transcript.value = voiceChatRef.value.transcript || '';
        errorMessage.value = voiceChatRef.value.errorMessage || '';
      }
    };

    // Atualiza a cada 100ms para refletir mudanças
    const intervalId = setInterval(updateStates, 100);

    // Limpa o intervalo quando o componente for desmontado
    onBeforeUnmount(() => {
      clearInterval(intervalId);
    });
  }
}, { immediate: true });

// Manipula eventos de síntese de voz para respostas
const handleMessageAdded = (message: any) => {
  // Verifica se é uma mensagem do assistente e se o chat de voz está ativo
  if (message.role === 'assistant' && message.content && voiceChatActive.value && voiceChatRef.value) {
    // Espera um pouco para dar tempo de renderizar a mensagem
    setTimeout(() => {
      console.log('Sintetizando resposta da IA em áudio:', message.content.substring(0, 30) + '...');
      if (voiceChatRef.value && typeof voiceChatRef.value.speakResponse === 'function') {
        voiceChatRef.value.speakResponse(message.content);
      } else {
        console.error('Função speakResponse não encontrada no componente VoiceChat');
      }
    }, 300);
  }
}

// Observa novas mensagens para sintetizar voz
watch(() => {
  // Observa todas as mensagens de todos os chats para garantir que capturamos todas
  return chatStore.chats.map(chat => chat.messages.length);
}, () => {
  // Verifica se há um chat ativo
  if (!currentChat.value) return;

  // Obtém a última mensagem do chat atual, se existir
  const messages = currentChat.value.messages;
  if (messages && messages.length > 0) {
    const latestMessage = messages[messages.length - 1];
    handleMessageAdded(latestMessage);
  }
}, { immediate: true });

// Observa atualizações nas mensagens existentes (para streaming)
watch(() => {
  if (!currentChat.value || !currentChat.value.messages) return null;

  // Cria um array com as mensagens atuais e seus conteúdos para detectar mudanças
  return currentChat.value.messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role
  }));
}, (newVal, oldVal) => {
  if (!newVal || !oldVal || newVal.length === 0) return;

  // Verifica se alguma mensagem foi atualizada (útil para streaming)
  for (let i = 0; i < newVal.length; i++) {
    if (i >= oldVal.length) {
      // Nova mensagem
      handleMessageAdded(newVal[i]);
    } else if (newVal[i].content !== oldVal[i].content && newVal[i].role === 'assistant') {
      // Conteúdo da mensagem foi atualizado (streaming)
      // Não enviamos ainda para evitar sintetizar fragmentos incompletos durante streaming
    }
  }
}, { deep: true });
</script>

<template>
  <div class="chat-view-fullscreen">
    <!-- Barra lateral com lista de chats -->
    <div class="chat-sidebar" :class="{ 'sidebar-visible': showSidebar, 'sidebar-hidden': !showSidebar }">
      <div class="sidebar-header">
        <button class="new-chat-button" @click="createNewChat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Novo Chat
        </button>
      </div>

      <div class="chats-list">
        <div v-for="chat in sortedChats" :key="chat.id" class="chat-item"
          :class="{ 'active': chat.id === chatStore.activeChatId }" @click="selectChat(chat.id)">
          <div v-if="renamingChatId === chat.id" class="rename-input" @click.stop>
            <input v-model="newChatTitle" @keyup.enter="confirmRenaming" @blur="confirmRenaming" ref="renameInput"
              type="text" />
          </div>
          <div v-else class="chat-info">
            <div class="chat-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {{ chat.title }}
            </div>
            <div class="chat-date">{{ formatDate(chat.updatedAt) }}</div>
          </div>

          <div class="chat-actions" @click.stop>
            <button @click="startRenaming(chat.id)" class="action-button" title="Renomear">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button @click="deleteCurrentChat" class="action-button" title="Excluir">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout principal (chat ou visualizador de mapa mental) -->
    <div class="main-layout">
      <!-- Interface do Chat (visível quando não está visualizando mapa mental) -->
      <div v-if="!showMindMapViewer" class="chat-main-container">
        <!-- Botão de toggle para exibir/ocultar a barra lateral em dispositivos móveis -->
        <button v-if="isMobile" class="toggle-sidebar-button" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="chat-container" ref="chatContainer">
          <!-- Estado vazio - sem mensagens -->
          <div v-if="chatIsEmpty" class="empty-chat">
            <div class="empty-chat-content">
              <h2>MapaMental.IA</h2>
              <p>Envie documentos ou faça perguntas para criar mapas mentais interativos.</p>

              <div class="upload-container" @dragenter="handleDragEnter" @dragleave="handleDragLeave"
                @dragover="handleDragOver" @drop="handleDrop" :class="{ 'drag-active': dragActive }">
                <div class="upload-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Arraste documentos aqui ou <label class="file-input-label">escolha arquivos<input type="file"
                        multiple @change="handleFileInput" /></label></p>
                  <p class="upload-formats">PDF, DOC, DOCX, TXT (até 25MB)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensagens do chat -->
          <div v-else class="chat-messages">
            <div v-for="message in currentChat?.messages" :key="message.id" class="message" :class="message.role">
              <div class="message-avatar">
                <div v-if="message.role === 'user'" class="user-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div v-else class="assistant-avatar">
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
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-role">{{ message.role === 'user' ? 'Você' : 'MapaMental.IA' }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>

            <!-- Indicador de geração de mapa -->
            <div v-if="isCreatingMap || isGeneratingMindMap" class="map-generation-indicator">
              <div class="spinner"></div>
              <span>{{ isGeneratingMindMap ? 'Gerando mapa mental...' : 'Processando...' }}</span>
            </div>

            <!-- Indicador de resposta sendo carregada -->
            <div v-if="isLoadingResponse" class="loading-response">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Conectando ao assistente...</span>
            </div>

            <!-- Botão para visualizar mapas mentais quando disponíveis -->
            <div v-if="chatStore.chatMindMaps.length > 0" class="mind-maps-available">
              <button class="view-mind-maps-button" @click="toggleMindMapViewer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="21.17" y1="8" x2="12" y2="8"></line>
                  <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                  <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                </svg>
                Visualizar {{ chatStore.chatMindMaps.length }} Mapas Mentais
              </button>
            </div>
          </div>

          <!-- Área de mensagem -->
          <div class="message-input-container">
            <!-- Lista de arquivos para upload -->
            <div v-if="documentFiles.length > 0" class="file-upload-list">
              <div v-for="(file, index) in documentFiles" :key="index" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <button class="remove-file-button" @click="removeFile(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div class="message-input-wrapper">
              <textarea v-model="newMessage" @keydown.enter.prevent="sendMessage"
                placeholder="Envie uma mensagem ou adicione documentos para análise..." class="message-input"
                rows="1"></textarea>

              <div class="message-actions">
                <label class="upload-button" title="Anexar documento">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path
                      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                    </path>
                  </svg>
                  <input type="file" @change="handleFileInput" multiple />
                </label>

                <button class="voice-button" :class="{ 'active': voiceChatActive }" @click="toggleVoiceChat"
                  title="Chamada de voz">
                  <svg v-if="!voiceChatActive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>

                <button class="send-button" @click="sendMessage"
                  :disabled="!newMessage.trim() && documentFiles.length === 0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal de Status de Voz -->
          <div v-if="voiceChatActive" class="voice-chat-modal">
            <div class="voice-modal-content">
              <div class="voice-status" :class="{
                'listening': isListening && !isResponseSpeaking && !isLoadingVoice,
                'speaking': isResponseSpeaking,
                'loading': isLoadingVoice
              }">
                <div v-if="isListening && !isResponseSpeaking && !isLoadingVoice" class="voice-status-icon">
                  <div class="voice-waves">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                  </div>
                </div>
                <div v-else-if="isResponseSpeaking" class="voice-status-icon">
                  <div class="voice-waves speaking">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                  </div>
                </div>
                <div v-else-if="isLoadingVoice" class="voice-status-icon">
                  <div class="loading-spinner"></div>
                </div>
                <div v-else class="voice-status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  </svg>
                </div>

                <div class="voice-status-text">
                  <div v-if="isListening && !isResponseSpeaking && !isLoadingVoice">
                    {{ transcript || 'Ouvindo...' }}
                  </div>
                  <div v-else-if="isResponseSpeaking">
                    Assistente falando...
                  </div>
                  <div v-else-if="isLoadingVoice">
                    Processando áudio...
                  </div>
                  <div v-else>
                    Aguardando...
                  </div>

                  <div v-if="errorMessage" class="voice-error">
                    {{ errorMessage }}
                  </div>
                </div>

                <button @click="toggleVoiceChat" class="voice-close-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Componente de Chat de Voz (invisível) -->
          <VoiceChat ref="voiceChatRef" :active="voiceChatActive" :on-voice-message="handleVoiceMessage"
            :on-stop-listening="() => { }" @toggle-voice-chat="toggleVoiceChat" />
        </div>
      </div>

      <!-- Visualizador de Mapas Mentais -->
      <div v-else class="mind-map-view">
        <div class="mind-map-layout">
          <!-- Barra lateral com lista de mapas mentais -->
          <div class="mind-map-sidebar">
            <div class="mind-map-sidebar-header">
              <button class="back-to-chat-button" @click="toggleMindMapViewer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Voltar ao Chat
              </button>
            </div>

            <!-- Lista de mapas mentais -->
            <MindMapList :mind-maps="chatStore.chatMindMaps" :active-mind-map-id="chatStore.activeMindMapId"
              @select-mind-map="selectMindMap" @edit-mind-map="editMindMap" @delete-mind-map="deleteMindMap" />
          </div>

          <!-- Área de visualização do mapa mental -->
          <div class="mind-map-content">
            <div v-if="!chatStore.activeMindMap" class="no-mind-map">
              <p>Selecione um mapa mental para visualizar</p>
            </div>

            <MindMapViewer v-else :root-node="chatStore.activeMindMap.rootNode" :title="chatStore.activeMindMap.title"
              :editable="showMindMapEditor" @update:root-node="updateMindMapNode" @save="saveMindMapChanges"
              @cancel="cancelMindMapEdit" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view-fullscreen {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--background-color);
  position: relative;
}

.chat-sidebar {
  width: 260px;
  height: 100%;
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.new-chat-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.new-chat-button svg {
  width: 16px;
  height: 16px;
  color: white;
}

.chats-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: var(--transition);
  position: relative;
  color: var(--text-color);
}

.chat-item:hover {
  background-color: var(--background-alt);
}

.chat-item.active {
  background-color: rgba(91, 97, 217, 0.08);
  border-left: 3px solid var(--primary-color);
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}

.chat-title svg {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.chat-date {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 4px;
}

.chat-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.action-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-light);
  transition: var(--transition);
}

.action-button:hover {
  background-color: var(--background-alt);
  color: var(--primary-color);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.rename-input {
  width: 100%;
}

.rename-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--primary-light);
  border-radius: 4px;
  background-color: var(--surface-color);
  color: var(--text-color);
  font-size: 0.9rem;
  outline: none;
}

.chat-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  background-color: var(--background-color);
}

.toggle-sidebar-button {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-light);
}

.toggle-sidebar-button:hover {
  background-color: var(--background-alt);
  color: var(--primary-color);
}

.toggle-sidebar-button svg {
  width: 20px;
  height: 20px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  position: relative;
  height: 100%;
}

/* Área de mensagens vazia - upload inicial */
.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  padding: 20px;
}

.empty-chat-content {
  max-width: 600px;
  text-align: center;
  padding: 40px 20px;
}

.empty-chat-content h2 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: var(--primary-color);
  font-family: 'Sora', sans-serif;
}

.empty-chat-content p {
  color: var(--text-light);
  margin-bottom: 32px;
  font-size: 1.1rem;
}

.upload-container {
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  padding: 40px 20px;
  background-color: var(--background-alt);
  transition: all 0.3s ease;
}

.upload-container.drag-active {
  border-color: var(--primary-light);
  background-color: rgba(91, 97, 217, 0.08);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-content svg {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
}

.file-input-label {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.file-input-label:hover {
  text-decoration: underline;
}

.file-input-label input[type="file"] {
  display: none;
}

.upload-formats {
  font-size: 0.8rem;
  color: var(--text-light);
}

/* Área de mensagens */
.chat-messages {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.message {
  display: flex;
  gap: 16px;
  width: 100%;
  animation: fadeIn 0.3s ease;
  padding: 16px 0;
}

.message.user {
  background-color: #f9fafb;
}

.message.assistant {
  background-color: white;
}

.message-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.user-avatar,
.assistant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar {
  background-color: var(--primary-color);
}

.assistant-avatar {
  background-color: var(--secondary-color);
}

.user-avatar svg,
.assistant-avatar svg {
  width: 24px;
  height: 24px;
  color: white;
}

.message-content {
  flex: 1;
  padding: 0 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-role {
  font-weight: 600;
  color: var(--text-color);
}

.message-time {
  font-size: 0.8rem;
  color: var(--text-light);
}

.message-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--text-color);
}

/* Indicador de geração de mapa */
.map-generation-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: rgba(91, 97, 217, 0.1);
  border-radius: 6px;
  margin: 16px auto;
  width: fit-content;
  color: var(--text-color);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--primary-color);
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Botões de download/visualização do mapa */
.map-download-container {
  display: flex;
  gap: 12px;
  margin: 16px auto;
  width: fit-content;
}

.map-download-button,
.map-view-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.map-download-button {
  background-color: var(--primary-color);
  color: white;
}

.map-download-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.map-view-button {
  background-color: var(--surface-color);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.map-view-button:hover {
  background-color: rgba(91, 97, 217, 0.08);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.map-download-button svg,
.map-view-button svg {
  width: 18px;
  height: 18px;
}

/* Área de input de mensagem */
.message-input-container {
  border-top: 1px solid var(--border-color);
  padding: 16px;
  background-color: var(--surface-color);
  position: sticky;
  bottom: 0;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.file-upload-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: rgba(91, 97, 217, 0.1);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-color);
}

.file-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-file-button {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-light);
}

.remove-file-button:hover {
  color: var(--primary-color);
}

.remove-file-button svg {
  width: 12px;
  height: 12px;
}

.message-input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 0 0 1px var(--border-color);
  max-width: 800px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  max-height: 200px;
  outline: none;
  color: var(--text-color);
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-light);
  transition: var(--transition);
}

.upload-button:hover {
  color: var(--primary-color);
  background-color: rgba(91, 97, 217, 0.1);
}

.upload-button svg {
  width: 18px;
  height: 18px;
}

.upload-button input[type="file"] {
  display: none;
}

.voice-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-light);
  transition: var(--transition);
}

.voice-button:hover {
  color: var(--primary-color);
  background-color: rgba(91, 97, 217, 0.1);
}

.voice-button.active {
  color: white;
  background-color: var(--primary-color);
}

.voice-button svg {
  width: 18px;
  height: 18px;
}

.send-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: var(--primary-color);
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: var(--transition);
}

.send-button:enabled:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.send-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.send-button svg {
  width: 16px;
  height: 16px;
}

.input-footer {
  text-align: center;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 8px auto 0;
}

/* Adaptações para mobile */
@media (max-width: 768px) {
  .chat-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 100;
  }

  .sidebar-visible {
    transform: translateX(0);
  }

  .sidebar-hidden {
    transform: translateX(-100%);
  }

  .chat-main-container {
    max-width: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.model-info {
  display: none;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
  animation: pulse 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.loading-response {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: rgba(91, 97, 217, 0.08);
  margin: 8px 0;
  font-size: 0.9rem;
  color: var(--text-color);
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Layout principal */
.main-layout {
  flex: 1;
  display: flex;
  position: relative;
  height: 100%;
}

/* Botão para visualizar mapas mentais */
.mind-maps-available {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.view-mind-maps-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.view-mind-maps-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.view-mind-maps-button svg {
  width: 18px;
  height: 18px;
}

/* Layout do visualizador de mapas mentais */
.mind-map-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mind-map-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.mind-map-sidebar {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.mind-map-sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.back-to-chat-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--surface-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.back-to-chat-button:hover {
  background-color: var(--background-alt);
}

.back-to-chat-button svg {
  width: 14px;
  height: 14px;
}

.mind-map-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.mind-map-content>div {
  width: 100%;
  height: 100%;
}

.no-mind-map {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  font-size: 1.1rem;
}

/* Adaptações para mobile */
@media (max-width: 768px) {
  .main-layout {
    max-width: 100%;
  }

  .mind-map-layout {
    flex-direction: column;
  }

  .mind-map-sidebar {
    width: 100%;
    height: auto;
    max-height: 40%;
  }
}

.model-info {
  display: none;
}

/* Modal de Status de Voz */
.voice-chat-modal {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
}

.voice-modal-content {
  background-color: var(--surface-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 320px;
}

.voice-status {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  position: relative;
  transition: all 0.3s ease;
}

.voice-status.listening {
  background-color: rgba(91, 97, 217, 0.1);
  border-left: 3px solid var(--primary-color);
}

.voice-status.speaking {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid var(--success-color);
}

.voice-status.loading {
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 3px solid var(--warning-color);
}

.voice-status-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: var(--text-light);
}

.voice-status-icon svg {
  width: 24px;
  height: 24px;
}

.voice-status-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--text-color);
  overflow: hidden;
}

.voice-error {
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--danger-color);
}

.voice-close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
}

.voice-close-button:hover {
  color: var(--danger-color);
  background-color: rgba(255, 59, 48, 0.1);
}

.voice-close-button svg {
  width: 16px;
  height: 16px;
}

.voice-waves {
  display: flex;
  align-items: center;
  height: 24px;
  gap: 3px;
}

.voice-waves .wave {
  width: 3px;
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 1px;
  animation: waveAnimation 1s infinite ease-in-out;
}

.voice-waves.speaking .wave {
  background-color: var(--success-color);
}

.voice-waves .wave:nth-child(2) {
  animation-delay: 0.2s;
}

.voice-waves .wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes waveAnimation {

  0%,
  100% {
    transform: scaleY(0.4);
  }

  50% {
    transform: scaleY(1);
  }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 152, 0, 0.3);
  border-radius: 50%;
  border-top-color: var(--warning-color);
  animation: spinAnimation 1s linear infinite;
}

@keyframes spinAnimation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>