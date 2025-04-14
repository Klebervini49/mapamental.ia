import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

// Interface para representar um nó no mapa mental
export interface MindMapNode {
  id: string
  text: string
  children?: MindMapNode[]
  color?: string
}

// Interface para representar um mapa mental completo
export interface MindMap {
  id: string
  title: string
  rootNode: MindMapNode // Campo obrigatório
  createdAt: Date
  updatedAt: Date
  source: 'chat' | 'document' // Origem do mapa: conversa ou documento
  documentName?: string // Nome do documento de origem, se aplicável
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  mindMaps: MindMap[] // Lista de mapas mentais associados ao chat
}

export const useChatStore = defineStore('chat', () => {
  // Estado
  const chats = ref<Chat[]>([])
  const activeChatId = ref<string | null>(null)
  const activeMindMapId = ref<string | null>(null)

  // Mock de dados para testes
  const mockChats: Chat[] = [
    {
      id: '1',
      title: 'Introdução à Inteligência Artificial',
      messages: [
        {
          id: '101',
          role: 'user',
          content: 'Preciso de um mapa mental sobre conceitos básicos de IA',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '102',
          role: 'assistant',
          content:
            'Claro! Vou criar um mapa mental sobre os conceitos básicos de Inteligência Artificial. Quais tópicos específicos você gostaria de incluir?',
          timestamp: new Date(Date.now() - 3580000),
        },
        {
          id: '103',
          role: 'user',
          content: 'Machine Learning, Deep Learning, NLP e aplicações práticas',
          timestamp: new Date(Date.now() - 3540000),
        },
        {
          id: '104',
          role: 'assistant',
          content:
            'Ótimo! Criei um mapa mental abrangendo Machine Learning, Deep Learning, NLP e aplicações práticas da IA. Você pode visualizá-lo e fazer download agora.',
          timestamp: new Date(Date.now() - 3520000),
        },
      ],
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3520000),
      mindMaps: [
        {
          id: '1001',
          title: 'Conceitos básicos de IA',
          rootNode: {
            id: 'r1',
            text: 'Inteligência Artificial',
            children: [
              {
                id: 'c1',
                text: 'Machine Learning',
                children: [
                  { id: 'c1-1', text: 'Aprendizado Supervisionado' },
                  { id: 'c1-2', text: 'Aprendizado Não-Supervisionado' },
                ],
              },
              {
                id: 'c2',
                text: 'Deep Learning',
                children: [{ id: 'c2-1', text: 'Redes Neurais' }],
              },
              {
                id: 'c3',
                text: 'NLP',
                children: [{ id: 'c3-1', text: 'Processamento de Linguagem Natural' }],
              },
            ],
          },
          createdAt: new Date(Date.now() - 3520000),
          updatedAt: new Date(Date.now() - 3520000),
          source: 'chat',
        },
      ],
    },
    {
      id: '2',
      title: 'Desenvolvimento Sustentável',
      messages: [
        {
          id: '201',
          role: 'user',
          content: 'Quero um mapa mental sobre ODS - Objetivos de Desenvolvimento Sustentável',
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: '202',
          role: 'assistant',
          content:
            'Com certeza! Os Objetivos de Desenvolvimento Sustentável (ODS) são 17 metas globais estabelecidas pela ONU. Gostaria que o mapa mental abordasse todos eles ou algum específico?',
          timestamp: new Date(Date.now() - 86380000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86380000),
      mindMaps: [],
    },
  ]

  // Inicializar com dados de exemplo
  const initializeStore = () => {
    // Tenta carregar dados do localStorage
    const savedChats = localStorage.getItem('chats')
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats)
        // Converte as strings de data de volta para objetos Date
        parsedChats.forEach((chat: any) => {
          chat.createdAt = new Date(chat.createdAt)
          chat.updatedAt = new Date(chat.updatedAt)
          chat.messages.forEach((msg: any) => {
            msg.timestamp = new Date(msg.timestamp)
          })
          // Converte datas dos mapas mentais
          if (chat.mindMaps) {
            chat.mindMaps.forEach((map: any) => {
              map.createdAt = new Date(map.createdAt)
              map.updatedAt = new Date(map.updatedAt)
            })
          } else {
            chat.mindMaps = [] // Garante que o campo mindMaps exista
          }
        })
        chats.value = parsedChats
      } catch (e) {
        console.error('Erro ao carregar chats do localStorage:', e)
        chats.value = [...mockChats]
      }
    } else {
      // Usa os dados mockados
      chats.value = [...mockChats]
    }

    // Define o chat ativo como o mais recente
    if (chats.value.length > 0) {
      activeChatId.value = chats.value[0].id

      // Define o mapa mental ativo como o primeiro do chat, se existir
      if (chats.value[0].mindMaps.length > 0) {
        activeMindMapId.value = chats.value[0].mindMaps[0].id
      }
    }
  }

  // Função para salvar no localStorage
  const saveChats = () => {
    try {
      localStorage.setItem('chats', JSON.stringify(chats.value))
    } catch (e) {
      console.error('Erro ao salvar chats no localStorage:', e)
    }
  }

  /**
   * Verifica e repara mapas mentais inválidos (sem rootNode)
   */
  const repairInvalidMindMaps = () => {
    chats.value.forEach((chat) => {
      chat.mindMaps.forEach((mindMap) => {
        if (!mindMap.rootNode) {
          console.log('Reparando mapa mental sem rootNode:', mindMap.id)
          mindMap.rootNode = {
            id: 'root1',
            text: mindMap.title || 'Mapa Mental',
            children: [
              {
                id: 'c1',
                text: 'Tópico 1',
                children: [
                  { id: 'c1-1', text: 'Subtópico 1.1' },
                  { id: 'c1-2', text: 'Subtópico 1.2' },
                ],
              },
              {
                id: 'c2',
                text: 'Tópico 2',
                children: [
                  { id: 'c2-1', text: 'Subtópico 2.1' },
                  { id: 'c2-2', text: 'Subtópico 2.2' },
                ],
              },
            ],
          }
          mindMap.updatedAt = new Date()
        }
      })
    })

    // Salva as alterações
    saveChats()
  }

  // Getters
  const activeChat = computed(() => {
    return chats.value.find((chat) => chat.id === activeChatId.value) || null
  })

  const sortedChats = computed(() => {
    return [...chats.value].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  })

  const activeMindMap = computed(() => {
    if (!activeChat.value || !activeMindMapId.value) return null
    return activeChat.value.mindMaps.find((map) => map.id === activeMindMapId.value) || null
  })

  const chatMindMaps = computed(() => {
    console.log('Calculando chatMindMaps, activeChat:', activeChat.value)
    if (!activeChat.value) return []
    return activeChat.value.mindMaps
  })

  // Actions
  const setActiveChat = (chatId: string) => {
    activeChatId.value = chatId

    // Define o mapa mental ativo como o primeiro do chat, se existir
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat && chat.mindMaps.length > 0) {
      activeMindMapId.value = chat.mindMaps[0].id
    } else {
      activeMindMapId.value = null
    }
  }

  const setActiveMindMap = (mindMapId: string) => {
    console.log('setActiveMindMap chamado com id:', mindMapId)
    activeMindMapId.value = mindMapId
    console.log('activeMindMapId definido como:', activeMindMapId.value)

    // Verifica se o mapa mental é válido e repara se necessário
    if (activeMindMap.value && !activeMindMap.value.rootNode) {
      const chat = activeChat.value
      if (chat) {
        updateMindMap(chat.id, mindMapId, {
          rootNode: {
            id: 'root1',
            text: activeMindMap.value.title || 'Mapa Mental',
            children: [
              {
                id: 'c1',
                text: 'Tópico 1',
                children: [
                  { id: 'c1-1', text: 'Subtópico 1.1' },
                  { id: 'c1-2', text: 'Subtópico 1.2' },
                ],
              },
              {
                id: 'c2',
                text: 'Tópico 2',
                children: [
                  { id: 'c2-1', text: 'Subtópico 2.1' },
                  { id: 'c2-2', text: 'Subtópico 2.2' },
                ],
              },
            ],
          },
        })
      }
    }

    console.log('activeMindMap agora é:', activeMindMap.value)
  }

  const createChat = (title: string = 'Novo Chat') => {
    const newChat: Chat = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mindMaps: [],
    }

    chats.value.unshift(newChat)
    activeChatId.value = newChat.id
    activeMindMapId.value = null
    saveChats()

    return newChat
  }

  const deleteChat = (chatId: string) => {
    const index = chats.value.findIndex((chat) => chat.id === chatId)
    if (index !== -1) {
      chats.value.splice(index, 1)

      // Se o chat excluído era o ativo, seleciona outro
      if (activeChatId.value === chatId) {
        activeChatId.value = chats.value.length > 0 ? chats.value[0].id : null

        // Atualiza o mapa mental ativo
        if (activeChatId.value && chats.value[0].mindMaps.length > 0) {
          activeMindMapId.value = chats.value[0].mindMaps[0].id
        } else {
          activeMindMapId.value = null
        }
      }

      saveChats()
    }
  }

  const renameChat = (chatId: string, newTitle: string) => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      chat.title = newTitle
      chat.updatedAt = new Date()
      saveChats()
    }
  }

  const addMessage = (chatId: string, content: string, role: 'user' | 'assistant') => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      const newMessage: Message = {
        id: uuidv4(),
        content,
        role,
        timestamp: new Date(),
      }

      chat.messages.push(newMessage)
      chat.updatedAt = new Date()
      saveChats()

      return newMessage.id
    }
    return null
  }

  /**
   * Atualiza o conteúdo de uma mensagem existente
   * Usado principalmente para streaming de respostas
   */
  const updateMessageContent = (chatId: string, messageId: string, content: string) => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      const message = chat.messages.find((m) => m.id === messageId)
      if (message) {
        message.content = content
        // Não atualizamos o timestamp para manter a ordem original
        saveChats()
        return true
      }
    }
    return false
  }

  /**
   * Adiciona um novo mapa mental ao chat
   */
  const addMindMap = (
    chatId: string,
    title: string,
    rootNode: MindMapNode | null = null,
    source: 'chat' | 'document' = 'chat',
    documentName?: string,
  ) => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      // Se não for fornecido um nó raiz, cria um padrão
      const defaultRootNode: MindMapNode = rootNode || {
        id: 'root1',
        text: title || 'Mapa Mental',
        children: [
          {
            id: 'c1',
            text: 'Tópico 1',
            children: [
              { id: 'c1-1', text: 'Subtópico 1.1' },
              { id: 'c1-2', text: 'Subtópico 1.2' },
            ],
          },
          {
            id: 'c2',
            text: 'Tópico 2',
            children: [
              { id: 'c2-1', text: 'Subtópico 2.1' },
              { id: 'c2-2', text: 'Subtópico 2.2' },
            ],
          },
        ],
      }

      const newMindMap: MindMap = {
        id: uuidv4(),
        title,
        rootNode: defaultRootNode,
        createdAt: new Date(),
        updatedAt: new Date(),
        source,
        documentName,
      }

      chat.mindMaps.push(newMindMap)
      activeMindMapId.value = newMindMap.id
      saveChats()

      return newMindMap.id
    }
    return null
  }

  /**
   * Atualiza um mapa mental existente
   */
  const updateMindMap = (
    chatId: string,
    mindMapId: string,
    updates: Partial<Omit<MindMap, 'id' | 'createdAt'>>,
  ) => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      const mindMap = chat.mindMaps.find((map) => map.id === mindMapId)
      if (mindMap) {
        // Atualiza apenas os campos fornecidos
        if (updates.title !== undefined) mindMap.title = updates.title
        if (updates.rootNode !== undefined) mindMap.rootNode = updates.rootNode
        if (updates.source !== undefined) mindMap.source = updates.source
        if (updates.documentName !== undefined) mindMap.documentName = updates.documentName

        mindMap.updatedAt = new Date()
        saveChats()
        return true
      }
    }
    return false
  }

  /**
   * Remove um mapa mental
   */
  const deleteMindMap = (chatId: string, mindMapId: string) => {
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      const index = chat.mindMaps.findIndex((map) => map.id === mindMapId)
      if (index !== -1) {
        chat.mindMaps.splice(index, 1)

        // Se o mapa excluído era o ativo, seleciona outro
        if (activeMindMapId.value === mindMapId) {
          activeMindMapId.value = chat.mindMaps.length > 0 ? chat.mindMaps[0].id : null
        }

        saveChats()
        return true
      }
    }
    return false
  }

  const clearAllChats = () => {
    chats.value = []
    activeChatId.value = null
    activeMindMapId.value = null
    saveChats()
  }

  // Chama a inicialização
  initializeStore()

  // Repara mapas mentais depois da inicialização completa
  repairInvalidMindMaps()

  return {
    chats,
    activeChatId,
    activeMindMapId,
    activeChat,
    sortedChats,
    activeMindMap,
    chatMindMaps,
    setActiveChat,
    setActiveMindMap,
    createChat,
    deleteChat,
    renameChat,
    addMessage,
    updateMessageContent,
    addMindMap,
    updateMindMap,
    deleteMindMap,
    clearAllChats,
  }
})
