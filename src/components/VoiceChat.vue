<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import elevenlabsService, { AVAILABLE_VOICES } from '../services/elevenlabsService';

const props = defineProps<{
  active: boolean;
  onVoiceMessage: (message: string) => void;
  onStopListening: () => void;
}>();

const emit = defineEmits<{
  'toggle-voice-chat': [];
}>();

// Tipos para as APIs de Web Speech
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Estados para controlar a interface
const isListening = ref(false);
const errorMessage = ref('');
const transcript = ref('');
const isResponseSpeaking = ref(false);
const voiceType = ref('neural'); // Tipo de voz: 'native' (navegador) ou 'neural'
const selectedVoice = ref('EXAVITQu4vr4xnSDxMaL'); // ID da voz feminina natural
const isLoadingVoice = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);

// Referências para as APIs de voz
let recognition: any = null;
let speechSynthesis: SpeechSynthesis | null = null;

// Endpoint para serviço TTS neural
const TTS_NEURAL_API = 'https://api.elevenlabs.io/v1/text-to-speech';

// API Key para ElevenLabs (solicite ao usuário inserir)
const apiKey = ref('sk_00ea5f4267eee0fbefdce16e17e52aed492c19404f0477bd');  // Chave API ElevenLabs configurada

// Lista de vozes disponíveis na ElevenLabs
const availableVoices = AVAILABLE_VOICES;

