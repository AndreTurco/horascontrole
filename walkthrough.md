# Walkthrough: Conexão Permanente Celular-PC e Otimização do Aplicativo

Este documento detalha o que foi feito para garantir que o seu aplicativo de celular permaneça conectado ao servidor do PC sem exigir reconfigurações diárias, além de melhorar o comportamento do aplicativo de desktop (Electron) no Windows.

---

## 🛠️ O que foi feito?

### 1. Suporte a Subpastas PWA no GitHub Pages
- **`public/sw.js`**: Alterado a lista de arquivos cacheados (`ASSETS`) de caminhos absolutos (como `/index.html`) para relativos (`index.html`). Isso evita erros 404 ao hospedar o app em subpastas.
- **`public/manifest.json`**: Atualizado a propriedade `start_url` para `./index.html` e tornado os caminhos dos ícones relativos (`clock-192.png`, `clock-512.png`), proporcionando portabilidade total.
- **`public/app.js`**: Atualizado o registro do Service Worker para carregar `'sw.js'` usando caminho relativo.

### 2. Reconexão e Autoresolução de Endereço em Tempo Real
- **`public/app.js` (setupRealtimeUpdates)**:
  - Modificado o loop de reconexão do Server-Sent Events (SSE). Toda vez que o aplicativo perde a conexão com o PC (ex: PC desligado, rede desconectada), ele aguarda 5 segundos, busca a URL ativa atualizada a partir do repositório público do GitHub do usuário via `resolveActiveTunnelUrl()`, e tenta reconectar à nova URL.
  - Ao estabelecer ou restabelecer a conexão com sucesso, o aplicativo executa um `fetchData()` e `fetchNetworkInfo()` imediato para sincronizar o celular com quaisquer alterações feitas offline ou no computador.

### 3. Notificação do Sistema ao Minimizar para a Tray (Windows)
- **`main.js`**:
  - Implementado um balão de notificação nativa do Windows (`tray.displayBalloon`) na primeira vez que o painel do aplicativo é minimizado na bandeja do sistema ao fechar ("X").
  - A notificação avisa claramente: *"O sistema continua ativo em segundo plano na barra de tarefas (próximo ao relógio) para manter a sincronização com o celular."*

### 4. Configuração Estática Permanente para o APK
- **`server.js`**:
  - Criada a função `parseGitOrigin()` para ler o remote origin do git do usuário no computador e `getGitHubPagesUrl()` para construir dinamicamente o link do GitHub Pages.
  - Atualizado o gerador do PWABuilder para usar o endereço fixo do GitHub Pages (ex: `https://andreturco.github.io/horascontrole/public/`) como a URL de origem do APK. Isso torna o APK permanente; o usuário só precisa instalá-lo uma única vez.
  - Otimizado a inicialização: se o arquivo `controle-horas.apk` já existir localmente na pasta, o servidor ignora a compilação na nuvem do PWABuilder (evitando esperas e limites de taxa), servindo o APK local a partir da URL do túnel ativa. Para forçar uma nova compilação, basta apagar o arquivo `.apk` local.

### 5. Sistema de PIN de Acesso Seguro (Privacidade Total)
- **`server.js`**:
  - Implementada a função `getAccessPin()` que gera um PIN de 6 dígitos aleatório único no primeiro início e o grava em `senha_acesso.txt`.
  - Adicionado um middleware para todas as rotas `/api/*`. Se a requisição vier de um celular (via internet ou rede local), o servidor exige um cabeçalho `x-access-pin` correspondente ao PIN correto.
  - A rota `/api/network-info` foi ajustada para retornar o PIN apenas se a requisição for feita de forma local no PC (segurança total: o PIN nunca é exposto na internet e só pode ser visto na tela física do computador).
- **`public/index.html`**:
  - Adicionado um painel visual destacado exibindo o PIN de acesso (exibido apenas no computador).
- **`public/app.js`**:
  - Adicionado um interceptador global de requisições `fetch` que injeta o cabeçalho de autenticação `x-access-pin` a partir do `localStorage` e escuta por retornos `401` (Não Autorizado).
  - Se um celular tentar conectar e não tiver o PIN (ou se o PIN estiver errado), o app exibe um popup premium solicitando a senha. Uma vez digitado corretamente, ele é memorizado no celular e não precisa mais ser inserido.

### 6. Sincronização Automática do Túnel no Executável Empacotado (Electron)
- **`.gitignore`**: Removido o `tunnel_url.json` das regras de ignorados para permitir que o Git rastreie e publique as alterações deste arquivo no repositório.
- **`server.js` (findGitRoot / pushTunnelUrlToGit)**:
  - Implementada a busca dinâmica da raiz do repositório Git subindo a árvore de diretórios a partir do executável.
  - Ao iniciar o servidor empacotado, ele gera o arquivo `tunnel_url.json` na subpasta `dist/...`, copia o arquivo para a raiz do repositório Git e realiza o comando de `git push` a partir da raiz. Isso resolve a falha em que o celular ficava com dados zerados/desconectados por não ter acesso ao novo link gerado.

---

## 🔬 Como testar e validar?

1. **Atualizar e Iniciar o App no Computador**:
   - Certifique-se de fechar completamente qualquer instância do programa rodando em segundo plano (próximo ao relógio do Windows).
   - Inicie o sistema no computador clicando em `iniciar_servidor.bat` (para baixar as últimas atualizações do Git) ou execute a versão atualizada empacotada por `iniciar_app.bat`.
   - Assim que o aplicativo abrir e o túnel for estabelecido, ele atualizará o `tunnel_url.json` na raiz do projeto e enviará automaticamente ao GitHub.
2. **Sincronização no Celular**:
   - Abra o aplicativo no celular. Ele buscará o novo link do túnel que o computador acabou de enviar ao GitHub.
   - Os dados deixarão de estar zerados e passarão a exibir exatamente as mesmas informações ativas no PC em tempo real.
   - Qualquer batida de ponto ou edição feita no celular será transmitida diretamente para o computador e salva na planilha Excel local.

