# Walkthrough: Sincronização Dinâmica e Universal Sem Git (Zero-Git)

Este documento detalha o que foi implementado para remover toda a dependência do Git/GitHub no pareamento automático celular-PC, permitindo que qualquer pessoa (como seu amigo) execute o sistema instantaneamente e pareie o celular sem precisar configurar repositórios.

---

## 🛠️ O que foi feito?

### 1. Registro Automático do Servidor na Nuvem (ExtendsClass REST API)
* **`server.js`**:
  * Ao iniciar o servidor, ele verifica a existência do arquivo local [config_registro.json](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/config_registro.json).
  * Caso o arquivo não exista, o servidor faz um registro automático e gratuito criando um JSON bin no serviço em nuvem **ExtendsClass**, recebendo um ID único de Registro (ex: `aacbafb`).
  * Toda vez que o túnel SSH do PC é iniciado ou redefinido, o servidor envia a nova URL ativa à nuvem (através do endpoint `https://extendsclass.com/api/json-storage/bin/{binId}`) via requisição HTTP `PUT`.
  * **Auto-Recuperação (Self-Healing)**: Se o registro na nuvem expirar por inatividade prolongada (retornando erro 404), o servidor automaticamente exclui o arquivo corrompido, gera um novo ID na nuvem e atualiza a interface.

### 2. Tela de Boas-Vindas e Pareamento no Celular (Setup Overlay)
* **`public/index.html`** & **`public/app.js`**:
  * Se o celular acessar o aplicativo externamente (via nuvem ou PWA) e não possuir um ID de Servidor pareado localmente, uma tela de boas-vindas premium e moderna (radial-gradient escuro, backdrop-filter de desfoque, ícones e inputs estilizados) é exibida.
  * O usuário pode digitar o **ID de Registro** do PC (ex: `aacbafb`) e o **PIN de Acesso** de 6 dígitos diretamente nesta tela para realizar o pareamento manual imediato.
  * **Pareamento por 1 Clique (QR Code)**: Se o usuário escanear o QR Code de Acesso Remoto exibido na tela do PC, a URL já inclui os parâmetros `?sid={ID}&pin={PIN}`. O app móvel detecta esses parâmetros, salva no celular automaticamente, limpa a barra de endereços (para manter o link limpo) e fecha o overlay de configuração sem exigir nenhuma digitação!

### 3. Exibição do ID de Registro no Computador
* **`public/index.html`** & **`public/app.js`**:
  * Atualizamos a caixa de informações de segurança no painel do PC para exibir de forma centralizada tanto o **ID de Registro** quanto o **PIN de Acesso** sob a aba *"Conectar Celular / Acesso Externo"*.
  * As informações só são expostas se o acesso for local (rodando no próprio computador), garantindo total privacidade contra olhares curiosos na internet.

### 4. Empacotamento Limpo Automatizado
* **`scratch/build_clean_zip.js`**:
  * Atualizamos o script para excluir de forma automática os arquivos locais de configuração e chaves (`config_registro.json` e `senha_acesso.txt`) antes de gerar o pacote final.
  * Isso assegura que o arquivo compactado gerado para o seu amigo esteja completamente limpo e pronto para registrar um ID de nuvem exclusivo para ele no primeiro início.

---

## 🚀 Como rodar o sistema (Manual de Instruções)

Você e seu amigo podem executar o aplicativo de três formas diferentes:

### 1. Versão Integrada de Desktop (Electron)
*Este é o modo ideal para uso pessoal no computador, rodando com janela própria estilizada e integração com a barra de tarefas do Windows.*
1. Dê dois cliques no arquivo **[iniciar_app.bat](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/iniciar_app.bat)**.
2. O script fecha qualquer processo travado em segundo plano e abre a janela do aplicativo Controle Premium.
3. Ao fechar a janela no botão "X", o sistema continuará rodando de forma invisível na barra de tarefas (perto do relógio) para manter o celular sincronizado.
4. Para fechar o programa totalmente, clique com o botão direito no ícone do relógio do Windows e selecione **"Sair Completamente"**.

### 2. Versão Navegador Web (Sem Janela Electron)
*Ideal se você preferir rodar o painel direto no Chrome/Edge ou em computadores com pouca memória RAM.*
1. Dê dois cliques no arquivo **[iniciar_servidor.bat](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/iniciar_servidor.bat)** (ou **[enviar_para_amigo.bat](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/enviar_para_amigo.bat)** para computadores novos).
2. O script inicia o servidor em background na porta 3080 e abre seu navegador padrão no link: **`http://localhost:3080`**.

### 3. Versão Mobile (Sincronização no Celular)
*Para bater o ponto e ver o painel financeiro fora de casa.*
1. **Primeira Conexão (Pareamento)**:
   * **Método 1 (Recomendado)**: Abra a câmera do seu celular e escaneie o **QR Code de Acesso Remoto** exibido no painel de ajustes do seu computador. O celular carregará a interface e sincronizará na hora.
   * **Método 2**: Abra o aplicativo no celular. Na tela de boas-vindas que surgir, digite o **ID de Registro** e o **PIN** exibidos na tela do seu computador.
2. **Uso nos dias seguintes**:
   * O celular salva as credenciais de forma definitiva no armazenamento interno. Você pode fechar o aplicativo no celular e reiniciar o computador quando quiser.
   * Assim que você abrir o programa no PC e iniciar o app no celular, a sincronização será restabelecida automaticamente em qualquer rede (Wi-Fi ou 4G)!
