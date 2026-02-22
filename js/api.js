const API = {
    url: "https://script.google.com/macros/s/AKfycbwgaW0g_bhj9PR-3XaeI01o3PXSK4ijPVyUMRkARlWwqxKN8w9-GTPsRSrOGI0zwxPg-w/exec", 

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