// Inicializa o reconhecimento de voz
const initSpeechRecognition = () => {
  try {
    // Verificando suporte do navegador
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      errorMessage.value = 'Seu navegador não suporta reconhecimento de voz.';
      console.error('API de reconhecimento de voz não disponível neste navegador');
      return false;
    }

    // @ts-ignore - Necessário devido à compatibilidade entre navegadores
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Limpa qualquer instância anterior
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn('Erro ao parar instância anterior:', e);
      }
    }

    recognition = new SpeechRecognition();

    if (recognition) {
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Configurar eventos
      recognition.onstart = () => {
        isListening.value = true;
        errorMessage.value = '';
        transcript.value = '';
        console.log('[VOICE] 🎤 Reconhecimento de voz iniciado.');
      };

      recognition.onresult = (event) => {
        console.log('[VOICE] 📝 Recebeu resultado:', event.results);
        const result = event.results[event.results.length - 1];
        const transcriptText = result[0].transcript;
        transcript.value = transcriptText;
        console.log('[VOICE] 📝 Texto reconhecido:', transcriptText);

        // Se o resultado for final, envia a mensagem
        if (result.isFinal) {
          props.onVoiceMessage(transcriptText);
          transcript.value = '';
        }
      };

      recognition.onerror = (event) => {
        console.error('[VOICE] ❌ Erro no reconhecimento de voz:', event);
        errorMessage.value = `Erro no reconhecimento de voz: ${event.error}`;

        if (event.error === 'no-speech') {
          errorMessage.value = 'Nenhum áudio detectado. Verifique seu microfone.';
        } else if (event.error === 'audio-capture') {
          errorMessage.value = 'Não foi possível acessar o microfone. Verifique as permissões.';
          // Tenta verificar microfone novamente
          testMicrophoneAccess().then(hasMic => {
            if (hasMic) {
              errorMessage.value = 'Microfone detectado, tentando reconectar...';
            }
          });
        } else if (event.error === 'not-allowed') {
          errorMessage.value = 'Permissão de microfone negada. Verifique as configurações do navegador.';
        }

        isListening.value = false;

        // Tenta reiniciar após um erro
        setTimeout(() => {
          if (props.active) {
            console.log('[VOICE] 🔄 Tentando reiniciar após erro:', event.error);
            startListening();
          }
        }, 2000);
      };

      recognition.onend = () => {
        console.log('[VOICE] 🛑 Reconhecimento de voz finalizado');

        // Se estava escutando e não está falando resposta, provavelmente caiu
        if (isListening.value && !isResponseSpeaking.value) {
          console.log('[VOICE] ⚠️ Reconhecimento caiu inesperadamente, tentando reiniciar...');
          isListening.value = false;

          // Reinicia automaticamente se ainda estiver ativo
          if (props.active) {
            setTimeout(() => {
              console.log('[VOICE] 🔄 Reiniciando após queda...');
              // Tentar iniciar uma nova instância
              recognition = null;
              initSpeechRecognition();
              startListening();
            }, 300);
          }
        } else {
          isListening.value = false;
        }
      };

      // Adiciona timeouts para detectar se o reconhecimento está funcionando
      let activityTimeout = setTimeout(() => {
        if (isListening.value && transcript.value === '') {
          console.warn('[VOICE] ⚠️ Sem atividade após 5 segundos, verificando microfone...');
          // Verificar microfone novamente
          testMicrophoneAccess().then(hasMic => {
            if (hasMic) {
              console.log('[VOICE] ✅ Microfone detectado mas sem captação. Tentando reiniciar...');
              // Tentar reiniciar completamente
              try {
                recognition?.stop();
              } catch (e) { /* ignora erros ao parar */ }

              setTimeout(() => {
                recognition = null;
                initSpeechRecognition();
                startListening();
              }, 500);
            } else {
              errorMessage.value = 'Problema com o microfone. Verifique as permissões.';
            }
          });
        }
      }, 5000);

      // Limpar timeout quando houver resultado
      watch(() => transcript.value, (newVal) => {
        if (newVal) {
          clearTimeout(activityTimeout);
          // Reseta o timeout para continuar monitorando
          activityTimeout = setTimeout(() => {
            if (isListening.value && !isResponseSpeaking.value) {
              console.log('[VOICE] 🔄 Verificando atividade do microfone após período sem fala...');
              // Se parou de falar por um tempo, reinicie para manter fresco
              try {
                recognition?.stop();
              } catch (e) { /* ignora erros ao parar */ }

              setTimeout(() => {
                startListening();
              }, 500);
            }
          }, 10000); // 10 segundos sem fala
        }
      });

      // Limpar o timeout ao desmontar
      onBeforeUnmount(() => {
        clearTimeout(activityTimeout);
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error('[VOICE] ❌ Erro ao inicializar reconhecimento de voz:', error);
    errorMessage.value = 'Erro ao inicializar reconhecimento de voz.';
    return false;
  }
};

// Inicializa a síntese de voz
const initSpeechSynthesis = () => {
  try {
    if (!('speechSynthesis' in window)) {
      errorMessage.value = 'Seu navegador não suporta síntese de voz.';
      return false;
    }

    speechSynthesis = window.speechSynthesis;
    return true;
  } catch (error) {
    console.error('Erro ao inicializar síntese de voz:', error);
    errorMessage.value = 'Erro ao inicializar síntese de voz.';
    return false;
  }
};

// Inicia o reconhecimento de voz
const startListening = () => {
  if (!recognition) {
    console.log('[VOICE] 🔄 Inicializando reconhecimento de voz...');
    const initialized = initSpeechRecognition();
    if (!initialized) {
      console.error('[VOICE] ❌ Falha ao inicializar reconhecimento de voz');
      return;
    }
  }

  try {
    if (recognition && !isListening.value) {
      console.log('[VOICE] 🎤 Iniciando captura de voz...');
      recognition.start();
      console.log('[VOICE] ✅ Reconhecimento de voz iniciado');
    }
  } catch (error) {
    console.error('[VOICE] ❌ Erro ao iniciar reconhecimento de voz:', error);
    errorMessage.value = 'Erro ao iniciar captura de voz. Tentando reiniciar...';

    // Tenta reinicializar o reconhecimento se tiver erro
    recognition = null;
    setTimeout(() => {
      if (props.active) {
        console.log('[VOICE] 🔄 Tentando reiniciar após erro de inicialização');
        startListening();
      }
    }, 1000);
  }
};

// Para o reconhecimento de voz
const stopListening = () => {
  try {
    if (recognition && isListening.value) {
      recognition.stop();
      isListening.value = false;
      props.onStopListening();
    }
  } catch (error) {
    console.error('Erro ao parar reconhecimento de voz:', error);
  }
};

// Converte texto para voz usando TTS neural
const speakResponseNeural = async (text: string) => {
  try {
    isResponseSpeaking.value = true;
    isLoadingVoice.value = true;

    // Para o reconhecimento enquanto a resposta está sendo falada
    if (recognition && isListening.value) {
      recognition.stop();
    }

    // Se houver áudio tocando, pare
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.currentTime = 0;
    }

    // Cria um elemento de áudio se não existir
    if (!audioElement.value) {
      audioElement.value = new Audio();

      // Configurar eventos do áudio
      audioElement.value.onended = () => {
        isResponseSpeaking.value = false;
        isLoadingVoice.value = false;

        // Reinicia o reconhecimento após a resposta
        if (props.active) {
          startListening();
        }
      };

      audioElement.value.onerror = (e) => {
        console.error('Erro ao reproduzir áudio:', e);
        errorMessage.value = 'Erro ao reproduzir resposta em áudio.';
        isResponseSpeaking.value = false;
        isLoadingVoice.value = false;
      };
    }

    try {
      // Verifica se a API key está configurada
      if (!apiKey.value) {
        console.log('API Key não configurada. Usando síntese nativa do navegador.');
        return speakResponseNative(text);
      }

      // Tenta usar a API ElevenLabs
      console.log(`Solicitando TTS neural para: "${text.substring(0, 30)}..." com voz ${selectedVoice.value}`);

      // Cria um áudio simples com a API nativa para teste de áudio
      const testAudio = new Audio();
      testAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

      // Tenta tocar o áudio de teste para verificar se o áudio está funcionando
      try {
        await testAudio.play();
        testAudio.pause();
        console.log('✅ Teste de áudio bem-sucedido');
      } catch (audioTestError) {
        console.error('❌ Falha no teste de áudio:', audioTestError);
        errorMessage.value = 'Não foi possível reproduzir áudio. Clique em qualquer lugar da página para permitir áudio.';

        // Adiciona um evento de clique único para permitir interação com áudio
        const unlockAudio = () => {
          testAudio.play().then(() => {
            testAudio.pause();
            document.removeEventListener('click', unlockAudio);
            errorMessage.value = '';
            // Tenta novamente após desbloquear
            speakResponseNative(text);
          }).catch(e => {
            console.error('Ainda não foi possível reproduzir áudio:', e);
          });
        };

        document.addEventListener('click', unlockAudio);
        return false;
      }

      // Após teste de áudio bem-sucedido, usar o serviço de síntese
      const audioUrl = await elevenlabsService.textToSpeech({
        apiKey: apiKey.value,
        voiceId: selectedVoice.value,
        text: text
      });

      if (!audioUrl) {
        throw new Error('Não foi possível gerar áudio');
      }

      // Configura o áudio para reprodução
      if (audioElement.value) {
        // Limpar URL anterior se existir
        if (audioElement.value.src && audioElement.value.src.startsWith('blob:')) {
          elevenlabsService.cleanupAudioUrl(audioElement.value.src);
        }

        audioElement.value.src = audioUrl;

        // Tenta reproduzir o áudio
        await audioElement.value.play();
        isLoadingVoice.value = false;
        return true;
      }

      return false;
    } catch (apiError) {
      console.warn('Erro na API neural TTS, usando sintetizador nativo:', apiError);
      // Se falhar com a API neural, volta para a síntese nativa do navegador
      return speakResponseNative(text);
    }
  } catch (error) {
    console.error('Erro ao sintetizar voz neural:', error);
    errorMessage.value = 'Erro ao reproduzir resposta em áudio.';
    isResponseSpeaking.value = false;
    isLoadingVoice.value = false;
    return false;
  }
};

