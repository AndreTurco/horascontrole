/**
 * SUPER TOOLS APP STORE (300 Ideias)
 * Este arquivo gerencia a lógica, interface e modais dinâmicos das ferramentas.
 */

// Banco de Dados das Ferramentas
const SUPER_TOOLS_DB = [
    // --- 💰 FINANÇAS FÁCEIS ---
    {
        id: 'fin-50-30-20',
        category: 'financas',
        icon: 'fa-solid fa-chart-pie color-green',
        title: 'Regra 50/30/20',
        desc: 'Divide seu salário em necessidades, desejos e poupança.',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Sua Renda Mensal Líquida (R$)</label>
                    <input type="number" id="st-503020-renda" class="form-control-flat" placeholder="Ex: 3000">
                </div>
                <button id="st-503020-btn" class="btn btn-primary w-100 mt-2" style="background:#10b981; border-color:#10b981;"><i class="fa-solid fa-calculator"></i> Dividir Meu Salário</button>
                <div id="st-503020-res" class="mt-3 hidden" style="display:flex; flex-direction:column; gap:0.5rem;">
                    <div style="background:rgba(239,68,68,0.1); padding:1rem; border-radius:8px; border-left:4px solid #ef4444;">
                        <strong>50% Necessidades (Aluguel, contas, comida):</strong><br>
                        <span id="st-503020-50" style="font-size:1.2rem; color:#ef4444; font-weight:bold;">R$ 0,00</span>
                    </div>
                    <div style="background:rgba(59,130,246,0.1); padding:1rem; border-radius:8px; border-left:4px solid #3b82f6;">
                        <strong>30% Desejos (Lazer, iFood, compras):</strong><br>
                        <span id="st-503020-30" style="font-size:1.2rem; color:#3b82f6; font-weight:bold;">R$ 0,00</span>
                    </div>
                    <div style="background:rgba(16,185,129,0.1); padding:1rem; border-radius:8px; border-left:4px solid #10b981;">
                        <strong>20% Poupança e Dívidas (Reserva, investir):</strong><br>
                        <span id="st-503020-20" style="font-size:1.2rem; color:#10b981; font-weight:bold;">R$ 0,00</span>
                    </div>
                </div>
            `;
            document.getElementById('st-503020-btn').onclick = () => {
                const renda = parseFloat(document.getElementById('st-503020-renda').value) || 0;
                document.getElementById('st-503020-50').innerText = formatCurrency(renda * 0.50);
                document.getElementById('st-503020-30').innerText = formatCurrency(renda * 0.30);
                document.getElementById('st-503020-20').innerText = formatCurrency(renda * 0.20);
                document.getElementById('st-503020-res').classList.remove('hidden');
            };
        }
    },
    {
        id: 'fin-pizza-ifood',
        category: 'financas',
        icon: 'fa-solid fa-burger color-orange',
        title: 'Custo iFood Anual',
        desc: 'Descubra quanto você gasta por ano pedindo lanche.',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Gasto médio por pedido (R$)</label>
                    <input type="number" id="st-ifood-pedido" class="form-control-flat" value="45">
                </div>
                <div class="form-group-flat">
                    <label>Quantos pedidos por semana?</label>
                    <input type="number" id="st-ifood-qtd" class="form-control-flat" value="2">
                </div>
                <button id="st-ifood-btn" class="btn btn-primary w-100 mt-2" style="background:#f97316; border-color:#f97316;"><i class="fa-solid fa-face-surprise"></i> Revelar o susto</button>
                <div id="st-ifood-res" class="mt-3 hidden text-center" style="padding:1.5rem; background:rgba(249,115,22,0.1); border-radius:8px; border:1px solid rgba(249,115,22,0.3);">
                    <div style="font-size:0.9rem; color:var(--text-secondary);">Você gasta por ano aproximadamente:</div>
                    <div id="st-ifood-total" style="font-size:2rem; font-weight:bold; color:#f97316; margin:0.5rem 0;">R$ 0,00</div>
                    <div id="st-ifood-dica" style="font-size:0.8rem; color:var(--text-secondary);">Isso daria pra comprar muitas coisas!</div>
                </div>
            `;
            document.getElementById('st-ifood-btn').onclick = () => {
                const valor = parseFloat(document.getElementById('st-ifood-pedido').value) || 0;
                const qtd = parseFloat(document.getElementById('st-ifood-qtd').value) || 0;
                const totalAnual = valor * qtd * 52; // 52 semanas no ano
                document.getElementById('st-ifood-total').innerText = formatCurrency(totalAnual);
                document.getElementById('st-ifood-res').classList.remove('hidden');
            };
        }
    },
    {
        id: 'fin-preco-hora',
        category: 'financas',
        icon: 'fa-solid fa-shirt color-blue',
        title: 'Custa quantas horas?',
        desc: 'Coloque o preço de algo e veja quantas horas tem que trabalhar.',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Sua Taxa por Hora (R$)</label>
                    <input type="number" id="st-ph-taxa" class="form-control-flat" value="${window.state ? window.state.globalRate : 12}">
                </div>
                <div class="form-group-flat">
                    <label>Preço do Produto (Ex: Tênis, Blusa)</label>
                    <input type="number" id="st-ph-preco" class="form-control-flat" placeholder="Ex: 250">
                </div>
                <button id="st-ph-btn" class="btn btn-primary w-100 mt-2" style="background:#3b82f6; border-color:#3b82f6;"><i class="fa-solid fa-clock"></i> Calcular Horas de Vida</button>
                <div id="st-ph-res" class="mt-3 hidden text-center" style="padding:1.5rem; background:rgba(59,130,246,0.1); border-radius:8px; border:1px solid rgba(59,130,246,0.3);">
                    <div style="font-size:0.9rem; color:var(--text-secondary);">Isso custará a você:</div>
                    <div id="st-ph-total" style="font-size:2.5rem; font-weight:bold; color:#3b82f6; margin:0.5rem 0;">0h</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">de trabalho suado!</div>
                </div>
            `;
            document.getElementById('st-ph-btn').onclick = () => {
                const taxa = parseFloat(document.getElementById('st-ph-taxa').value) || 1;
                const preco = parseFloat(document.getElementById('st-ph-preco').value) || 0;
                const horas = (preco / taxa).toFixed(1);
                document.getElementById('st-ph-total').innerText = `${horas}h`;
                document.getElementById('st-ph-res').classList.remove('hidden');
            };
        }
    },

    // --- ⚖️ DIREITOS TRABALHISTAS ---
    {
        id: 'rh-ferias',
        category: 'rh',
        icon: 'fa-solid fa-umbrella-beach color-yellow',
        title: 'Cálculo de Férias',
        desc: 'Descubra quanto cai na conta ao tirar férias (com o 1/3 a mais).',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Salário Bruto (R$)</label>
                    <input type="number" id="st-ferias-salario" class="form-control-flat" value="3000">
                </div>
                <div class="form-group-flat">
                    <label>Quantos dias de férias vai tirar?</label>
                    <input type="number" id="st-ferias-dias" class="form-control-flat" value="30" min="1" max="30">
                </div>
                <button id="st-ferias-btn" class="btn btn-primary w-100 mt-2" style="background:#eab308; border-color:#eab308; color:#000;"><i class="fa-solid fa-calculator"></i> Calcular Férias</button>
                <div id="st-ferias-res" class="mt-3 hidden" style="padding:1rem; background:rgba(234,179,8,0.1); border-radius:8px; border:1px solid rgba(234,179,8,0.3); font-size:0.85rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span>Valor dos Dias:</span> <strong id="st-ferias-v1">R$ 0,00</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span>Adicional de 1/3 (Terço Constitucional):</span> <strong id="st-ferias-v2" class="color-yellow">R$ 0,00</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.1); font-size:1.1rem;">
                        <span><strong>Total Bruto a Receber:</strong></span> <strong id="st-ferias-total" class="color-green">R$ 0,00</strong>
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-secondary); text-align:center; margin-top:0.5rem;">*Sem descontos de INSS/IR</div>
                </div>
            `;
            document.getElementById('st-ferias-btn').onclick = () => {
                const salario = parseFloat(document.getElementById('st-ferias-salario').value) || 0;
                let dias = parseInt(document.getElementById('st-ferias-dias').value) || 30;
                if(dias > 30) dias = 30;
                
                const valorDias = (salario / 30) * dias;
                const terco = valorDias / 3;
                const total = valorDias + terco;

                document.getElementById('st-ferias-v1').innerText = formatCurrency(valorDias);
                document.getElementById('st-ferias-v2').innerText = formatCurrency(terco);
                document.getElementById('st-ferias-total').innerText = formatCurrency(total);
                document.getElementById('st-ferias-res').classList.remove('hidden');
            };
        }
    },
    {
        id: 'rh-13',
        category: 'rh',
        icon: 'fa-solid fa-gift color-red',
        title: 'Cálculo de Décimo Terceiro',
        desc: 'Veja o valor da primeira e segunda parcela.',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Salário Bruto Atual (R$)</label>
                    <input type="number" id="st-13-salario" class="form-control-flat" value="3000">
                </div>
                <div class="form-group-flat">
                    <label>Meses trabalhados neste ano</label>
                    <input type="number" id="st-13-meses" class="form-control-flat" value="12" min="1" max="12">
                </div>
                <button id="st-13-btn" class="btn btn-primary w-100 mt-2" style="background:#ef4444; border-color:#ef4444;"><i class="fa-solid fa-calculator"></i> Calcular 13º</button>
                <div id="st-13-res" class="mt-3 hidden" style="padding:1rem; background:rgba(239,68,68,0.1); border-radius:8px; border:1px solid rgba(239,68,68,0.3); font-size:0.85rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span>1ª Parcela (Até 30/Nov):</span> <strong id="st-13-p1" class="color-green">R$ 0,00</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span>2ª Parcela Bruta (Até 20/Dez):</span> <strong id="st-13-p2" class="color-yellow">R$ 0,00</strong>
                    </div>
                </div>
            `;
            document.getElementById('st-13-btn').onclick = () => {
                const salario = parseFloat(document.getElementById('st-13-salario').value) || 0;
                let meses = parseInt(document.getElementById('st-13-meses').value) || 12;
                if(meses > 12) meses = 12;
                
                const decimo = (salario / 12) * meses;
                const p1 = decimo / 2;
                const p2 = decimo / 2;

                document.getElementById('st-13-p1').innerText = formatCurrency(p1);
                document.getElementById('st-13-p2').innerText = formatCurrency(p2);
                document.getElementById('st-13-res').classList.remove('hidden');
            };
        }
    },

    // --- ⏱️ FOCO E TEMPO ---
    {
        id: 'foco-pomodoro',
        category: 'foco',
        icon: 'fa-solid fa-stopwatch color-red',
        title: 'Timer Pomodoro',
        desc: 'Método de 25 min de foco e 5 min de pausa para ser produtivo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:1rem;">
                    <div id="st-pom-timer" style="font-size:4rem; font-weight:900; color:#ef4444; font-family:'Space Grotesk', monospace;">25:00</div>
                    <div id="st-pom-status" style="color:var(--text-secondary); margin-bottom:1.5rem;">Pronto para focar?</div>
                    
                    <div style="display:flex; gap:1rem; justify-content:center;">
                        <button id="st-pom-start" class="btn btn-primary" style="background:#ef4444; border-color:#ef4444; padding:0.5rem 1.5rem;"><i class="fa-solid fa-play"></i> Foco (25m)</button>
                        <button id="st-pom-break" class="btn btn-secondary" style="color:#10b981; border-color:rgba(16,185,129,0.3);"><i class="fa-solid fa-mug-hot"></i> Pausa (5m)</button>
                    </div>
                </div>
            `;
            
            let interval = null;
            let timeLeft = 25 * 60;
            const updateDisplay = () => {
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                document.getElementById('st-pom-timer').innerText = `${m}:${s}`;
            };
            
            const startTimer = (minutes, color, statusText) => {
                clearInterval(interval);
                timeLeft = minutes * 60;
                document.getElementById('st-pom-timer').style.color = color;
                document.getElementById('st-pom-status').innerText = statusText;
                updateDisplay();
                
                interval = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    if(timeLeft <= 0) {
                        clearInterval(interval);
                        alert("Tempo esgotado!");
                    }
                }, 1000);
            };

            document.getElementById('st-pom-start').onclick = () => startTimer(25, '#ef4444', 'Sessão de Foco em andamento...');
            document.getElementById('st-pom-break').onclick = () => startTimer(5, '#10b981', 'Pausa para relaxar...');
        }
    },
    {
        id: 'foco-chuva',
        category: 'foco',
        icon: 'fa-solid fa-cloud-rain color-blue',
        title: 'Som de Chuva para Foco',
        desc: 'Ruído branco para abafar barulhos e ajudar na concentração.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-cloud-showers-heavy" style="font-size:4rem; color:#3b82f6; margin-bottom:1rem; opacity:0.8;"></i>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Crie um ambiente relaxante de chuva sem sair do app.</p>
                    
                    <audio id="st-chuva-audio" loop src="https://www.soundjay.com/nature/sounds/rain-03.mp3"></audio>
                    <button id="st-chuva-btn" class="btn btn-primary" style="background:#3b82f6; border-color:#3b82f6; width:100%; border-radius:50px;"><i class="fa-solid fa-play"></i> Tocar Chuva</button>
                </div>
            `;
            let playing = false;
            document.getElementById('st-chuva-btn').onclick = (e) => {
                const audio = document.getElementById('st-chuva-audio');
                if(!playing) {
                    audio.play();
                    e.target.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar Chuva';
                    e.target.style.background = '#1e3a8a';
                    playing = true;
                } else {
                    audio.pause();
                    e.target.innerHTML = '<i class="fa-solid fa-play"></i> Tocar Chuva';
                    e.target.style.background = '#3b82f6';
                    playing = false;
                }
            };
        }
    },

    // --- 🗂️ ORGANIZAÇÃO ---
    {
        id: 'org-compras',
        category: 'org',
        icon: 'fa-solid fa-cart-shopping color-orange',
        title: 'Lista de Compras Rápida',
        desc: 'Uma listinha de supermercado arrastável para não esquecer nada.',
        render: (container) => {
            container.innerHTML = `
                <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
                    <input type="text" id="st-lista-input" class="form-control-flat" placeholder="Adicionar item... (Ex: Leite)">
                    <button id="st-lista-add" class="btn btn-primary"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div id="st-lista-items" style="display:flex; flex-direction:column; gap:0.5rem; max-height:300px; overflow-y:auto; padding-right:5px;">
                </div>
                <button id="st-lista-clear" class="btn btn-secondary btn-xs mt-3 w-100"><i class="fa-solid fa-trash"></i> Limpar Tudo</button>
            `;
            
            let items = JSON.parse(localStorage.getItem('st_lista_compras')) || [];
            
            const renderItems = () => {
                const list = document.getElementById('st-lista-items');
                list.innerHTML = '';
                if(items.length === 0) list.innerHTML = '<div style="text-align:center; color:gray; font-size:0.8rem; padding:1rem;">Lista vazia.</div>';
                
                items.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:rgba(255,255,255,0.05); border-radius:8px; border:1px solid rgba(255,255,255,0.1);`;
                    
                    const label = document.createElement('label');
                    label.style.cssText = `display:flex; align-items:center; gap:0.75rem; cursor:pointer; flex:1;`;
                    label.innerHTML = `
                        <input type="checkbox" style="width:18px; height:18px;" ${item.done ? 'checked' : ''} onchange="window.stToggleItem(${index})">
                        <span style="${item.done ? 'text-decoration:line-through; color:gray;' : 'color:white;'}">${item.text}</span>
                    `;
                    
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn btn-secondary btn-xs';
                    delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    delBtn.style.padding = '0.2rem 0.5rem';
                    delBtn.onclick = () => { items.splice(index, 1); save(); };
                    
                    div.appendChild(label);
                    div.appendChild(delBtn);
                    list.appendChild(div);
                });
            };
            
            const save = () => {
                localStorage.setItem('st_lista_compras', JSON.stringify(items));
                renderItems();
            };
            
            window.stToggleItem = (index) => {
                items[index].done = !items[index].done;
                save();
            };
            
            document.getElementById('st-lista-add').onclick = () => {
                const input = document.getElementById('st-lista-input');
                if(input.value.trim() !== '') {
                    items.push({ text: input.value.trim(), done: false });
                    input.value = '';
                    save();
                }
            };
            
            document.getElementById('st-lista-input').addEventListener('keypress', (e) => {
                if(e.key === 'Enter') document.getElementById('st-lista-add').click();
            });
            
            document.getElementById('st-lista-clear').onclick = () => {
                if(confirm('Limpar toda a lista?')) {
                    items = [];
                    save();
                }
            };
            
            renderItems();
        }
    },

    // --- 🎮 GAMIFICAÇÃO ---
    {
        id: 'game-roleta',
        category: 'games',
        icon: 'fa-solid fa-dharmachakra color-purple',
        title: 'Roleta do Almoço',
        desc: 'Não sabe o que pedir no iFood ou almoçar? Gire a roleta!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center;">
                    <div id="st-roleta-result" style="font-size:2rem; font-weight:800; color:#a855f7; margin:2rem 0; min-height:60px; display:flex; align-items:center; justify-content:center; background:rgba(168,85,247,0.1); border-radius:12px; border:2px dashed rgba(168,85,247,0.3);">
                        O que comer?
                    </div>
                    <button id="st-roleta-btn" class="btn btn-primary w-100" style="background:#a855f7; border-color:#a855f7; font-size:1.1rem; height:50px;"><i class="fa-solid fa-arrows-rotate"></i> Girar a Roleta!</button>
                    <div style="margin-top:1.5rem; font-size:0.75rem; color:var(--text-secondary);">Opções: Marmita, Pizza, Hambúrguer, Salada, Japonês, Churrasco, Pastel.</div>
                </div>
            `;
            const options = ["Marmita Caseira 🍱", "Pizza 🍕", "Hambúrguer 🍔", "Saladinha Leve 🥗", "Japonês 🍣", "Churrasco 🥩", "Pastel de Feira 🥟"];
            document.getElementById('st-roleta-btn').onclick = () => {
                const resEl = document.getElementById('st-roleta-result');
                const btn = document.getElementById('st-roleta-btn');
                btn.disabled = true;
                
                let counter = 0;
                const interval = setInterval(() => {
                    resEl.innerText = options[Math.floor(Math.random() * options.length)];
                    counter++;
                    if(counter > 15) {
                        clearInterval(interval);
                        const final = options[Math.floor(Math.random() * options.length)];
                        resEl.innerHTML = `<span style="color:#fff;">${final}</span>`;
                        btn.disabled = false;
                    }
                }, 100);
            };
        }
    },

    // --- 🧘‍♂️ BEM-ESTAR ---
    {
        id: 'saude-respirar',
        category: 'saude',
        icon: 'fa-solid fa-lungs color-cyan',
        title: 'Respiração Guiada (1 Minuto)',
        desc: 'Sente que está no limite? Pare 1 minuto para respirar com este guia visual.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <p style="color:var(--text-secondary); margin-bottom:2rem;">Acompanhe o círculo: Inspire quando ele crescer, expire quando encolher.</p>
                    
                    <div style="position:relative; width:200px; height:200px; margin:0 auto; display:flex; align-items:center; justify-content:center;">
                        <div id="st-breathe-circle" style="width:50px; height:50px; background:#06b6d4; border-radius:50%; opacity:0.8; transition: all 4s ease-in-out;"></div>
                        <div id="st-breathe-text" style="position:absolute; color:#fff; font-weight:bold; font-size:1.2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Pronto</div>
                    </div>
                    
                    <button id="st-breathe-start" class="btn btn-primary mt-4" style="background:#06b6d4; border-color:#06b6d4; padding:0.75rem 2rem; border-radius:50px;">Começar Exercício</button>
                </div>
            `;
            
            let isActive = false;
            document.getElementById('st-breathe-start').onclick = () => {
                if(isActive) return;
                isActive = true;
                const circle = document.getElementById('st-breathe-circle');
                const text = document.getElementById('st-breathe-text');
                const btn = document.getElementById('st-breathe-start');
                btn.style.display = 'none';
                
                let cycles = 0;
                
                const breatheIn = () => {
                    text.innerText = 'Inspire...';
                    circle.style.transform = 'scale(4)';
                    circle.style.background = '#3b82f6';
                    setTimeout(breatheOut, 4000);
                };
                
                const breatheOut = () => {
                    text.innerText = 'Expire...';
                    circle.style.transform = 'scale(1)';
                    circle.style.background = '#06b6d4';
                    cycles++;
                    if(cycles < 6) { 
                        setTimeout(breatheIn, 4000);
                    } else {
                        setTimeout(() => {
                            text.innerText = 'Muito bem!';
                            btn.style.display = 'inline-block';
                            btn.innerText = 'Repetir';
                            isActive = false;
                        }, 4000);
                    }
                };
                
                breatheIn();
            };
        }
    },

    // --- 🛠️ UTILITÁRIOS ---
    {
        id: 'utils-qrcode',
        category: 'utils',
        icon: 'fa-solid fa-qrcode color-green',
        title: 'Gerador de QR Code',
        desc: 'Colete pagamentos mais rápido gerando um QR code de links.',
        render: (container) => {
            container.innerHTML = `
                <div class="form-group-flat">
                    <label>Texto, Link ou Chave PIX</label>
                    <input type="text" id="st-qr-input" class="form-control-flat" placeholder="https://meusite.com ou Chave Pix">
                </div>
                <button id="st-qr-btn" class="btn btn-primary w-100 mt-2" style="background:#10b981; border-color:#10b981;"><i class="fa-solid fa-qrcode"></i> Gerar QR Code</button>
                
                <div id="st-qr-result" class="text-center hidden" style="margin-top:1.5rem; background:white; padding:1.5rem; border-radius:12px;">
                    <img id="st-qr-img" src="" alt="QR Code" style="max-width:200px; width:100%; display:block; margin:0 auto;">
                    <p style="color:#000; font-size:0.75rem; margin-top:1rem;">Mostre esta tela para escanear</p>
                </div>
            `;
            document.getElementById('st-qr-btn').onclick = () => {
                const text = document.getElementById('st-qr-input').value.trim();
                if(!text) return;
                
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
                document.getElementById('st-qr-img').src = url;
                document.getElementById('st-qr-result').classList.remove('hidden');
            };
        }
    }
