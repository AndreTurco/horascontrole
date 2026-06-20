const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec, execSync } = require('child_process');

console.log('===================================================');
console.log('🔄 Sincronizando dados da planilha local para o PWA...');
try {
    execSync('python scratch/sync_excel_to_base64.py', { stdio: 'inherit' });
} catch (e) {
    console.warn('⚠️ Falha ao sincronizar Excel:', e.message);
}
console.log('===================================================');

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
    const filename = isPrefilled ? 'Controle_de_Horas_Premium_v44.apk' : 'Controle_de_Horas_Limpo_v44.apk';
    const packageId = isPrefilled ? "com.andreturco.horascontrole.premium" : "com.andreturco.horascontrole";
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
        appVersion: "1.44.0.0",
        appVersionCode: 44,
        backgroundColor: "#0b0f19",
        display: "fullscreen",
        enableNotifications: true,
        enableSiteSettingsShortcut: true,
        fallbackType: "webview",
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
        packageId: packageId,
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
            timeout: 300000 // 5 minutos de timeout
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

                // Comando PowerShell para expandir o ZIP
                const psCommand = `powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${extractPath}'"`;

                exec(psCommand, (error, stdout, stderr) => {
                    if (error) {
                        // Limpeza
                        try { fs.unlinkSync(zipPath); } catch (e) {}
                        try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}
                        return reject(new Error(`Erro ao expandir o arquivo ZIP: ${stderr || error.message}`));
                    }

                    console.log(`[APK] ZIP extraído. Procurando arquivos...`);

                    // Função recursiva para encontrar arquivos
                    function findFileRecursive(dir, filterFn) {
                        const files = fs.readdirSync(dir);
                        for (const file of files) {
                            const filePath = path.join(dir, file);
                            const stat = fs.statSync(filePath);
                            if (stat.isDirectory()) {
                                const found = findFileRecursive(filePath, filterFn);
                                if (found) return found;
                            } else if (filterFn(file)) {
                                return filePath;
                            }
                        }
                        return null;
                    }

                    try {
                        // 1. Procurar o arquivo .apk
                        const apkFile = findFileRecursive(extractPath, (name) => name.endsWith('.apk'));
                        if (!apkFile) {
                            throw new Error('Nenhum arquivo .apk encontrado no pacote ZIP compilado.');
                        }
                        console.log(`[APK] APK encontrado: ${apkFile}. Copiando para ${apkDestPath}...`);
                        fs.copyFileSync(apkFile, apkDestPath);

                        // 2. Extrair e mesclar assinatura SHA256 no assetlinks.json
                        const assetlinksFile = findFileRecursive(extractPath, (name) => name === 'assetlinks.json');
                        let sha256 = null;
                        if (assetlinksFile) {
                            try {
                                const content = fs.readFileSync(assetlinksFile, 'utf8');
                                const parsed = JSON.parse(content);
                                if (parsed && parsed[0] && parsed[0].target && parsed[0].target.sha256_cert_fingerprints) {
                                    sha256 = parsed[0].target.sha256_cert_fingerprints[0];
                                }
                            } catch (e) {
                                console.warn('[APK] Erro ao ler assetlinks.json extraído:', e.message);
                            }
                        }

                        if (!sha256) {
                            const keyInfoFile = findFileRecursive(extractPath, (name) => name === 'signing-key-info.txt');
                            if (keyInfoFile) {
                                const keyInfoContent = fs.readFileSync(keyInfoFile, 'utf8');
                                const shaLine = keyInfoContent.split('\n').find(line => line.includes('SHA256') || line.includes('SHA-256'));
                                if (shaLine) {
                                    const shaMatch = shaLine.match(/([0-9A-Fa-f]{2}[:-]){31}[0-9A-Fa-f]{2}/) || shaLine.match(/([0-9A-Fa-f]{64})/);
                                    if (shaMatch) {
                                        sha256 = shaMatch[0].toUpperCase().trim();
                                    }
                                }
                            }
                        }

                        if (sha256) {
                            const destAssetlinks = path.join(__dirname, 'public', '.well-known', 'assetlinks.json');
                            let currentList = [];
                            if (fs.existsSync(destAssetlinks)) {
                                try {
                                    currentList = JSON.parse(fs.readFileSync(destAssetlinks, 'utf8'));
                                } catch (e) {
                                    console.warn('[APK] Erro ao ler assetlinks.json existente, recriando:', e.message);
                                }
                            }
                            if (!Array.isArray(currentList)) currentList = [];

                            // Filtrar para remover entrada antiga com o mesmo packageId
                            currentList = currentList.filter(item => {
                                return !(item && item.target && item.target.package_name === packageId);
                            });

                            // Adicionar nova entrada
                            currentList.push({
                                relation: ["delegate_permission/common.handle_all_urls"],
                                target: {
                                    namespace: "android_app",
                                    package_name: packageId,
                                    sha256_cert_fingerprints: [sha256]
                                }
                            });

                            fs.writeFileSync(destAssetlinks, JSON.stringify(currentList, null, 2));
                            console.log(`[APK] assetlinks.json atualizado com sucesso para ${packageId}! SHA256: ${sha256}`);
                        } else {
                            console.warn('[APK] Não foi possível extrair a assinatura SHA256 para o assetlinks.json.');
                        }

                        console.log(`[APK] Concluído com sucesso para: ${filename}`);
                        
                        // Limpeza
                        try { fs.unlinkSync(zipPath); } catch (e) {}
                        try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}
                        resolve();

                    } catch (err) {
                        // Limpeza
                        try { fs.unlinkSync(zipPath); } catch (e) {}
                        try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}
                        reject(err);
                    }
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
        console.log(`   1. Versão Premium: Controle_de_Horas_Premium_v44.apk`);
        console.log(`   2. Versão Limpa: Controle_de_Horas_Limpo_v44.apk`);
        console.log('===================================================');
    } catch (err) {
        console.error('\n❌ OCORREU UM ERRO DURANTE A COMPILAÇÃO:', err.message);
        process.exit(1);
    }
}

main();
