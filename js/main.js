// Variável global para armazenar as configurações da loja
window.storeConfig = {};

window.onload = async () => {
    renderSkeletons();

    try {
        const data = await API.load();
        
        if (data && data.config) {
            window.storeConfig = Array.isArray(data.config) ? data.config[0] : data.config;
            
            const storeNameEl = document.getElementById("store-name");
            if (storeNameEl) storeNameEl.innerText = window.storeConfig.nome_loja || "Minha Loja";
            
            iniciarCarrosselDinamico();

            const logoImg = document.getElementById("logo");
            if (logoImg && window.storeConfig.logo) {
                logoImg.src = window.storeConfig.logo + '?v=' + new Date().getTime();
                
                logoImg.onload = () => {
                    const corP = window.storeConfig.cor_principal;
                    const corS = window.storeConfig.cor_secundaria;

                    if (corP && corP.trim() !== "" && corP !== "#") {
                        document.documentElement.style.setProperty('--cor-principal', corP);
                    }
                    if (corS && corS.trim() !== "" && corS !== "#") {
                        document.documentElement.style.setProperty('--cor-secundaria', corS);
                    }
                };
            }
        }

        verificarHorario();
        
        // Chamada da nova função de saudação ao carregar
        atualizarSaudacao();

        setTimeout(() => {
            if (data.bairros) renderBairros(data.bairros);
            if (data.produtos) renderProducts(data.produtos);
        }, 500);

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
};

// --- NOVA FUNÇÃO: SAUDAÇÃO DINÂMICA ---
function atualizarSaudacao() {
    const agora = new Date();
    const hora = agora.getHours();
    let saudacao = "";

    if (hora >= 5 && hora < 12) saudacao = "Bom dia";
    else if (hora >= 12 && hora < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    const nomeInput = document.getElementById('cliente-nome');
    const nomeCliente = nomeInput ? nomeInput.value : "";
    const displaySaudacao = document.getElementById('saudacao-usuario');
    
    if (displaySaudacao) {
        displaySaudacao.innerText = `${saudacao}${nomeCliente ? ', ' + nomeCliente : ''}! 👋`;
    }
}

// --- FUNÇÃO DO CARROSSEL ---
function iniciarCarrosselDinamico() {
    const config = window.storeConfig;
    const bgElement = document.getElementById("header-bg");
    if (!bgElement) return;

    const imagens = [config.banner1, config.banner2, config.banner3].filter(url => url && url.trim() !== ""); 
    if (imagens.length === 0) return;

    let index = 0;
    const trocarImagem = () => {
        bgElement.style.backgroundImage = `url("${imagens[index]}")`;
        index = (index + 1) % imagens.length;
    };
    trocarImagem();
    if (imagens.length > 1) setInterval(trocarImagem, 6000);
}

// --- VERIFICAÇÃO DE HORÁRIO ---
function verificarHorario() {
    const config = window.storeConfig;
    const statusContainer = document.getElementById("loja-status-msg");
    const btnCart = document.getElementById("btn-finalizar-cart");

    if (!config || !config.abertura || !config.fechamento) return;

    const agora = new Date();
    const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    const abertura = String(config.abertura).substring(0, 5);
    const fechamento = String(config.fechamento).substring(0, 5);

    let estaAberto = (fechamento > abertura) ? (horaAtual >= abertura && horaAtual <= fechamento) : (horaAtual >= abertura || horaAtual < fechamento);

    if (statusContainer) {
        if (estaAberto) {
            statusContainer.innerHTML = "🟢 Aberto agora";
            statusContainer.className = "status-loja aberto";
        } else {
            statusContainer.innerHTML = `🔴 Fechado - Abrimos às ${abertura}`;
            statusContainer.className = "status-loja fechado";
            if (btnCart) { btnCart.disabled = true; btnCart.innerText = "Loja Fechada"; }
        }
    }
}

// --- RENDERIZAÇÃO DE PRODUTOS ---
function renderProducts(produtos) {
    const container = document.getElementById("products");
    if (!container) return;
    
    const ativos = produtos.filter(p => String(p.ativo).toUpperCase() === "SIM");
    
    container.innerHTML = ativos.map(p => {
        const precoNum = parseFloat(String(p.preco || p.preço || 0).replace(',', '.'));
        const produtoJson = JSON.stringify(p).replace(/'/g, "&apos;");
        
        return `
            <div class="product-card">
                <div class="product-card-top">
                    <img src="${p.imagem}" class="product-img" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="product-info">
                        <h3>${p.nome}</h3>
                        <p>${p.descricao || p.descrição || ''}</p>
                    </div>
                </div>
                <div class="product-card-bottom">
                    <div class="product-price">R$ ${precoNum.toFixed(2).replace('.', ',')}</div>
                    <button onclick='Cart.add(${produtoJson})' class="btn-add">Adicionar</button>
                </div>
            </div>`;
    }).join('');
}

function renderSkeletons() {
    const container = document.getElementById("products");
    if (!container) return;
    container.innerHTML = Array(4).fill(`
        <div class="product-card skeleton">
            <div style="display:flex; gap:15px; padding:15px;">
                <div style="width:100px; height:100px; background:#eee; border-radius:12px;"></div>
                <div style="flex:1;">
                    <div style="width:70%; height:15px; background:#eee; margin-bottom:10px;"></div>
                    <div style="width:90%; height:10px; background:#eee;"></div>
                </div>
            </div>
        </div>`).join('');
}

function renderBairros(bairros) {
    Cart.bairrosData = bairros;
}
// --- MONITOR DE BAIRRO ATENDIDO ---
function monitorarBairro() {
    const inputBairro = document.getElementById('cliente-bairro');
    const statusTaxa = document.getElementById('taxa-status');

    if (!inputBairro || !statusTaxa) return;

    inputBairro.addEventListener('input', function() {
        const valorDigitado = this.value.trim();

        if (valorDigitado.length < 3) {
            statusTaxa.innerText = "";
            return;
        }

        // Verifica se o bairro existe na memória do sistema
        const lista = Cart.bairrosData || [];
        const achou = lista.find(b => 
            b.bairro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
            valorDigitado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );

        if (achou) {
            statusTaxa.innerHTML = `✅ Taxa de entrega: R$ ${parseFloat(achou.taxa).toFixed(2).replace('.', ',')}`;
            statusTaxa.style.color = "#155724"; // Verde
        } else {
            statusTaxa.innerHTML = "❌ Ainda não atendemos este bairro.";
            statusTaxa.style.color = "#d9534f"; // Vermelho (estilo Araújo)
        }
    });
}

// Ativa o monitor assim que a página carregar
window.addEventListener('DOMContentLoaded', monitorarBairro);
