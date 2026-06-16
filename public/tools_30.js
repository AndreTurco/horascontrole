
const SUPER_TOOLS_DB = [
    {
        id: 'calc',
        category: 'utilidades',
        icon: 'fa-solid fa-calculator color-blue',
        title: 'Calculadora Premium',
        desc: 'Calculadora avançada com histórico e operações completas.',
        render: (container) => {
            container.innerHTML = `
<div class="calculator-container" style="background:#1e293b; padding:1.5rem; border-radius:12px; max-width:350px; margin:0 auto; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    <div id="calc-history" style="height:20px; font-size:0.85rem; color:#94a3b8; text-align:right; margin-bottom:5px;"></div>
    <div id="calc-display" style="background:#0f172a; padding:1rem; font-size:2.5rem; text-align:right; color:#fff; border-radius:8px; margin-bottom:1rem; overflow:hidden; text-overflow:ellipsis;">0</div>
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem;">
        <button class="calc-btn" style="background:#334155; color:#f87171;" onclick="calcAction('C')">C</button>
        <button class="calc-btn" style="background:#334155; color:#f87171;" onclick="calcAction('CE')">CE</button>
        <button class="calc-btn" style="background:#334155; color:#38bdf8;" onclick="calcAction('%')">%</button>
        <button class="calc-btn" style="background:#0ea5e9; color:#fff;" onclick="calcAction('/')">÷</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('7')">7</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('8')">8</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('9')">9</button>
        <button class="calc-btn" style="background:#0ea5e9; color:#fff;" onclick="calcAction('*')">×</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('4')">4</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('5')">5</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('6')">6</button>
        <button class="calc-btn" style="background:#0ea5e9; color:#fff;" onclick="calcAction('-')">-</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('1')">1</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('2')">2</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('3')">3</button>
        <button class="calc-btn" style="background:#0ea5e9; color:#fff;" onclick="calcAction('+')">+</button>
        <button class="calc-btn" style="background:#475569; color:#fff; grid-column:span 2;" onclick="calcAction('0')">0</button>
        <button class="calc-btn" style="background:#475569; color:#fff;" onclick="calcAction('.')">,</button>
        <button class="calc-btn" style="background:#10b981; color:#fff;" onclick="calcAction('=')">=</button>
    </div>
</div>
<style>
.calc-btn { border:none; padding:1rem; font-size:1.2rem; font-weight:bold; border-radius:8px; cursor:pointer; transition:filter 0.2s; }
.calc-btn:hover { filter:brightness(1.2); }
.calc-btn:active { transform:scale(0.95); }
</style>
`;
            
    let current = '0';
    let prev = '';
    let op = null;
    let resetOnNext = false;
    window.calcAction = (val) => {
        const display = document.getElementById('calc-display');
        const hist = document.getElementById('calc-history');
        if(val === 'C') { current = '0'; prev = ''; op = null; }
        else if(val === 'CE') { current = '0'; }
        else if(val === '=') {
            if(!op || !prev) return;
            const a = parseFloat(prev); const b = parseFloat(current);
            let res = 0;
            if(op === '+') res = a + b;
            if(op === '-') res = a - b;
            if(op === '*') res = a * b;
            if(op === '/') res = a / b;
            hist.innerText = `${prev} ${op} ${current} =`;
            current = String(res); prev = ''; op = null; resetOnNext = true;
        }
        else if(['+','-','*','/'].includes(val)) {
            if(op && !resetOnNext) { window.calcAction('='); }
            prev = current; op = val; hist.innerText = `${prev} ${op}`; resetOnNext = true;
        }
        else if(val === '%') { current = String(parseFloat(current) / 100); }
        else if(val === '.') { if(!current.includes('.')) current += '.'; }
        else {
            if(current === '0' || resetOnNext) { current = val; resetOnNext = false; }
            else { current += val; }
        }
        display.innerText = current.substring(0, 12);
    };

        }
    },
    {
        id: 'pomodoro',
        category: 'produtividade',
        icon: 'fa-solid fa-stopwatch color-red',
        title: 'Timer Pomodoro',
        desc: 'Aumente seu foco com a técnica Pomodoro (25min).',
        render: (container) => {
            container.innerHTML = `
<div style="text-align:center; padding:2rem; background:#1e293b; border-radius:12px;">
    <h2 id="pom-time" style="font-size:4rem; color:#fff; margin:0; font-family:monospace;">25:00</h2>
    <p id="pom-status" style="color:#10b981; margin-top:0;">Foco</p>
    <div style="margin-top:2rem; display:flex; gap:1rem; justify-content:center;">
        <button id="pom-start" class="btn btn-primary"><i class="fa-solid fa-play"></i> Iniciar</button>
        <button id="pom-pause" class="btn btn-secondary"><i class="fa-solid fa-pause"></i> Pausar</button>
        <button id="pom-reset" class="btn btn-danger" style="background:#ef4444;"><i class="fa-solid fa-rotate-right"></i> Reset</button>
    </div>
</div>
`;
            
    let timeLeft = 25 * 60;
    let timerId = null;
    const timeEl = document.getElementById('pom-time');
    const updateTime = () => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timeEl.innerText = `${m}:${s}`;
    };
    document.getElementById('pom-start').onclick = () => {
        if(!timerId) timerId = setInterval(() => {
            if(timeLeft > 0) { timeLeft--; updateTime(); }
            else { clearInterval(timerId); alert('Tempo finalizado!'); }
        }, 1000);
    };
    document.getElementById('pom-pause').onclick = () => { clearInterval(timerId); timerId = null; };
    document.getElementById('pom-reset').onclick = () => { clearInterval(timerId); timerId = null; timeLeft = 25*60; updateTime(); };

        }
    },
    {
        id: '503020',
        category: 'financas',
        icon: 'fa-solid fa-chart-pie color-green',
        title: 'Regra 50/30/20',
        desc: 'Planejamento orçamentário ideal em segundos.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat">
    <label>Renda Mensal (R$)</label>
    <input type="number" id="f-renda" class="form-control-flat" placeholder="3000" oninput="window.calc503020()">
</div>
<div id="f-res" style="margin-top:1rem; display:none;">
    <div style="padding:1rem; background:rgba(16,185,129,0.1); border-left:4px solid #10b981; margin-bottom:0.5rem;">
        <strong>Necessidades (50%):</strong> <span id="f-50" style="color:#10b981; font-weight:bold;"></span><br>
        <small style="color:var(--text-secondary)">Moradia, contas, alimentação básica.</small>
    </div>
    <div style="padding:1rem; background:rgba(56,189,248,0.1); border-left:4px solid #38bdf8; margin-bottom:0.5rem;">
        <strong>Desejos (30%):</strong> <span id="f-30" style="color:#38bdf8; font-weight:bold;"></span><br>
        <small style="color:var(--text-secondary)">Lazer, compras, assinaturas.</small>
    </div>
    <div style="padding:1rem; background:rgba(168,85,247,0.1); border-left:4px solid #a855f7;">
        <strong>Poupança/Investimento (20%):</strong> <span id="f-20" style="color:#a855f7; font-weight:bold;"></span><br>
        <small style="color:var(--text-secondary)">Reserva de emergência, investimentos.</small>
    </div>
</div>
`;
            
    window.calc503020 = () => {
        const val = parseFloat(document.getElementById('f-renda').value);
        if(!isNaN(val) && val > 0) {
            document.getElementById('f-res').style.display = 'block';
            document.getElementById('f-50').innerText = 'R$ ' + (val * 0.5).toFixed(2);
            document.getElementById('f-30').innerText = 'R$ ' + (val * 0.3).toFixed(2);
            document.getElementById('f-20').innerText = 'R$ ' + (val * 0.2).toFixed(2);
        } else {
            document.getElementById('f-res').style.display = 'none';
        }
    };

        }
    },
    {
        id: 'passgen',
        category: 'utilidades',
        icon: 'fa-solid fa-key color-blue',
        title: 'Gerador de Senhas',
        desc: 'Crie senhas impenetráveis facilmente.',
        render: (container) => {
            container.innerHTML = `
<div style="background:#1e293b; padding:1.5rem; border-radius:12px; text-align:center;">
    <div id="pw-display" style="font-family:monospace; font-size:1.5rem; color:#10b981; padding:1rem; background:#0f172a; border-radius:8px; margin-bottom:1rem; word-break:break-all;">GerarSenha123!</div>
    <div style="display:flex; justify-content:center; gap:1rem; margin-bottom:1rem;">
        <label><input type="checkbox" id="pw-num" checked> Números</label>
        <label><input type="checkbox" id="pw-sym" checked> Símbolos</label>
        <label><input type="checkbox" id="pw-upp" checked> Maiúsculas</label>
    </div>
    <div class="form-group-flat" style="text-align:left;">
        <label>Tamanho: <span id="pw-len-lbl">16</span></label>
        <input type="range" id="pw-len" min="8" max="32" value="16" style="width:100%" oninput="document.getElementById('pw-len-lbl').innerText=this.value; window.genPw()">
    </div>
    <button class="btn btn-primary" onclick="window.genPw()" style="width:100%; margin-bottom:0.5rem;"><i class="fa-solid fa-rotate"></i> Gerar Nova Senha</button>
    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('pw-display').innerText); alert('Copiado!')" style="width:100%;"><i class="fa-solid fa-copy"></i> Copiar Senha</button>
