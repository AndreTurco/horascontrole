const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Configurações do Git e PWA
const gitInfo = {
    username: 'AndreTurco',
    repo: 'horascontrole'
};
const pwaUrl = `https://${gitInfo.username.toLowerCase()}.github.io/${gitInfo.repo.toLowerCase()}/public/`;
const hostNameOnly = 'andreturco.github.io';
const iconUrl = `https://raw.githubusercontent.com/${gitInfo.username}/${gitInfo.repo}/main/public/clock-512.png`;
const webManifestUrl = `${pwaUrl}manifest.json`;

async function compileApk(mode) {
    const isPrefilled = (mode === 'user');
    const label = isPrefilled ? 'PREENCHIDO (Premium)' : 'LIMPO (Distribuição)';
    const filename = isPrefilled ? 'Controle_de_Horas_Premium.apk' : 'Controle_de_Horas_Limpo.apk';
    const apkDestPath = path.join(__dirname, filename);
    const zipPath = path.join(__dirname, `temp_${mode}.zip`);
    const extractPath = path.join(__dirname, `temp_decompressed_${mode}`);

    console.log(`\n===================================================`);
    console.log(`[APK] COMPILANDO VERSÃO: ${label}`);
    console.log(`[APK] URL de Início: ${pwaUrl}index.html?mode=${mode}`);
    console.log(`[APK] Destino: ${apkDestPath}`);
    console.log(`===================================================`);

    // Limpar arquivos temporários antigos se existirem
    try { fs.unlinkSync(zipPath); } catch (e) {}
    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}
    try { fs.unlinkSync(apkDestPath); } catch (e) {}

    const postData = JSON.stringify({
        appVersion: "1.0.0.0",
        appVersionCode: 1,
        backgroundColor: "#0b0f19",
        display: "standalone",
        enableNotifications: true,
        enableSiteSettingsShortcut: true,
        fallbackType: "customtabs",
        features: {
            locationDelegation: { enabled: true },
            playBilling: { enabled: false }
        },
        host: hostNameOnly,
        iconUrl: iconUrl,
        includeSourceCode: false,
        isChromeOSOnly: false,
        isMetaQuest: false,
        launcherName: isPrefilled ? "Controle Pessoal" : "Controle de Horas",
        maskableIconUrl: "",
        monochromeIconUrl: "",
        name: isPrefilled ? "Controle de Horas Premium" : "Controle de Horas",
        navigationColor: "#0b0f19",
        navigationColorDark: "#0b0f19",
        navigationDividerColor: "#0b0f19",
        navigationDividerColorDark: "#0b0f19",
        orientation: "portrait",
        packageId: isPrefilled ? "com.andreturco.horascontrole.premium" : "com.andreturco.horascontrole",
        shortcuts: [],
        signing: {
            file: null,
            alias: "my-key-alias",
            fullName: "Controle de Horas Admin",
            organization: "PWABuilder",
            organizationalUnit: "Engineering",
            countryCode: "US",
            keyPassword: "",
            storePassword: ""
        },
        signingMode: "new",
        splashScreenFadeOutDuration: 300,
        startUrl: `/${gitInfo.repo.toLowerCase()}/public/index.html?mode=${mode}`,
        themeColor: "#0b0f19",
        themeColorDark: "#0b0f19",
        webManifestUrl: webManifestUrl,
        pwaUrl: pwaUrl,
        fullScopeUrl: pwaUrl,
        minSdkVersion: 23
    });

    return new Promise((resolve, reject) => {
        const url = 'https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage';
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'platform-identifier': 'PWABuilder',
                'platform-identifier-version': '1.0.0',
                'correlation-id': `controle-horas-${mode}-id`
            },
            timeout: 120000 // 2 minutos de timeout
        };

        console.log(`[APK] Enviando requisição para o compilador do PWABuilder...`);
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let errData = '';
                res.on('data', chunk => errData += chunk);
                res.on('end', () => {
                    reject(new Error(`PWABuilder API retornou status ${res.statusCode}: ${errData}`));
                });
                return;
            }

            const fileStream = fs.createWriteStream(zipPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`[APK] Pacote ZIP baixado com sucesso! Extraindo...`);

                // Certificar que a pasta .well-known existe
                fs.mkdirSync(path.join(__dirname, 'public', '.well-known'), { recursive: true });

                // Comando PowerShell para expandir o ZIP, extrair o .apk final e o assetlinks.json
                const psCommand = `powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${extractPath}'; Get-ChildItem -Path '${extractPath}' -Filter '*.apk' -Recurse | Select-Object -First 1 | Move-Item -Destination '${apkDestPath}' -Force; Get-ChildItem -Path '${extractPath}' -Filter 'assetlinks.json' -Recurse | Select-Object -First 1 | Copy-Item -Destination '${path.join(__dirname, 'public', '.well-known', 'assetlinks.json')}' -Force"`;

                exec(psCommand, (error, stdout, stderr) => {
                    // Limpeza de arquivos temporários
                    try { fs.unlinkSync(zipPath); } catch (e) {}
                    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}

                    if (error) {
                        return reject(new Error(`Erro ao extrair ou mover o arquivo APK: ${stderr || error.message}`));
                    }

                    console.log(`[APK] Concluído! APK salvo em: ${apkDestPath}`);
                    resolve();
                });
            });

            fileStream.on('error', (err) => {
                reject(err);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout de conexão com o servidor do PWABuilder (120s)'));
        });

        req.write(postData);
        req.end();
    });
}

// Execução sequencial para evitar sobrecarga
async function main() {
    try {
        console.log('Iniciando script de compilação dos APKs do Controle de Horas...');
        
        // 1. Compilar versão pré-preenchida (Premium)
        await compileApk('user');
        
        // 2. Compilar versão limpa (para salvar no Drive e distribuir)
        await compileApk('clean');

        console.log('\n===================================================');
        console.log('🎉 SUCESSO! Ambos os APKs foram compilados e baixados.');
        console.log(`   1. Versão Premium: Controle_de_Horas_Premium.apk`);
        console.log(`   2. Versão Limpa: Controle_de_Horas_Limpo.apk`);
        console.log('===================================================');
    } catch (err) {
        console.error('\n❌ OCORREU UM ERRO DURANTE A COMPILAÇÃO:', err.message);
        process.exit(1);
    }
}

main();
