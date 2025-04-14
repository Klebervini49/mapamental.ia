# Servidor TTS Neural

Este é um servidor simples que oferece um endpoint de Text-to-Speech (TTS) neural para o MapaMental.IA.

## Instalação

Para instalar as dependências:

```
pnpm install
```

## Execução

Para iniciar o servidor:

```
pnpm start
```

Ou com recarregamento automático durante desenvolvimento:

```
pnpm dev
```

## Endpoint

O servidor rodará na porta 11435 e o endpoint será:
http://localhost:11435/tts

## Uso

Envie uma requisição POST com o seguinte formato:

```json
{
  "text": "Texto que você deseja converter em fala",
  "voice": "pt_female",
  "speed": 1.0
}
```

Vozes disponíveis:

- `pt_female`: Voz portuguesa feminina
- `pt_male`: Voz portuguesa masculina

## Implementação

Este é um servidor de exemplo que simula um serviço de TTS neural. Para uma implementação real, você pode usar:

- Google Cloud Text-to-Speech
- Microsoft Azure Speech Service
- Amazon Polly
- Outras APIs de TTS neural
