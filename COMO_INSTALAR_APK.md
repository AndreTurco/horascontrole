# Guia de Instalação e Configuração do Aplicativo Android (APK) 📱

Este guia prático explica como instalar e configurar o aplicativo **Controle de Horas Premium** (versão 2026) no seu celular Android a partir dos arquivos compilados.

O aplicativo agora funciona no modelo **Offline-First**: todos os seus registros de ponto, despesas e investimentos são salvos instantaneamente no banco de dados local do seu aparelho (`IndexedDB`) e sincronizados de forma automática com o seu **Google Drive** quando houver conexão com a internet.

---

## 📱 Como Instalar o Aplicativo no Celular?

Já geramos e compilamos os dois pacotes oficiais de instalação para você. Eles estão localizados na raiz da pasta do seu projeto:

1. **Versão Premium (Pré-preenchida):** [Controle_de_Horas_Premium.apk](Controle_de_Horas_Premium.apk)
   - *Uso pessoal:* Inicializa automaticamente importando todas as 365 linhas de ponto e dados financeiros do seu Excel base preenchido.
2. **Versão Limpa (Distribuição):** [Controle_de_Horas_Limpo.apk](Controle_de_Horas_Limpo.apk)
   - *Distribuição:* Inicializa zerado e exibe o assistente de Boas-vindas para configuração do zero.

### Passo a Passo de Instalação:
1. Envie o arquivo `.apk` desejado para o seu celular (por WhatsApp, Telegram, e-mail ou cabo USB).
2. No celular, clique sobre o arquivo `.apk` recebido.
3. O Android exibirá um aviso de segurança sobre "instalação de fontes desconhecidas" (uma mensagem padrão para aplicativos instalados fora da Google Play Store).
4. Clique em **Configurações**, conceda a permissão para o seu gerenciador de arquivos/navegador instalar o app e conclua a instalação.
5. O aplicativo estará disponível na tela inicial com o ícone oficial.

---

## 🌐 Como Configurar a Sincronização com o Google Drive?

Para garantir que você nunca perca seus dados, o aplicativo possui sincronização contínua com sua conta pessoal do Google Drive. 

Se ao clicar em "Conectar ao Google Drive" você receber a mensagem de erro *"OAuth client was not found"*, isso significa que você precisa cadastrar o seu próprio identificador (Client ID) no painel do Google. É um processo gratuito e rápido:

### Criando seu Google Client ID:
1. Acesse o site do **[Google Cloud Console](https://console.cloud.google.com/)** com a sua conta Google.
2. Crie um novo projeto (ex: *“Controle de Horas”*).
3. No menu lateral esquerdo, vá em **Tela de consentimento OAuth**:
   - Escolha o tipo de usuário **Externo**.
   - Preencha o nome do aplicativo (ex: *“Controle Pessoal”*) e seu e-mail de suporte.
   - Salve e, na tela seguinte, clique em **Publicar Aplicativo** (para liberá-lo para produção).
4. Vá em **Credenciais** no menu lateral:
   - Clique em **+ Criar Credenciais** no topo e selecione **ID do cliente OAuth**.
   - Escolha o Tipo de Aplicativo: **Aplicativo da Web**.
   - No campo **Origens JavaScript autorizadas**, adicione a URL de hospedagem do seu sistema: `https://andreturco.github.io`.
   - Clique em **Criar**.
5. Copie o **ID do Cliente** gerado (um texto longo terminando em `.apps.googleusercontent.com`).
6. Abra a aba **Ajustes** no aplicativo -> abra a seção **Configuração e Tutorial do Google Drive** -> cole o ID no campo **Google Client ID Personalizado** e clique em **Salvar ID**.

Pronto! Agora clique em **Conectar ao Google Drive** para fazer o login seguro. O aplicativo criará uma pasta oculta privada chamada `Controle_de_Horas_Backup` no seu Drive e salvará o arquivo Excel (`Controle_de_Horas_Trabalho.xlsx`) e o JSON de backup de forma 100% segura e automática!

---

## 📺 Como Ocultar a Barra de Endereço (Modo Tela Cheia)

Para que o celular oculte a barra de endereço superior do navegador Chrome (fazendo o app rodar exatamente como um nativo), você precisa validar a relação de confiança entre a chave do app e o seu site.

Nós já geramos o arquivo necessário para isso. Ele está localizado em:
`public/.well-known/assetlinks.json`

### O que fazer:
1. Acesse o seu repositório pessoal principal no GitHub (aquele com o nome **`andreturco.github.io`**).
2. Crie ou envie a pasta chamada **`.well-known`** para a raiz desse repositório.
3. Salve o arquivo `assetlinks.json` dentro dessa pasta `.well-known`.
4. Verifique se a URL `https://andreturco.github.io/.well-known/assetlinks.json` está respondendo no seu navegador com o código JSON.
5. Pronto! O Android Chrome lerá este arquivo silenciosamente e removerá a barra superior do aplicativo na próxima inicialização.
