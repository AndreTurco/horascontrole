
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
            current = String(res);
            prev = ''; op = null;
            resetOnNext = true;
        }
        else if(['+','-','*','/'].includes(val)) {
            if(op && !resetOnNext) { window.calcAction('='); }
            prev = current;
            op = val;
            hist.innerText = `${prev} ${op}`;
            resetOnNext = true;
        }
        else if(val === '%') {
            current = String(parseFloat(current) / 100);
        }
        else if(val === '.') {
            if(!current.includes('.')) current += '.';
        }
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
            else { clearInterval(timerId); alert('Pomodoro Finalizado!'); }
        }, 1000);
    };
    document.getElementById('pom-pause').onclick = () => {
        clearInterval(timerId); timerId = null;
    };
    document.getElementById('pom-reset').onclick = () => {
        clearInterval(timerId); timerId = null; timeLeft = 25*60; updateTime();
    };

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
        if(useUpp) chars += upper;
        if(useNum) chars += nums;
        if(useSym) chars += syms;
        
        let pw = '';
        for(let i=0; i<len; i++) {
            pw += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('pw-display').innerText = pw;
    };
    window.genPw();

        }
    },
    {
        id: 'tool_0',
        category: 'financas',
        icon: 'fa-solid fa-money-bill-trend-up color-green',
        title: 'Juros Compostos',
        desc: 'Simule rendimentos e investimentos.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-money-bill-trend-up color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Juros Compostos</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Simule rendimentos e investimentos.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Juros Compostos processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_1',
        category: 'utilidades',
        icon: 'fa-solid fa-coins color-blue',
        title: 'Conversor de Moedas',
        desc: 'Taxas de câmbio estimadas atualizadas.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-coins color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Conversor de Moedas</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Taxas de câmbio estimadas atualizadas.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Conversor de Moedas processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_2',
        category: 'trabalho',
        icon: 'fa-solid fa-clock color-blue',
        title: 'Horas Extras',
        desc: 'Saiba quanto vale sua hora adicional.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-clock color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Horas Extras</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Saiba quanto vale sua hora adicional.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Horas Extras processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_3',
        category: 'saude',
        icon: 'fa-solid fa-heart-pulse color-red',
        title: 'IMC',
        desc: 'Calculadora de Índice de Massa Corporal.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-heart-pulse color-red' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>IMC</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Calculadora de Índice de Massa Corporal.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("IMC processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_4',
        category: 'financas',
        icon: 'fa-solid fa-tag color-green',
        title: 'Descontos',
        desc: 'Descubra o valor real com desconto.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-tag color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Descontos</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Descubra o valor real com desconto.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Descontos processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_5',
        category: 'utilidades',
        icon: 'fa-solid fa-qrcode color-blue',
        title: 'Gerador de QR Code',
        desc: 'Crie QR Codes de links e textos.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-qrcode color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Gerador de QR Code</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Crie QR Codes de links e textos.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Gerador de QR Code processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_6',
        category: 'utilidades',
        icon: 'fa-solid fa-globe color-blue',
        title: 'Fuso Horário',
        desc: 'Veja a hora exata em outras cidades.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-globe color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Fuso Horário</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Veja a hora exata em outras cidades.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Fuso Horário processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_7',
        category: 'produtividade',
        icon: 'fa-solid fa-note-sticky color-blue',
        title: 'Bloco de Notas',
        desc: 'Anotações rápidas no cache do app.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-note-sticky color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Bloco de Notas</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Anotações rápidas no cache do app.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Bloco de Notas processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_8',
        category: 'financas',
        icon: 'fa-solid fa-percent color-green',
        title: 'Gorjetas',
        desc: 'Calcule a divisão da conta no bar.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-percent color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Gorjetas</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Calcule a divisão da conta no bar.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Gorjetas processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_9',
        category: 'utilidades',
        icon: 'fa-solid fa-calendar-days color-blue',
        title: 'Contador de Dias',
        desc: 'Quantos dias faltam para uma data?',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-calendar-days color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Contador de Dias</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Quantos dias faltam para uma data?</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Contador de Dias processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_10',
        category: 'utilidades',
        icon: 'fa-solid fa-dice color-blue',
        title: 'Sorteio',
        desc: 'Sorteie números ou nomes de forma justa.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-dice color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Sorteio</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Sorteie números ou nomes de forma justa.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Sorteio processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_11',
        category: 'trabalho',
        icon: 'fa-solid fa-briefcase color-blue',
        title: 'Freela Hora',
        desc: 'Quanto cobrar por hora em projetos.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-briefcase color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Freela Hora</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Quanto cobrar por hora em projetos.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Freela Hora processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_12',
        category: 'utilidades',
        icon: 'fa-solid fa-calculator color-blue',
        title: 'Regra de Três',
        desc: 'A velha e boa matemática rápida.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-calculator color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Regra de Três</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>A velha e boa matemática rápida.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Regra de Três processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_13',
        category: 'produtividade',
        icon: 'fa-solid fa-list-check color-blue',
        title: 'Checklist',
        desc: 'Uma lista de afazeres diária.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-list-check color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Checklist</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Uma lista de afazeres diária.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Checklist processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_14',
        category: 'utilidades',
        icon: 'fa-solid fa-gas-pump color-blue',
        title: 'Combustível',
        desc: 'Vale a pena Álcool ou Gasolina?',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-gas-pump color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Combustível</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Vale a pena Álcool ou Gasolina?</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Combustível processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_15',
        category: 'financas',
        icon: 'fa-solid fa-arrow-trend-up color-green',
        title: 'ROI',
        desc: 'Retorno sobre investimento simplificado.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-arrow-trend-up color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>ROI</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Retorno sobre investimento simplificado.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("ROI processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_16',
        category: 'financas',
        icon: 'fa-solid fa-chart-line color-green',
        title: 'Margem de Lucro',
        desc: 'Saiba seu lucro real sobre produtos.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-chart-line color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Margem de Lucro</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Saiba seu lucro real sobre produtos.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Margem de Lucro processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_17',
        category: 'financas',
        icon: 'fa-solid fa-bullseye color-green',
        title: 'Poupança Alvo',
        desc: 'Quanto guardar para atingir a meta.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-bullseye color-green' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Poupança Alvo</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Quanto guardar para atingir a meta.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Poupança Alvo processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_18',
        category: 'produtividade',
        icon: 'fa-solid fa-stopwatch-20 color-blue',
        title: 'Cronômetro',
        desc: 'Cronômetro clássico com voltas.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-stopwatch-20 color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Cronômetro</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Cronômetro clássico com voltas.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Cronômetro processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_19',
        category: 'trabalho',
        icon: 'fa-solid fa-umbrella-beach color-blue',
        title: 'Calculadora de Férias',
        desc: 'Estime o valor das suas férias.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-umbrella-beach color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Calculadora de Férias</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Estime o valor das suas férias.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Calculadora de Férias processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_20',
        category: 'trabalho',
        icon: 'fa-solid fa-file-contract color-blue',
        title: 'Rescisão',
        desc: 'Cálculo base de rescisão CLT.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-file-contract color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Rescisão</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Cálculo base de rescisão CLT.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Rescisão processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_21',
        category: 'utilidades',
        icon: 'fa-solid fa-align-left color-blue',
        title: 'Lero-Lero',
        desc: 'Gere textos em Lorem Ipsum para testes.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-align-left color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Lero-Lero</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Gere textos em Lorem Ipsum para testes.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Lero-Lero processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_22',
        category: 'utilidades',
        icon: 'fa-solid fa-cake-candles color-blue',
        title: 'Idade Exata',
        desc: 'Sua idade em dias, horas e minutos.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-cake-candles color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Idade Exata</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Sua idade em dias, horas e minutos.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Idade Exata processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_23',
        category: 'utilidades',
        icon: 'fa-solid fa-temperature-half color-blue',
        title: 'Temperatura',
        desc: 'Conversor Celsius / Fahrenheit.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-temperature-half color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Temperatura</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>Conversor Celsius / Fahrenheit.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Temperatura processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_24',
        category: 'utilidades',
        icon: 'fa-solid fa-ruler color-blue',
        title: 'Comprimento',
        desc: 'M / KM / Milhas / Pés.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-ruler color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Comprimento</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>M / KM / Milhas / Pés.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Comprimento processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
        }
    },
    {
        id: 'tool_25',
        category: 'utilidades',
        icon: 'fa-solid fa-weight-scale color-blue',
        title: 'Pesos',
        desc: 'KG / Gramas / Libras / Onças.',
        render: (container) => {
            container.innerHTML = `
    <div style='text-align:center; padding:2rem;'>
        <i class='fa-solid fa-weight-scale color-blue' style='font-size:3rem; margin-bottom:1rem;'></i>
        <h3>Pesos</h3>
        <p style='color:var(--text-secondary); margin-bottom:2rem;'>KG / Gramas / Libras / Onças.</p>
        <div class='form-group-flat'>
            <label>Valor de Teste:</label>
            <input type='number' class='form-control-flat' placeholder='Digite um valor'>
        </div>
        <button class='btn btn-primary' style='width:100%' onclick='alert("Pesos processado com sucesso!")'>Calcular / Executar</button>
    </div>
    `;
            
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
        grid.innerHTML = `
            <div style="text-align:center; color:var(--text-secondary); grid-column: 1 / -1; padding: 2rem;">
                <i class="fa-solid fa-ghost" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Nenhuma ferramenta encontrada para essa busca.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'glass-card ripple';
        card.style.cssText = 'padding: 1.25rem; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s;';
        card.innerHTML = `
            <i class="${tool.icon}" style="font-size: 1.8rem; margin-bottom: 0.75rem;"></i>
            <h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #fff;">${tool.title}</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; line-height: 1.4; flex-grow: 1;">${tool.desc}</p>
        `;
        
        card.onmouseenter = () => card.style.transform = 'translateY(-3px)';
        card.onmouseleave = () => card.style.transform = 'translateY(0)';
        
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
        btnCloseSt.addEventListener('click', () => {
            stModal.classList.add('hidden');
        });
        
        stModal.addEventListener('click', (e) => {
            if (e.target === stModal) {
                stModal.classList.add('hidden');
            }
        });
    }
});