// Converte texto para voz usando a API nativa do navegador
const speakResponseNative = (text: string) => {
  if (!speechSynthesis) {
    const initialized = initSpeechSynthesis();
    if (!initialized) return false;
  }

  try {
    // Para qualquer fala em andamento
    if (speechSynthesis) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';

      // Verificar se há vozes disponíveis e listar no console para diagnóstico
      const voices = speechSynthesis.getVoices();
      console.log('Vozes disponíveis:', voices.map(v => ({ name: v.name, lang: v.lang })));

      // Encontrar uma voz em português, se disponível
      let portugueseVoice = voices.find(v => v.lang.includes('pt'));

      // Se não encontrar voz em português, use a primeira voz disponível
      if (!portugueseVoice && voices.length > 0) {
        console.warn('Nenhuma voz em português encontrada. Usando a primeira voz disponível.');
        portugueseVoice = voices[0];
      }

      if (portugueseVoice) {
        console.log('Usando voz:', portugueseVoice.name);
        utterance.voice = portugueseVoice;
      } else {
        console.warn('Nenhuma voz encontrada!');
      }

      // Melhora a naturalidade da voz
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('Síntese de voz iniciada!');
        isResponseSpeaking.value = true;
        isLoadingVoice.value = false;
        // Pausa o reconhecimento enquanto a resposta está sendo falada
        if (recognition && isListening.value) {
          recognition.stop();
        }
      };

      utterance.onend = () => {
        console.log('Síntese de voz finalizada!');
        isResponseSpeaking.value = false;
        // Reinicia o reconhecimento após a resposta
        if (props.active) {
          startListening();
        }
      };

      utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
        errorMessage.value = 'Erro ao reproduzir resposta em áudio.';
        isResponseSpeaking.value = false;
        isLoadingVoice.value = false;
      };

      // Garantir que o speechSynthesis está disponível (pode variar entre navegadores)
      if (window.speechSynthesis) {
        // Forçar o carregamento de vozes se necessário
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.onvoiceschanged = () => {
            // Tentar novamente quando as vozes estiverem disponíveis
            const updatedVoices = speechSynthesis.getVoices();
            if (updatedVoices.length > 0) {
              const updatedPortugueseVoice = updatedVoices.find(v => v.lang.includes('pt'));
              if (updatedPortugueseVoice) {
                utterance.voice = updatedPortugueseVoice;
              }
              speechSynthesis.speak(utterance);
            }
          };
        } else {
          speechSynthesis.speak(utterance);
        }
      } else {
        console.error('API de síntese de voz não disponível neste navegador');
        errorMessage.value = 'Seu navegador não suporta síntese de voz.';
        isResponseSpeaking.value = false;
        isLoadingVoice.value = false;
        return false;
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao sintetizar voz nativa:', error);
    errorMessage.value = 'Erro ao reproduzir resposta em áudio.';
    isResponseSpeaking.value = false;
    isLoadingVoice.value = false;
    return false;
  }
};

