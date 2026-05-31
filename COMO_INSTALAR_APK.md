# Guia de Instalação e Criação do Aplicativo Android (APK) 📱

Este guia prático explica o passo a passo completo para transformar o seu sistema premium de **Controle de Horas** em um aplicativo nativo para celular Android (APK), funcionando em tempo real com a sua planilha do **Excel no OneDrive**!

---

## 💡 Como o Aplicativo Funciona no Celular?

Para que você consiga visualizar, registrar pontos e editar os dados no seu celular de qualquer lugar do mundo (e salvar de forma 100% segura na sua planilha Excel), o aplicativo precisa se comunicar com o servidor que lê e grava na planilha.

Existem duas maneiras excelentes de usar o aplicativo no celular de forma gratuita:

---

### Opção 1: Atalho PWA (Recomendado - 1 Segundo) ⚡
Como o seu aplicativo já possui toda a configuração de **PWA (Progressive Web App)** integrada e otimizada por nós, você não precisa compilar nada para ter a sensação de um aplicativo nativo!

1. Abra o navegador do celular (Chrome ou Firefox).
2. Acesse o endereço público do seu sistema (gerado ao iniciar o túnel no seu notebook, ex: `https://seu-subdominio.serveo.net`).
3. O navegador exibirá um pop-up na parte inferior: **"Adicionar Controle de Horas à tela inicial"**.
4. Se o pop-up não aparecer, clique nos **três pontinhos** do navegador no canto superior direito e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
5. **Pronto!** Um ícone premium do aplicativo será criado na tela inicial do seu celular. Ao clicar nele, o app abrirá em tela cheia, sem barras de navegação do browser, comportando-se exatamente como um aplicativo nativo!

---

### Opção 2: Gerar um APK Nativo Gratuito (Via PWABuilder) 🛠️
Se você prefere gerar um arquivo `.apk` de instalação para enviar para amigos ou instalar diretamente no celular, utilizaremos a ferramenta oficial e gratuita da Microsoft: **PWABuilder**.

#### Passo 1: Iniciar o Servidor e obter o Link Público
1. No seu notebook, abra o arquivo `iniciar_servidor.bat` para iniciar o sistema.
2. Em seguida, abra o arquivo `iniciar_tunnel_alternativo.bat`. Ele gerará um endereço de internet seguro (URL pública do Serveo) que aponta para o seu notebook (exemplo: `https://controle-horas.serveo.net` ou um link aleatório temporário).
3. Copie esse link gerado no terminal.

#### Passo 2: Gerar o APK no site PWABuilder
1. No computador, acesse o site: [**PWABuilder.com**](https://www.pwabuilder.com/)
2. No campo de texto central, cole a URL pública gerada pelo seu túnel (ou a URL de onde seu servidor estiver hospedado) e clique em **"Start"**.
3. O PWABuilder analisará o seu sistema automaticamente. Como já criamos e configuramos perfeitamente o arquivo [manifest.json](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/public/manifest.json) e o [sw.js](file:///c:/Users/aline/OneDrive/Documentos/Projetos/controle%20de%20Horas/public/sw.js) no seu projeto, o site dará uma nota máxima de compatibilidade!
4. Clique no botão azul **"Build My PWA"** no canto superior direito.
5. Na aba **Android**, clique em **"Download Package"** (Baixar Pacote).
6. Um arquivo `.zip` será baixado no seu computador.

#### Passo 3: Instalar o APK no Celular
1. Extraia o arquivo `.zip` baixado.
2. Dentro da pasta extraída, localize o arquivo final com extensão `.apk` (normalmente nomeado como `app-release-unsigned.apk` ou similar).
3. Transfira esse arquivo `.apk` para o seu celular (enviando pelo WhatsApp, e-mail ou via cabo USB).
4. No celular, toque no arquivo `.apk` para instalar.
   * *Nota: O Android solicitará permissão para "Instalar aplicativos de fontes desconhecidas" (uma proteção padrão para aplicativos instalados fora da Google Play Store). Basta conceder a permissão e concluir a instalação.*
5. **Pronto!** O seu aplicativo nativo estará instalado na gaveta de aplicativos do seu celular Android com o ícone e nome oficiais!

---

## 🛠️ Resolvido: Correção de Erros de Edição de Dados!

Detectamos e corrigimos por que a edição às vezes falhava de forma silenciosa ou dava erro:

1. **Planilha Aberta no Computador (Bloqueio de Escrita)**:
   * **O Problema**: O Excel do Windows bloqueia arquivos que estão abertos no Microsoft Excel. Se você tentasse editar os dados no celular ou no navegador enquanto a planilha estava aberta no seu notebook, o Node.js não conseguia salvar as alterações, dando erro.
   * **A Solução**: Atualizamos todo o sistema e agora, se a planilha estiver aberta no computador ou sendo sincronizada pelo OneDrive no momento da gravação, o aplicativo exibirá um aviso amigável na tela do seu celular explicando exatamente o que aconteceu: *"A planilha Excel está aberta no Microsoft Excel ou sendo sincronizada pelo OneDrive. Por favor, feche o Excel no computador e tente salvar novamente!"*.
2. **Clique Total nas Listas**:
   * **Melhoria**: Agora, em todas as abas de histórico (tanto na de **Pontos** quanto na de **Deslocamentos/Trajetos**), toda a linha e qualquer célula que você clicar abrirá automaticamente o formulário para edição. Isso torna o uso no celular extremamente fácil de manusear com o polegar!
   * **Investimentos e Finanças**: Adicionamos o mesmo recurso no extrato de investimentos e transações financeiras: basta clicar sobre o card da transação para preenchê-la no formulário superior e editá-la rapidamente!

---

### 🚀 Dica de Ouro: Hospedagem 100% Online e Independente (Grátis)
Se você não deseja manter o seu notebook ligado para usar o aplicativo no celular, você pode hospedar o código deste projeto gratuitamente em serviços de nuvem como o [**Render.com**](https://render.com/) ou [**Glitch.com**](https://glitch.com/).
Dessa forma, o seu aplicativo estará online 24h por dia, e qualquer alteração feita no celular salvará instantaneamente na sua planilha do OneDrive de forma totalmente autônoma!