</div>
`;
            
    window.genPw = () => {
        const len = parseInt(document.getElementById('pw-len').value);
        const useNum = document.getElementById('pw-num').checked;
        const useSym = document.getElementById('pw-sym').checked;
        const useUpp = document.getElementById('pw-upp').checked;
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let chars = lower;
        if(useUpp) chars += upper; if(useNum) chars += nums; if(useSym) chars += syms;
        let pw = '';
        for(let i=0; i<len; i++) { pw += chars.charAt(Math.floor(Math.random() * chars.length)); }
        document.getElementById('pw-display').innerText = pw;
    };
    window.genPw();

        }
    },
    {
        id: 'juros_comp',
        category: 'financas',
        icon: 'fa-solid fa-money-bill-trend-up color-green',
        title: 'Juros Compostos',
        desc: 'Simule seus rendimentos de longo prazo.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Valor Inicial (R$)</label><input type="number" id="jc-init" class="form-control-flat" value="1000"></div>
<div class="form-group-flat"><label>Aporte Mensal (R$)</label><input type="number" id="jc-month" class="form-control-flat" value="200"></div>
<div class="form-group-flat"><label>Taxa de Juros Mensal (%)</label><input type="number" id="jc-rate" class="form-control-flat" value="1.0" step="0.1"></div>
<div class="form-group-flat"><label>Tempo (Meses)</label><input type="number" id="jc-time" class="form-control-flat" value="60"></div>
<button class="btn btn-primary" onclick="window.calcJC()" style="width:100%; margin-bottom:1rem;">Calcular Retorno</button>
<div id="jc-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px;">
    <h3 style="color:#10b981; margin:0;" id="jc-total">R$ 0,00</h3><small style="color:var(--text-secondary)">Total Acumulado</small>
    <p style="margin:0.5rem 0 0 0; color:#38bdf8;" id="jc-juros"></p>
</div>
`;
            
    window.calcJC = () => {
        let p = parseFloat(document.getElementById('jc-init').value) || 0;
        let m = parseFloat(document.getElementById('jc-month').value) || 0;
        let r = parseFloat(document.getElementById('jc-rate').value) || 0;
        let t = parseInt(document.getElementById('jc-time').value) || 0;
        let rate = r / 100;
        let total = p * Math.pow(1 + rate, t);
        for(let i=1; i<=t; i++){ total += m * Math.pow(1 + rate, t - i); }
        let investido = p + (m * t);
        let juros = total - investido;
        document.getElementById('jc-res').style.display = 'block';
        document.getElementById('jc-total').innerText = 'R$ ' + total.toFixed(2).replace('.',',');
        document.getElementById('jc-juros').innerText = 'Total Investido: R$ ' + investido.toFixed(2).replace('.',',') + ' | Rendimento: R$ ' + juros.toFixed(2).replace('.',',');
    };

        }
    },
    {
        id: 'horas_extras',
        category: 'trabalho',
        icon: 'fa-solid fa-clock color-blue',
        title: 'Horas Extras',
        desc: 'Saiba exatamente quanto vale sua hora adicional.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Salário Bruto (R$)</label><input type="number" id="he-sal" class="form-control-flat" value="3000"></div>
<div class="form-group-flat"><label>Jornada Mensal (Horas)</label><input type="number" id="he-jorn" class="form-control-flat" value="220"></div>
<div class="form-group-flat"><label>Qtd. Horas Extras Feitas</label><input type="number" id="he-qtd" class="form-control-flat" value="10"></div>
<div class="form-group-flat"><label>Adicional (%)</label><select id="he-pct" class="form-control-flat"><option value="50">50% (Normal)</option><option value="100">100% (Dom/Feriado)</option></select></div>
<button class="btn btn-primary" onclick="window.calcHE()" style="width:100%; margin-bottom:1rem;">Calcular Horas Extras</button>
<div id="he-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;"></div>
`;
            
    window.calcHE = () => {
        let sal = parseFloat(document.getElementById('he-sal').value) || 0;
        let jorn = parseFloat(document.getElementById('he-jorn').value) || 1;
        let qtd = parseFloat(document.getElementById('he-qtd').value) || 0;
        let pct = parseFloat(document.getElementById('he-pct').value) || 50;
        let horaNormal = sal / jorn;
        let valorExtra = horaNormal * (1 + (pct/100));
        let total = valorExtra * qtd;
        document.getElementById('he-res').style.display = 'block';
        document.getElementById('he-res').innerHTML = `Valor da Hora Normal: R$ ${horaNormal.toFixed(2)}<br>Valor da Hora Extra: R$ ${valorExtra.toFixed(2)}<br><strong style="color:#10b981; font-size:1.2rem;">Total a Receber: R$ ${total.toFixed(2)}</strong>`;
    };

        }
    },
    {
        id: 'conv_moedas',
        category: 'utilidades',
        icon: 'fa-solid fa-coins color-blue',
        title: 'Conversor de Moedas',
        desc: 'Taxas de câmbio ao vivo (USD para BRL/EUR).',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Valor (USD)</label><input type="number" id="cm-val" class="form-control-flat" value="100"></div>
<button class="btn btn-primary" onclick="window.convMoeda()" style="width:100%; margin-bottom:1rem;">Converter para BRL e EUR</button>
<div id="cm-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;">Aguarde...</div>
`;
            
    window.convMoeda = async () => {
        const val = parseFloat(document.getElementById('cm-val').value) || 0;
        const resEl = document.getElementById('cm-res');
        resEl.style.display = 'block'; resEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando cotação ao vivo...';
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            const brl = (val * data.rates.BRL).toFixed(2);
            const eur = (val * data.rates.EUR).toFixed(2);
            resEl.innerHTML = `<strong style="color:#10b981; font-size:1.2rem;">R$ ${brl} BRL</strong><br><strong style="color:#38bdf8; font-size:1.2rem;">€ ${eur} EUR</strong><br><small>Cotação de hoje</small>`;
        } catch(e) { resEl.innerHTML = 'Erro ao buscar cotações offline.'; }
    };

        }
    },
    {
        id: 'desconto',
        category: 'financas',
        icon: 'fa-solid fa-tag color-green',
        title: 'Descontos',
        desc: 'Descubra o valor real após a promoção.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Preço Original (R$)</label><input type="number" id="desc-orig" class="form-control-flat" value="250"></div>
<div class="form-group-flat"><label>Desconto (%)</label><input type="number" id="desc-pct" class="form-control-flat" value="15"></div>
<button class="btn btn-primary" onclick="window.calcDesc()" style="width:100%; margin-bottom:1rem;">Calcular Preço Final</button>
<div id="desc-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;"></div>
`;
            
    window.calcDesc = () => {
        let orig = parseFloat(document.getElementById('desc-orig').value) || 0;
        let pct = parseFloat(document.getElementById('desc-pct').value) || 0;
        let final = orig - (orig * (pct/100));
        let econ = orig - final;
        document.getElementById('desc-res').style.display = 'block';
        document.getElementById('desc-res').innerHTML = `Economia: R$ ${econ.toFixed(2)}<br><strong style="color:#10b981; font-size:1.2rem;">Preço Final: R$ ${final.toFixed(2)}</strong>`;
    };

        }
    },
    {
        id: 'imc',
        category: 'saude',
        icon: 'fa-solid fa-heart-pulse color-red',
        title: 'Calculadora IMC',
        desc: 'Monitore seu Índice de Massa Corporal.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Peso (KG)</label><input type="number" id="imc-peso" class="form-control-flat" value="75"></div>
<div class="form-group-flat"><label>Altura (M)</label><input type="number" id="imc-alt" class="form-control-flat" value="1.75" step="0.01"></div>
<button class="btn btn-primary" onclick="window.calcIMC()" style="width:100%; margin-bottom:1rem;">Calcular IMC</button>
<div id="imc-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;"></div>
`;
            
    window.calcIMC = () => {
        let peso = parseFloat(document.getElementById('imc-peso').value) || 0;
        let alt = parseFloat(document.getElementById('imc-alt').value) || 1;
        let imc = peso / (alt * alt);
        let classif = '';
        if(imc < 18.5) classif = 'Abaixo do Peso';
        else if(imc < 24.9) classif = 'Peso Normal';
        else if(imc < 29.9) classif = 'Sobrepeso';
        else classif = 'Obesidade';
        document.getElementById('imc-res').style.display = 'block';
        document.getElementById('imc-res').innerHTML = `Seu IMC: <strong style="color:#38bdf8; font-size:1.2rem;">${imc.toFixed(2)}</strong><br>Classificação: <strong style="color:#10b981;">${classif}</strong>`;
    };

        }
    },
    {
        id: 'qrcode',
        category: 'utilidades',
        icon: 'fa-solid fa-qrcode color-blue',
        title: 'Gerador de QR Code',
        desc: 'Gere QR codes instantaneamente.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Texto ou Link (URL)</label><input type="text" id="qr-text" class="form-control-flat" value="https://google.com"></div>
<button class="btn btn-primary" onclick="window.genQR()" style="width:100%; margin-bottom:1rem;">Gerar QR Code</button>
<div id="qr-res" style="display:none; text-align:center; padding:1rem; background:#fff; border-radius:8px;">
    <img id="qr-img" src="" style="width:200px; height:200px; object-fit:contain;">
</div>
`;
            
    window.genQR = () => {
        let txt = document.getElementById('qr-text').value;
        if(!txt) return;
        document.getElementById('qr-res').style.display = 'block';
        document.getElementById('qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(txt)}`;
    };

        }
    },
    {
        id: 'gorjeta',
        category: 'financas',
        icon: 'fa-solid fa-percent color-green',
        title: 'Calculadora Gorjeta',
        desc: 'Divida a conta do bar facilmente.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Valor da Conta (R$)</label><input type="number" id="gor-conta" class="form-control-flat" value="150"></div>
<div class="form-group-flat"><label>Porcentagem (%)</label><input type="number" id="gor-pct" class="form-control-flat" value="10"></div>
<div class="form-group-flat"><label>Dividir por (Pessoas)</label><input type="number" id="gor-pes" class="form-control-flat" value="3"></div>
<button class="btn btn-primary" onclick="window.calcGor()" style="width:100%; margin-bottom:1rem;">Calcular</button>
<div id="gor-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;"></div>
`;
            
    window.calcGor = () => {
        let conta = parseFloat(document.getElementById('gor-conta').value) || 0;
        let pct = parseFloat(document.getElementById('gor-pct').value) || 0;
        let pes = parseInt(document.getElementById('gor-pes').value) || 1;
        let gorjeta = conta * (pct/100);
        let total = conta + gorjeta;
        let porPessoa = total / pes;
        document.getElementById('gor-res').style.display = 'block';
        document.getElementById('gor-res').innerHTML = `Gorjeta Total: R$ ${gorjeta.toFixed(2)}<br>Total com Gorjeta: R$ ${total.toFixed(2)}<br><strong style="color:#10b981; font-size:1.2rem;">R$ ${porPessoa.toFixed(2)} por pessoa</strong>`;
    };

        }
    },
    {
        id: 'regra3',
        category: 'utilidades',
        icon: 'fa-solid fa-calculator color-blue',
        title: 'Regra de Três',
        desc: 'Proporção rápida e fácil.',
        render: (container) => {
            container.innerHTML = `
<div style="display:flex; gap:1rem; margin-bottom:1rem;">
    <div class="form-group-flat"><label>A</label><input type="number" id="r3-a" class="form-control-flat" value="100"></div>
    <div class="form-group-flat" style="display:flex; align-items:flex-end; padding-bottom:1rem;">está para</div>
    <div class="form-group-flat"><label>B</label><input type="number" id="r3-b" class="form-control-flat" value="50"></div>
</div>
<div style="display:flex; gap:1rem; margin-bottom:1rem;">
    <div class="form-group-flat"><label>C</label><input type="number" id="r3-c" class="form-control-flat" value="200"></div>
    <div class="form-group-flat" style="display:flex; align-items:flex-end; padding-bottom:1rem;">está para</div>
    <div class="form-group-flat"><label>X</label><input type="text" disabled class="form-control-flat" placeholder="?"></div>
</div>
<button class="btn btn-primary" onclick="window.calcR3()" style="width:100%; margin-bottom:1rem;">Encontrar X</button>
<div id="r3-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#10b981; font-size:1.5rem; text-align:center; font-weight:bold;"></div>
`;
            
    window.calcR3 = () => {
        let a = parseFloat(document.getElementById('r3-a').value) || 0;
        let b = parseFloat(document.getElementById('r3-b').value) || 0;
        let c = parseFloat(document.getElementById('r3-c').value) || 0;
        if(a === 0) return;
        let x = (b * c) / a;
        document.getElementById('r3-res').style.display = 'block';
        document.getElementById('r3-res').innerText = `X = ${x}`;
    };

        }
    },
    {
        id: 'sorteio',
        category: 'utilidades',
        icon: 'fa-solid fa-dice color-blue',
        title: 'Sorteador',
        desc: 'Número aleatório entre dois valores.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>De (Mínimo)</label><input type="number" id="sort-min" class="form-control-flat" value="1"></div>
<div class="form-group-flat"><label>Até (Máximo)</label><input type="number" id="sort-max" class="form-control-flat" value="100"></div>
<button class="btn btn-primary" onclick="window.calcSort()" style="width:100%; margin-bottom:1rem;">Sortear Número</button>
<div id="sort-res" style="display:none; padding:2rem; background:#1e293b; border-radius:8px; color:#38bdf8; font-size:3rem; text-align:center; font-weight:bold;"></div>
`;
            
    window.calcSort = () => {
        let min = parseInt(document.getElementById('sort-min').value) || 0;
        let max = parseInt(document.getElementById('sort-max').value) || 0;
        if(min > max) { let temp=min; min=max; max=temp; }
        let res = Math.floor(Math.random() * (max - min + 1)) + min;
        document.getElementById('sort-res').style.display = 'block';
        document.getElementById('sort-res').innerText = res;
    };

        }
    },
    {
        id: 'dias',
        category: 'utilidades',
        icon: 'fa-solid fa-calendar-days color-blue',
        title: 'Contador de Dias',
        desc: 'Diferença exata entre duas datas.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Data Inicial</label><input type="date" id="dias-ini" class="form-control-flat"></div>
<div class="form-group-flat"><label>Data Final</label><input type="date" id="dias-fim" class="form-control-flat"></div>
<button class="btn btn-primary" onclick="window.calcDias()" style="width:100%; margin-bottom:1rem;">Calcular Dias</button>
<div id="dias-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#10b981; font-size:1.5rem; text-align:center; font-weight:bold;"></div>
`;
            
    document.getElementById('dias-ini').value = new Date().toISOString().split('T')[0];
    window.calcDias = () => {
        let d1 = new Date(document.getElementById('dias-ini').value);
        let d2 = new Date(document.getElementById('dias-fim').value);
        let diff = Math.abs(d2 - d1);
        let days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        document.getElementById('dias-res').style.display = 'block';
        document.getElementById('dias-res').innerText = `${days} dias de diferença`;
    };

        }
    },
    {
        id: 'freela',
        category: 'trabalho',
        icon: 'fa-solid fa-briefcase color-blue',
        title: 'Valor Freela',
        desc: 'Quanto cobrar por hora nos projetos.',
        render: (container) => {
            container.innerHTML = `
<div class="form-group-flat"><label>Salário Mensal Desejado (R$)</label><input type="number" id="fr-sal" class="form-control-flat" value="5000"></div>
<div class="form-group-flat"><label>Horas trabalhadas por dia</label><input type="number" id="fr-hdia" class="form-control-flat" value="6"></div>
<div class="form-group-flat"><label>Dias trabalhados por semana</label><input type="number" id="fr-dsem" class="form-control-flat" value="5"></div>
<div class="form-group-flat"><label>Custos Mensais (Luz, Net) (R$)</label><input type="number" id="fr-cust" class="form-control-flat" value="500"></div>
<button class="btn btn-primary" onclick="window.calcFr()" style="width:100%; margin-bottom:1rem;">Calcular Valor Hora</button>
<div id="fr-res" style="display:none; padding:1rem; background:#1e293b; border-radius:8px; color:#fff;"></div>
`;
            
    window.calcFr = () => {
        let sal = parseFloat(document.getElementById('fr-sal').value) || 0;
        let hdia = parseFloat(document.getElementById('fr-hdia').value) || 0;
        let dsem = parseFloat(document.getElementById('fr-dsem').value) || 0;
        let cust = parseFloat(document.getElementById('fr-cust').value) || 0;
        let horasMes = hdia * dsem * 4;
        if(horasMes===0)return;
        let valorHora = (sal + cust) / horasMes;
        document.getElementById('fr-res').style.display = 'block';
        document.getElementById('fr-res').innerHTML = `Seu valor ideal é de: <strong style="color:#10b981; font-size:1.5rem;">R$ ${valorHora.toFixed(2)}/h</strong>`;
    };

        }
    },
    {
        id: 'cronometro',
        category: 'produtividade',
        icon: 'fa-solid fa-stopwatch-20 color-blue',
        title: 'Cronômetro',
        desc: 'Cronômetro clássico.',
        render: (container) => {
            container.innerHTML = `<div style="text-align:center"><h2 id="cron-d" style="font-size:3rem;color:#fff;">0.0s</h2><button class="btn btn-primary" onclick="window.togCron()">Inic/Pause</button> <button class="btn btn-secondary" onclick="window.resCron()">Reset</button></div>`;
            window.cTimer=null; window.cTime=0; window.togCron=()=>{if(window.cTimer){clearInterval(window.cTimer);window.cTimer=null;}else{window.cTimer=setInterval(()=>{window.cTime+=0.1;document.getElementById("cron-d").innerText=window.cTime.toFixed(1)+"s";},100);}}; window.resCron=()=>{clearInterval(window.cTimer);window.cTimer=null;window.cTime=0;document.getElementById("cron-d").innerText="0.0s";}
        }
    },
    {
        id: 'margem_lucro',
        category: 'financas',
        icon: 'fa-solid fa-chart-line color-green',
        title: 'Margem de Lucro',
        desc: 'Lucro real sobre produtos.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Custo</label><input type="number" id="ml-custo" class="form-control-flat" value="50"></div><div class="form-group-flat"><label>Venda</label><input type="number" id="ml-venda" class="form-control-flat" value="100"></div><button class="btn btn-primary" onclick="window.calcMl()" style="width:100%">Calc</button><div id="ml-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.5rem"></div>`;
            window.calcMl=()=>{let c=parseFloat(document.getElementById("ml-custo").value)||0;let v=parseFloat(document.getElementById("ml-venda").value)||0;if(v===0)return;let p=((v-c)/v)*100;document.getElementById("ml-r").innerText=`Margem: ${p.toFixed(2)}%`;}
        }
    },
    {
        id: 'ferias',
        category: 'trabalho',
        icon: 'fa-solid fa-umbrella-beach color-blue',
        title: 'Calculadora de Férias',
        desc: '1/3 constitucional.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Salário Bruto</label><input type="number" id="fer-sal" class="form-control-flat" value="3000"></div><button class="btn btn-primary" onclick="window.calcFer()" style="width:100%">Calc</button><div id="fer-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.2rem"></div>`;
            window.calcFer=()=>{let s=parseFloat(document.getElementById("fer-sal").value)||0;let f=s+(s/3);document.getElementById("fer-r").innerText=`A receber (Bruto): R$ ${f.toFixed(2)}`;}
        }
    },
    {
        id: 'checklist',
        category: 'produtividade',
        icon: 'fa-solid fa-list-check color-blue',
        title: 'Checklist Diário',
        desc: 'To-do list em LocalStorage.',
        render: (container) => {
            container.innerHTML = `<div style="display:flex;gap:0.5rem"><input type="text" id="chk-in" class="form-control-flat" placeholder="Nova tarefa..."><button class="btn btn-primary" onclick="window.addChk()">Add</button></div><ul id="chk-list" style="list-style:none;padding:0;color:#fff;margin-top:1rem;"></ul>`;
            window.addChk=()=>{let v=document.getElementById("chk-in").value;if(!v)return;let li=document.createElement("li");li.innerHTML=`<input type="checkbox" onchange="this.parentNode.style.textDecoration=this.checked?'line-through':'none'"> ${v}`;document.getElementById("chk-list").appendChild(li);document.getElementById("chk-in").value="";}
        }
    },
    {
        id: 'roi',
        category: 'financas',
        icon: 'fa-solid fa-arrow-trend-up color-green',
        title: 'ROI',
        desc: 'Retorno sobre investimento.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Investido</label><input type="number" id="roi-inv" class="form-control-flat" value="1000"></div><div class="form-group-flat"><label>Recebido</label><input type="number" id="roi-rec" class="form-control-flat" value="1500"></div><button class="btn btn-primary" onclick="window.calcRoi()" style="width:100%">Calc</button><div id="roi-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.5rem"></div>`;
            window.calcRoi=()=>{let i=parseFloat(document.getElementById("roi-inv").value)||1;let r=parseFloat(document.getElementById("roi-rec").value)||0;let roi=((r-i)/i)*100;document.getElementById("roi-r").innerText=`ROI: ${roi.toFixed(2)}%`;}
        }
    },
    {
        id: 'combustivel',
        category: 'utilidades',
        icon: 'fa-solid fa-gas-pump color-blue',
        title: 'Combustível',
        desc: 'Álcool ou Gasolina?',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Preço Álcool</label><input type="number" id="cb-a" class="form-control-flat" value="3.50"></div><div class="form-group-flat"><label>Preço Gasolina</label><input type="number" id="cb-g" class="form-control-flat" value="5.50"></div><button class="btn btn-primary" onclick="window.calcCb()" style="width:100%">Calc</button><div id="cb-r" style="margin-top:1rem;color:#fff;font-weight:bold;font-size:1.2rem"></div>`;
            window.calcCb=()=>{let a=parseFloat(document.getElementById("cb-a").value)||0;let g=parseFloat(document.getElementById("cb-g").value)||1;let p=a/g;let r=(p<0.7)?"Abasteça com ÁLCOOL":"Abasteça com GASOLINA";document.getElementById("cb-r").innerHTML=`Razão: ${(p*100).toFixed(1)}%<br><strong style="color:#10b981">${r}</strong>`;}
        }
    },
    {
        id: 'bloco_notas',
        category: 'produtividade',
        icon: 'fa-solid fa-note-sticky color-blue',
        title: 'Bloco de Notas',
        desc: 'Anotações rápidas salvas.',
        render: (container) => {
            container.innerHTML = `<textarea id="bn-txt" class="form-control-flat" rows="8" placeholder="Escreva aqui..." oninput="localStorage.setItem('bn_data', this.value)"></textarea>`;
            document.getElementById("bn-txt").value=localStorage.getItem("bn_data")||"";
        }
    },
    {
        id: 'poupanca',
        category: 'financas',
        icon: 'fa-solid fa-bullseye color-green',
        title: 'Poupança Alvo',
        desc: 'Meta de economia.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Meta (R$)</label><input type="number" id="pa-m" class="form-control-flat" value="10000"></div><div class="form-group-flat"><label>Meses</label><input type="number" id="pa-t" class="form-control-flat" value="12"></div><button class="btn btn-primary" onclick="window.calcPa()" style="width:100%">Calc</button><div id="pa-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.2rem"></div>`;
            window.calcPa=()=>{let m=parseFloat(document.getElementById("pa-m").value)||0;let t=parseFloat(document.getElementById("pa-t").value)||1;let r=m/t;document.getElementById("pa-r").innerText=`Guarde R$ ${r.toFixed(2)} por mês`;}
        }
    },
    {
        id: 'fuso_horario',
        category: 'utilidades',
        icon: 'fa-solid fa-globe color-blue',
        title: 'Fuso Horário',
        desc: 'Hora em outros locais.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Fuso (Ex: America/New_York)</label><input type="text" id="fz-t" class="form-control-flat" value="Europe/London"></div><button class="btn btn-primary" onclick="window.calcFz()" style="width:100%">Ver Hora</button><div id="fz-r" style="margin-top:1rem;color:#38bdf8;font-weight:bold;font-size:1.5rem"></div>`;
            window.calcFz=async()=>{try{let f=document.getElementById("fz-t").value;let res=await fetch(`https://worldtimeapi.org/api/timezone/${f}`);let d=await res.json();document.getElementById("fz-r").innerText=new Date(d.datetime).toLocaleString("pt-BR");}catch(e){document.getElementById("fz-r").innerText="Fuso não encontrado";}}
        }
    },
    {
        id: 'idade_exata',
        category: 'utilidades',
        icon: 'fa-solid fa-cake-candles color-blue',
        title: 'Idade Exata',
        desc: 'Anos, meses e dias.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Data Nascimento</label><input type="date" id="ie-d" class="form-control-flat"></div><button class="btn btn-primary" onclick="window.calcIe()" style="width:100%">Calc</button><div id="ie-r" style="margin-top:1rem;color:#10b981;font-weight:bold;"></div>`;
            window.calcIe=()=>{let dn=new Date(document.getElementById("ie-d").value);let hj=new Date();let diff=hj-dn;let a=Math.floor(diff/(1000*60*60*24*365.25));document.getElementById("ie-r").innerText=`Você tem ${a} anos completos.`;}
        }
    },
    {
        id: 'temperatura',
        category: 'utilidades',
        icon: 'fa-solid fa-temperature-half color-blue',
        title: 'Temperatura',
        desc: 'C para F.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Celsius</label><input type="number" id="tp-c" class="form-control-flat" value="30" oninput="window.calcTp()"></div><div id="tp-r" style="margin-top:1rem;color:#38bdf8;font-weight:bold;font-size:1.5rem"></div>`;
            window.calcTp=()=>{let c=parseFloat(document.getElementById("tp-c").value)||0;let f=(c*9/5)+32;document.getElementById("tp-r").innerText=`${f.toFixed(1)} °F`;}; window.calcTp();
        }
    },
    {
        id: 'comprimento',
        category: 'utilidades',
        icon: 'fa-solid fa-ruler color-blue',
        title: 'Comprimento',
        desc: 'Metros para Pés/Milhas.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Metros</label><input type="number" id="cp-m" class="form-control-flat" value="100" oninput="window.calcCp()"></div><div id="cp-r" style="margin-top:1rem;color:#fff;font-weight:bold;font-size:1.2rem"></div>`;
            window.calcCp=()=>{let m=parseFloat(document.getElementById("cp-m").value)||0;let p=m*3.28084;let mi=m*0.000621371;document.getElementById("cp-r").innerHTML=`Pés: ${p.toFixed(2)}<br>Milhas: ${mi.toFixed(4)}`;}; window.calcCp();
        }
    },
    {
        id: 'peso',
        category: 'utilidades',
        icon: 'fa-solid fa-weight-scale color-blue',
        title: 'Pesos',
        desc: 'KG para Libras.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Quilos (KG)</label><input type="number" id="ps-k" class="form-control-flat" value="70" oninput="window.calcPs()"></div><div id="ps-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.5rem"></div>`;
            window.calcPs=()=>{let k=parseFloat(document.getElementById("ps-k").value)||0;let l=k*2.20462;document.getElementById("ps-r").innerText=`Libras (lb): ${l.toFixed(2)}`;}; window.calcPs();
        }
    },
    {
        id: 'rescisao',
        category: 'trabalho',
        icon: 'fa-solid fa-file-contract color-blue',
        title: 'Rescisão Base',
        desc: 'Estime seu acerto.',
        render: (container) => {
            container.innerHTML = `<div class="form-group-flat"><label>Salário</label><input type="number" id="rs-s" class="form-control-flat" value="3000"></div><button class="btn btn-primary" onclick="window.calcRs()" style="width:100%">Aviso Prévio 30d</button><div id="rs-r" style="margin-top:1rem;color:#10b981;font-weight:bold;font-size:1.2rem"></div>`;
            window.calcRs=()=>{let s=parseFloat(document.getElementById("rs-s").value)||0;let r=s+(s/3)+(s*(8/100)*1.4);document.getElementById("rs-r").innerText=`Valor Aprox: R$ ${r.toFixed(2)}`;}
        }
    },
    {
        id: 'lero',
        category: 'utilidades',
        icon: 'fa-solid fa-align-left color-blue',
        title: 'Gerador Lero-Lero',
        desc: 'Textos Lorem Ipsum.',
        render: (container) => {
            container.innerHTML = `<button class="btn btn-primary" onclick="window.calcLr()" style="width:100%;margin-bottom:1rem;">Gerar Texto</button><p id="lr-r" style="color:var(--text-secondary);"></p>`;
            window.calcLr=()=>{document.getElementById("lr-r").innerText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";}
        }
    }];

