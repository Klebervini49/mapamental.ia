<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import MindElixir from 'mind-elixir';
import { MindMapNode } from '../services/mindMapGenerator';

const props = defineProps<{
  rootNode: MindMapNode;
  title: string;
  editable?: boolean;
}>();

const emit = defineEmits<{
  'update:rootNode': [value: MindMapNode];
  'save': [];
  'cancel': [];
}>();

// Estado interno
const safeClone = (obj: any) => {
  try {
    if (!obj) return { id: 'empty', text: 'Vazio' };
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Erro ao clonar objeto:', error);
    return { id: 'error', text: 'Erro ao carregar mapa' };
  }
};

const internalRootNode = ref<MindMapNode>(safeClone(props.rootNode));
const mindmapContainer = ref<HTMLElement | null>(null);
const mindElixirInstance = ref<any>(null);
const hasChanges = ref(false);

// Converter o formato de MindMapNode para o formato do mind-elixir
const convertToMindElixirData = (node: MindMapNode) => {
  try {
    if (!node || !node.id) {
      // Se o nó for inválido, retorna um nó mínimo válido
      return {
        id: 'root',
        topic: 'Mapa Mental',
        style: {
          background: getNodeColor(0)
        }
      };
    }

    // Cria nó raiz com propriedades básicas
    const result: any = {
      id: node.id,
      topic: node.text || 'Item',
      style: {
        background: getNodeColor(0)
      }
    };

    // Processa filhos regulares no array children
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      // Filtra quaisquer nós filhos inválidos
      const validChildren = node.children.filter(child => child && (child.id || child.text));

      if (validChildren.length > 0) {
        result.children = validChildren.map((child, index) => {
          const childNode = convertToMindElixirData(child);
          // Aplicar cores diferentes por nível
          childNode.style = {
            background: getNodeColor(1)
          };

          // Garantir que o nó filho tenha um ID válido
          if (!childNode.id) {
            childNode.id = `child-${index}-${Date.now()}`;
          }

          return childNode;
        });
      }
    }
    // Se o nó não tem children convencionais, mas tem outras propriedades que são objetos,
    // trata essas propriedades como filhos (caso comum em formatos de dados aninhados)
    else if (Object.keys(node).length > 3) { // id, text, children são as 3 props padrão
      const potentialChildren = [];

      // Percorre todas as propriedades que não são id, text ou children
      for (const [key, value] of Object.entries(node)) {
        if (key !== 'id' && key !== 'text' && key !== 'children' && key !== 'color') {
          if (typeof value === 'object' && value !== null) {
            // Se o valor é um objeto, cria um nó filho para representá-lo
            const childNode = {
              id: `${node.id}-${key}`,
              topic: key,
              style: { background: getNodeColor(1) },
              children: []
            };

            // Cria nós netos para as propriedades do objeto filho
            if (Array.isArray(value)) {
              // Se o valor é um array, criar um nó para cada item do array
              childNode.children = value.map((item, idx) => {
                if (typeof item === 'object' && item !== null) {
                  return {
                    id: `${node.id}-${key}-${idx}`,
                    topic: Object.keys(item)[0] || `Item ${idx + 1}`,
                    style: { background: getNodeColor(2) }
                  };
                } else {
                  return {
                    id: `${node.id}-${key}-${idx}`,
                    topic: String(item),
                    style: { background: getNodeColor(2) }
                  };
                }
              });
            } else {
              // Para objetos não-array, criar um nó para cada chave
              for (const [subKey, subValue] of Object.entries(value)) {
                let grandChildNode;

                if (typeof subValue === 'object' && subValue !== null) {
                  // Se o valor é um objeto, cria um nó complexo
                  grandChildNode = {
                    id: `${node.id}-${key}-${subKey}`,
                    topic: subKey,
                    style: { background: getNodeColor(2) }
                  };

                  // Adiciona detalhes se forem primitivos ou os converte em nós aninhados
                  if (Array.isArray(subValue)) {
                    grandChildNode.children = subValue.map((item, idx) => ({
                      id: `${node.id}-${key}-${subKey}-${idx}`,
                      topic: String(item),
                      style: { background: getNodeColor(3) }
                    }));
                  }
                } else {
                  // Para valores primitivos, criar nós simples
                  grandChildNode = {
                    id: `${node.id}-${key}-${subKey}`,
                    topic: `${subKey}: ${subValue}`,
                    style: { background: getNodeColor(2) }
                  };
                }

                childNode.children.push(grandChildNode);
              }
            }

            potentialChildren.push(childNode);
          } else {
            // Para valores primitivos, criar nós simples
            potentialChildren.push({
              id: `${node.id}-${key}`,
              topic: `${key}: ${value}`,
              style: { background: getNodeColor(1) }
            });
          }
        }
      }

      if (potentialChildren.length > 0) {
        result.children = potentialChildren;
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao converter para formato MindElixir:', error);
    // Retorna um nó básico em caso de erro
    return {
      id: 'error-fallback',
      topic: 'Erro ao carregar mapa',
      style: {
        background: '#FF3B30'
      }
    };
  }
};

// Converter do formato mind-elixir de volta para MindMapNode
const convertFromMindElixirData = (data: any): MindMapNode => {
  try {
    if (!data || typeof data !== 'object') {
      // Retornar um nó básico se os dados forem inválidos
      return {
        id: 'error-conversion',
        text: 'Dados inválidos'
      };
    }

    const result: MindMapNode = {
      id: data.id || `node-${Date.now()}`,
      text: data.topic || 'Item sem título'
    };

    if (data.children && Array.isArray(data.children) && data.children.length > 0) {
      // Filtrar quaisquer filhos inválidos
      const validChildren = data.children.filter((child: any) =>
        child && typeof child === 'object'
      );

      if (validChildren.length > 0) {
        result.children = validChildren.map((child: any) =>
          convertFromMindElixirData(child)
        );
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao converter do formato MindElixir:', error);
    // Retornar um nó básico em caso de erro
    return {
      id: 'error-fallback',
      text: 'Erro na conversão'
    };
  }
};

// Obter cor para o nó baseado no nível
const getNodeColor = (level: number) => {
  const colors = ['#5B61D9', '#4CAF50', '#FF9800', '#FF3B30'];
  return colors[level % colors.length];
};

// Inicializa o MindElixir após o DOM ser montado
function initMindElixir() {
  try {
    console.log('Iniciando inicialização do MindElixir...');

    // Verifica se o contêiner existe
    const container = document.getElementById('map');
    if (!container) {
      console.error('Elemento #map não encontrado no DOM. Tentando novamente em 200ms...');
      setTimeout(initMindElixir, 200);
      return;
    }

    // Limpa instâncias anteriores
    if (mindElixirInstance.value) {
      try {
        mindElixirInstance.value.destroy();
      } catch (destroyError) {
        console.warn('Erro ao destruir instância anterior:', destroyError);
      }
    }

    // Dados mínimos para inicialização
    const fallbackData = {
      nodeData: {
        id: 'root',
        topic: props.title || 'Mapa Mental',
        children: []
      }
    };

    // Configura a instância com dados mínimos iniciais
    console.log('Configurando instância MindElixir...');

    // Tema baseado nas preferências atuais
    const currentTheme = {
      primary: '#5B61D9',
      secondary: '#4CAF50',
      success: '#28a745',
      info: '#17a2b8',
      warning: '#FF9800',
      danger: '#FF3B30',
      text: 'white'
    };

    console.log('Elemento #map encontrado:', container);

    mindElixirInstance.value = new MindElixir({
      el: '#map',
      direction: MindElixir.SIDE,
      theme: currentTheme as any,
      draggable: true,
      contextMenu: true,
      toolBar: true,
      nodeMenu: true,
      keypress: true,
      locale: 'en', // Usando locale padrão
      mainColor: '#888',
      data: fallbackData
    } as any);

    // Inicializa com dados mínimos primeiro
    console.log('Iniciando MindElixir com dados mínimos...');
    try {
      // Garante que o objeto tem os valores esperados antes da inicialização
      if (!mindElixirInstance.value.data || !mindElixirInstance.value.data.nodeData) {
        mindElixirInstance.value.data = {
          nodeData: {
            id: 'root',
            topic: props.title || 'Mapa Mental',
            children: []
          }
        };
      }

      // Aplica o init sem opções adicionais que possam causar problemas
      mindElixirInstance.value.init();

    } catch (initError) {
      console.error('Erro na inicialização:', initError);

      // Tenta uma alternativa mais segura para inicialização
      try {
        // Recria com mínimo de opções
        mindElixirInstance.value = new MindElixir({
          el: '#map',
          direction: MindElixir.SIDE,
          draggable: true,
          contextMenu: false,
          toolBar: false,
          nodeMenu: false,
          keypress: false,
          data: {
            nodeData: {
              id: 'root',
              topic: 'Mapa Mental',
              children: []
            }
          }
        } as any);

        mindElixirInstance.value.init();
      } catch (recoveryError) {
        console.error('Erro na tentativa de recuperação:', recoveryError);
        return;
      }
    }

    // Tenta carregar os dados originais após inicialização
    console.log('Tentando carregar dados originais...');
    setTimeout(() => {
      try {
        // Verifica se o componente ainda está montado
        if (!container || !document.body.contains(container)) {
          console.error('Contêiner não mais existente no DOM');
          return;
        }

        // Carrega os dados do nó root fornecido nos props
        console.log('Props rootNode:', props.rootNode);

        if (props.rootNode) {
          console.log('Convertendo dados para formato Elixir');

          // Verifica se o nó raiz é válido
          if (!props.rootNode.id) {
            console.warn('rootNode não possui ID válido, adicionando ID temporário');
            props.rootNode.id = 'root-' + Date.now();
          }

          // Verifica se o texto é válido
          if (!props.rootNode.text) {
            console.warn('rootNode não possui texto válido, adicionando texto padrão');
            props.rootNode.text = props.title || 'Mapa Mental';
          }

          // Converte para o formato MindElixir
          let elixirData;
          try {
            // Criando uma cópia segura do objeto para processamento
            const safeRootNode = safeClone(props.rootNode);

            // Verifica novamente se a cópia é válida
            if (!safeRootNode || !safeRootNode.id) {
              console.warn('Falha ao clonar rootNode, usando dados padrão');
              elixirData = {
                nodeData: {
                  id: 'root',
                  topic: props.title || 'Mapa Mental',
                  children: []
                }
              };
            } else {
              const convertedNodeData = convertToMindElixirData(safeRootNode);
              console.log('Nó root convertido:', convertedNodeData);

              elixirData = {
                nodeData: convertedNodeData
              };
            }
          } catch (convertError) {
            console.error('Erro ao converter dados:', convertError);
            // Usa dados de fallback em caso de erro
            elixirData = {
              nodeData: {
                id: 'root',
                topic: props.title || 'Mapa Mental',
                children: []
              }
            };
          }

          console.log('Dados convertidos:', elixirData);

          // Verifica se os dados são válidos antes de atualizar
          if (elixirData && elixirData.nodeData) {
            try {
              // Limpa o objeto antes de transferir os dados
              const safeData = JSON.parse(JSON.stringify(elixirData));
              mindElixirInstance.value.data = safeData;
              mindElixirInstance.value.refresh();
              console.log('Mapa atualizado com os dados convertidos');
            } catch (refreshError) {
              console.error('Erro ao atualizar o mapa:', refreshError);
            }
          } else {
            console.warn('Dados convertidos inválidos, mantendo o mapa vazio');
          }
        } else {
          console.warn('rootNode não fornecido para o mapa mental');
        }

        // Centraliza o mapa após carregar
        setTimeout(() => {
          try {
            if (mindElixirInstance.value) {
              mindElixirInstance.value.center();
              console.log('Mapa centralizado com sucesso');
            }
          } catch (centerError) {
            console.warn('Erro ao centralizar mapa:', centerError);
          }
        }, 300);
      } catch (error) {
        console.error('Erro ao processar dados do mapa mental:', error);
      }
    }, 500);

    // Adiciona os event listeners
    addEventListeners();
    console.log('Inicialização completada com sucesso');

  } catch (error) {
    console.error('Erro crítico durante inicialização do MindElixir:', error);
  }
}

// Função para adicionar event listeners
function addEventListeners() {
  if (props.editable && mindElixirInstance.value && mindElixirInstance.value.bus) {
    try {
      // Quando o nó ou sua estrutura mudar
      mindElixirInstance.value.bus.addListener('operation', (operation) => {
        console.log('Operação realizada:', operation);
        hasChanges.value = true;
        updateInternalData();
      });

      // Quando o texto de um nó mudar
      mindElixirInstance.value.bus.addListener('changed', () => {
        console.log('Mapa atualizado');
        hasChanges.value = true;
        updateInternalData();
      });
    } catch (eventError) {
      console.error('Erro ao adicionar eventos:', eventError);
    }
  }
}

// Atualizar dados internos baseado na estrutura atual do mapa mental
const updateInternalData = () => {
  if (!mindElixirInstance.value) return;

  try {
    // Obter os dados atuais do mapa
    const currentData = mindElixirInstance.value.getData('node_tree');
    console.log('Dados atuais do mapa:', currentData);

    // Verificar se os dados são válidos
    if (!currentData || !currentData.nodeData) {
      console.warn('Dados inválidos retornados de getData()');
      return;
    }

    // Converter para o formato MindMapNode
    internalRootNode.value = convertFromMindElixirData(currentData.nodeData);
    console.log('Dados convertidos:', internalRootNode.value);

    // Emitir evento de atualização se tiver edições
    if (hasChanges.value) {
      emit('update:rootNode', internalRootNode.value);
    }
  } catch (error) {
    console.error('Erro ao atualizar dados internos:', error);
    // Não propagar o erro para evitar quebrar a UI
  }
};

// Adicionar nó irmão
const addSiblingNode = () => {
  if (!mindElixirInstance.value || !props.editable) return;

  try {
    const selectedNode = mindElixirInstance.value.currentNode;
    if (selectedNode) {
      mindElixirInstance.value.insertSibling();
      updateInternalData();
    } else {
      alert('Selecione um nó primeiro para adicionar um irmão.');
    }
  } catch (error) {
    console.error('Erro ao adicionar nó irmão:', error);
  }
};

// Adicionar nó filho ao nó selecionado
const addChildToSelected = () => {
  if (!mindElixirInstance.value || !props.editable) return;

  try {
    const selectedNode = mindElixirInstance.value.currentNode;
    if (selectedNode) {
      mindElixirInstance.value.insertChild();
      updateInternalData();
    } else {
      alert('Selecione um nó primeiro para adicionar um filho.');
    }
  } catch (error) {
    console.error('Erro ao adicionar filho:', error);
  }
};

// Remover nó selecionado
const removeSelected = () => {
  if (!mindElixirInstance.value || !props.editable) return;

  try {
    const selectedNode = mindElixirInstance.value.currentNode;
    if (selectedNode && selectedNode.dataset.nodeid !== 'root') {
      mindElixirInstance.value.removeNode(selectedNode);
      updateInternalData();
    } else {
      alert('Selecione um nó para remover (não é possível remover o nó raiz).');
    }
  } catch (error) {
    console.error('Erro ao remover nó:', error);
  }
};

// Salvar alterações
const saveChanges = () => {
  updateInternalData();
  emit('save');
};

// Cancelar alterações
const cancelChanges = () => {
  internalRootNode.value = safeClone(props.rootNode);

  // Reinicializar o mapa mental
  if (mindElixirInstance.value) {
    mindElixirInstance.value.destroy();
    mindElixirInstance.value = null;
  }

  initMindElixir();
  hasChanges.value = false;
  emit('cancel');
};

// Observar mudanças nas props
watch(() => props.rootNode, (newValue) => {
  console.log('MindMapViewer: props.rootNode alterado', newValue);
  if (newValue && !hasChanges.value) {
    internalRootNode.value = safeClone(newValue);

    // Reinicializar o mapa se ele já existir
    if (mindElixirInstance.value) {
      mindElixirInstance.value.destroy();
      mindElixirInstance.value = null;
    }

    initMindElixir();
  }
}, { deep: true });

// Inicializar no carregamento
onMounted(() => {
  console.log('MindMapViewer montado:', props.title, props.rootNode);

  // Verifica se rootNode é undefined e cria um nó básico para evitar erros
  if (!props.rootNode) {
    internalRootNode.value = {
      id: 'root',
      text: props.title || 'Mapa Mental',
      children: []
    };
  }

  // Aguardar até o próximo ciclo de renderização para garantir 
  // que o DOM foi atualizado antes de inicializar o mapa
  setTimeout(() => {
    // Garantir que o container já esteja devidamente renderizado
    const tryInitialize = () => {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        // Elemento existe, podemos inicializar
        initMindElixir();
      } else {
        // Elemento ainda não existe, tentar novamente
        console.log('Aguardando elemento #map ser renderizado...');
        setTimeout(tryInitialize, 100);
      }
    };

    tryInitialize();
  }, 200);
});

// Limpar ao desmontar
onBeforeUnmount(() => {
  if (mindElixirInstance.value) {
    try {
      mindElixirInstance.value.destroy();
    } catch (error) {
      console.error('Erro ao destruir instância do MindElixir:', error);
    }
    mindElixirInstance.value = null;
  }
});
</script>

<template>
  <div class="mind-map-viewer">
    <div class="mind-map-header">
      <h2>{{ title }}</h2>

      <div v-if="editable" class="edit-controls">
        <button class="add-node-button" @click="addChildToSelected" title="Adicionar filho ao nó selecionado">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Adicionar Filho
        </button>
        <button class="add-sibling-button" @click="addSiblingNode" title="Adicionar irmão ao nó selecionado">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" stroke-width="2">
            <rect x="3" y="8" width="18" height="8" rx="2" />
            <line x1="12" y1="6" x2="12" y2="14" />
            <line x1="8" y1="10" x2="16" y2="10" />
          </svg>
          Adicionar Irmão
        </button>
        <button class="remove-button" @click="removeSelected" title="Remover nó selecionado">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Remover Nó
        </button>
        <button class="save-button" @click="saveChanges">Salvar Alterações</button>
        <button class="cancel-button" @click="cancelChanges">Cancelar</button>
      </div>
    </div>

    <div class="mind-map-container" ref="mindmapContainer">
      <!-- Mensagem de carregamento ou erro -->
      <div v-if="!mindElixirInstance" class="mind-map-loading">
        <p>Carregando mapa mental...</p>
      </div>
      <div id="map" class="mind-map"></div>
    </div>
  </div>
</template>

<style scoped>
.mind-map-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.mind-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-color);
  z-index: 5;
}

