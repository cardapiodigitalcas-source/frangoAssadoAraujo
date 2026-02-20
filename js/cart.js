const Cart = {
    items: [],
    bairrosData: [],
    taxaEntrega: 0,

    add: function(product) {
        const existingItem = this.items.find(item => item.nome === product.nome);
        if (existingItem) {
            existingItem.quantidade = (existingItem.quantidade || 1) + 1;
        } else {
            this.items.push({
                ...product,
                quantidade: 1
            });
        }
        this.render();
        this.update(); // Estava dando erro aqui porque a função sumiu
    },

    remove: function(index) {
        if (this.items[index].quantidade > 1) {
            this.items[index].quantidade--;
        } else {
            this.items.splice(index, 1);
        }
        this.render();
        this.update();
    },

    clear: function() {
        if (this.items.length === 0) return;
        if (confirm("Deseja realmente limpar o carrinho?")) {
            this.items = [];
            this.render();
            this.update();
            this.toggle();
        }
    },

    render: function() {
        const container = document.getElementById("cart-items");
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = "<p style='text-align:center;padding:20px;color:#666;'>Seu carrinho está vazio.</p>";
            return;
        }

        container.innerHTML = this.items.map((item, index) => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");

            return `
                <div class="cart-item" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding:10px 0;">
                    <div>
                        <strong>${item.nome}</strong><br>
                        <span>R$ ${(preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <button onclick="Cart.remove(${index})" style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;background:white;">-</button>
                        <strong>${item.quantidade}</strong>
                        <button onclick='Cart.add(${itemJson})' style="width:30px;height:30px;border-radius:50%;border:1px solid #ccc;background:white;">+</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    toggle: function() {
        const modal = document.getElementById("cart-modal");
        if (modal) modal.classList.toggle("hidden");
    },

    checkout: function() {
        if (this.items.length === 0) return alert("Adicione itens primeiro");
        this.toggle();
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout: function() {
        document.getElementById("checkout-modal").classList.add("hidden");
        document.getElementById("cart-modal").classList.remove("hidden");
    },

    sugerirBairros: function(valor) {
        const lista = document.getElementById("lista-sugestoes");
        if (!valor || valor.length < 2) {
            lista.classList.add("hidden");
            return;
        }
        const filtrados = this.bairrosData.filter(b =>
            b.bairro.toLowerCase().includes(valor.toLowerCase())
        );
        if (filtrados.length === 0) {
            lista.classList.add("hidden");
            return;
        }
        lista.innerHTML = filtrados.map(b => `
            <div class="sugestao-item" onclick="Cart.selecionarBairro('${b.bairro}', ${String(b.taxa).replace(',', '.')})">
                ${b.bairro}
            </div>
        `).join('');
        lista.classList.remove("hidden");
    },

    selecionarBairro: function(nome, taxa) {
        document.getElementById("cliente-bairro").value = nome;
        document.getElementById("lista-sugestoes").classList.add("hidden");
        this.taxaEntrega = taxa;
        const status = document.getElementById("taxa-status");
        if (status) {
            status.innerHTML = `✅ Taxa de entrega: R$ ${taxa.toFixed(2).replace('.', ',')}`;
            status.style.color = "green";
        }
        this.update();
    },

    ajustarPagamento: function(tipo) {
        const areaPix = document.getElementById("area-pix");
        const areaTroco = document.getElementById("area-troco");
        if (areaPix) areaPix.classList.add("hidden");
        if (areaTroco) areaTroco.classList.add("hidden");

        if (tipo === "Pix") {
            areaPix.classList.remove("hidden");
            const chave = window.storeConfig.chave_pix || window.storeConfig.whatsapp || "Consulte-nos";
            const favorecido = window.storeConfig.favorecido || window.storeConfig.nome_loja || "Araújo";
            document.getElementById("chave-pix-valor").innerText = chave;
            document.getElementById("favorecido-pix").innerText = favorecido;
        }
        if (tipo === "Dinheiro") areaTroco.classList.remove("hidden");
    },

    // ESTA FUNÇÃO TINHA SUMIDO:
    copiarPix: function() {
        const chave = document.getElementById("chave-pix-valor").innerText;
        navigator.clipboard.writeText(chave);
        alert("Pix copiado!");
    },

    // ESTA FUNÇÃO TINHA SUMIDO E É A MAIS IMPORTANTE:
    update: function() {
        const subtotal = this.items.reduce((sum, item) => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            return sum + (preco * item.quantidade);
        }, 0);

        const total = subtotal + this.taxaEntrega;
        const el = document.getElementById("cart-total");
        if (el) el.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        const elFloat = document.getElementById("cart-total-float");
        if (elFloat) elFloat.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    },

    enviarPedido: function() {
        if (this.items.length === 0) return alert("Carrinho vazio");
        const nome = document.getElementById("cliente-nome")?.value || "Cliente";
        const bairro = document.getElementById("cliente-bairro")?.value || "Não informado";
        const endereco = document.getElementById("cliente-endereco")?.value || "Não informado";
        const pagamento = document.getElementById("pagamento")?.value || "A combinar";
        const troco = document.getElementById("valor-troco")?.value || "";
        const obs = document.getElementById("cliente-obs")?.value || "";

        let fone = window.storeConfig.whatsapp || window.storeConfig.telefone || "";
        fone = String(fone).replace(/\D/g, '');
        if (fone.length <= 11) fone = "55" + fone;

        const hora = new Date().getHours();
        const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

        let mensagem = `✅ *NOVO PEDIDO - ${window.storeConfig.nome_loja || 'ARAÚJO'}* ✅\n`;
        mensagem += `------------------------------------------\n`;
        mensagem += `Olá, equipe! ${saudacao}.\n`;
        mensagem += `*${nome}* acabou de enviar um pedido:\n\n`;
        
        mensagem += `📝 *ITENS DO PEDIDO*\n`;
        let subtotal = 0;
        this.items.forEach(item => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            const totalItem = preco * item.quantidade;
            subtotal += totalItem;
            mensagem += `• ${item.quantidade}x ${item.nome} (R$ ${totalItem.toFixed(2).replace('.', ',')})\n`;
        });

        const totalGeral = subtotal + this.taxaEntrega;
        mensagem += `\n------------------------------------------\n`;
        mensagem += `💰 *RESUMO DE VALORES*\n`;
        mensagem += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        mensagem += `*Taxa de Entrega:* R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}\n`;
        mensagem += `🛒 *TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;
        mensagem += `------------------------------------------\n\n`;
        
        mensagem += `📍 *DADOS PARA ENTREGA*\n`;
        mensagem += `*Endereço:* ${endereco}\n`;
        mensagem += `*Bairro:* ${bairro}\n`;
        mensagem += `💳 *Forma de Pagamento:* ${pagamento}\n`;

        if (pagamento === "Dinheiro" && troco) mensagem += `💵 *Troco para:* R$ ${troco}\n`;
        if (obs) mensagem += `\n💬 *OBSERVAÇÕES:* ${obs}\n`;
        
        mensagem += `\n------------------------------------------\n`;
        mensagem += `🙏 *Aguardamos a confirmação. Muito obrigado!*`;

        const url = `https://api.whatsapp.com/send?phone=${fone}&text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");

        this.items = [];
        this.taxaEntrega = 0;
        this.render();
        this.update();
        this.closeCheckout();
    }
};