// Função principal para converter texto para voz
const speakResponse = async (text: string) => {
  console.log('Iniciando síntese de voz para texto:', text.substring(0, 30) + '...');

  if (!text || text.trim() === '') {
    console.log('Texto vazio, ignorando síntese de voz');
    return false;
  }

  try {
    // Garantir que a interface visual reflita o estado correto
    isResponseSpeaking.value = true;
    isLoadingVoice.value = true;

    // Usa síntese neural por padrão para melhor qualidade
    voiceType.value = 'neural';

    // Verifica qual método de síntese usar
    if (voiceType.value === 'neural') {
      // Tenta usar síntese neural primeiro
      const success = await speakResponseNeural(text);
      if (!success) {
        console.log('Fallback para síntese nativa após falha na neural');
        // Fallback para síntese nativa se a neural falhar
        return speakResponseNative(text);
      }
      return success;
    } else {
      // Usa síntese nativa diretamente
      return speakResponseNative(text);
    }
  } catch (error) {
    console.error('Erro ao iniciar síntese de voz:', error);
    // Tenta usar a síntese nativa como última opção
    isResponseSpeaking.value = false;
    isLoadingVoice.value = false;
    return speakResponseNative(text);
  }
};

// Alternar entre tipos de voz (neural ou nativa)
const toggleVoiceType = () => {
  voiceType.value = voiceType.value === 'neural' ? 'native' : 'neural';
};

// Trocar a voz selecionada
const changeVoice = (voiceId: string) => {
  selectedVoice.value = voiceId;
};

// Alternar o modo de chat de voz
const toggleVoiceChat = () => {
  emit('toggle-voice-chat');
};

