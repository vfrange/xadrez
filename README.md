# Xadrez com Carinho

Curso completo de xadrez em 20 aulas, pensado para ensinar do zero, com calma e visualmente. Do tabuleiro ao xeque-mate técnico de Rei + Torre.

Construído com React, Vite e Framer Motion.

## Como publicar no GitHub Pages (passo a passo)

### 1. Criar o repositório no GitHub

1. Vá em <https://github.com/new>
2. Dê um nome ao repositório (ex: `xadrez-com-carinho`)
3. Marque como **Public**
4. **NÃO** marque "Add a README" (já temos)
5. Clique em "Create repository"

### 2. Subir os arquivos

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Primeira versão do curso de xadrez"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

Substitua `SEU-USUARIO/SEU-REPO` pelos seus dados reais.

### 3. Ajustar o nome do repositório no Vite

Abra `vite.config.js` e mude a linha `base:` para o nome EXATO do seu repositório:

```js
base: "/xadrez-com-carinho/", // ← coloque aqui o nome do seu repo
```

Se você nomeou o repo de outra forma, ajuste — por exemplo `base: "/curso-xadrez/"`.

Faça commit dessa mudança:

```bash
git add vite.config.js
git commit -m "Ajusta base path do Vite"
git push
```

### 4. Ativar o GitHub Pages

1. Vá ao seu repositório no GitHub
2. Aba **Settings** → seção **Pages** (no menu lateral)
3. Em **"Build and deployment"** → **Source**: escolha **"GitHub Actions"**
4. Pronto. O workflow já está configurado em `.github/workflows/deploy.yml`

### 5. Esperar o deploy

A cada `git push` para a branch `main`, o GitHub vai automaticamente:

1. Instalar dependências
2. Buildar o projeto com Vite
3. Publicar em `https://SEU-USUARIO.github.io/SEU-REPO/`

Você pode acompanhar o progresso na aba **Actions** do GitHub. Demora cerca de 2 minutos na primeira vez.

## Rodar localmente (opcional)

Se quiser testar antes de publicar:

```bash
npm install
npm run dev
```

Abre em <http://localhost:5173>.

## Estrutura

```
xadrez-com-carinho/
├── index.html              # Entry point HTML
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração do Vite (ajuste o base path!)
├── src/
│   ├── main.jsx            # Bootstrap React
│   └── App.jsx             # Todo o código do curso (2.500 linhas)
└── .github/workflows/
    └── deploy.yml          # Auto-deploy ao GitHub Pages
```

## Tecnologia

- **React 18** — UI
- **Vite** — build tool moderna e rápida
- **Framer Motion** — animações suaves de peças e transições
- **Lucide Icons** — ícones limpos
- **Web Speech API** — síntese de voz em pt-BR (nativo do navegador)

## Compatibilidade

Funciona em Chrome, Edge, Safari e Firefox modernos. A síntese de voz funciona melhor no Chrome/Edge no desktop e no Safari no iPhone.

---

Feito com carinho — para a melhor mãe do mundo. ♟️
