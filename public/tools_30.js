// ==========================================================================
// MÓDULO DE SUPER FERRAMENTAS DE ELITE (10 PREMIUM APPS)
// ==========================================================================

// Injeção de Estilos CSS customizados para abas e métricas das ferramentas
const styleEl = document.createElement('style');
styleEl.textContent = `
    .st-tabs-nav {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 1.25rem;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
    }
    .st-tab-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        white-space: nowrap;
    }
    .st-tab-btn:hover {
        color: #fff;
    }
    .st-tab-btn.active {
        color: var(--accent-blue, #38bdf8);
        border-bottom-color: var(--accent-blue, #38bdf8);
    }
    .st-card-metric {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        flex: 1;
        min-width: 120px;
    }
    .st-metric-val {
        font-size: 1.3rem;
        font-weight: 700;
        color: #fff;
        margin-top: 0.25rem;
    }
    .st-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    @media (max-width: 600px) {
        .st-form-row {
            grid-template-columns: 1fr;
        }
    }
    .st-badge {
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    .st-badge-success {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .st-badge-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .st-badge-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .st-trophy-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: transform 0.2s, border-color 0.2s;
    }
    .st-trophy-card.unlocked {
        border-color: rgba(234, 179, 8, 0.4);
        background: linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%);
    }
    .st-trophy-icon {
        font-size: 2.2rem;
        color: #475569;
    }
    .st-trophy-card.unlocked .st-trophy-icon {
        color: #eab308;
        filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.4));
    }
`;
document.head.appendChild(styleEl);