// Testa o acesso ao microfone
const testMicrophoneAccess = async () => {
  try {
    console.log('[VOICE] 🔍 Verificando acesso ao microfone...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[VOICE] ✅ Acesso ao microfone concedido, configurações:',
      stream.getAudioTracks()[0].getSettings());

    // Verifica se o microfone está realmente funcionando
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Verifica se há sinal de áudio
    let silenceTimeout = setTimeout(() => {
      console.warn('[VOICE] ⚠️ Microfone parece estar silencioso ou muito baixo');
      errorMessage.value = 'Microfone parece não estar captando áudio. Verifique o volume do microfone.';
    }, 3000);

    const checkAudioLevel = () => {
      if (!stream.active) return;

      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      if (average > 10) {
        console.log('[VOICE] 🔊 Sinal de áudio detectado!', average);
        clearTimeout(silenceTimeout);
        // Limpa recursos
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();

    // Libera os recursos após o teste
    setTimeout(() => {
      clearTimeout(silenceTimeout);
      stream.getTracks().forEach(track => track.stop());
    }, 5000);

    return true;
  } catch (error) {
    console.error('[VOICE] ❌ Erro ao acessar o microfone:', error);
    errorMessage.value = 'Permissão ao microfone negada. Clique no ícone da câmera na barra de endereço e permita o acesso.';
    return false;
  }
};

// Função para sintetizar resposta streaming (incrementais)
const speakStreamingResponse = async (text: string, isComplete: boolean = false) => {
  // Se não for a resposta final completa, não sintetizamos o streaming parcial
  if (!isComplete) {
    console.log('Resposta streaming parcial, aguardando conclusão...');
    return false;
  }

  // É a resposta final completa, sintetiza normalmente
  return speakResponse(text);
};

// Inicializa as APIs quando o componente é montado
onMounted(async () => {
  console.log('[VOICE] 🚀 Componente de voz montado, ativo:', props.active);

  if (props.active) {
    // Testa o acesso ao microfone antes de iniciar
    const hasMicAccess = await testMicrophoneAccess();
    if (hasMicAccess) {
      console.log('[VOICE] ✅ Acesso ao microfone confirmado, inicializando APIs...');
      initSpeechRecognition();
      initSpeechSynthesis();
      startListening();
    } else {
      console.error('[VOICE] ❌ Sem acesso ao microfone, reconhecimento não será iniciado');
    }
  }
});

// Limpa recursos ao desmontar
onBeforeUnmount(() => {
  if (recognition) {
    recognition.stop();
  }

  if (speechSynthesis) {
    speechSynthesis.cancel();
  }

  // Libera recursos do elemento de áudio
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
  }
});

// Observadores para props
watch(() => props.active, (newVal) => {
  if (newVal) {
    startListening();
  } else {
    stopListening();
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  }
});

// Expõe funções e variáveis para uso externo
defineExpose({
  speakResponse,
  speakStreamingResponse,
  isListening,
  isResponseSpeaking,
  isLoadingVoice,
  transcript,
  errorMessage,
  selectedVoice,
  voiceType,
  availableVoices,
  apiKey
});
</script>

<template>
  <div class="voice-chat-container">
    <!-- Botão para alternar chat de voz -->
    <button @click="emit('toggle-voice-chat')" class="toggle-voice-button" :class="{ 'active': props.active }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>

    <!-- Configurações de voz (visível apenas quando ativo) -->
    <div v-if="props.active" class="voice-settings">
      <div class="voice-selector">
        <label for="voice-type">Tipo de voz:</label>
        <select id="voice-type" v-model="voiceType">
          <option value="neural">Neural (Mais natural)</option>
          <option value="native">Nativa (Navegador)</option>
        </select>
      </div>

      <div class="voice-selector" v-if="voiceType === 'neural'">
        <label for="voice-choice">Escolha a voz:</label>
        <select id="voice-choice" v-model="selectedVoice">
          <option v-for="voice in availableVoices" :key="voice.id" :value="voice.id">
            {{ voice.name }}
          </option>
        </select>
      </div>

      <div class="api-key-input" v-if="voiceType === 'neural' && !apiKey">
        <label for="api-key">ElevenLabs API Key:</label>
        <input type="password" id="api-key" v-model="apiKey" placeholder="Insira sua API key da ElevenLabs" />
        <small>Necessário para usar vozes neurais de alta qualidade</small>
      </div>
    </div>

    <!-- Estado do chat de voz -->
    <div class="voice-chat-status" v-if="props.active">
      <div class="status-card" :class="{
        'listening': isListening,
        'speaking': isResponseSpeaking,
        'loading': isLoadingVoice,
        'idle': !isListening && !isResponseSpeaking && !isLoadingVoice
      }">
        <div v-if="isListening" class="status-content">
          <div class="voice-waves">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <div class="status-info">
            <div class="status-title">Ouvindo...</div>
            <div class="transcript-text" v-if="transcript">{{ transcript }}</div>
            <div class="status-subtitle" v-else>Fale agora...</div>
          </div>
        </div>

        <div v-else-if="isLoadingVoice" class="status-content">
          <div class="loading-spinner"></div>
          <div class="status-info">
            <div class="status-title">Processando Áudio</div>
            <div class="status-subtitle">Aguarde enquanto carregamos a resposta...</div>
          </div>
        </div>

        <div v-else-if="isResponseSpeaking" class="status-content">
          <div class="voice-waves speaking">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <div class="status-info">
            <div class="status-title">Assistente Falando</div>
            <div class="status-subtitle">{{ voiceType === 'neural' ? 'Usando voz neural' : 'Usando voz nativa' }}</div>
          </div>
        </div>

        <div v-else class="status-content">
          <div class="status-icon-idle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </div>
          <div class="status-info">
            <div class="status-title">Aguardando</div>
            <div class="status-subtitle">Pronto para receber sua mensagem...</div>
          </div>
        </div>
      </div>

      <div class="error-message" v-if="errorMessage">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-chat-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  position: fixed;
  bottom: -1000px;
}

