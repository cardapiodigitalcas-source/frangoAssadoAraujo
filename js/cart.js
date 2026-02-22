/* =========================================
   CARRINHO ARAÚJO - VERSÃO EMPATIA TOTAL
   ========================================= */

const Cart = {
    items: [],
    taxaEntrega: 0,
    bairrosData: [],
    bairroConfirmado: false,
    enviadoAoWhats: false,

    // Função para saudação automática baseada no relógio
    getSaudacao: function() {
        const hora = new Date().getHours();
        if (hora >= 5 && hora < 12) return "Bom dia";
        if (hora >= 12 && hora < 18) return "Boa tarde";
        return "Boa noite";
    },

    add: function(product) {
        const precoNum = parseFloat(String(product.preco || product.preço || 0).replace(',', '.'));
        const existingItem = this.items.find(item => item.nome === product.nome);
        
        if (existingItem) {
            existingItem.quantidade += 1;
        } else {
            this.items.push({
                nome: product.nome,
                preco: precoNum,
                quantidade: 1
            });
        }
        this.update();
        this.playAnimation(); // Executa a animação de pulo
        console.log("Adicionado: " + product.nome);
    },

    // Nova função para animação de entrada no carrinho
    playAnimation: function() {
        const btn = document.querySelector(".cart-float");
        if (btn) {
            btn.classList.add("cart-bump");
            setTimeout(() => btn.classList.remove("cart-bump"), 300);
        }
    },

    update: function() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const qtdTotal = this.items.reduce((sum, item) => sum + item.quantidade, 0);

        const totalFloat = document.getElementById("cart-total-float");
        const totalModal = document.getElementById("cart-total");
        const cartCount = document.getElementById("cart-count");
        
        if (totalFloat) totalFloat.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (totalModal) totalModal.innerHTML = `<strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>`;
        if (cartCount) cartCount.innerText = qtdTotal; // Atualiza a quantidade visual

        // Mostra/Esconde botão flutuante
        const floatBtn = document.querySelector(".cart-float");
        if (floatBtn) {
            if (qtdTotal > 0) floatBtn.classList.remove("hidden");
            else floatBtn.classList.add("hidden");
        }

        this.render();
    },

    render: function() {
        const container = document.getElementById("cart-items");
        const minOrderContainer = document.getElementById("min-order-info");
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = "<p style='text-align:center;padding:20px;'>Carrinho vazio.</p>";
            if (minOrderContainer) minOrderContainer.innerHTML = "";
            return;
        }

        // Renderiza itens
        container.innerHTML = this.items.map(item => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
                <span>${item.quantidade}x ${item.nome}</span>
                <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');

        // Lógica de Pedido Mínimo Visual (sem constranger o cliente)
        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const valorMinimo = 25.00;

        if (minOrderContainer) {
            if (subtotal < valorMinimo) {
                const falta = (valorMinimo - subtotal).toFixed(2).replace('.', ',');
                minOrderContainer.innerHTML = `
                    <div class="min-order-warning">
                        🛵 <strong>Pedido Mínimo para Entrega: R$ 25,00</strong><br>
                        Faltam apenas R$ ${falta} em delícias no seu carrinho!
                    </div>`;
            } else {
                minOrderContainer.innerHTML = "";
            }
        }
    },

    toggle: function() {
        const modal = document.getElementById("cart-modal");
        if (modal) {
            modal.classList.toggle("hidden");
            this.render();
        }
    },

    // --- FUNÇÃO CHECKOUT (MANTIDA CONFORME APROVADO) ---
    checkout: function() {
        if (this.items.length === 0) return alert("Carrinho vazio!");

        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const valorMinimo = 25.00;

        if (subtotal < valorMinimo) {
            const falta = (valorMinimo - subtotal).toFixed(2).replace('.', ',');
            alert(`😊 Olá! Para realizarmos a entrega, o pedido mínimo é de R$ 25,00.\n\nFalta apenas R$ ${falta} para você completar!`);
            return; 
        }

        document.getElementById("cart-modal").classList.add("hidden");
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout: function() {
        document.getElementById("checkout-modal").classList.add("hidden");
    },

    // --- BOTÃO 1: MENSAGEM PARA A LOJA (MANTIDA) ---
    enviarPedido: function() {
        if (!this.bairroConfirmado) {
            alert("⚠️ Por favor, selecione seu bairro na lista para calcular a entrega!");
            return;
        }

        const config = window.storeConfig || {};
        let foneLoja = config.whatsapp ? String(config.whatsapp).replace(/\D/g, '') : "5591992875156";
        if (!foneLoja.startsWith("55")) foneLoja = "55" + foneLoja;

        const nome = document.getElementById("cliente-nome").value;
        const endereco = document.getElementById("cliente-endereco").value;
        const bairro = document.getElementById("cliente-bairro").value;
        const pagamento = document.getElementById("pagamento").value;
        const obs = document.getElementById("cliente-obs").value;

        if (!nome || !endereco) return alert("Preencha seu nome e endereço para entregarmos com carinho!");

        const saudacao = this.getSaudacao();
        let itensTexto = this.items.map(i => `✅ *${i.quantidade}x* ${i.nome}`).join('\n');
        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const totalGeral = (subtotal + this.taxaEntrega).toFixed(2).replace('.', ',');

        const msg = `✨ *${saudacao}, equipe Araújo!* ❤️\n\n` +
                    `Gostaria de fazer esse pedido com vocês hoje:\n\n` +
                    `👤 *CLIENTE:* ${nome}\n` +
                    `📍 *ENDEREÇO:* ${endereco}\n` +
                    `🏙️ *BAIRRO:* ${bairro}\n\n` +
                    `*MEU PEDIDO:* \n${itensTexto}\n\n` +
                    `🛵 *TAXA:* R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}\n` +
                    `💰 *TOTAL: R$ ${totalGeral}*\n` +
                    `💳 *PAGAMENTO:* ${pagamento}\n` +
                    `${obs ? '💬 *OBSERVAÇÃO:* ' + obs : ''}\n\n` +
                    `*Desde já, muito obrigado pelo excelente atendimento e carinho!* 🙏✨`;

        window.open(`https://api.whatsapp.com/send?phone=${foneLoja}&text=${encodeURIComponent(msg)}`, "_blank");

        this.enviadoAoWhats = true;
        const btnMoto = document.getElementById("btn-solicitar-motoboy");
        if (btnMoto) {
            btnMoto.disabled = false;
            btnMoto.style.opacity = "1";
            btnMoto.style.background = "#ff9800"; 
            btnMoto.innerText = "🛵 2. Avisar Entregador Agora";
        }
        alert("✔️ Pedido enviado ao WhatsApp da Loja!\n\n⚠️ NÃO FECHE ESSA TELA. Agora clique no botão laranja abaixo para avisar o entregador.");
    },

    // --- BOTÃO 2: MENSAGEM PARA O MOTOBOY (MANTIDA) ---
    solicitarMotoboy: function() {
        const foneCentral = "5591980481900"; 
        const saudacao = this.getSaudacao();
        const linkMapsLoja = "https://maps.app.goo.gl/xUBwD25yRjBRgNPe8"; 

        const nomeCliente = document.getElementById("cliente-nome").value;
        const enderecoCliente = document.getElementById("cliente-endereco").value;
        const bairroCliente = document.getElementById("cliente-bairro").value;

        const msgLogistica = 
            `🛵 *${saudacao}, amigo entregador!* ✨\n` +
            `Temos uma entrega saindo do Araújo, pode nos ajudar?\n\n` +
            `🏢 *ESTABELECIMENTO (COLETA):*\n` +
            `Frango Assado do Araújo\n` +
            `📍 Localização da Loja: ${linkMapsLoja}\n` +
            `Endereço: Av. Altamira, sn - Bairro: Saudade\n\n` +
            `--------------------------\n\n` +
            `👤 *CLIENTE:* ${nomeCliente}\n` +
            `🏠 *ENTREGA:* ${enderecoCliente}\n` +
            `🏙️ *BAIRRO:* ${bairroCliente}\n\n` +
            `💵 *TAXA:* R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}\n\n` +
            `*Muito obrigado, bom trabalho e dirija com segurança!* 🙏🍀`;

        const url = `https://api.whatsapp.com/send?phone=${foneCentral}&text=${encodeURIComponent(msgLogistica)}`;
        window.open(url, "_blank");

        alert("Tudo pronto! Sua entrega foi solicitada com sucesso. Muito obrigado! ❤️");
        this.items = []; 
        this.update();
        this.closeCheckout();
        setTimeout(() => { location.reload(); }, 500); 
    },

    clear: function() {
        if (confirm("Limpar carrinho?")) {
            this.items = [];
            this.update();
            this.render();
            this.toggle();
        }
    },

    sugerirBairros: function(v) {},
    ajustarPagamento: function(v) {},
    copiarPix: function() {}
};

window.Cart = Cart;
