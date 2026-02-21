const API = {
    url: "https://script.google.com/macros/s/AKfycbw7lw62lq1_KoSWFgVaXqfRpNUrmObbmnS9_zejxuhJa4Sm3Kyu5YTlupcVY3dR3ec-vQ/exec", 

    async load() {
        try {
            const response = await fetch(this.url);
            const data = await response.json();
            window.storeConfig = data.config; 
            window.bairrosCadastrados = data.bairros; // Salva a lista de bairros da planilha
            return data;
        } catch (error) {
            console.error("Erro ao carregar API:", error);
            return { produtos: [], config: {}, bairros: [] };
        }
    }
};