.voice-chat {
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--surface-color);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.voice-chat.active {
  box-shadow: 0 4px 12px rgba(91, 97, 217, 0.15);
}

.voice-chat-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 14px 18px;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.voice-chat-toggle:hover {
  background-color: rgba(91, 97, 217, 0.08);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  background-color: rgba(91, 97, 217, 0.1);
  border-radius: 50%;
  padding: 7px;
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
}

.toggle-text {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-color);
}

.voice-chat-status {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-card {
  width: 100%;
  padding: 16px;
  border-radius: 0;
  background-color: var(--background-color);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--border-color);
}

.status-card.listening {
  background-color: rgba(91, 97, 217, 0.08);
  border-left: 3px solid var(--primary-color);
}

.status-card.speaking {
  background-color: rgba(76, 175, 80, 0.08);
  border-left: 3px solid var(--success-color);
}

.status-card.loading {
  background-color: rgba(255, 152, 0, 0.08);
  border-left: 3px solid var(--warning-color);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color);
}

.status-subtitle {
  font-size: 0.85rem;
  color: var(--text-light);
}

.transcript-text {
  font-size: 0.9rem;
  color: var(--primary-color);
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.voice-waves {
  display: flex;
  align-items: center;
  height: 36px;
  gap: 3px;
}

.wave {
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  animation: wave 1.2s infinite ease-in-out;
  opacity: 0.8;
}

.voice-waves.speaking .wave {
  background-color: var(--success-color);
}

.wave:nth-child(1) {
  animation-delay: 0s;
  height: 60%;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
  height: 80%;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
  height: 100%;
}

.wave:nth-child(4) {
  animation-delay: 0.6s;
  height: 80%;
}

.wave:nth-child(5) {
  animation-delay: 0.8s;
  height: 60%;
}

@keyframes wave {

  0%,
  100% {
    transform: scaleY(0.6);
  }

  50% {
    transform: scaleY(1);
  }
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 152, 0, 0.3);
  border-radius: 50%;
  border-top-color: var(--warning-color);
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

.status-icon-idle {
  width: 32px;
  height: 32px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon-idle svg {
  width: 28px;
  height: 28px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(255, 59, 48, 0.08);
  border-left: 3px solid var(--danger-color);
  color: var(--danger-color);
  font-size: 0.85rem;
  margin: 0;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Voice Settings */
.voice-settings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  max-width: 320px;
}

.voice-selector,
.api-key-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.voice-selector label,
.api-key-input label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.voice-selector select,
.api-key-input input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.9rem;
}

.api-key-input small {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}
</style>