// Função global para troca de abas no modal das ferramentas
window.switchStTab = (btn, tabId) => {
    const parent = btn.parentElement;
    parent.querySelectorAll('.st-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Subir até encontrar o container pai do modal de ferramentas
    const container = parent.parentElement;
    container.querySelectorAll('.st-tab-content').forEach(c => c.style.display = 'none');
    
    const targetContent = container.querySelector('#' + tabId);
    if(targetContent) {
        targetContent.style.display = 'block';
    }
};

// Variáveis de escopo de áudio para o Gerador de Frequências (Web Audio API)
let audioCtx = null;
let currentNoiseNode = null;
let gainNode = null;

// Banco de dados de Ferramentas de Elite
const SUPER_TOOLS_DB = [
    {
        id: 'calc_fire',
        category: 'financas',
        icon: 'fa-solid fa-fire-flame-curved color-red',
        title: 'F.I.R.E. Hub: Independência',
        desc: 'Planeje sua aposentadoria antecipada com juros compostos avançados e simulação Monte Carlo.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'fire-sim')">Simulador</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'fire-graph')">Evolução Patrimonial</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'fire-monte-carlo')">Monte Carlo</button>
                </div>
                
                <div id="fire-sim" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Patrimônio Atual (R$)</label>
                            <input type="number" id="fire-init" class="form-control-flat" value="10000">
                        </div>
                        <div class="form-group-flat">
                            <label>Aporte Mensal (R$)</label>
                            <input type="number" id="fire-aporte" class="form-control-flat" value="1500">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Custo de Vida Mensal Desejado (R$)</label>
                            <input type="number" id="fire-cost" class="form-control-flat" value="5000">
                        </div>
                        <div class="form-group-flat">
                            <label>Taxa de Juros Anual Nominal (%)</label>
                            <input type="number" id="fire-rate" class="form-control-flat" value="10">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Inflação Anual Média (%)</label>
                            <input type="number" id="fire-inflation" class="form-control-flat" value="4.5">
                        </div>
                        <div class="form-group-flat">
                            <label>Taxa de Retirada Segura - SWR (%)</label>
                            <input type="number" id="fire-swr" class="form-control-flat" value="4" step="0.1">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.runFireSimulation()" style="width: 100%; margin-top: 0.5rem;">Calcular Aposentadoria</button>
                    
                    <div id="fire-results" style="margin-top: 1.25rem; display: none; display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Patrimônio Alvo (FIRE)</span>
                                <div class="st-metric-val" id="fire-val-target" style="color: #eab308;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Tempo Estimado</span>
                                <div class="st-metric-val" id="fire-val-time" style="color: #10b981;">0 anos</div>
                            </div>
                        </div>
                        <div class="glass-card" style="padding: 1rem; font-size: 0.85rem; line-height: 1.4;">
                            <span id="fire-summary-text"></span>
                        </div>
                    </div>
                </div>
                
                <div id="fire-graph" class="st-tab-content" style="display: none;">
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Gráfico interativo simulando patrimônio acumulado nominal vs real (ajustado pela inflação):</p>
                    <canvas id="fire-chart" style="width: 100%; max-height: 250px; background: rgba(0,0,0,0.2); border-radius: 8px;"></canvas>
                </div>
                
                <div id="fire-monte-carlo" class="st-tab-content" style="display: none;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #fff;">Simulação Estocástica de Sobrevivência</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">Roda 250 cenários aleatórios de rentabilidade anual considerando uma volatilidade de mercado de 15% ao ano.</p>
                    <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="font-size: 3rem; font-weight: 800; color: #10b981;" id="mc-prob-val">-%</div>
                        <div style="text-align: center;">
                            <strong style="color: #fff; font-size: 0.9rem;">Probabilidade de Sucesso em 30 anos</strong>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;" id="mc-desc">Clique no botão abaixo para rodar a simulação.</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="window.runMonteCarloSim()" style="width: 100%; margin-top: 1rem;">Rodar Análise Monte Carlo</button>
                </div>
            `;
            
            window.runFireSimulation = () => {
                const init = parseFloat(document.getElementById('fire-init').value) || 0;
                const aporte = parseFloat(document.getElementById('fire-aporte').value) || 0;
                const cost = parseFloat(document.getElementById('fire-cost').value) || 0;
                const rate = (parseFloat(document.getElementById('fire-rate').value) || 0) / 100;
                const inflation = (parseFloat(document.getElementById('fire-inflation').value) || 0) / 100;
                const swr = (parseFloat(document.getElementById('fire-swr').value) || 0) / 100;
                
                if(cost <= 0 || swr <= 0) return;
                
                const target = (cost * 12) / swr;
                const realRate = (1 + rate) / (1 + inflation) - 1;
                
                let capReal = init;
                let capNominal = init;
                let months = 0;
                let maxMonths = 720; // 60 anos limite
                
                const dataNominal = [];
                const dataReal = [];
                const labels = [];
                
                while(capReal < target && months < maxMonths) {
                    capReal = capReal * (1 + realRate/12) + aporte;
                    capNominal = capNominal * (1 + rate/12) + aporte;
                    months++;
                    if(months % 12 === 0) {
                        dataReal.push(Math.round(capReal));
                        dataNominal.push(Math.round(capNominal));
                        labels.push(`Ano ${months/12}`);
                    }
                }
                
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                
                document.getElementById('fire-results').style.display = 'flex';
                document.getElementById('fire-val-target').innerText = 'R$ ' + target.toLocaleString('pt-BR', {maximumFractionDigits: 0});
                document.getElementById('fire-val-time').innerText = years > 0 ? `${years}a ${remainingMonths}m` : `${remainingMonths} meses`;
                
                document.getElementById('fire-summary-text').innerHTML = `Seu patrimônio alvo para a aposentadoria é de <strong>R$ ${target.toLocaleString('pt-BR', {maximumFractionDigits:2})}</strong>. Aportando <strong>R$ ${aporte.toLocaleString('pt-BR')}</strong> mensalmente com rendimento real líquido de <strong>${(realRate*100).toFixed(2)}%</strong> ao ano, você atingirá a liberdade financeira em <strong>${years} anos e ${remainingMonths} meses</strong>.`;
                
                // Plotar gráfico usando Chart.js
                const ctx = document.getElementById('fire-chart').getContext('2d');
                if (window.fireChartInstance) window.fireChartInstance.destroy();
                
                window.fireChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Patrimônio Real (Deflacionado)',
                                data: dataReal,
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                fill: true,
                                tension: 0.2
                            },
                            {
                                label: 'Patrimônio Nominal',
                                data: dataNominal,
                                borderColor: '#eab308',
                                borderDash: [5, 5],
                                fill: false,
                                tension: 0.2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#94a3b8' } } },
                        scales: {
                            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                        }
                    }
                });
            };
            
            window.runMonteCarloSim = () => {
                const init = parseFloat(document.getElementById('fire-init').value) || 0;
                const aporte = parseFloat(document.getElementById('fire-aporte').value) || 0;
                const cost = parseFloat(document.getElementById('fire-cost').value) || 0;
                const rate = (parseFloat(document.getElementById('fire-rate').value) || 0) / 100;
                const inflation = (parseFloat(document.getElementById('fire-inflation').value) || 0) / 100;
                
                const realRate = (1 + rate) / (1 + inflation) - 1;
                const volatility = 0.15; // Volatilidade padrão 15%
                const totalAnnualExpenses = cost * 12;
                
                let successCount = 0;
                const runs = 250;
                const years = 30;
                
                for(let r = 0; r < runs; r++) {
                    let cap = init;
                    let failed = false;
                    for(let y = 0; y < years; y++) {
                        // Transformada Box-Muller para distribuição normal de retornos
                        const u1 = Math.random() || 0.0001;
                        const u2 = Math.random() || 0.0001;
                        const rand = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
                        const yearlyReturn = realRate + volatility * rand;
                        
                        cap = cap * (1 + yearlyReturn) + (aporte * 12);
                        cap -= totalAnnualExpenses;
                        
                        if(cap <= 0) {
                            failed = true;
                            break;
                        }
                    }
                    if(!failed) successCount++;
                }
                
                const prob = Math.round((successCount / runs) * 100);
                const probEl = document.getElementById('mc-prob-val');
                const descEl = document.getElementById('mc-desc');
                
                probEl.innerText = `${prob}%`;
                if(prob >= 80) {
                    probEl.style.color = '#10b981';
                    descEl.innerHTML = `Excelente! O portfólio tem alta segurança contra flutuações e crises de mercado de ações.`;
                } else if(prob >= 50) {
                    probEl.style.color = '#f59e0b';
                    descEl.innerHTML = `Moderado. Há risco médio do patrimônio acabar em 30 anos sob cenários pessimistas. Considere poupar mais.`;
                } else {
                    probEl.style.color = '#ef4444';
                    descEl.innerHTML = `Crítico. Alta probabilidade de insolvência do fundo em 30 anos. Aumente o aporte ou reduza o custo de vida.`;
                }
            };
            
            setTimeout(() => window.runFireSimulation(), 200);
        }
    },
    {
        id: 'clt_pj_coop',
        category: 'trabalho',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'CLT vs PJ vs Cooperado',
        desc: 'Simule propostas de contratação corporativa integrando encargos tributários de forma real.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'cpc-sim')">Simulador</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'cpc-table')">Detalhamento Anual</button>
                </div>
                
                <div id="cpc-sim" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Salário CLT Bruto (R$)</label>
                            <input type="number" id="cpc-clt-bruto" class="form-control-flat" value="8000">
                        </div>
                        <div class="form-group-flat">
                            <label>Proposta PJ Mensal (R$)</label>
                            <input type="number" id="cpc-pj-bruto" class="form-control-flat" value="13000">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>VA/VR Mensal CLT (R$)</label>
                            <input type="number" id="cpc-clt-ben" class="form-control-flat" value="1000">
                        </div>
                        <div class="form-group-flat">
                            <label>Imposto Simples PJ (%)</label>
                            <input type="number" id="cpc-pj-tax" class="form-control-flat" value="6">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Despesa Contador PJ (R$/mês)</label>
                            <input type="number" id="cpc-pj-cont" class="form-control-flat" value="250">
                        </div>
                        <div class="form-group-flat">
                            <label>Proposta Cooperado (R$)</label>
                            <input type="number" id="cpc-coop-bruto" class="form-control-flat" value="12000">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="window.runCpcSim()" style="width: 100%; margin-top: 0.5rem;">Comparar Modelos</button>
                    
                    <div id="cpc-results" style="margin-top: 1.25rem; display: none; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">CLT Líquido (Mês)</span>
                                <div class="st-metric-val" id="cpc-val-clt" style="color: #ef4444;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">PJ Líquido (Mês)</span>
                                <div class="st-metric-val" id="cpc-val-pj" style="color: #10b981;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Cooperado (Mês)</span>
                                <div class="st-metric-val" id="cpc-val-coop" style="color: #38bdf8;">R$ 0,00</div>
                            </div>
                        </div>
                        
                        <div class="glass-card" style="padding: 1rem; border-left: 4px solid #eab308; background: rgba(234, 179, 8, 0.05);">
                            <strong style="color: #fff; font-size: 0.85rem;">Análise e Recomendação:</strong>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; line-height: 1.45;" id="cpc-verdict"></p>
                        </div>
                    </div>
                </div>
                
                <div id="cpc-table" class="st-tab-content" style="display: none;">
                    <div style="overflow-x: auto;">
                        <table class="table-flat" style="width: 100%; font-size: 0.8rem;">
                            <thead>
                                <tr>
                                    <th style="text-align: left;">Rubrica Anual</th>
                                    <th style="text-align: right;">CLT</th>
                                    <th style="text-align: right;">PJ</th>
                                    <th style="text-align: right;">Cooperado</th>
                                </tr>
                            </thead>
                            <tbody id="cpc-table-body">
                                <!-- Preenchido dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            window.runCpcSim = () => {
                const cltBruto = parseFloat(document.getElementById('cpc-clt-bruto').value) || 0;
                const cltBen = parseFloat(document.getElementById('cpc-clt-ben').value) || 0;
                const pjBruto = parseFloat(document.getElementById('cpc-pj-bruto').value) || 0;
                const pjTax = (parseFloat(document.getElementById('cpc-pj-tax').value) || 0) / 100;
                const pjCont = parseFloat(document.getElementById('cpc-pj-cont').value) || 0;
                const coopBruto = parseFloat(document.getElementById('cpc-coop-bruto').value) || 0;
                
                // Cálculo CLT Progressivo simplificado (INSS e IRPF)
                let inss = 0;
                if(cltBruto <= 1412) inss = cltBruto * 0.075;
                else if(cltBruto <= 2666.68) inss = 1412 * 0.075 + (cltBruto - 1412) * 0.09;
                else if(cltBruto <= 4000.03) inss = 1412 * 0.075 + 1254.68 * 0.09 + (cltBruto - 2666.68) * 0.12;
                else inss = 1412 * 0.075 + 1254.68 * 0.09 + 1333.35 * 0.12 + (Math.min(cltBruto, 7786.02) - 4000.03) * 0.14;
                
                const baseIRPF = cltBruto - inss;
                let irpf = 0;
                if(baseIRPF <= 2259.20) irpf = 0;
                else if(baseIRPF <= 2828.65) irpf = (baseIRPF * 0.075) - 169.44;
                else if(baseIRPF <= 3751.06) irpf = (baseIRPF * 0.15) - 381.44;
                else if(baseIRPF <= 4664.68) irpf = (baseIRPF * 0.225) - 662.77;
                else irpf = (baseIRPF * 0.275) - 896.00;
                
                const cltLiqMês = cltBruto - inss - irpf + cltBen;
                const cltFGTS = cltBruto * 0.08;
                
                // Cálculo CLT Anual (13 salários + 1/3 férias + 12 meses benefícios + 12 meses FGTS)
                const cltAnual = (cltBruto - inss - irpf) * 13 + (cltBruto/3) + (cltBen * 12) + (cltFGTS * 12);
                
                // Cálculo PJ Anual
                const pjReceitaAnual = pjBruto * 12;
                const pjImpostoAnual = pjReceitaAnual * pjTax;
                const pjCustosAnual = pjCont * 12;
                const pjAnual = pjReceitaAnual - pjImpostoAnual - pjCustosAnual;
                
                // Cooperado (Retenção média de 10% de imposto/cooperativa)
                const coopTax = 0.10;
                const coopAnual = (coopBruto * (1 - coopTax)) * 12;
                
                document.getElementById('cpc-results').style.display = 'flex';
                document.getElementById('cpc-val-clt').innerText = 'R$ ' + Math.round(cltLiqMês).toLocaleString('pt-BR');
                document.getElementById('cpc-val-pj').innerText = 'R$ ' + Math.round(pjAnual / 12).toLocaleString('pt-BR');
                document.getElementById('cpc-val-coop').innerText = 'R$ ' + Math.round(coopAnual / 12).toLocaleString('pt-BR');
                
                // Tabela Detalhada
                const tbody = document.getElementById('cpc-table-body');
                tbody.innerHTML = `
                    <tr><td>Faturamento Bruto</td><td style="text-align:right;">R$ ${(cltBruto*13.33).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#10b981;">R$ ${pjReceitaAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;">R$ ${(coopBruto*12).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td></tr>
                    <tr><td>INSS / Encargos</td><td style="text-align:right;">R$ ${(inss*13).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;">-</td><td style="text-align:right;">-</td></tr>
                    <tr><td>Impostos Incidentes</td><td style="text-align:right;">R$ ${(irpf*13).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#ef4444;">R$ ${pjImpostoAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#ef4444;">R$ ${(coopBruto*12*coopTax).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td></tr>
                    <tr><td>Benefícios / Custos Extras</td><td style="text-align:right;color:#10b981;">R$ ${(cltBen*12 + cltFGTS*12).toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#ef4444;">R$ ${pjCustosAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;">-</td></tr>
                    <tr style="font-weight:bold; background:rgba(255,255,255,0.05);><td>LÍQUIDO ANUAL</td><td style="text-align:right;color:#ef4444;">R$ ${cltAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#10b981;">R$ ${pjAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td style="text-align:right;color:#38bdf8;">R$ ${coopAnual.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td></tr>
                `;
                
                // Veredito
                const breakEvenPj = (cltAnual / 12) / (1 - pjTax) + pjCont;
                let best = 'PJ';
                if(cltAnual > pjAnual && cltAnual > coopAnual) best = 'CLT';
                else if(coopAnual > pjAnual) best = 'Cooperado';
                
                let text = `O modelo ideal para você é o <strong>${best}</strong>. `;
                if(best === 'PJ') {
                    const diff = pjAnual - cltAnual;
                    text += `Você ganhará <strong>R$ ${diff.toLocaleString('pt-BR', {maximumFractionDigits:0})} a mais por ano</strong> se aceitar o PJ. `;
                } else if(best === 'CLT') {
                    const diff = cltAnual - pjAnual;
                    text += `O CLT ainda é mais vantajoso em <strong>R$ ${diff.toLocaleString('pt-BR', {maximumFractionDigits:0})} anuais</strong> devido aos benefícios e FGTS. `;
                }
                text += `O valor mínimo faturável em PJ para empatar com a sua proposta CLT atual é de <strong>R$ ${breakEvenPj.toLocaleString('pt-BR', {maximumFractionDigits:0})} por mês</strong>.`;
                document.getElementById('cpc-verdict').innerHTML = text;
            };
            
            setTimeout(() => window.runCpcSim(), 200);
        }
    },
    {
        id: 'financiamento_sac_price',
        category: 'financas',
        icon: 'fa-solid fa-house-laptop color-green',
        title: 'Simulador SAC vs Price',
        desc: 'Amortizações extraordinárias e comparação técnica de tabelas de financiamento imobiliário.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'fin-calculator')">Simulação</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'fin-amort-table')">Tabela SAC vs Price</button>
                </div>
                
                <div id="fin-calculator" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Valor Financiado (R$)</label>
                            <input type="number" id="fin-pv" class="form-control-flat" value="300000">
                        </div>
                        <div class="form-group-flat">
                            <label>Taxa de Juros Anual Nominal (%)</label>
                            <input type="number" id="fin-rate-year" class="form-control-flat" value="10.5" step="0.1">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Prazo Total (meses)</label>
                            <input type="number" id="fin-n" class="form-control-flat" value="360">
                        </div>
                        <div class="form-group-flat">
                            <label>Amortização Extra Mensal (R$)</label>
                            <input type="number" id="fin-extra" class="form-control-flat" value="1000">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="window.runFinancSim()" style="width: 100%; margin-top: 0.5rem;">Simular Amortização</button>
                    
                    <div id="fin-results" style="margin-top: 1.25rem; display: none; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Total de Juros (Normal)</span>
                                <div class="st-metric-val" id="fin-juros-normal" style="color: #ef4444; font-size: 1.15rem;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Total de Juros (Amortizado)</span>
                                <div class="st-metric-val" id="fin-juros-amort" style="color: #10b981; font-size: 1.15rem;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Economia Gerada</span>
                                <div class="st-metric-val" id="fin-saving" style="color: #eab308; font-size: 1.15rem;">R$ 0,00</div>
                            </div>
                        </div>
                        
                        <div class="glass-card" style="padding: 1rem; border-left: 4px solid #10b981; background: rgba(16,185,129,0.05); font-size: 0.8rem; line-height: 1.4;">
                            <p id="fin-text-summary"></p>
                        </div>
                    </div>
                </div>
                
                <div id="fin-amort-table" class="st-tab-content" style="display: none;">
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                        <label style="font-size:0.85rem; color:#fff;">Sistema Visualizado:</label>
                        <select id="fin-table-system" class="form-control-flat" style="width: auto; padding: 0.25rem 1.5rem;" onchange="window.renderAmortTable()">
                            <option value="SAC">SAC (Amortização Constante)</option>
                            <option value="PRICE">Tabela Price (Parcela Fixa)</option>
                        </select>
                    </div>
                    <div style="max-height: 250px; overflow-y: auto;">
                        <table class="table-flat" style="width: 100%; font-size: 0.75rem;">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th style="text-align: right;">Prestação</th>
                                    <th style="text-align: right;">Juros</th>
                                    <th style="text-align: right;">Amortizado</th>
                                    <th style="text-align: right;">Saldo Devedor</th>
                                </tr>
                            </thead>
                            <tbody id="fin-table-body">
                                <!-- Injetado dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            window.runFinancSim = () => {
                const pv = parseFloat(document.getElementById('fin-pv').value) || 0;
                const rateY = parseFloat(document.getElementById('fin-rate-year').value) || 0;
                const n = parseInt(document.getElementById('fin-n').value) || 0;
                const extra = parseFloat(document.getElementById('fin-extra').value) || 0;
                
                if(pv <= 0 || rateY <= 0 || n <= 0) return;
                
                const rateM = (1 + rateY/100)**(1/12) - 1;
                
                // Simulação SAC (Normal)
                let balanceNormal = pv;
                let jurosNormal = 0;
                const amortConst = pv / n;
                for(let i=0; i<n; i++) {
                    const j = balanceNormal * rateM;
                    jurosNormal += j;
                    balanceNormal -= amortConst;
                }
                
                // Simulação SAC (Com Amortização Extraordinária)
                let balanceAmort = pv;
                let jurosAmort = 0;
                let monthsSaved = 0;
                let actualMonths = 0;
                
                while(balanceAmort > 0 && actualMonths < 600) {
                    const j = balanceAmort * rateM;
                    jurosAmort += j;
                    
                    const amort = Math.min(amortConst + extra, balanceAmort);
                    balanceAmort -= amort;
                    actualMonths++;
                    if(balanceAmort <= 0) break;
                }
                
                monthsSaved = n - actualMonths;
                const saving = jurosNormal - jurosAmort;
                
                document.getElementById('fin-results').style.display = 'flex';
                document.getElementById('fin-juros-normal').innerText = 'R$ ' + Math.round(jurosNormal).toLocaleString('pt-BR');
                document.getElementById('fin-juros-amort').innerText = 'R$ ' + Math.round(jurosAmort).toLocaleString('pt-BR');
                document.getElementById('fin-saving').innerText = 'R$ ' + Math.round(saving).toLocaleString('pt-BR');
                
                document.getElementById('fin-text-summary').innerHTML = `Fazendo aportes extras de <strong>R$ ${extra.toLocaleString('pt-BR')}</strong> mensalmente, você reduzirá o prazo do financiamento de <strong>${n}</strong> para apenas <strong>${actualMonths} meses</strong> (economia de <strong>${monthsSaved} meses</strong> ou <strong>${(monthsSaved/12).toFixed(1)} anos</strong> a menos pagando prestações). A economia total estimada é de <strong>R$ ${saving.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</strong> apenas em juros evitados.`;
                
                window.renderAmortTable();
            };
            
            window.renderAmortTable = () => {
                const pv = parseFloat(document.getElementById('fin-pv').value) || 0;
                const rateY = parseFloat(document.getElementById('fin-rate-year').value) || 0;
                const n = parseInt(document.getElementById('fin-n').value) || 0;
                const system = document.getElementById('fin-table-system').value;
                
                if(pv <= 0 || rateY <= 0 || n <= 0) return;
                const rateM = (1 + rateY/100)**(1/12) - 1;
                
                const tbody = document.getElementById('fin-table-body');
                tbody.innerHTML = '';
                
                let balance = pv;
                const rowsToShow = [];
                
                if(system === 'SAC') {
                    const amort = pv / n;
                    for(let i=1; i<=n; i++) {
                        const j = balance * rateM;
                        const p = amort + j;
                        balance -= amort;
                        if(i <= 10 || i === n || i % 60 === 0) {
                            rowsToShow.push({ m: i, p, j, a: amort, bal: Math.max(0, balance) });
                        }
                    }
                } else {
                    const p = (pv * rateM) / (1 - (1 + rateM)**(-n));
                    for(let i=1; i<=n; i++) {
                        const j = balance * rateM;
                        const amort = p - j;
                        balance -= amort;
                        if(i <= 10 || i === n || i % 60 === 0) {
                            rowsToShow.push({ m: i, p, j, a: amort, bal: Math.max(0, balance) });
                        }
                    }
                }
                
                rowsToShow.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.m === n ? 'Último (' + row.m + ')' : 'Parcela ' + row.m}</td>
                        <td style="text-align:right;">R$ ${row.p.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                        <td style="text-align:right;color:#ef4444;">R$ ${row.j.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                        <td style="text-align:right;color:#10b981;">R$ ${row.a.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                        <td style="text-align:right;">R$ ${row.bal.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                    `;
                    tbody.appendChild(tr);
                });
            };
            
            setTimeout(() => window.runFinancSim(), 200);
        }
    },
    {
        id: 'carne_leao',
        category: 'trabalho',
        icon: 'fa-solid fa-receipt color-blue',
        title: 'Carnê-Leão & Autônomos',
        desc: 'Controle de livro caixa digital de despesas profissionais e apuração do carnê-leão mensal.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'cl-sim')">Apuração Mensal</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'cl-livro')">Livro Caixa</button>
                </div>
                
                <div id="cl-sim" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Receita Autônoma Bruta (R$)</label>
                            <input type="number" id="cl-receita" class="form-control-flat" value="6500">
                        </div>
                        <div class="form-group-flat">
                            <label>Número de Dependentes</label>
                            <input type="number" id="cl-depend" class="form-control-flat" value="0">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Outras Deduções (INSS Autônomo)</label>
                            <input type="number" id="cl-deduc" class="form-control-flat" value="0">
                        </div>
                        <div class="form-group-flat" style="display: flex; align-items: flex-end;">
                            <button class="btn btn-primary" onclick="window.calcCarneLeao()" style="width: 100%;">Apurar Imposto</button>
                        </div>
                    </div>
                    
                    <div id="cl-results" style="margin-top: 1.25rem; display: none; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Base de Cálculo</span>
                                <div class="st-metric-val" id="cl-val-base" style="color: #fff;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Imposto Devido (DARF)</span>
                                <div class="st-metric-val" id="cl-val-imposto" style="color: #ef4444;">R$ 0,00</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Alíquota Efetiva</span>
                                <div class="st-metric-val" id="cl-val-efetiva" style="color: #38bdf8;">0.0%</div>
                            </div>
                        </div>
                        
                        <div class="glass-card" style="padding: 1rem; font-size: 0.8rem; line-height: 1.4;">
                            <strong style="color: #fff; font-size: 0.85rem;">Detalhamento da Guia DARF:</strong>
                            <p style="color: var(--text-secondary); margin-top: 0.25rem;">
                                Código da Receita: <strong>0190</strong> (Carnê-Leão Mensal)<br>
                                Vencimento: Último dia útil do mês subsequente.<br>
                                Despesas Deduzidas do Livro Caixa: <strong id="cl-total-despesas-text">R$ 0,00</strong>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div id="cl-livro" class="st-tab-content" style="display: none;">
                    <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: #fff;">Despesas Dedutíveis (Livro Caixa)</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem;">Lojas, escritórios, internet e despesas operacionais necessárias para exercer sua atividade.</p>
                    
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="cl-desp-nome" class="form-control-flat" placeholder="Ex: Assinatura Software Co-working" style="flex: 2;">
                        <input type="number" id="cl-desp-val" class="form-control-flat" placeholder="Valor R$" style="flex: 1;">
                        <button class="btn btn-secondary" onclick="window.addClDespesa()"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    
                    <div style="max-height: 150px; overflow-y: auto; margin-bottom: 1rem;">
                        <ul id="cl-despesas-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem;">
                            <!-- Injetado dinamicamente -->
                        </ul>
                    </div>
                    <div style="text-align: right; font-weight: bold; font-size: 0.85rem; color: #fff;">
                        Total Livro Caixa: <span id="cl-despesas-total" style="color: #38bdf8;">R$ 0,00</span>
                    </div>
                </div>
            `;
            
            let despesas = [
                { name: 'Licença de Software e IDEs', amount: 150 },
                { name: 'Acesso Internet Comercial', amount: 120 }
            ];
            
            window.renderClDespesas = () => {
                const listEl = document.getElementById('cl-despesas-list');
                const totalEl = document.getElementById('cl-despesas-total');
                if(!listEl || !totalEl) return;
                
                listEl.innerHTML = '';
                let total = 0;
                despesas.forEach((d, idx) => {
                    total += d.amount;
                    const li = document.createElement('li');
                    li.style.cssText = 'display:flex; justify-content:space-between; background:rgba(255,255,255,0.02); padding:0.5rem; border-radius:6px; border: 1px solid rgba(255,255,255,0.05); align-items:center; font-size: 0.8rem;';
                    li.innerHTML = `
                        <span>${d.name}</span>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span style="color:#10b981; font-weight:bold;">R$ ${d.amount.toFixed(2)}</span>
                            <button onclick="window.removeClDesp(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    listEl.appendChild(li);
                });
                
                totalEl.innerText = 'R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                const summaryText = document.getElementById('cl-total-despesas-text');
                if(summaryText) summaryText.innerText = 'R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});
            };
            
            window.addClDespesa = () => {
                const nameInput = document.getElementById('cl-desp-nome');
                const valInput = document.getElementById('cl-desp-val');
                const name = nameInput.value.trim();
                const amount = parseFloat(valInput.value) || 0;
                
                if(!name || amount <= 0) return;
                despesas.push({ name, amount });
                nameInput.value = '';
                valInput.value = '';
                window.renderClDespesas();
                window.calcCarneLeao();
            };
            
            window.removeClDesp = (idx) => {
                despesas.splice(idx, 1);
                window.renderClDespesas();
                window.calcCarneLeao();
            };
            
            window.calcCarneLeao = () => {
                const receita = parseFloat(document.getElementById('cl-receita').value) || 0;
                const dependented = parseInt(document.getElementById('cl-depend').value) || 0;
                const outrasDeducoes = parseFloat(document.getElementById('cl-deduc').value) || 0;
                
                const totalDespesas = despesas.reduce((s, d) => s + d.amount, 0);
                const deducDependente = dependented * 189.59;
                
                const baseCalculo = Math.max(0, receita - totalDespesas - deducDependente - outrasDeducoes);
                
                // Tabela progressiva IRPF
                let imposto = 0;
                if(baseCalculo <= 2259.20) imposto = 0;
                else if(baseCalculo <= 2828.65) imposto = (baseCalculo * 0.075) - 169.44;
                else if(baseCalculo <= 3751.06) imposto = (baseCalculo * 0.15) - 381.44;
                else if(baseCalculo <= 4664.68) imposto = (baseCalculo * 0.225) - 662.77;
                else imposto = (baseCalculo * 0.275) - 896.00;
                
                const alicEfetiva = receita > 0 ? (imposto / receita) * 100 : 0;
                
                document.getElementById('cl-results').style.display = 'flex';
                document.getElementById('cl-val-base').innerText = 'R$ ' + baseCalculo.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                document.getElementById('cl-val-imposto').innerText = 'R$ ' + imposto.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                document.getElementById('cl-val-efetiva').innerText = alicEfetiva.toFixed(2) + '%';
            };
            
            setTimeout(() => {
                window.renderClDespesas();
                window.calcCarneLeao();
            }, 200);
        }
    },
    {
        id: 'trophy_hub',
        category: 'financas',
        icon: 'fa-solid fa-trophy color-yellow',
        title: 'Trophy Hub & Conquistas',
        desc: 'Monitore conquistas financeiras e ganhe troféus à medida que bate metas de horas e aportes.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'trophy-list')">Conquistas Recentes</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'trophy-stats')">Diagnóstico e Estatísticas</button>
                </div>
                
                <div id="trophy-list" class="st-tab-content">
                    <div id="trophies-container" style="display: grid; grid-template-columns: 1fr; gap: 0.75rem; max-height: 350px; overflow-y: auto; padding-right: 5px;">
                        <!-- Injetado dinamicamente -->
                    </div>
                </div>
                
                <div id="trophy-stats" class="st-tab-content" style="display: none;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem;">
                        <h4 style="font-size:0.95rem; color:#fff; margin-bottom: 0.5rem;">Resumo de Produtividade</h4>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.8rem;">
                            <span style="color:var(--text-secondary)">Total de Horas Trabalhadas:</span>
                            <span style="font-weight:bold; color:#fff;" id="stats-total-hours">0,00 h</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.8rem;">
                            <span style="color:var(--text-secondary)">Faturamento Total Acumulado:</span>
                            <span style="font-weight:bold; color:#10b981;" id="stats-total-earnings">R$ 0,00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                            <span style="color:var(--text-secondary)">Aportes e Investimentos:</span>
                            <span style="font-weight:bold; color:#38bdf8;" id="stats-total-invested">R$ 0,00</span>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="padding:1rem; border-left:4px solid #38bdf8;">
                        <strong style="color: #fff; font-size: 0.85rem;">Próxima Meta Sugerida:</strong>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;" id="stats-next-goal">Carregando sugestão...</p>
                    </div>
                </div>
            `;
            
            window.renderTrophyHub = async () => {
                // Cálculo das conquistas com base no state global do aplicativo
                let totalHours = 0;
                let totalGanhos = 0;
                let totalInvested = 0;
                
                if (window.state) {
                    if (window.state.rows) {
                        totalHours = window.state.rows.reduce((sum, r) => sum + (parseFloat(r.horas) || 0), 0);
                    }
                    totalGanhos = window.state.totalEarningsSinceJan || 0;
                    totalInvested = window.state.totalInvested || 0;
                    if (totalInvested === 0 && window.state.investEntries) {
                        totalInvested = window.state.investEntries.reduce((s, e) => s + (e.amount || 0), 0);
                    }
                }
                
                const achievements = [
                    { id: 'pe_de_meia', title: 'Pé de Meia Iniciante', desc: 'Aporte de pelo menos R$ 500 em investimentos.', icon: 'fa-solid fa-piggy-bank', target: 500, current: totalInvested },
                    { id: 'investidor_audaz', title: 'Investidor Audaz', desc: 'Aporte acumulado de R$ 5.000 em investimentos.', icon: 'fa-solid fa-chart-line', target: 5000, current: totalInvested },
                    { id: 'patrimonio_ouro', title: 'Patrimônio de Ouro', desc: 'Aporte acumulado de R$ 20.000 em investimentos.', icon: 'fa-solid fa-gem', target: 20000, current: totalInvested },
                    { id: 'guerreiro_horas', title: 'Guerreiro do Ponto', desc: 'Soma de 100 horas trabalhadas registradas.', icon: 'fa-solid fa-user-clock', target: 100, current: totalHours },
                    { id: 'elite_prod', title: 'Elite da Produtividade', desc: 'Soma de 200 horas trabalhadas registradas.', icon: 'fa-solid fa-crown', target: 200, current: totalHours },
                    { id: 'faturamento_diamante', title: 'Faturamento Diamante', desc: 'Ganhos totais acumulados de R$ 15.000.', icon: 'fa-solid fa-award', target: 15000, current: totalGanhos }
                ];
                
                const container = document.getElementById('trophies-container');
                if(!container) return;
                container.innerHTML = '';
                
                achievements.forEach(item => {
                    const isUnlocked = item.current >= item.target;
                    const pct = Math.min(100, (item.current / item.target) * 100);
                    
                    const card = document.createElement('div');
                    card.className = `st-trophy-card ${isUnlocked ? 'unlocked' : ''}`;
                    card.innerHTML = `
                        <div class="st-trophy-icon"><i class="${item.icon}"></i></div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem; color:#fff;">${item.title}</strong>
                                <span style="font-size:0.7rem; color:${isUnlocked ? '#eab308':'#64748b'}">${isUnlocked ? 'Desbloqueado!':'Pendente'}</span>
                            </div>
                            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0.2rem 0 0.4rem 0;">${item.desc}</p>
                            <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                <div style="width:${pct}%; height:100%; background:${isUnlocked ? '#eab308':'#3b82f6'};"></div>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
                
                // Atualizar painel de Estatísticas
                const hoursEl = document.getElementById('stats-total-hours');
                const earningsEl = document.getElementById('stats-total-earnings');
                const investEl = document.getElementById('stats-total-invested');
                const nextGoalEl = document.getElementById('stats-next-goal');
                
                if (hoursEl) hoursEl.innerText = `${totalHours.toFixed(1)} h`;
                if (earningsEl) earningsEl.innerText = 'R$ ' + totalGanhos.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                if (investEl) investEl.innerText = 'R$ ' + totalInvested.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                
                if (nextGoalEl) {
                    const nextLocked = achievements.find(a => a.current < a.target);
                    if(nextLocked) {
                        nextGoalEl.innerHTML = `Alcance <strong>${nextLocked.target}</strong> no objetivo <strong>${nextLocked.title}</strong> (Faltam <strong>${(nextLocked.target - nextLocked.current).toFixed(0)}</strong>).`;
                    } else {
                        nextGoalEl.innerText = "Parabéns! Você alcançou todas as conquistas de elite financeiras.";
                    }
                }
            };
            
            setTimeout(() => window.renderTrophyHub(), 200);
        }
    },
    {
        id: 'contrato_gerador',
        category: 'trabalho',
        icon: 'fa-solid fa-file-signature color-blue',
        title: 'Gerador de Contratos de Elite',
        desc: 'Elabore contratos juridicamente válidos de prestação de serviços com cálculos tributários embutidos.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'contract-form')">Formulário</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'contract-view')">Minuta do Contrato</button>
                </div>
                
                <div id="contract-form" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Nome do Contratante (Cliente)</label>
                            <input type="text" id="ct-client" class="form-control-flat" value="Organizações ACME S.A.">
                        </div>
                        <div class="form-group-flat">
                            <label>Nome do Contratado (Prestador)</label>
                            <input type="text" id="ct-provider" class="form-control-flat" value="André Turco Finanças">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Objeto do Serviço</label>
                            <input type="text" id="ct-service" class="form-control-flat" value="Consultoria Estratégica em Planejamento Financeiro e Otimização de Custos">
                        </div>
                        <div class="form-group-flat">
                            <label>Valor Total do Contrato (R$)</label>
                            <input type="number" id="ct-value" class="form-control-flat" value="15000">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Prazo de Conclusão (dias)</label>
                            <input type="number" id="ct-deadline" class="form-control-flat" value="90">
                        </div>
                        <div class="form-group-flat">
                            <label>Multa por Atraso (%)</label>
                            <input type="number" id="ct-multa" class="form-control-flat" value="10">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="window.generateContract()" style="width: 100%; margin-top: 0.5rem;">Gerar Contrato Legal</button>
                </div>
                
                <div id="contract-view" class="st-tab-content" style="display: none;">
                    <div class="glass-card" id="ct-text-container" style="padding: 1.5rem; background: #0f172a; border-radius: 8px; color: #cbd5e1; font-family: 'Courier New', Courier, monospace; font-size: 0.8rem; max-height: 250px; overflow-y: auto; line-height: 1.5; white-space: pre-wrap; border: 1px solid rgba(255,255,255,0.06);">
                        Preencha o formulário para visualizar o contrato.
                    </div>
                    <button class="btn btn-secondary" onclick="window.copyContractToClipboard()" style="width: 100%; margin-top: 1rem;"><i class="fa-solid fa-copy"></i> Copiar Minuta Completa</button>
                </div>
            `;
            
            window.generateContract = () => {
                const client = document.getElementById('ct-client').value.trim();
                const provider = document.getElementById('ct-provider').value.trim();
                const service = document.getElementById('ct-service').value.trim();
                const val = parseFloat(document.getElementById('ct-value').value) || 0;
                const deadline = document.getElementById('ct-deadline').value;
                const multa = document.getElementById('ct-multa').value;
                
                const today = new Date().toLocaleDateString('pt-BR');
                
                const template = `INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS

CONTRATANTE: ${client}, doravante denominado simplesmente CONTRATANTE;
CONTRATADO: ${provider}, doravante denominado simplesmente CONTRATADO;

As partes acima qualificadas têm, entre si, justo e acordado o presente contrato mediante as seguintes cláusulas:

CLÁUSULA PRIMEIRA - DO OBJETO:
O CONTRATADO compromete-se a prestar ao CONTRATANTE os serviços descritos como: ${service}.

CLÁUSULA SEGUNDA - DO PREÇO E DA FORMA DE PAGAMENTO:
Pela execução dos serviços pactuados, o CONTRATANTE pagará ao CONTRATADO o valor total de R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}, divididos de acordo com as entregas acordadas.

