<template>
  <div class="sobre-container">
    <div class="sobre-content">
      <h1>Sobre o MapaMental.IA</h1>

      <section>
        <h2>O que é o MapaMental.IA?</h2>
        <p>
          O MapaMental.IA é uma ferramenta avançada que utiliza Inteligência Artificial para transformar
          textos e documentos em mapas mentais interativos. Nossa plataforma analisa automaticamente o conteúdo,
          identifica os principais conceitos e suas relações, organizando-os em uma estrutura visual intuitiva.
        </p>
      </section>

      <section>
        <h2>Como Funciona?</h2>
        <ol>
          <li><strong>Upload de Documentos:</strong> Carregue textos ou PDFs diretamente no site.</li>
          <li><strong>Análise por IA:</strong> Nossos algoritmos processam o conteúdo, identificando tópicos e
            subtópicos.</li>
          <li><strong>Geração do Mapa Mental:</strong> A aplicação cria automaticamente um mapa mental com os conceitos
            encontrados.</li>
          <li><strong>Visualização Interativa:</strong> Explore seu mapa mental de forma interativa, expandindo e
            contraindo nós.</li>
        </ol>
      </section>

      <section>
        <h2>Tecnologias Utilizadas</h2>
        <ul>
          <li>Vue.js para a interface de usuário</li>
          <li>LangChain para processamento de linguagem natural</li>
          <li>MarkMap para renderização de mapas mentais interativos</li>
          <li>PDF.js para extração de texto de documentos PDF</li>
        </ul>
      </section>

      <section>
        <h2>Benefícios</h2>
        <ul>
          <li>Economize tempo na criação de mapas mentais</li>
          <li>Melhore a compreensão de textos complexos</li>
          <li>Visualize as relações entre conceitos</li>
          <li>Compartilhe conhecimento de forma visual e eficiente</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sobre-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.sobre-content {
  margin: 0 auto;
}

h1 {
  color: #41b883;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin: 2rem 0 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

p,
li {
  color: #555;
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

ul,
ol {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

section {
  margin-bottom: 2.5rem;
}
</style>