function initSuperToolsStore() {
    const grid = document.getElementById('super-tools-grid');
    const searchInput = document.getElementById('search-super-tools');
    const filterSelect = document.getElementById('filter-super-tools-category');
    
    if(!grid || !searchInput || !filterSelect) return;

    renderSuperToolsGrid('all', '');

    searchInput.addEventListener('input', (e) => {
        renderSuperToolsGrid(filterSelect.value, e.target.value.toLowerCase());
    });

    filterSelect.addEventListener('change', (e) => {
        renderSuperToolsGrid(e.target.value, searchInput.value.toLowerCase());
    });
}

function renderSuperToolsGrid(category, query) {
    const grid = document.getElementById('super-tools-grid');
    grid.innerHTML = '';

    const filtered = SUPER_TOOLS_DB.filter(tool => {
        const matchCategory = category === 'all' || tool.category === category;
        const matchQuery = tool.title.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query);
        return matchCategory && matchQuery;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; color:var(--text-secondary); grid-column: 1 / -1; padding: 2rem;"><i class="fa-solid fa-ghost" style="font-size: 2rem; margin-bottom: 1rem;"></i><p>Nenhuma ferramenta encontrada para essa busca.</p></div>`;
        return;
    }

    filtered.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'glass-card ripple';
        card.style.cssText = 'padding: 1.25rem; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s;';
        card.innerHTML = `<i class="${tool.icon}" style="font-size: 1.8rem; margin-bottom: 0.75rem;"></i><h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #fff;">${tool.title}</h4><p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; line-height: 1.4; flex-grow: 1;">${tool.desc}</p>`;
        card.onclick = () => openSuperToolModal(tool.id);
        grid.appendChild(card);
    });
}

function openSuperToolModal(toolId) {
    const tool = SUPER_TOOLS_DB.find(t => t.id === toolId);
    if(!tool) return;
    const modal = document.getElementById('super-tools-modal');
    const title = document.getElementById('st-modal-title');
    const body = document.getElementById('st-modal-body');
    const footer = document.getElementById('st-modal-footer');
    title.innerHTML = `<i class="${tool.icon}"></i> ${tool.title}`;
    body.innerHTML = '';
    footer.style.display = 'none';
    tool.render(body);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    initSuperToolsStore();
    const btnCloseSt = document.getElementById('btn-close-st-modal');
    const stModal = document.getElementById('super-tools-modal');
    if(btnCloseSt && stModal) {
        btnCloseSt.addEventListener('click', () => stModal.classList.add('hidden'));
        stModal.addEventListener('click', (e) => { if (e.target === stModal) stModal.classList.add('hidden'); });
    }
});
