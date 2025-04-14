<script setup lang="ts">
import { MindMap } from '../stores/chat';

const props = defineProps<{
  mindMaps: MindMap[];
  activeMindMapId: string | null;
}>();

const emit = defineEmits<{
  'select-mind-map': [id: string];
  'delete-mind-map': [id: string];
  'edit-mind-map': [id: string];
}>();

// Seleciona um mapa mental
const selectMindMap = (id: string) => {
  emit('select-mind-map', id);
};

// Edita um mapa mental
const editMindMap = (id: string, event: Event) => {
  event.stopPropagation();
  emit('edit-mind-map', id);
};

// Exclui um mapa mental
const deleteMindMap = (id: string, event: Event) => {
  event.stopPropagation();
  if (confirm('Tem certeza que deseja excluir este mapa mental?')) {
    emit('delete-mind-map', id);
  }
};

// Formatação de data
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Obtém o ícone com base na origem do mapa
const getSourceIcon = (source: 'chat' | 'document') => {
  return source === 'chat'
    ? 'chat-bubble'
    : 'document';
};
</script>

<template>
  <div class="mind-map-list">
    <div class="list-header">
      <h3>Mapas Mentais</h3>
    </div>

    <div v-if="mindMaps.length === 0" class="empty-list">
      <p>Nenhum mapa mental criado ainda.</p>
      <p>Peça ao assistente para criar um mapa mental ou envie um documento.</p>
    </div>

    <div v-else class="map-items">
      <div v-for="map in mindMaps" :key="map.id" class="map-item" :class="{ 'active': map.id === activeMindMapId }"
        @click="selectMindMap(map.id)">
        <div class="map-icon">
          <div v-if="getSourceIcon(map.source) === 'chat'" class="chat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div v-else class="document-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
        </div>

        <div class="map-info">
          <div class="map-title">{{ map.title }}</div>
          <div class="map-meta">
            <span class="map-date">{{ formatDate(map.updatedAt) }}</span>
            <span v-if="map.documentName" class="map-source">{{ map.documentName }}</span>
          </div>
        </div>

        <div class="map-actions">
          <button class="edit-button" title="Editar mapa" @click="editMindMap(map.id, $event)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="delete-button" title="Excluir mapa" @click="deleteMindMap(map.id, $event)">
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
</template>

<style scoped>
.mind-map-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
}

.list-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.list-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.empty-list {
  padding: 20px;
  color: var(--text-light);
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
}

.map-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.map-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: var(--transition);
}

.map-item:hover {
  background-color: var(--background-alt);
}

.map-item.active {
  background-color: rgba(91, 97, 217, 0.08);
  border-left: 3px solid var(--primary-color);
}

.map-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  color: var(--primary-color);
}

.map-icon svg {
  width: 24px;
  height: 24px;
}

.map-info {
  flex: 1;
  overflow: hidden;
}

.map-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}

.map-meta {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

.map-date,
.map-source {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-source {
  font-style: italic;
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.map-item:hover .map-actions {
  opacity: 1;
}

.edit-button,
.delete-button {
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

.edit-button:hover {
  background-color: var(--background-alt);
  color: var(--primary-color);
}

.delete-button:hover {
  background-color: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.edit-button svg,
.delete-button svg {
  width: 16px;
  height: 16px;
}
</style>