.mind-map-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.edit-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.save-button,
.cancel-button,
.add-node-button,
.add-sibling-button,
.remove-button {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
}

.save-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-button {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.cancel-button:hover {
  background-color: var(--background-alt);
}

.add-node-button,
.add-sibling-button {
  background-color: #4CAF50;
  color: white;
}

.add-node-button:hover,
.add-sibling-button:hover {
  background-color: #43A047;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-button {
  background-color: #FF3B30;
  color: white;
}

.remove-button:hover {
  background-color: #E53935;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mind-map-container {
  flex: 1;
  width: 100%;
  height: calc(100% - 60px);
  background-color: #f8f9fa;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}

/* Estilos essenciais do Mind Elixir */
:deep(.mind-elixir) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:deep(.map-container) {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
}

:deep(.mind-elixir-toolbar) {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f8f9fa !important;
  border-radius: 8px;
  padding: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  z-index: 10;
}

:deep(.mind-elixir-toolbar) div {
  margin: 0 5px !important;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

:deep(.mind-elixir-toolbar) div:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.mind-elixir-node) {
  position: absolute;
  transition: transform 0.2s ease;
}

:deep(.mind-elixir-node:hover) {
  transform: scale(1.02);
}

:deep(.mind-elixir-node-topic) {
  padding: 8px 12px !important;
  border-radius: 6px !important;
  font-family: 'Roboto', sans-serif !important;
  font-weight: 500 !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  color: white;
  cursor: pointer;
}

:deep(.mind-elixir-node.root .mind-elixir-node-topic) {
  font-weight: 600 !important;
  font-size: 16px !important;
  background-color: #5B61D9;
}

:deep(.mind-elixir-node:not(.root) .mind-elixir-node-topic) {
  font-size: 14px !important;
}

:deep(.mind-elixir-link) {
  stroke: #cbd5e1;
  stroke-width: 2px;
  fill: transparent;
}

:deep(.mind-elixir-node.selected .mind-elixir-node-topic) {
  box-shadow: 0 0 0 2px rgba(91, 97, 217, 0.5) !important;
  transform: scale(1.05);
}

/* Menu de contexto */
:deep(.mind-elixir-context-menu) {
  position: absolute;
  background: white;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

:deep(.mind-elixir-context-menu div) {
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 6px;
}

:deep(.mind-elixir-context-menu div:hover) {
  background-color: rgba(91, 97, 217, 0.1);
}

/* Área de edição do nó */
:deep(.mind-elixir-editing) {
  position: absolute;
  padding: 4px 8px;
  font-size: 14px;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  background-color: white;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mind-map-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8);
  color: #666;
  font-size: 16px;
}

.mind-map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>