,
    {
        id: 'tool-11',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #11',
        desc: 'Simulador de "O que acontece se eu investir R$ 100 todo mês?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #11</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de "O que acontece se eu investir R$ 100 todo mês?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-12',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #12',
        desc: 'Botão para zerar as finanças do mês (Começar de novo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #12</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão para zerar as finanças do mês (Começar de novo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-13',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #13',
        desc: 'Resumo de Fim de Semana (Quanto gastou no Sábado e Domingo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #13</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Resumo de Fim de Semana (Quanto gastou no Sábado e Domingo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-14',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #14',
        desc: 'Contador de R$ gasto com iFood/Uber Eats.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #14</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Contador de R$ gasto com iFood/Uber Eats.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-15',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #15',
        desc: 'Calculadora mágica de descontos de loja (20% off de R$ 139,90).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #15</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora mágica de descontos de loja (20% off de R$ 139,90).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-16',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #16',
        desc: 'Meta do Fundo de Emergência (Calcula quanto você precisa guardar pra ter paz).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #16</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Meta do Fundo de Emergência (Calcula quanto você precisa guardar pra ter paz).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-17',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #17',
        desc: 'Comparador rápido "Comprar à vista com desconto ou parcelado?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #17</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Comparador rápido "Comprar à vista com desconto ou parcelado?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-18',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #18',
        desc: 'Calculadora de Juros do Cartão de Crédito atrasado.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #18</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de Juros do Cartão de Crédito atrasado.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-19',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #19',
        desc: 'Relatório animado "Seu mês mais caro do ano".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #19</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório animado "Seu mês mais caro do ano".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-20',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #20',
        desc: 'Cadastro rápido de moedinhas ou trocos esquecidos.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #20</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cadastro rápido de moedinhas ou trocos esquecidos.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-21',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: '"Desafio 52 Semanas"',
        desc: 'Uma tabela interativa pra guardar um pouquinho toda semana.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Desafio 52 Semanas"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Uma tabela interativa pra guardar um pouquinho toda semana.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-22',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #22',
        desc: 'Alerta para a fatura do cartão que vai vencer.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #22</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Alerta para a fatura do cartão que vai vencer.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-23',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #23',
        desc: 'Cálculo rápido de Consumo de Gasolina (Reais por km).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #23</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cálculo rápido de Consumo de Gasolina (Reais por km).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-24',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #24',
        desc: 'Estimativa de conta de Luz (Se o ar condicionado ficar muito ligado).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #24</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Estimativa de conta de Luz (Se o ar condicionado ficar muito ligado).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-25',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: '"Poupômetro"',
        desc: 'A cada hora extra, separe R$ 10.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Poupômetro"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">A cada hora extra, separe R$ 10.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-26',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #26',
        desc: 'Botão para copiar chave PIX facilmente para os clientes.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #26</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão para copiar chave PIX facilmente para os clientes.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-27',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #27',
        desc: 'Simulador de "Qualidade de Vida" vs Salário.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #27</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de "Qualidade de Vida" vs Salário.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-28',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #28',
        desc: 'Rastreador de pequenos gastos (Café da padaria).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #28</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Rastreador de pequenos gastos (Café da padaria).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-29',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #29',
        desc: 'Custo do Churrasco do fim de semana.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #29</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Custo do Churrasco do fim de semana.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-30',
        category: 'financas',
        icon: 'fa-solid fa-coins color-green',
        title: 'Ferramenta #30',
        desc: 'Visualização rápida de dinheiro "Na mão" vs "No Banco".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-coins color-green" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #30</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Visualização rápida de dinheiro "Na mão" vs "No Banco".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-31',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Conversor "CLT ou PJ?"',
        desc: 'Coloca o salário de um e ele diz o valor do outro.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Conversor "CLT ou PJ?"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Coloca o salário de um e ele diz o valor do outro.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-32',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Calculadora de Rescisão',
        desc: '"Se eu for demitido hoje, quanto recebo?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Calculadora de Rescisão</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Se eu for demitido hoje, quanto recebo?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-33',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #33',
        desc: 'Simulador de Décimo Terceiro (mostra 1ª e 2ª parcelas).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #33</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de Décimo Terceiro (mostra 1ª e 2ª parcelas).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-34',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Cálculo de Férias',
        desc: 'Escolha quantos dias quer tirar e veja quanto cai na conta.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Cálculo de Férias</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Escolha quantos dias quer tirar e veja quanto cai na conta.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-35',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #35',
        desc: 'Descubra quantas parcelas do Seguro Desemprego você tem direito.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #35</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Descubra quantas parcelas do Seguro Desemprego você tem direito.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-36',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #36',
        desc: 'Cálculo do FGTS acumulado.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #36</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cálculo do FGTS acumulado.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-37',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #37',
        desc: 'Botão mágico para ver se compensa vender as férias (Abono pecuniário).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #37</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão mágico para ver se compensa vender as férias (Abono pecuniário).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-38',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #38',
        desc: 'Calculadora de Hora Extra em Domingo e Feriado (100%).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #38</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de Hora Extra em Domingo e Feriado (100%).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-39',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #39',
        desc: 'Cálculo rápido de Adicional Noturno.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #39</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cálculo rápido de Adicional Noturno.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-40',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #40',
        desc: 'Saiba qual o valor do desconto do Vale Transporte (6%).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #40</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Saiba qual o valor do desconto do Vale Transporte (6%).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-41',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Conversor de Horas de Relógio para Formato Decimal (Ex',
        desc: '8h30 vira 8,5).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Conversor de Horas de Relógio para Formato Decimal (Ex</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">8h30 vira 8,5).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-42',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #42',
        desc: 'Controle de Banco de Horas Positivo e Negativo com barrinha de cor.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #42</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Controle de Banco de Horas Positivo e Negativo com barrinha de cor.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-43',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #43',
        desc: 'Simulador de Aumento de Salário (Mude a porcentagem e veja a diferença no bolso).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #43</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de Aumento de Salário (Mude a porcentagem e veja a diferença no bolso).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-44',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #44',
        desc: '"Vale a pena pegar esse freela?" (Calcula o valor da hora pedida).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #44</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Vale a pena pegar esse freela?" (Calcula o valor da hora pedida).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-45',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #45',
        desc: 'Simulador do Imposto de Renda "Mordida do Leão".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #45</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador do Imposto de Renda "Mordida do Leão".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-46',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #46',
        desc: 'Calculadora de faltas e atrasos e o peso no final do mês.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #46</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de faltas e atrasos e o peso no final do mês.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-47',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #47',
        desc: 'Tempo de deslocamento pro trabalho = "Horas perdidas na vida".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #47</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tempo de deslocamento pro trabalho = "Horas perdidas na vida".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-48',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #48',
        desc: 'Custo diário da marmita vs comer fora.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #48</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Custo diário da marmita vs comer fora.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-49',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #49',
        desc: 'Contagem para Aposentadoria (quantos anos faltam?).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #49</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Contagem para Aposentadoria (quantos anos faltam?).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-50',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Ponto Negativo"',
        desc: 'Botão pra registrar que teve que sair mais cedo e vai pagar amanhã.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Ponto Negativo"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão pra registrar que teve que sair mais cedo e vai pagar amanhã.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-51',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #51',
        desc: 'Calendário automático de Feriados Nacionais na tabela.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #51</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calendário automático de Feriados Nacionais na tabela.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-52',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #52',
        desc: 'Cálculo fácil para diaristas ou diaristas (Valor dia + Transporte).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #52</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cálculo fácil para diaristas ou diaristas (Valor dia + Transporte).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-53',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #53',
        desc: 'Calculadora de multa de 40% em demissão surpresa.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #53</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de multa de 40% em demissão surpresa.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-54',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Tela verde/vermelha simples para quem folga por escala (Ex',
        desc: '12x36).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Tela verde/vermelha simples para quem folga por escala (Ex</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">12x36).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-55',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #55',
        desc: 'Botão pra mandar o "Recibo" das suas horas em PDF no WhatsApp do chefe.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #55</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão pra mandar o "Recibo" das suas horas em PDF no WhatsApp do chefe.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-56',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #56',
        desc: 'Histórico visual dos aumentos que você já teve na vida.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #56</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Histórico visual dos aumentos que você já teve na vida.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-57',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #57',
        desc: 'Simulador de PLR ou Bônus Anual.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #57</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de PLR ou Bônus Anual.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-58',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #58',
        desc: 'Custo para MEI (Aviso do imposto mensal).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #58</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Custo para MEI (Aviso do imposto mensal).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-59',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #59',
        desc: 'Calculadora de Vale Alimentação mensal total.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #59</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de Vale Alimentação mensal total.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-60',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #60',
        desc: '"Hoje ganhei um lanche" (Botão pra abater gasto).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #60</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Hoje ganhei um lanche" (Botão pra abater gasto).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-61',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #61',
        desc: 'Botão "Estou Focado" (Cronômetro Pomodoro gigante e bonito).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #61</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Estou Focado" (Cronômetro Pomodoro gigante e bonito).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-62',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #62',
        desc: 'Pausa para o Café (Cronômetro de 10 min que avisa quando voltar).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #62</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Pausa para o Café (Cronômetro de 10 min que avisa quando voltar).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-63',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #63',
        desc: 'Modo "Só Hoje" (Esconde tudo do mês e foca só nas tarefas de hoje).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #63</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Modo "Só Hoje" (Esconde tudo do mês e foca só nas tarefas de hoje).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-64',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #64',
        desc: 'Anotação Relâmpago (Uma caixinha de texto que está sempre visível na tela).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #64</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Anotação Relâmpago (Uma caixinha de texto que está sempre visível na tela).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-65',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #65',
        desc: '"Ruído de Chuva" para ouvir enquanto trabalha direto no app.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #65</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Ruído de Chuva" para ouvir enquanto trabalha direto no app.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-66',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #66',
        desc: 'Música de Lo-Fi embutida pra focar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #66</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Música de Lo-Fi embutida pra focar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-67',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #67',
        desc: 'To-Do List simples de arrastar (Fazer, Fazendo, Feito).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #67</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">To-Do List simples de arrastar (Fazer, Fazendo, Feito).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-68',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Anota Aí"',
        desc: 'Lista de ideias que você quer ver depois.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Anota Aí"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lista de ideias que você quer ver depois.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-69',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Regressiva Mágica',
        desc: '"Quantas horas faltam para a Sexta-feira?" (Ao vivo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Regressiva Mágica</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Quantas horas faltam para a Sexta-feira?" (Ao vivo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-70',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #70',
        desc: 'Alarme para parar de trabalhar no fim do dia (Sino).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #70</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Alarme para parar de trabalhar no fim do dia (Sino).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-71',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Bloqueador de Abas visuais',
        desc: 'Tela cheia, sem distrações.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Bloqueador de Abas visuais</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tela cheia, sem distrações.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-72',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #72',
        desc: 'Botão de "Interrupção" (Conta quantas vezes alguém te chamou no trabalho).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #72</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão de "Interrupção" (Conta quantas vezes alguém te chamou no trabalho).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-73',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Qual a coisa mais importante de hoje?"',
        desc: 'Digita no começo do dia e fica piscando.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Qual a coisa mais importante de hoje?"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Digita no começo do dia e fica piscando.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-74',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #74',
        desc: 'Gráfico "Sou mais rápido de manhã ou de tarde?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #74</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gráfico "Sou mais rápido de manhã ou de tarde?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-75',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Limpador mental',
        desc: 'Um botão pra escrever desabafos e apagar sem salvar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Limpador mental</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Um botão pra escrever desabafos e apagar sem salvar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-76',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #76',
        desc: 'Cronômetro regressivo para aquela reunião chata acabar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #76</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cronômetro regressivo para aquela reunião chata acabar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-77',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Botão "Estou Enrolando"',
        desc: 'pausa o relógio de horas extras pra ser justo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Botão "Estou Enrolando"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">pausa o relógio de horas extras pra ser justo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-78',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Lembrete',
        desc: '"Beber água agora".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Lembrete</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Beber água agora".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-79',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #79',
        desc: 'Foco Contínuo (Muda a tela toda pra vermelho avisando "Não Perturbe").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #79</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Foco Contínuo (Muda a tela toda pra vermelho avisando "Não Perturbe").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-80',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #80',
        desc: 'Agenda de 1 clique (Anota que horas tem que entregar o serviço).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #80</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Agenda de 1 clique (Anota que horas tem que entregar o serviço).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-81',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #81',
        desc: 'Resumo "O que eu fiz hoje" para preencher no ônibus voltando pra casa.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #81</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Resumo "O que eu fiz hoje" para preencher no ônibus voltando pra casa.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-82',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #82',
        desc: 'Marcador rápido de Humor diário (Carinha feliz, normal ou triste).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #82</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Marcador rápido de Humor diário (Carinha feliz, normal ou triste).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-83',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #83',
        desc: 'Desafio "Sem Redes Sociais" ativado visualmente.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #83</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Desafio "Sem Redes Sociais" ativado visualmente.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-84',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #84',
        desc: 'Bloco de notas rápido para senhas soltas do dia (apagadas amanhã).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #84</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bloco de notas rápido para senhas soltas do dia (apagadas amanhã).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-85',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #85',
        desc: 'Organizador de Mesa (Avisa para limpar sua mesa física na sexta-feira).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #85</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Organizador de Mesa (Avisa para limpar sua mesa física na sexta-feira).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-86',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #86',
        desc: 'Gerador de desculpas engraçadas para atraso.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #86</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gerador de desculpas engraçadas para atraso.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-87',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #87',
        desc: 'Cronômetro regressivo para o horário do almoço!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #87</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cronômetro regressivo para o horário do almoço!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-88',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Not To-Do"',
        desc: 'O que NÃO fazer hoje (ex: não pedir fast food).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Not To-Do"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O que NÃO fazer hoje (ex: não pedir fast food).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-89',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'O "Pinger"',
        desc: 'O app toca um bipe suave pra ver se você não dormiu na cadeira.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">O "Pinger"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O app toca um bipe suave pra ver se você não dormiu na cadeira.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-90',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #90',
        desc: 'Tela de Metas da Vida (Onde quero estar em 5 anos).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #90</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tela de Metas da Vida (Onde quero estar em 5 anos).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-91',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Sistema de Níveis',
        desc: 'Comece como "Novato" e vire "Chefe" batendo horas!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Sistema de Níveis</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Comece como "Novato" e vire "Chefe" batendo horas!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-92',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #92',
        desc: 'Barra de Experiência (XP) que sobe a cada dia completo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #92</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Barra de Experiência (XP) que sobe a cada dia completo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-93',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #93',
        desc: 'Conquista "Madrugador" se começar antes das 7h.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #93</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Conquista "Madrugador" se começar antes das 7h.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-94',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #94',
        desc: 'Conquista "Coruja" se trabalhar até depois das 22h.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #94</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Conquista "Coruja" se trabalhar até depois das 22h.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-95',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #95',
        desc: 'Fogo de "Ofensiva" (Streak) por dias seguidos batendo a meta!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #95</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Fogo de "Ofensiva" (Streak) por dias seguidos batendo a meta!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-96',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #96',
        desc: 'Animação de Confetes na tela se bater todas as horas da semana na Sexta!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #96</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Animação de Confetes na tela se bater todas as horas da semana na Sexta!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-97',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #97',
        desc: 'Moedinhas Virtuais do App ganhas com o trabalho.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #97</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Moedinhas Virtuais do App ganhas com o trabalho.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-98',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #98',
        desc: 'Botão "Girar a Roleta" pra decidir o que comer no almoço.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #98</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Girar a Roleta" pra decidir o que comer no almoço.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-99',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #99',
        desc: 'Tela preta de Game Over se você folgar na quarta-feira (Brincadeira).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #99</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tela preta de Game Over se você folgar na quarta-feira (Brincadeira).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-100',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #100',
        desc: 'Frase motivacional nova todo dia de manhã ("Vai lá campeão!").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #100</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Frase motivacional nova todo dia de manhã ("Vai lá campeão!").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-101',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #101',
        desc: 'Som do Mário Bros quando clica em 'Bater Ponto'.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #101</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Som do Mário Bros quando clica em 'Bater Ponto'.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-102',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #102',
        desc: 'Troféus visuais brilhantes colecionáveis no perfil.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #102</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Troféus visuais brilhantes colecionáveis no perfil.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-103',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ranking Pessoal de Meses',
        desc: '"Novembro venceu Outubro por 5 horas!".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ranking Pessoal de Meses</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Novembro venceu Outubro por 5 horas!".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-104',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #104',
        desc: 'Som épico tocando ao finalizar uma meta grande.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #104</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Som épico tocando ao finalizar uma meta grande.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-105',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Invasão Alienígena"',
        desc: 'Minigame escondido enquanto o relógio corre.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Invasão Alienígena"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Minigame escondido enquanto o relógio corre.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-106',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #106',
        desc: 'Pet Virtual na aba (Uma plantinha que cresce se você trabalhar as horas certas).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #106</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Pet Virtual na aba (Uma plantinha que cresce se você trabalhar as horas certas).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-107',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #107',
        desc: 'Gráfico Colorido de calor (Quanto mais horas, mais vermelha a bolinha).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #107</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gráfico Colorido de calor (Quanto mais horas, mais vermelha a bolinha).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-108',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #108',
        desc: 'Animação de neve na tela quando chegar o Natal.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #108</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Animação de neve na tela quando chegar o Natal.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-109',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #109',
        desc: 'Troféu "Mestre do Foco" (10 Pomodoros perfeitos na semana).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #109</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Troféu "Mestre do Foco" (10 Pomodoros perfeitos na semana).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-110',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #110',
        desc: 'Easter Egg da Konami (cima, cima, baixo, baixo) que destrava uma cor nova.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #110</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Easter Egg da Konami (cima, cima, baixo, baixo) que destrava uma cor nova.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-111',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Estatísticas de Vida',
        desc: 'Total de horas trabalhadas desde que instalou o app.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Estatísticas de Vida</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Total de horas trabalhadas desde que instalou o app.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-112',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Avatar do Usuário',
        desc: 'Escolha um rostinho pro seu perfil.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Avatar do Usuário</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Escolha um rostinho pro seu perfil.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-113',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Escolha seu "Título" honorário (Ex',
        desc: 'O Ninja do Teclado).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Escolha seu "Título" honorário (Ex</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O Ninja do Teclado).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-114',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Batalha do Dia',
        desc: 'Bater a própria meta de ontem.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Batalha do Dia</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bater a própria meta de ontem.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-115',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Carta Surpresa',
        desc: 'Às vezes o app te dá "parabéns" do nada.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Carta Surpresa</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Às vezes o app te dá "parabéns" do nada.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-116',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #116',
        desc: 'Desafio Semanal "Apenas 4 dias trabalhando duro".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #116</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Desafio Semanal "Apenas 4 dias trabalhando duro".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-117',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #117',
        desc: 'Notificação engraçada ("Volta a trabalhar!")',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #117</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Notificação engraçada ("Volta a trabalhar!")</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-118',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #118',
        desc: 'Botão de Pânico Animado se apagar algo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #118</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão de Pânico Animado se apagar algo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-119',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #119',
        desc: 'Moedas servem pra comprar temas e cores "exclusivas" na loja do app.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #119</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Moedas servem pra comprar temas e cores "exclusivas" na loja do app.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-120',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #120',
        desc: 'Celebração de 1 Mês de uso do App com balões na tela.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #120</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Celebração de 1 Mês de uso do App com balões na tela.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-121',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #121',
        desc: 'Lembrete gigante de "Levanta da Cadeira!".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #121</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lembrete gigante de "Levanta da Cadeira!".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-122',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #122',
        desc: 'Bip para beber água (e botão pra registrar os copos do dia).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #122</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bip para beber água (e botão pra registrar os copos do dia).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-123',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #123',
        desc: 'Aviso para piscar os olhos e desviar a visão da tela por 20 seg.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #123</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Aviso para piscar os olhos e desviar a visão da tela por 20 seg.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-124',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #124',
        desc: 'Contador de Passos (Sugestão de dar 100 passos pelo quarto).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #124</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Contador de Passos (Sugestão de dar 100 passos pelo quarto).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-125',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Alongamento guiado',
        desc: 'App mostra uma foto de alongamento para fazer.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Alongamento guiado</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">App mostra uma foto de alongamento para fazer.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-126',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Chega por hoje"',
        desc: 'Tela fica escura se passar de 10 horas trabalhando.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Chega por hoje"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tela fica escura se passar de 10 horas trabalhando.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-127',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #127',
        desc: 'Controle do Humor do dia, pra ver se o trampo tá te adoecendo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #127</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Controle do Humor do dia, pra ver se o trampo tá te adoecendo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-128',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #128',
        desc: 'Filtro Noturno na tela (Amarelado para não doer o olho à noite).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #128</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Filtro Noturno na tela (Amarelado para não doer o olho à noite).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-129',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #129',
        desc: 'Lembrete de Postura ("Tá com a coluna torta?").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #129</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lembrete de Postura ("Tá com a coluna torta?").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-130',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #130',
        desc: 'Registro se tomou o café da manhã.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #130</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Registro se tomou o café da manhã.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-131',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #131',
        desc: 'Exercício de Respiração profunda na tela (Uma bola que infla e esvazia 1 min).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #131</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Exercício de Respiração profunda na tela (Uma bola que infla e esvazia 1 min).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-132',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #132',
        desc: 'Tracker de Dor nas Costas.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #132</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tracker de Dor nas Costas.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-133',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Custo na Saúde daquela hora extra (Dica',
        desc: 'não vale a pena!).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Custo na Saúde daquela hora extra (Dica</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">não vale a pena!).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-134',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #134',
        desc: 'Lembrete "Pegue um Sol" se for meio dia.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #134</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lembrete "Pegue um Sol" se for meio dia.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-135',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #135',
        desc: 'Alarme suave pra parar de olhar a tela 1h antes de dormir.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #135</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Alarme suave pra parar de olhar a tela 1h antes de dormir.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-136',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #136',
        desc: 'Tracker de tempo sentado (se passar de 4h, ele bipa).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #136</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tracker de tempo sentado (se passar de 4h, ele bipa).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-137',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #137',
        desc: 'Aviso de "Sextou! Desliga tudo".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #137</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Aviso de "Sextou! Desliga tudo".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-138',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #138',
        desc: 'Frases calmantes se o nível de estresse estiver alto.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #138</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Frases calmantes se o nível de estresse estiver alto.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-139',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #139',
        desc: 'Registro "Hoje foi um bom dia?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #139</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Registro "Hoje foi um bom dia?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-140',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #140',
        desc: 'Lista de Agradecimento ("Escreva 1 coisa boa de hoje").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #140</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lista de Agradecimento ("Escreva 1 coisa boa de hoje").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-141',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #141',
        desc: 'Cronômetro de Cochilo pós-almoço (20 minutinhos).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #141</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cronômetro de Cochilo pós-almoço (20 minutinhos).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-142',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #142',
        desc: 'Música suave embutida para baixar ansiedade.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #142</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Música suave embutida para baixar ansiedade.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-143',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #143',
        desc: 'Dicas de refeições leves antes de voltar a focar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #143</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Dicas de refeições leves antes de voltar a focar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-144',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #144',
        desc: 'Lembrete pra passar protetor solar se trabalhar na janela.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #144</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lembrete pra passar protetor solar se trabalhar na janela.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-145',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #145',
        desc: 'Botão "Preciso Respirar" pausa o relógio e foca em você.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #145</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Preciso Respirar" pausa o relógio e foca em você.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-146',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #146',
        desc: 'Botão "Desligar o cérebro" (Tela preta com uma estrelinha brilhando).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #146</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Desligar o cérebro" (Tela preta com uma estrelinha brilhando).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-147',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #147',
        desc: 'Acompanhamento rápido de peso (Se está engordando no home office).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #147</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Acompanhamento rápido de peso (Se está engordando no home office).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-148',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #148',
        desc: 'Frequência Cardíaca (Caixinha manual para você anotar se está agitado).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #148</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Frequência Cardíaca (Caixinha manual para você anotar se está agitado).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-149',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #149',
        desc: '"Walk & Talk" lembrete pra andar pela casa enquanto fala no telefone.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #149</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Walk & Talk" lembrete pra andar pela casa enquanto fala no telefone.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-150',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #150',
        desc: 'Termômetro visual de Burnout.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #150</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Termômetro visual de Burnout.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-151',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #151',
        desc: 'Lista de Compras do Supermercado super fácil no app.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #151</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lista de Compras do Supermercado super fácil no app.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-152',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #152',
        desc: 'Caderno de endereços rápidos de clientes/patrão.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #152</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Caderno de endereços rápidos de clientes/patrão.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-153',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Controle de validade',
        desc: 'Avisar quando vencer aquela conta de luz.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Controle de validade</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Avisar quando vencer aquela conta de luz.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-154',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #154',
        desc: 'Checklist "Mochila do Trabalho" antes de sair de casa.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #154</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Checklist "Mochila do Trabalho" antes de sair de casa.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-155',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Gaveta de Documentos',
        desc: 'Anotar número da identidade, PIS, etc.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Gaveta de Documentos</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Anotar número da identidade, PIS, etc.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-156',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #156',
        desc: 'Calendário Anual que pinta os finais de semana automaticamente.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #156</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calendário Anual que pinta os finais de semana automaticamente.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-157',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #157',
        desc: 'Diário Pessoal trancado com senha simples.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #157</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Diário Pessoal trancado com senha simples.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-158',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #158',
        desc: 'Botão mágico para agendar almoço com amigo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #158</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão mágico para agendar almoço com amigo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-159',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #159',
        desc: 'Roteiro do dia (Onde vou estar às 10h, às 14h, às 16h).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #159</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Roteiro do dia (Onde vou estar às 10h, às 14h, às 16h).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-160',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #160',
        desc: 'Rastreador de Encomendas simples (Guarde o código aqui).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #160</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Rastreador de Encomendas simples (Guarde o código aqui).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-161',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #161',
        desc: 'Planejamento do Cardápio Semanal na hora do almoço.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #161</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Planejamento do Cardápio Semanal na hora do almoço.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-162',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #162',
        desc: 'Aviso para levar guarda-chuva se for sair.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #162</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Aviso para levar guarda-chuva se for sair.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-163',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Checklist de Sexta-feira',
        desc: '"Esvaziou a lixeira? Mandou relatório?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Checklist de Sexta-feira</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Esvaziou a lixeira? Mandou relatório?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-164',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #164',
        desc: 'Tabela de tarefas da casa que divide com os familiares.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #164</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tabela de tarefas da casa que divide com os familiares.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-165',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #165',
        desc: 'Contagem regressiva pras Férias!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #165</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Contagem regressiva pras Férias!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-166',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #166',
        desc: 'Caderno de rascunho gigante, uma página só em branco.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #166</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Caderno de rascunho gigante, uma página só em branco.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-167',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #167',
        desc: 'Aba de Orçamentos (Guarde preço de coisas que quer comprar).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #167</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Aba de Orçamentos (Guarde preço de coisas que quer comprar).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-168',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #168',
        desc: 'Organizador de links úteis e vídeos do YouTube pra ver à noite.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #168</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Organizador de links úteis e vídeos do YouTube pra ver à noite.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-169',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #169',
        desc: 'Contador "Faltam X meses para pagar o carro".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #169</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Contador "Faltam X meses para pagar o carro".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-170',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #170',
        desc: 'Rastreador de Manutenção (Troca de óleo do carro, limpar PC).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #170</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Rastreador de Manutenção (Troca de óleo do carro, limpar PC).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-171',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #171',
        desc: 'Gestão fácil da Mesada dos filhos (Aba financeira extra).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #171</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gestão fácil da Mesada dos filhos (Aba financeira extra).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-172',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #172',
        desc: 'Tabela de Filmes para assistir nas folgas.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #172</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tabela de Filmes para assistir nas folgas.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-173',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #173',
        desc: 'Planejamento da Festa de Fim de Ano do trabalho.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #173</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Planejamento da Festa de Fim de Ano do trabalho.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-174',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #174',
        desc: 'Lista de Desejos (Wishlist com fotos de presentes pro aniversário).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #174</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lista de Desejos (Wishlist com fotos de presentes pro aniversário).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-175',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #175',
        desc: 'Bloco de "Não Esquecer" na tela inicial vermelha.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #175</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bloco de "Não Esquecer" na tela inicial vermelha.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-176',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #176',
        desc: 'Organizador do Fim de Semana (Sábado limpa, Domingo descansa).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #176</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Organizador do Fim de Semana (Sábado limpa, Domingo descansa).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-177',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #177',
        desc: 'Controle de Remédios Diários.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #177</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Controle de Remédios Diários.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-178',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #178',
        desc: 'Quadro Branco Digital para riscar com o dedo no celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #178</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Quadro Branco Digital para riscar com o dedo no celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-179',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #179',
        desc: 'Organização visual com "Etiquetas coloridas" nas atividades.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #179</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Organização visual com "Etiquetas coloridas" nas atividades.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-180',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #180',
        desc: 'Botão "Clonar dia anterior" pra preguiça de preencher a rotina.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #180</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Clonar dia anterior" pra preguiça de preencher a rotina.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-181',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #181',
        desc: 'Conversor Rápido de Temperatura (Graus C x F).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #181</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Conversor Rápido de Temperatura (Graus C x F).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-182',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #182',
        desc: 'Regra de 3 Simples para celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #182</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Regra de 3 Simples para celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-183',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #183',
        desc: 'Calculadora de Porcentagem (Para descontos em loja).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #183</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de Porcentagem (Para descontos em loja).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-184',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #184',
        desc: 'Sorteador de Números de 1 a 100.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #184</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Sorteador de Números de 1 a 100.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-185',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #185',
        desc: 'Cara ou Coroa Virtual (Gira a moedinha na tela).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #185</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cara ou Coroa Virtual (Gira a moedinha na tela).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-186',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #186',
        desc: 'Lanterna (Se o app puder botar fundo 100% branco com brilho máximo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #186</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lanterna (Se o app puder botar fundo 100% branco com brilho máximo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-187',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #187',
        desc: 'Lupa para texto (Aumenta o texto da tela pra quem tem vista cansada).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #187</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Lupa para texto (Aumenta o texto da tela pra quem tem vista cansada).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-188',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #188',
        desc: 'Calculadora Tradicional Gigante com botões grandes.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #188</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora Tradicional Gigante com botões grandes.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-189',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #189',
        desc: 'Medidor de distâncias (Para colocar km percorridos).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #189</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Medidor de distâncias (Para colocar km percorridos).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-190',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #190',
        desc: 'Criador de Link para WhatsApp (Gerar link sem salvar contato).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #190</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Criador de Link para WhatsApp (Gerar link sem salvar contato).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-191',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #191',
        desc: 'Gerador de Senhas "Forte" (E anota num canto).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #191</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gerador de Senhas "Forte" (E anota num canto).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-192',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #192',
        desc: 'Gerador de Código QR de um texto seu.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #192</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gerador de Código QR de um texto seu.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-193',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #193',
        desc: 'Identificador de Tamanhos (Tabela de roupa P/M/G x Estados Unidos).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #193</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Identificador de Tamanhos (Tabela de roupa P/M/G x Estados Unidos).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-194',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #194',
        desc: 'Cronômetro esportivo com botão de "Volta/Lap".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #194</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cronômetro esportivo com botão de "Volta/Lap".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-195',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Formatador Automático',
        desc: 'Cole o texto tudo maiúsculo e ele arruma pra você.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Formatador Automático</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cole o texto tudo maiúsculo e ele arruma pra você.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-196',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Conversor de Medidas Fáceis',
        desc: 'Xícaras para gramas (para o almoço).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Conversor de Medidas Fáceis</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Xícaras para gramas (para o almoço).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-197',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Dicionário Embutido de Termos Famosos no Trabalho (Ex',
        desc: '"O que é ASAP?").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Dicionário Embutido de Termos Famosos no Trabalho (Ex</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"O que é ASAP?").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-198',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #198',
        desc: 'Relógio Mundial Fuso Horário (Brasil x Portugal x EUA).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #198</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relógio Mundial Fuso Horário (Brasil x Portugal x EUA).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-199',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #199',
        desc: 'Gerador de Desculpas Inteligentes para Faltar no Compromisso.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #199</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gerador de Desculpas Inteligentes para Faltar no Compromisso.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-200',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #200',
        desc: 'Sorteador de times para futebol no final de semana.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #200</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Sorteador de times para futebol no final de semana.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-201',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #201',
        desc: 'Gravador de Áudio simples de 1 minuto para lembrete de voz.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #201</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gravador de Áudio simples de 1 minuto para lembrete de voz.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-202',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #202',
        desc: 'Gerenciador de Áreas de Transferência (Guarda 5 últimos textos copiados).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #202</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gerenciador de Áreas de Transferência (Guarda 5 últimos textos copiados).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-203',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #203',
        desc: 'Escâner Falso (Abre a câmera pro cara bater foto do recibo e salva na nota).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #203</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Escâner Falso (Abre a câmera pro cara bater foto do recibo e salva na nota).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-204',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #204',
        desc: '"Qual Meu Signo hoje?" (Horóscopo aleatório de brincadeira).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #204</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Qual Meu Signo hoje?" (Horóscopo aleatório de brincadeira).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-205',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #205',
        desc: 'Simulador de loteria (Gera 6 números da Mega).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #205</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Simulador de loteria (Gera 6 números da Mega).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-206',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #206',
        desc: 'Calculadora de IMC (Índice de Massa Corporal).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #206</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Calculadora de IMC (Índice de Massa Corporal).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-207',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #207',
        desc: 'Conversor Km/h para Milhas (Pra quem tá viajando).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #207</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Conversor Km/h para Milhas (Pra quem tá viajando).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-208',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Cripto Hoje',
        desc: 'Cotação do BTC e Dólar com 1 botão.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Cripto Hoje</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cotação do BTC e Dólar com 1 botão.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-209',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #209',
        desc: 'Tabuada completa para ajudar as crianças do home office.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #209</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tabuada completa para ajudar as crianças do home office.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-210',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #210',
        desc: 'Conversor Rápido de Sapato Brasil -> Europa/EUA.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #210</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Conversor Rápido de Sapato Brasil -> Europa/EUA.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-211',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #211',
        desc: 'Paleta de 15 Cores Premium (Azul Bebê, Rosa Choque, Verde Folha, Ouro).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #211</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Paleta de 15 Cores Premium (Azul Bebê, Rosa Choque, Verde Folha, Ouro).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-212',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #212',
        desc: 'Roda de Cor para você mesmo criar a cor exata que gosta.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #212</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Roda de Cor para você mesmo criar a cor exata que gosta.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-213',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #213',
        desc: 'Escolher o Tamanho da Letra (Pra quem usa óculos ou quer tudo pequeno).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #213</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Escolher o Tamanho da Letra (Pra quem usa óculos ou quer tudo pequeno).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-214',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #214',
        desc: 'Botão "Modo Escuro" com fundo Super Preto (Pra economizar bateria OLED).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #214</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Modo Escuro" com fundo Super Preto (Pra economizar bateria OLED).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-215',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #215',
        desc: 'Modo Claro com tons pastel bonitos.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #215</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Modo Claro com tons pastel bonitos.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-216',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Mudar os Ícones',
        desc: 'Estilo redondinho ou mais "quadrado/sério".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Mudar os Ícones</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Estilo redondinho ou mais "quadrado/sério".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-217',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #217',
        desc: 'Barra de rolagem customizada da cor que você escolheu.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #217</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Barra de rolagem customizada da cor que você escolheu.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-218',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #218',
        desc: 'Botões Flutuantes Redondos (Estilo app mobile famoso) pra bater o ponto.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #218</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botões Flutuantes Redondos (Estilo app mobile famoso) pra bater o ponto.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-219',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #219',
        desc: 'Fundo Gradiente Animado (Se mexe devagar e fica bonito na tela).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #219</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Fundo Gradiente Animado (Se mexe devagar e fica bonito na tela).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-220',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Remover Sombras',
        desc: 'Para quem quer o design "Flat" super limpo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Remover Sombras</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Para quem quer o design "Flat" super limpo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-221',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Vidro Jateado (Glassmorphism)',
        desc: 'Efeito das janelas do iPhone (ativar/desativar).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Vidro Jateado (Glassmorphism)</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Efeito das janelas do iPhone (ativar/desativar).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-222',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Animações de "Salto"',
        desc: 'Quando o dinheiro entra, o número pula feliz.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Animações de "Salto"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Quando o dinheiro entra, o número pula feliz.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-223',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #223',
        desc: 'Mudar o Nome no topo da tela com um clique.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #223</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Mudar o Nome no topo da tela com um clique.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-224',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #224',
        desc: 'Foto de Perfil Redondinha no cantinho.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #224</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Foto de Perfil Redondinha no cantinho.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-225',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #225',
        desc: 'Capa de Fundo do Dashboard (Colocar foto do cachorro ou da viagem).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #225</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Capa de Fundo do Dashboard (Colocar foto do cachorro ou da viagem).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-226',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #226',
        desc: 'Cursor do Mouse Brilhante (Se estiver no Notebook).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #226</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cursor do Mouse Brilhante (Se estiver no Notebook).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-227',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Alinhamento de Texto',
        desc: 'Para esquerda ou centralizado.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Alinhamento de Texto</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Para esquerda ou centralizado.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-228',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #228',
        desc: 'Deixar as tabelas mais juntinhas (Compacto) ou mais espaçosas.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #228</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Deixar as tabelas mais juntinhas (Compacto) ou mais espaçosas.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-229',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #229',
        desc: 'Exibir o Relógio gigante no meio da tela no modo "Pausa".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #229</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Exibir o Relógio gigante no meio da tela no modo "Pausa".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-230',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #230',
        desc: 'Temas de Estações (Modo Verão, Inverno, Primavera, Outono).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #230</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Temas de Estações (Modo Verão, Inverno, Primavera, Outono).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-231',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #231',
        desc: 'Cores diferentes para "Ganhos" (Pode não ser verde, pode ser Dourado).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #231</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cores diferentes para "Ganhos" (Pode não ser verde, pode ser Dourado).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-232',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #232',
        desc: 'Cores exclusivas desbloqueadas com a Gamificação!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #232</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cores exclusivas desbloqueadas com a Gamificação!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-233',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Modo "Discreto"',
        desc: 'Aperta o olho e esconde todo o dinheiro (anti-curiosos).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Modo "Discreto"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Aperta o olho e esconde todo o dinheiro (anti-curiosos).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-234',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #234',
        desc: 'Partículas flutuantes no fundo se bater a meta do mês.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #234</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Partículas flutuantes no fundo se bater a meta do mês.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-235',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #235',
        desc: 'Estilo de Gráficos em linha, barra ou pizza com as suas cores favoritas.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #235</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Estilo de Gráficos em linha, barra ou pizza com as suas cores favoritas.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-236',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #236',
        desc: 'Bordas Arredondadas Gigantes (Fofas) ou Retas (Sérias).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #236</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bordas Arredondadas Gigantes (Fofas) ou Retas (Sérias).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-237',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #237',
        desc: 'Mudança da Fonte Escrita (Estilo "Máquina de Escrever", "Redondinha", "Séria").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #237</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Mudança da Fonte Escrita (Estilo "Máquina de Escrever", "Redondinha", "Séria").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-238',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #238',
        desc: 'Cores de Prioridade (Vermelho Urgente, Azul Tranquilo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #238</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cores de Prioridade (Vermelho Urgente, Azul Tranquilo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-239',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #239',
        desc: 'Animação suave ao trocar de abas, igual deslizar tela no celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #239</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Animação suave ao trocar de abas, igual deslizar tela no celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-240',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #240',
        desc: 'Efeito Neon Pulsante nos botões importantes!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #240</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Efeito Neon Pulsante nos botões importantes!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-241',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #241',
        desc: 'Instalação com 1 clique do Navegador pra tela do celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #241</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Instalação com 1 clique do Navegador pra tela do celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-242',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #242',
        desc: 'O app "Lembra de você" e não precisa fazer login.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #242</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O app "Lembra de você" e não precisa fazer login.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-243',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #243',
        desc: 'Salva tudo sozinho instantaneamente, sem precisar apertar "Salvar".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #243</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Salva tudo sozinho instantaneamente, sem precisar apertar "Salvar".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-244',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #244',
        desc: 'Bater ponto com 1 toque no Botão Gigante do celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #244</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Bater ponto com 1 toque no Botão Gigante do celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-245',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Esqueci de bater a saída"',
        desc: 'Botão mágico que preenche a hora certa pra você.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Esqueci de bater a saída"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão mágico que preenche a hora certa pra você.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-246',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #246',
        desc: 'Notificações normais direto no celular "Ei, faltam 30 min pro fim do expediente".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #246</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Notificações normais direto no celular "Ei, faltam 30 min pro fim do expediente".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-247',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #247',
        desc: 'Alarme tocando pra almoçar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #247</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Alarme tocando pra almoçar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-248',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #248',
        desc: 'Sincronização Local super forte (Pode ficar sem internet 1 mês que funciona).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #248</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Sincronização Local super forte (Pode ficar sem internet 1 mês que funciona).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-249',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Botão de Compartilhar',
        desc: 'Gera um resuminho de texto no WhatsApp direto do botão.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Botão de Compartilhar</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gera um resuminho de texto no WhatsApp direto do botão.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-250',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #250',
        desc: 'Pede a senha pra não deixar o filho apagar suas horas.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #250</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Pede a senha pra não deixar o filho apagar suas horas.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-251',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #251',
        desc: 'Tela não desliga se você deixar o relógio gigante rodando do lado do teclado.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #251</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Tela não desliga se você deixar o relógio gigante rodando do lado do teclado.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-252',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #252',
        desc: 'Exportar tudo pra Excel com 1 botão sem complicação.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #252</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Exportar tudo pra Excel com 1 botão sem complicação.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-253',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #253',
        desc: 'Arrastar e soltar atividades pra mudar a ordem.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #253</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Arrastar e soltar atividades pra mudar a ordem.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-254',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #254',
        desc: 'O Ponto do dia seguinte já entra copiado do dia anterior se for igual.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #254</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O Ponto do dia seguinte já entra copiado do dia anterior se for igual.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-255',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #255',
        desc: 'Geração de Gráfico mensal pra mandar pro chefe sem esforço.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #255</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Geração de Gráfico mensal pra mandar pro chefe sem esforço.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-256',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Limpeza de Primavera"',
        desc: 'Apagar todos os dados velhos de 1 ano com segurança.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Limpeza de Primavera"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Apagar todos os dados velhos de 1 ano com segurança.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-257',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Desfazer',
        desc: 'Apagou sem querer? Aperta botão pra voltar.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Desfazer</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Apagou sem querer? Aperta botão pra voltar.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-258',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Atualização "Muda Sozinho"',
        desc: 'Abre o app e tem função nova, sem ir na loja.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Atualização "Muda Sozinho"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Abre o app e tem função nova, sem ir na loja.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-259',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #259',
        desc: 'Notificação de Parabéns na sexta-feira à noite.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #259</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Notificação de Parabéns na sexta-feira à noite.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-260',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Aviso de Virada de Mês"',
        desc: 'Mostra o saldo final e limpa a tela pra começar fresco.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Aviso de Virada de Mês"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Mostra o saldo final e limpa a tela pra começar fresco.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-261',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #261',
        desc: 'Feriados já pintados de vermelho sozinhos.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #261</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Feriados já pintados de vermelho sozinhos.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-262',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #262',
        desc: 'Se você ganhar dinheiro num mês de 31 dias, ele soma sozinho a diária extra.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #262</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Se você ganhar dinheiro num mês de 31 dias, ele soma sozinho a diária extra.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-263',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #263',
        desc: 'Ponto via atalho (Icone extra só pra bater entrada).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #263</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Ponto via atalho (Icone extra só pra bater entrada).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-264',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #264',
        desc: 'Importar dados da sua planilha velha do Excel antiga super simples.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #264</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Importar dados da sua planilha velha do Excel antiga super simples.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-265',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #265',
        desc: 'Botão "Restaurar" se der algum bug no celular.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #265</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão "Restaurar" se der algum bug no celular.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-266',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #266',
        desc: 'Avisos de segurança se tiver prestes a deletar um mês inteiro.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #266</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Avisos de segurança se tiver prestes a deletar um mês inteiro.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-267',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #267',
        desc: 'O app abre muito rápido (em menos de 1 segundo).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #267</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">O app abre muito rápido (em menos de 1 segundo).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-268',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #268',
        desc: 'Cotação do Dólar aparece lá em cima na barrinha todos os dias.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #268</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Cotação do Dólar aparece lá em cima na barrinha todos os dias.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-269',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #269',
        desc: 'A tabela rola infinitamente sem precisar mudar de "página".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #269</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">A tabela rola infinitamente sem precisar mudar de "página".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-270',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Alerta amigável no celular',
        desc: '"Não se esqueça de preencher o ponto!".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Alerta amigável no celular</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Não se esqueça de preencher o ponto!".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-271',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #271',
        desc: 'Relatório em infográfico lindão (como os "Stories" do Instagram) no fim do mês!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #271</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório em infográfico lindão (como os "Stories" do Instagram) no fim do mês!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-272',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Resumo Falado (Manda pro zap como se fosse texto',
        desc: '"Trabalhei 40h, sobrou R$ X").',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Resumo Falado (Manda pro zap como se fosse texto</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Trabalhei 40h, sobrou R$ X").</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-273',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #273',
        desc: 'Gráfico estilo "Montanha" mostrando os ganhos subindo ao longo do ano.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #273</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gráfico estilo "Montanha" mostrando os ganhos subindo ao longo do ano.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-274',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #274',
        desc: '"Qual foi meu melhor mês na história?".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #274</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Qual foi meu melhor mês na história?".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-275',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Para Onde Vai Meu Tempo"',
        desc: 'Quantas horas no trabalho, quantas horas de trajeto.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Para Onde Vai Meu Tempo"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Quantas horas no trabalho, quantas horas de trajeto.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-276',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ranking dos Dias da Semana (Ex',
        desc: 'Segunda é o dia que você mais faz hora extra).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ranking dos Dias da Semana (Ex</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Segunda é o dia que você mais faz hora extra).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-277',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #277',
        desc: 'Relatório Financeiro Separado (Para ver só grana, não horas).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #277</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório Financeiro Separado (Para ver só grana, não horas).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-278',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Tabela de Comparação de Mês',
        desc: '"Agosto foi R$ 500 melhor que Julho".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Tabela de Comparação de Mês</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Agosto foi R$ 500 melhor que Julho".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-279',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #279',
        desc: 'Barra verde crescendo na tela durante o mês para atingir a meta financeira.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #279</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Barra verde crescendo na tela durante o mês para atingir a meta financeira.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-280',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Previsão Simples',
        desc: '"Se continuar assim, fechará com R$ 3.000".',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Previsão Simples</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Se continuar assim, fechará com R$ 3.000".</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-281',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #281',
        desc: 'Marcador Vermelho nos dias que você fez "Corpo Mole" (Brincadeira pra auto-análise).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #281</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Marcador Vermelho nos dias que você fez "Corpo Mole" (Brincadeira pra auto-análise).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-282',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #282',
        desc: '"Você atingiu o Break-even!" -> O dia que pagou suas contas e tudo é lucro a partir daí!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #282</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Você atingiu o Break-even!" -> O dia que pagou suas contas e tudo é lucro a partir daí!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-283',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Projeção "Meu Final de Ano"',
        desc: 'Qual vai ser meu patrimônio em dezembro?',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Projeção "Meu Final de Ano"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Qual vai ser meu patrimônio em dezembro?</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-284',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #284',
        desc: 'Relatório de Faltas Limpo (Pra mostrar no RH).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #284</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório de Faltas Limpo (Pra mostrar no RH).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-285',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #285',
        desc: 'Mapa de Calor (Quadradinhos igual o GitHub, só com cor do trabalho).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #285</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Mapa de Calor (Quadradinhos igual o GitHub, só com cor do trabalho).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-286',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: '"Onde eu Gasto Mais?"',
        desc: 'Relatório da categoria mais cara do mês.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">"Onde eu Gasto Mais?"</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório da categoria mais cara do mês.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-287',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #287',
        desc: 'Gráfico Radar (Pareia Saúde, Finanças, e Trabalho num pentágono bonitinho).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #287</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Gráfico Radar (Pareia Saúde, Finanças, e Trabalho num pentágono bonitinho).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-288',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #288',
        desc: 'Alertas de "Esgotamento" baseados na tendência da média móvel.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #288</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Alertas de "Esgotamento" baseados na tendência da média móvel.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-289',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #289',
        desc: 'Quantos finais de semana livres você teve no ano inteiro.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #289</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Quantos finais de semana livres você teve no ano inteiro.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-290',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #290',
        desc: 'Resumo de Férias Acumuladas pra mostrar pra família.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #290</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Resumo de Férias Acumuladas pra mostrar pra família.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-291',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #291',
        desc: '"Desempenho Ouro/Prata/Bronze" nos relatórios do mês.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #291</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Desempenho Ouro/Prata/Bronze" nos relatórios do mês.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-292',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #292',
        desc: 'Relatório de Horas em Projetos Diferentes.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #292</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Relatório de Horas em Projetos Diferentes.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-293',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #293',
        desc: 'Resumo Diário Automático antes de dormir.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #293</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Resumo Diário Automático antes de dormir.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-294',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #294',
        desc: 'Dashboard de 1 Só Botão (Resumo numa tela gigante só de números grandões).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #294</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Dashboard de 1 Só Botão (Resumo numa tela gigante só de números grandões).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-295',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #295',
        desc: 'Média Salarial dos últimos 6 meses e dos últimos 12 meses.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #295</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Média Salarial dos últimos 6 meses e dos últimos 12 meses.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-296',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Gráfico Animado',
        desc: 'As barras vão subindo enquanto você rola a página.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Gráfico Animado</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">As barras vão subindo enquanto você rola a página.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-297',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #297',
        desc: 'Estrelinhas de 1 a 5 pro mês todo.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #297</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Estrelinhas de 1 a 5 pro mês todo.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-298',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #298',
        desc: '"Mês Passado vs Este Mês" -> Bolinha verde se melhorou, Bolinha vermelha se piorou.',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #298</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">"Mês Passado vs Este Mês" -> Bolinha verde se melhorou, Bolinha vermelha se piorou.</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-299',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #299',
        desc: 'Detecção de "Lucro Estagnado" (Você está ganhando a mesma coisa há muito tempo!).',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #299</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Detecção de "Lucro Estagnado" (Você está ganhando a mesma coisa há muito tempo!).</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    },
    {
        id: 'tool-300',
        category: 'rh',
        icon: 'fa-solid fa-scale-balanced color-blue',
        title: 'Ferramenta #300',
        desc: 'Botão para Postar seu sucesso no LinkedIn com uma imagem bem bonita gerada na hora!',
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:2rem 1rem;">
                    <i class="fa-solid fa-scale-balanced color-blue" style="font-size:3rem; margin-bottom:1rem; opacity:0.8;"></i>
                    <h4 style="color:#fff; margin-bottom:0.5rem;">Ferramenta #300</h4>
                    <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Botão para Postar seu sucesso no LinkedIn com uma imagem bem bonita gerada na hora!</p>
                    <div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-hammer" style="font-size:2rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.85rem;">Esta ferramenta será ativada na próxima atualização!</p>
                    </div>
                </div>
            `;
        }
    }
];

// Funções Auxiliares Comuns para as ferramentas (se precisarem)
function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

// Inicialização e Renderização da App Store
function initSuperToolsStore() {
    const grid = document.getElementById('super-tools-grid');
    const searchInput = document.getElementById('search-super-tools');
    const filterSelect = document.getElementById('filter-super-tools-category');
    
    if(!grid || !searchInput || !filterSelect) return;

    // Renderizar a lista inicial
    renderSuperToolsGrid('all', '');

    // Ligar eventos de busca e filtro
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

    // Limpar e preparar o modal
    title.innerHTML = `<i class="${tool.icon}"></i> ${tool.title}`;
    body.innerHTML = '';
    footer.style.display = 'none';

    // Injetar a interface da ferramenta
    tool.render(body);

    // Mostrar Modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; // Caso tenha sido setado pra none antes
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initSuperToolsStore();

    // Evento para fechar o Modal da Super Tool
    const btnCloseSt = document.getElementById('btn-close-st-modal');
    const stModal = document.getElementById('super-tools-modal');
    if(btnCloseSt && stModal) {
        btnCloseSt.addEventListener('click', () => {
            stModal.classList.add('hidden');
        });
        
        // Fechar ao clicar fora
        stModal.addEventListener('click', (e) => {
            if (e.target === stModal) {
                stModal.classList.add('hidden');
            }
        });
    }
});