CLÁUSULA TERCEIRA - DO PRAZO:
O prazo total estimado para a conclusão e entrega definitiva dos serviços é de ${deadline} dias, com início imediato a partir da assinatura.

CLÁUSULA QUARTA - DAS MULTAS:
Em caso de inadimplemento ou descumprimento de prazos contratuais sem justificativa de força maior, incidirá multa penal fixada em ${multa}% do valor total do contrato sobre a parte inadimplente.

CLÁUSULA QUINTA - DA PROPRIEDADE INTELECTUAL:
Todos os materiais, códigos e relatórios gerados em decorrência deste contrato pertencerão em caráter de exclusividade ao CONTRATANTE mediante a quitação integral das parcelas.

CLÁUSULA SEXTA - DO FORO:
Fica eleito o foro da comarca da capital do estado do domicílio das partes para dirimir eventuais dúvidas relativas a este contrato.

E, por estarem justos e contratados, assinam o presente instrumento.

Data de Emissão: ${today}`;
                
                document.getElementById('ct-text-container').innerText = template;
                
                // Trocar para a aba visualização automaticamente
                const nav = document.querySelector('.st-tabs-nav');
                const btnView = nav.querySelectorAll('.st-tab-btn')[1];
                window.switchStTab(btnView, 'contract-view');
            };
            
            window.copyContractToClipboard = () => {
                const text = document.getElementById('ct-text-container').innerText;
                navigator.clipboard.writeText(text).then(() => {
                    alert('Copiado com sucesso para a área de transferência!');
                }).catch(e => {
                    alert('Erro ao copiar!');
                });
            };
        }
    },
    {
        id: 'precificacao_hora',
        category: 'trabalho',
        icon: 'fa-solid fa-hourglass-half color-blue',
        title: 'Precificação de Hora Ideal',
        desc: 'Descubra quanto cobrar por hora baseado em despesas fixas, impostos e rentabilidade real esperada.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'ph-custos')">Custos & Metas</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'ph-horas')">Horas Úteis</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'ph-preco')">Valor de Venda</button>
                </div>
                
                <div id="ph-custos" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Pro labore / Salário Desejado (R$)</label>
                            <input type="number" id="ph-target-sal" class="form-control-flat" value="10000">
                        </div>
                        <div class="form-group-flat">
                            <label>Internet + Softwares + Ferramentas (R$)</label>
                            <input type="number" id="ph-tools-cost" class="form-control-flat" value="500">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Reserva de Emergência / Investimentos (R$)</label>
                            <input type="number" id="ph-reserve" class="form-control-flat" value="1500">
                        </div>
                        <div class="form-group-flat">
                            <label>Outras Despesas de Escritório (R$)</label>
                            <input type="number" id="ph-office-cost" class="form-control-flat" value="400">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.switchTabToPhHoras()" style="width: 100%; margin-top: 0.5rem;">Avançar para Horas Úteis</button>
                </div>
                
                <div id="ph-horas" class="st-tab-content" style="display: none;">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Horas de Trabalho p/ Dia</label>
                            <input type="number" id="ph-hours-day" class="form-control-flat" value="6">
                        </div>
                        <div class="form-group-flat">
                            <label>Dias de Trabalho p/ Semana</label>
                            <input type="number" id="ph-days-week" class="form-control-flat" value="5">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Semanas de Férias por Ano</label>
                            <input type="number" id="ph-vacation" class="form-control-flat" value="4">
                        </div>
                        <div class="form-group-flat">
                            <label>Eficiência Operacional (%)</label>
                            <input type="number" id="ph-efficiency" class="form-control-flat" value="80">
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.calcHoraIdeal()" style="width: 100%; margin-top: 0.5rem;">Calcular Preço de Venda</button>
                </div>
                
                <div id="ph-preco" class="st-tab-content" style="display: none;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <div class="st-card-metric">
                            <span style="font-size: 0.75rem; color: var(--text-secondary)">Custo da Hora (Seco)</span>
                            <div class="st-metric-val" id="ph-val-custo" style="color: #ef4444;">R$ 0,00</div>
                        </div>
                        <div class="st-card-metric">
                            <span style="font-size: 0.75rem; color: var(--text-secondary)">Cobrar por Hora (Margem 20%)</span>
                            <div class="st-metric-val" id="ph-val-sugerido" style="color: #10b981;">R$ 0,00</div>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="padding: 1.25rem; font-size: 0.8rem; line-height: 1.4; margin-top: 1rem; border-left: 4px solid #eab308;">
                        <strong style="color: #fff; font-size: 0.85rem;">Distribuição das Horas:</strong>
                        <p style="color: var(--text-secondary); margin-top: 0.25rem;" id="ph-detail-text">
                            Horas produtivas mensais estimadas...
                        </p>
                    </div>
                </div>
            `;
            
            window.switchTabToPhHoras = () => {
                const nav = document.querySelector('.st-tabs-nav');
                const btnView = nav.querySelectorAll('.st-tab-btn')[1];
                window.switchStTab(btnView, 'ph-horas');
            };
            
            window.calcHoraIdeal = () => {
                const sal = parseFloat(document.getElementById('ph-target-sal').value) || 0;
                const tools = parseFloat(document.getElementById('ph-tools-cost').value) || 0;
                const reserve = parseFloat(document.getElementById('ph-reserve').value) || 0;
                const office = parseFloat(document.getElementById('ph-office-cost').value) || 0;
                
                const hoursD = parseFloat(document.getElementById('ph-hours-day').value) || 0;
                const daysW = parseFloat(document.getElementById('ph-days-week').value) || 0;
                const vac = parseFloat(document.getElementById('ph-vacation').value) || 0;
                const eff = (parseFloat(document.getElementById('ph-efficiency').value) || 0) / 100;
                
                const totalCustos = sal + tools + reserve + office;
                
                // Horas no ano
                const totalWeeks = 52 - vac;
                const potentialHours = totalWeeks * daysW * hoursD;
                // Horas reais com base no fator de eficiência (reuniões, admin, etc.)
                const billableHoursYear = potentialHours * eff;
                const billableHoursMonth = billableHoursYear / 12;
                
                const custoHora = totalCustos / billableHoursMonth;
                const precoVenda = custoHora * 1.25; // Adicionando 25% de margem de segurança/lucro
                
                document.getElementById('ph-val-custo').innerText = 'R$ ' + custoHora.toFixed(2);
                document.getElementById('ph-val-sugerido').innerText = 'R$ ' + precoVenda.toFixed(2);
                
                document.getElementById('ph-detail-text').innerHTML = `
                    Total de custos mensais a cobrir: <strong>R$ ${totalCustos.toLocaleString('pt-BR')}</strong>.<br>
                    Horas faturáveis estimadas por mês: <strong>${billableHoursMonth.toFixed(1)}h</strong> (considerando eficiência de ${(eff*100).toFixed(0)}%).<br>
                    Para atingir sua meta e manter a estrutura financeira saudável, seu valor de venda hora mínima deve ser de <strong>R$ ${precoVenda.toFixed(2)}</strong>.
                `;
                
                const nav = document.querySelector('.st-tabs-nav');
                const btnView = nav.querySelectorAll('.st-tab-btn')[2];
                window.switchStTab(btnView, 'ph-preco');
            };
        }
    },
    {
        id: 'pomodoro_audio',
        category: 'produtividade',
        icon: 'fa-solid fa-headset color-red',
        title: 'Pomodoro & Audio Hub',
        desc: 'Timer Pomodoro integrado a um gerador de frequências sonoras ambientais em tempo real.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'pomo-timer-view')">Pomodoro</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'audio-foco-view')">Sons para Concentração</button>
                </div>
                
                <div id="pomo-timer-view" class="st-tab-content" style="text-align: center; padding: 1rem 0;">
                    <div style="font-size: 4.5rem; font-weight: 800; font-family: monospace; color: #fff; line-height: 1;" id="pomo-time-display">25:00</div>
                    <div id="pomo-status-label" style="color: #ef4444; font-weight: bold; margin-bottom: 1.5rem; font-size: 0.95rem;">FOCO DE ELITE</div>
                    
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
                        <button class="btn btn-primary" onclick="window.startPomoTimer()"><i class="fa-solid fa-play"></i> Iniciar</button>
                        <button class="btn btn-secondary" onclick="window.pausePomoTimer()"><i class="fa-solid fa-pause"></i> Pausar</button>
                        <button class="btn btn-danger" onclick="window.resetPomoTimer()" style="background:#ef4444;"><i class="fa-solid fa-rotate-right"></i> Reset</button>
                    </div>
                </div>
                
                <div id="audio-foco-view" class="st-tab-content" style="display: none;">
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem;">Ligue os geradores sonoros sintéticos offline para abafar distrações:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <!-- Ruído Marrom -->
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 0.5rem 1rem; border-radius: 8px; border:1px solid rgba(255,255,255,0.05);">
                            <span style="font-size: 0.85rem; color: #fff;"><i class="fa-solid fa-wind"></i> Ruído Marrom (Foco)</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="range" id="vol-brown" min="0" max="1" step="0.05" value="0.5" style="width: 80px;" oninput="window.changeNoiseVolume('brown', this.value)">
                                <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem;" onclick="window.toggleNoise('brown')"><i class="fa-solid fa-play" id="btn-icon-brown"></i></button>
                            </div>
                        </div>
                        
                        <!-- Ruído Pink -->
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 0.5rem 1rem; border-radius: 8px; border:1px solid rgba(255,255,255,0.05);">
                            <span style="font-size: 0.85rem; color: #fff;"><i class="fa-solid fa-water"></i> Chuva Sintética</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="range" id="vol-rain" min="0" max="1" step="0.05" value="0.4" style="width: 80px;" oninput="window.changeNoiseVolume('rain', this.value)">
                                <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem;" onclick="window.toggleNoise('rain')"><i class="fa-solid fa-play" id="btn-icon-rain"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Lógica Pomodoro
            let duration = 25 * 60;
            let timerRunning = false;
            let timerId = null;
            
            window.updatePomoDisplay = () => {
                const m = Math.floor(duration / 60).toString().padStart(2, '0');
                const s = (duration % 60).toString().padStart(2, '0');
                const display = document.getElementById('pomo-time-display');
                if(display) display.innerText = `${m}:${s}`;
            };
            
            window.startPomoTimer = () => {
                if(timerRunning) return;
                timerRunning = true;
                timerId = setInterval(() => {
                    if(duration > 0) {
                        duration--;
                        window.updatePomoDisplay();
                    } else {
                        clearInterval(timerId);
                        timerRunning = false;
                        alert('Tempo de Foco de Elite concluído!');
                        duration = 25 * 60;
                        window.updatePomoDisplay();
                    }
                }, 1000);
            };
            
            window.pausePomoTimer = () => {
                clearInterval(timerId);
                timerRunning = false;
            };
            
            window.resetPomoTimer = () => {
                clearInterval(timerId);
                timerRunning = false;
                duration = 25 * 60;
                window.updatePomoDisplay();
            };
            
            // Lógica Áudio
            let playingType = null;
            
            window.toggleNoise = (type) => {
                if (playingType === type) {
                    window.stopNoiseAudio();
                    playingType = null;
                    document.getElementById(`btn-icon-${type}`).className = 'fa-solid fa-play';
                } else {
                    if(playingType) {
                        window.stopNoiseAudio();
                        document.getElementById(`btn-icon-${playingType}`).className = 'fa-solid fa-play';
                    }
                    const vol = parseFloat(document.getElementById(`vol-${type}`).value);
                    window.playNoiseAudio(type, vol);
                    playingType = type;
                    document.getElementById(`btn-icon-${type}`).className = 'fa-solid fa-stop';
                }
            };
            
            window.changeNoiseVolume = (type, val) => {
                if(playingType === type && gainNode) {
                    gainNode.gain.value = parseFloat(val);
                }
            };
            
            window.playNoiseAudio = (type, volume) => {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                
                const bufferSize = 2 * audioCtx.sampleRate;
                const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                
                if (type === 'brown') {
                    let lastOut = 0.0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        output[i] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = output[i];
                        output[i] *= 3.5;
                    }
                } else if (type === 'rain') {
                    let lastOut = 0.0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        let val = (lastOut + (0.015 * white)) / 1.015;
                        lastOut = val;
                        if (Math.random() < 0.0005) {
                            val += (Math.random() * 0.4) - 0.2;
                        }
                        output[i] = val * 3.0;
                    }
                }
                
                const noiseSource = audioCtx.createBufferSource();
                noiseSource.buffer = noiseBuffer;
                noiseSource.loop = true;
                
                gainNode = audioCtx.createGain();
                gainNode.gain.value = volume;
                
                noiseSource.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                noiseSource.start();
                currentNoiseNode = noiseSource;
            };
            
            window.stopNoiseAudio = () => {
                if (currentNoiseNode) {
                    try { currentNoiseNode.stop(); } catch(e) {}
                    currentNoiseNode = null;
                }
            };
        }
    },
    {
        id: 'orcamento_503020',
        category: 'financas',
        icon: 'fa-solid fa-chart-pie color-green',
        title: 'Orçamento 50/30/20 Hub',
        desc: 'Monitore seus gastos com base nas regras financeiras de elite 50/30/20 e receba diagnóstico inteligente com roadmaps.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'o50-sim')">Simulador & Alocação</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'o50-diag')">Diagnóstico de Saúde</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'o50-chart-tab')">Gráfico Proporcional</button>
                </div>
                
                <div id="o50-sim" class="st-tab-content">
                    <div class="form-group-flat" style="margin-bottom: 1rem;">
                        <label>Sua Renda Mensal Líquida (R$)</label>
                        <input type="number" id="o50-renda" class="form-control-flat" value="5000" oninput="window.calc503020()">
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <label style="font-size:0.85rem; color:#fff; display:block; margin-bottom:0.5rem;">Cenários Pré-definidos:</label>
                        <select id="o50-preset" class="form-control-flat" onchange="window.loadO50Preset()">
                            <option value="custom">Customizado (Modifique abaixo)</option>
                            <option value="ideal" selected>Equilibrado / Ideal (50% / 30% / 20%)</option>
                            <option value="survival">Sobrevivência / Crise (70% / 20% / 10%)</option>
                            <option value="fire">Super Poupador / Rota FIRE (30% / 20% / 50%)</option>
                            <option value="unbalanced">Consumista / Desequilibrado (55% / 40% / 5%)</option>
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
                        <!-- Necessidades -->
                        <div style="padding: 0.75rem; background: rgba(244, 63, 94, 0.05); border-left: 4px solid #f43f5e; border-radius: 4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem; color:#fff;">Necessidades Essenciais</strong>
                                <span style="font-size: 0.75rem; color:#f43f5e; font-weight:bold;" id="o50-pct-ess-label">50%</span>
                            </div>
                            <input type="range" id="o50-slide-ess" min="0" max="100" value="50" style="width: 100%; margin: 0.5rem 0;" oninput="window.adjustO50Sliders('ess')">
                            <div style="display:flex; justify-content:space-between; font-size: 0.75rem; color: var(--text-secondary)">
                                <span>Aluguel, contas básicas, mercado, saúde</span>
                                <span id="o50-val-50" style="font-weight:bold; color:#fff;">R$ 2.500,00</span>
                            </div>
                        </div>
                        
                        <!-- Desejos -->
                        <div style="padding: 0.75rem; background: rgba(14, 165, 233, 0.05); border-left: 4px solid #0ea5e9; border-radius: 4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem; color:#fff;">Desejos Pessoais</strong>
                                <span style="font-size: 0.75rem; color:#0ea5e9; font-weight:bold;" id="o50-pct-des-label">30%</span>
                            </div>
                            <input type="range" id="o50-slide-des" min="0" max="100" value="30" style="width: 100%; margin: 0.5rem 0;" oninput="window.adjustO50Sliders('des')">
                            <div style="display:flex; justify-content:space-between; font-size: 0.75rem; color: var(--text-secondary)">
                                <span>Lazer, jantares, assinaturas, compras</span>
                                <span id="o50-val-30" style="font-weight:bold; color:#fff;">R$ 1.500,00</span>
                            </div>
                        </div>
                        
                        <!-- Poupança -->
                        <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.05); border-left: 4px solid #10b981; border-radius: 4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.85rem; color:#fff;">Poupança e Investimentos</strong>
                                <span style="font-size: 0.75rem; color:#10b981; font-weight:bold;" id="o50-pct-poup-label">20%</span>
                            </div>
                            <input type="range" id="o50-slide-poup" min="0" max="100" value="20" style="width: 100%; margin: 0.5rem 0;" oninput="window.adjustO50Sliders('poup')">
                            <div style="display:flex; justify-content:space-between; font-size: 0.75rem; color: var(--text-secondary)">
                                <span>Reserva de emergência, ações, previdência</span>
                                <span id="o50-val-20" style="font-weight:bold; color:#fff;">R$ 1.000,00</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="o50-diag" class="st-tab-content" style="display: none;">
                    <div class="glass-card" style="padding: 1.25rem; border-left: 4px solid #38bdf8; background:rgba(15,23,42,0.4);" id="o50-health-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                            <strong style="color: #fff; font-size: 0.95rem;">Perfil: <span id="o50-profile-name" style="color: #38bdf8;">Equilibrado</span></strong>
                            <span id="o50-profile-badge" class="st-badge st-badge-success">Excelente</span>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;" id="o50-profile-desc"></p>
                        
                        <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem;">
                            <h5 style="color:#fff; font-size:0.85rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-list-check color-blue"></i> Plano de Ação de Elite Recomendado:</h5>
                            <ul id="o50-roadmap-list" style="padding-left: 1.2rem; font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.4rem; line-height: 1.45;">
                                <!-- Injetado dinamicamente -->
                            </ul>
                        </div>
                    </div>
                </div>

                <div id="o50-chart-tab" class="st-tab-content" style="display: none;">
                    <div style="display:flex; justify-content:center; align-items:center; padding: 1rem 0; flex-direction:column; gap:1.5rem;">
                        <svg width="160" height="160" viewBox="0 0 160 160" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">
                            <circle cx="80" cy="80" r="60" fill="transparent" stroke="rgba(255,255,255,0.03)" stroke-width="18" />
                            <!-- Segmento Necessidades (Rose) -->
                            <circle id="donut-seg-ess" cx="80" cy="80" r="60" fill="transparent" stroke="#f43f5e" stroke-width="18" stroke-dasharray="376.99" stroke-dashoffset="376.99" transform="rotate(-90 80 80)" stroke-linecap="round" style="transition: stroke-dashoffset 0.4s ease, transform 0.4s ease;" />
                            <!-- Segmento Desejos (Sky Blue) -->
                            <circle id="donut-seg-des" cx="80" cy="80" r="60" fill="transparent" stroke="#0ea5e9" stroke-width="18" stroke-dasharray="376.99" stroke-dashoffset="376.99" transform="rotate(-90 80 80)" stroke-linecap="round" style="transition: stroke-dashoffset 0.4s ease, transform 0.4s ease;" />
                            <!-- Segmento Poupança (Emerald) -->
                            <circle id="donut-seg-poup" cx="80" cy="80" r="60" fill="transparent" stroke="#10b981" stroke-width="18" stroke-dasharray="376.99" stroke-dashoffset="376.99" transform="rotate(-90 80 80)" stroke-linecap="round" style="transition: stroke-dashoffset 0.4s ease, transform 0.4s ease;" />
                            <text x="80" y="85" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" id="donut-center-text">100%</text>
                        </svg>
                        
                        <div style="display:flex; gap:1.25rem; font-size:0.75rem; justify-content:center;">
                            <span style="color:#f43f5e;"><i class="fa-solid fa-circle" style="font-size:0.6rem;"></i> Essencial</span>
                            <span style="color:#0ea5e9;"><i class="fa-solid fa-circle" style="font-size:0.6rem;"></i> Desejos</span>
                            <span style="color:#10b981;"><i class="fa-solid fa-circle" style="font-size:0.6rem;"></i> Poupança</span>
                        </div>
                    </div>
                </div>
            `;
            
            let currentPreset = 'ideal';

            window.calc503020 = () => {
                const renda = parseFloat(document.getElementById('o50-renda').value) || 0;
                const ess = parseFloat(document.getElementById('o50-slide-ess').value);
                const des = parseFloat(document.getElementById('o50-slide-des').value);
                const poup = parseFloat(document.getElementById('o50-slide-poup').value);
                
                document.getElementById('o50-val-50').innerText = 'R$ ' + ((renda * ess) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                document.getElementById('o50-val-30').innerText = 'R$ ' + ((renda * des) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                document.getElementById('o50-val-20').innerText = 'R$ ' + ((renda * poup) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                
                window.updateO50Chart(ess, des, poup);
                window.updateO50Diagnosis(ess, des, poup);
            };

            window.adjustO50Sliders = (changed) => {
                document.getElementById('o50-preset').value = 'custom';
                
                let ess = parseInt(document.getElementById('o50-slide-ess').value);
                let des = parseInt(document.getElementById('o50-slide-des').value);
                let poup = parseInt(document.getElementById('o50-slide-poup').value);
                
                const total = ess + des + poup;
                if (total !== 100) {
                    const diff = 100 - total;
                    if (changed === 'ess') {
                        // Distribuir a diferença proporcionalmente nos outros dois
                        if (des + poup > 0) {
                            const ratioDes = des / (des + poup);
                            des = Math.max(0, Math.min(100, Math.round(des + diff * ratioDes)));
                            poup = Math.max(0, 100 - ess - des);
                        } else {
                            des = Math.round(diff / 2);
                            poup = 100 - ess - des;
                        }
                    } else if (changed === 'des') {
                        if (ess + poup > 0) {
                            const ratioEss = ess / (ess + poup);
                            ess = Math.max(0, Math.min(100, Math.round(ess + diff * ratioEss)));
                            poup = Math.max(0, 100 - ess - des);
                        } else {
                            ess = Math.round(diff / 2);
                            poup = 100 - ess - des;
                        }
                    } else if (changed === 'poup') {
                        if (ess + des > 0) {
                            const ratioEss = ess / (ess + des);
                            ess = Math.max(0, Math.min(100, Math.round(ess + diff * ratioEss)));
                            des = Math.max(0, 100 - ess - poup);
                        } else {
                            ess = Math.round(diff / 2);
                            des = 100 - ess - poup;
                        }
                    }
                    
                    document.getElementById('o50-slide-ess').value = ess;
                    document.getElementById('o50-slide-des').value = des;
                    document.getElementById('o50-slide-poup').value = poup;
                }
                
                document.getElementById('o50-pct-ess-label').innerText = `${ess}%`;
                document.getElementById('o50-pct-des-label').innerText = `${des}%`;
                document.getElementById('o50-pct-poup-label').innerText = `${poup}%`;
                
                window.calc503020();
            };

            window.loadO50Preset = () => {
                const preset = document.getElementById('o50-preset').value;
                if (preset === 'custom') return;
                
                let ess = 50, des = 30, poup = 20;
                if (preset === 'survival') {
                    ess = 70; des = 20; poup = 10;
                } else if (preset === 'fire') {
                    ess = 30; des = 20; poup = 50;
                } else if (preset === 'unbalanced') {
                    ess = 55; des = 40; poup = 5;
                }
                
                document.getElementById('o50-slide-ess').value = ess;
                document.getElementById('o50-slide-des').value = des;
                document.getElementById('o50-slide-poup').value = poup;
                
                document.getElementById('o50-pct-ess-label').innerText = `${ess}%`;
                document.getElementById('o50-pct-des-label').innerText = `${des}%`;
                document.getElementById('o50-pct-poup-label').innerText = `${poup}%`;
                
                window.calc503020();
            };

            window.updateO50Chart = (ess, des, poup) => {
                const total = ess + des + poup;
                if(total <= 0) return;
                
                const c = 376.99; // Circunferência de raio 60
                
                const essCirc = (ess / 100) * c;
                const desCirc = (des / 100) * c;
                const poupCirc = (poup / 100) * c;
                
                const elEss = document.getElementById('donut-seg-ess');
                const elDes = document.getElementById('donut-seg-des');
                const elPoup = document.getElementById('donut-seg-poup');
                
                if(!elEss || !elDes || !elPoup) return;
                
                // Atualizar offsets
                elEss.style.strokeDashoffset = c - essCirc;
                elEss.setAttribute('transform', `rotate(-90 80 80)`);
                
                elDes.style.strokeDashoffset = c - desCirc;
                elDes.setAttribute('transform', `rotate(${-90 + (ess * 3.6)} 80 80)`);
                
                elPoup.style.strokeDashoffset = c - poupCirc;
                elPoup.setAttribute('transform', `rotate(${-90 + ((ess + des) * 3.6)} 80 80)`);
                
                document.getElementById('donut-center-text').innerText = `${total}%`;
            };

            window.updateO50Diagnosis = (ess, des, poup) => {
                const profileName = document.getElementById('o50-profile-name');
                const profileBadge = document.getElementById('o50-profile-badge');
                const profileDesc = document.getElementById('o50-profile-desc');
                const roadmapList = document.getElementById('o50-roadmap-list');
                const box = document.getElementById('o50-health-box');
                
                if(!profileName || !roadmapList) return;
                
                let profile = "";
                let badgeClass = "st-badge-success";
                let badgeText = "Excelente";
                let desc = "";
                let roadmap = [];
                let colorBorder = "#10b981";
                
                if (ess >= 65 || poup <= 5) {
                    // Cenário 1: Crise / Endividamento
                    profile = "Sobrevivência & Sobrecarga";
                    badgeClass = "st-badge-danger";
                    badgeText = "Crítico";
                    colorBorder = "#ef4444";
                    desc = "Seu orçamento está gravemente estrangulado pelos custos essenciais. Praticamente não há sobra financeira para poupar ou lidar com imprevistos cotidianos, gerando alta vulnerabilidade financeira.";
                    roadmap = [
                        "<strong>Desafio dos 7 Dias:</strong> Bloqueie qualquer consumo supérfluo ou de conveniência na próxima semana.",
                        "<strong>Auditoria Contratual:</strong> Faça portabilidade de crédito para reduzir juros de parcelamentos ativos, ligue e renegocie planos de internet, telefone e assinaturas.",
                        "<strong>Substituição de Marcas:</strong> Substitua produtos de marca em compras básicas por alternativas genéricas de qualidade no supermercado.",
                        "<strong>Foco em Faturamento:</strong> Direcione o tempo livre do histórico para prospectar mais horas extras de trabalho ou renda acessória rápida."
                    ];
                } else if (ess > 52 && ess < 65) {
                    // Cenário 2: Custo de Vida Elevado
                    profile = "Custo de Vida Elevado";
                    badgeClass = "st-badge-warning";
                    badgeText = "Atenção";
                    colorBorder = "#f59e0b";
                    desc = "Suas despesas obrigatórias estão acima dos 50% ideais. Apesar de não estar no vermelho, sua velocidade de investimento e acúmulo de patrimônio a longo prazo está significativamente abaixo do seu potencial.";
                    roadmap = [
                        "<strong>Mapeamento de Gastos:</strong> Mapeie por 30 dias todas as pequenas contas que extrapolam os custos fixos.",
                        "<strong>Cortes Seletivos:</strong> Reduza em 15% as contas variáveis domésticas (energia, gás, assinaturas redundantes).",
                        "<strong>Negociação de Assinaturas:</strong> Cancele planos ou diminua pacotes de streaming que não foram acessados no último mês."
                    ];
                } else if (des > 35) {
                    // Cenário 3: Lifestyle Creep / Consumista
                    profile = "Inflação de Estilo de Vida (Lifestyle Creep)";
                    badgeClass = "st-badge-warning";
                    badgeText = "Desequilibrado";
                    colorBorder = "#f59e0b";
                    desc = "Você possui boa renda, mas o excesso de gastos supérfluos, jantares, estilo de vida e compras imediatistas está drenando seus investimentos. Seu padrão atual sabota sua independência financeira futura.";
                    roadmap = [
                        "<strong>Regra do 'Pague-se Primeiro':</strong> Remova os 20% do investimento automaticamente no momento em que receber, antes de começar a gastar.",
                        "<strong>Regra do Desafio de 24h:</strong> Para qualquer compra não essencial superior a R$ 150, aguarde 24 horas. Na maioria dos casos, o impulso inicial desaparece.",
                        "<strong>Limite Mensal no Cartão:</strong> Defina um teto rígido de gastos supérfluos no aplicativo do banco."
                    ];
                } else if (poup >= 35) {
                    // Cenário 5: Super Poupador
                    profile = "Super Poupador (FIRE Path)";
                    badgeClass = "st-badge-success";
                    badgeText = "Elite";
                    colorBorder = "#10b981";
                    desc = "Você poupa uma fatia extremamente agressiva de sua renda. Isso garante a aceleração máxima rumo à independência financeira e liberdade de escolha profissional.";
                    roadmap = [
                        "<strong>Alocação Inteligente:</strong> Diversifique a poupança robusta entre fundos de índice (ETFs) de baixíssimo custo e renda fixa pós-fixada.",
                        "<strong>Equilíbrio Presente-Futuro:</strong> Certifique-se de que a taxa de poupança agressiva não está prejudicando excessivamente seu convívio social, saúde ou experiências no presente.",
                        "<strong>Projeção de Metas:</strong> Monitore seu FIRE Number pelo Simulador do FIRE Hub para recalcular anos restantes."
                    ];
                } else {
                    // Cenário 4: Ideal
                    profile = "Orçamento de Elite Equilibrado";
                    badgeClass = "st-badge-success";
                    badgeText = "Excelente";
                    colorBorder = "#10b981";
                    desc = "Parabéns! Sua divisão orçamentária segue as diretrizes clássicas mais recomendadas do mercado de planejamento pessoal. Você equilibra perfeitamente bem-estar imediato com investimentos e segurança.";
                    roadmap = [
                        "<strong>Automação Completa:</strong> Automatize a transferência de aportes para corretoras no dia do recebimento.",
                        "<strong>Reserva de Liquidez:</strong> Consolide a reserva de emergência equivalente a 6 meses de suas despesas essenciais em liquidez diária.",
                        "<strong>Otimização de Portfólio:</strong> Comece a estudar investimentos diversificados e rebalanceamento periódico."
                    ];
                }
                
                profileName.innerText = profile;
                profileBadge.className = `st-badge ${badgeClass}`;
                profileBadge.innerText = badgeText;
                profileDesc.innerHTML = desc;
                box.style.borderLeftColor = colorBorder;
                
                roadmapList.innerHTML = '';
                roadmap.forEach(step => {
                    const li = document.createElement('li');
                    li.innerHTML = step;
                    roadmapList.appendChild(li);
                });
            };

            setTimeout(() => {
                window.loadO50Preset();
            }, 200);
        }
    },
    {
        id: 'cripto_trade_tax',
        category: 'financas',
        icon: 'fa-solid fa-chart-line color-green',
        title: 'Calculadora Day Trade & Cripto',
        desc: 'Apurador tributário para cálculo de imposto devido em operações swing/day trade e criptoativos.',
        render: (container) => {
            container.innerHTML = `
                <div class="st-tabs-nav">
                    <button class="st-tab-btn active" onclick="switchStTab(this, 'ctt-sim')">Apuração</button>
                    <button class="st-tab-btn" onclick="switchStTab(this, 'ctt-info')">Guia DARF</button>
                </div>
                
                <div id="ctt-sim" class="st-tab-content">
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Volume Total de Vendas no Mês (R$)</label>
                            <input type="number" id="ctt-venda" class="form-control-flat" value="32000">
                        </div>
                        <div class="form-group-flat">
                            <label>Lucro Líquido Apurado (R$)</label>
                            <input type="number" id="ctt-lucro" class="form-control-flat" value="4500">
                        </div>
                    </div>
                    <div class="st-form-row">
                        <div class="form-group-flat">
                            <label>Tipo de Ativo / Mercado</label>
                            <select id="ctt-type" class="form-control-flat" onchange="window.calcCriptoTax()">
                                <option value="CRIPTO">Criptoativos (Swing Trade)</option>
                                <option value="SWING_TRADE">Ações Comuns (Swing Trade)</option>
                                <option value="DAY_TRADE">Ações / Futuros (Day Trade)</option>
                            </select>
                        </div>
                        <div class="form-group-flat" style="display:flex; align-items:flex-end;">
                            <button class="btn btn-primary" onclick="window.calcCriptoTax()" style="width:100%;">Calcular Imposto</button>
                        </div>
                    </div>
                    
                    <div id="ctt-results" style="margin-top: 1.25rem; display: none; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Alíquota Nominal</span>
                                <div class="st-metric-val" id="ctt-val-aliq" style="color: #fff;">0%</div>
                            </div>
                            <div class="st-card-metric">
                                <span style="font-size: 0.75rem; color: var(--text-secondary)">Imposto a Pagar</span>
                                <div class="st-metric-val" id="ctt-val-tax" style="color: #ef4444;">R$ 0,00</div>
                            </div>
                        </div>
                        
                        <div class="glass-card" style="padding: 1rem; font-size: 0.8rem; line-height: 1.4;" id="ctt-box-status">
                            <strong style="color: #fff; font-size: 0.85rem;" id="ctt-status-title">Isento de Imposto</strong>
                            <p style="color: var(--text-secondary); margin-top: 0.25rem;" id="ctt-status-desc"></p>
                        </div>
                    </div>
                </div>
                
                <div id="ctt-info" class="st-tab-content" style="display: none;">
                    <div class="glass-card" style="padding: 1.25rem; font-size: 0.8rem; line-height: 1.45;">
                        <h4 style="color:#fff; font-size:0.9rem; margin-bottom: 0.5rem;">Como recolher seu DARF:</h4>
                        <p style="color: var(--text-secondary);">
                            <strong>Código de Receita (DARF):</strong><br>
                            - Ações / Day Trade: <strong>6015</strong> (Pessoa Física)<br>
                            - Criptoativos: <strong>4600</strong> (Ganhos de capital no exterior)<br><br>
                            <strong>Prazo legal:</strong> Até o último dia útil do mês subsequente ao das operações.<br>
                            <strong>Isenção legal Cripto:</strong> Operações Swing Trade até R$ 35.000 em alienações mensais são isentas de IRPF.
                        </p>
                    </div>
                </div>
            `;
            
            window.calcCriptoTax = () => {
                const venda = parseFloat(document.getElementById('ctt-venda').value) || 0;
                const lucro = parseFloat(document.getElementById('ctt-lucro').value) || 0;
                const type = document.getElementById('ctt-type').value;
                
                let aliq = 0;
                let imposto = 0;
                let isento = false;
                let desc = '';
                
                if (type === 'CRIPTO') {
                    aliq = 15;
                    if (venda <= 35000) {
                        isento = true;
                        imposto = 0;
                        desc = 'Volume total de alienações abaixo do limite de isenção de R$ 35.000. Declare o ganho na ficha de Rendimentos Isentos e Não Tributáveis no IRPF Anual.';
                    } else {
                        imposto = lucro * 0.15;
                        desc = 'Alienação acima do limite mensal de R$ 35.000. Recolha o imposto através do DARF código 4600.';
                    }
                } else if (type === 'SWING_TRADE') {
                    aliq = 15;
                    if (venda <= 20000) {
                        isento = true;
                        imposto = 0;
                        desc = 'Isenção de IR para venda de ações comuns abaixo do limite mensal de R$ 20.000. Declare como rendimento isento no IRPF Anual.';
                    } else {
                        imposto = lucro * 0.15;
                        desc = 'Alienações de ações superaram R$ 20.000 no mês. Imposto devido de 15% incidente sobre o lucro líquido.';
                    }
                } else if (type === 'DAY_TRADE') {
                    aliq = 20;
                    isento = false; // Sem isenção para day trade
                    imposto = lucro > 0 ? lucro * 0.20 : 0;
                    desc = 'Operações do tipo Day Trade não possuem limites de isenção de faturamento. Alíquota de 20% incidente sobre todo lucro líquido.';
                }
                
                document.getElementById('ctt-results').style.display = 'flex';
                document.getElementById('ctt-val-aliq').innerText = `${aliq}%`;
                document.getElementById('ctt-val-tax').innerText = 'R$ ' + Math.max(0, imposto).toLocaleString('pt-BR', {minimumFractionDigits: 2});
                
                const box = document.getElementById('ctt-box-status');
                const title = document.getElementById('ctt-status-title');
                const descEl = document.getElementById('ctt-status-desc');
                
                if(isento) {
                    box.style.borderLeft = '4px solid #10b981';
                    box.style.background = 'rgba(16, 185, 129, 0.05)';
                    title.innerText = 'Operação Isenta de IRPF';
                    title.style.color = '#10b981';
                } else {
                    box.style.borderLeft = '4px solid #ef4444';
                    box.style.background = 'rgba(239, 68, 68, 0.05)';
                    title.innerText = 'Operação Tributada';
                    title.style.color = '#ef4444';
                }
                descEl.innerText = desc;
            };
            
            setTimeout(() => window.calcCriptoTax(), 200);
        }
    }
];

// Inicialização da Grade de Ferramentas
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
    if(!grid) return;
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
                <p>Nenhuma ferramenta de elite encontrada.</p>
            </div>`;
        return;
    }

    filtered.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'glass-card ripple';
        card.style.cssText = 'padding: 1.25rem; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.04);';
        card.innerHTML = `
            <i class="${tool.icon}" style="font-size: 1.8rem; margin-bottom: 0.75rem;"></i>
            <h4 style="font-size: 0.95rem; font-weight: 600; margin: 0 0 0.5rem 0; color: #fff;">${tool.title}</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; line-height: 1.4; flex-grow: 1;">${tool.desc}</p>
        `;
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
    
    // Parar qualquer áudio tocando anteriormente ao abrir/trocar ferramenta
    if (window.stopNoiseAudio) window.stopNoiseAudio();
    
    title.innerHTML = `<i class="${tool.icon}"></i> ${tool.title}`;
    body.innerHTML = '';
    footer.style.display = 'none';
    
    tool.render(body);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Configurar ouvintes de carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    initSuperToolsStore();
    const btnCloseSt = document.getElementById('btn-close-st-modal');
    const stModal = document.getElementById('super-tools-modal');
    if(btnCloseSt && stModal) {
        btnCloseSt.addEventListener('click', () => {
            stModal.classList.add('hidden');
            if (window.stopNoiseAudio) window.stopNoiseAudio();
        });
        stModal.addEventListener('click', (e) => {
            if (e.target === stModal) {
                stModal.classList.add('hidden');
                if (window.stopNoiseAudio) window.stopNoiseAudio();
            }
        });
    }
});
