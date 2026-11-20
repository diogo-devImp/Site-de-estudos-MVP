/**
 * relatoriosService.js
 * Gera o relatório de progresso em PDF no backend Python (/relatorios/{ra}/gerar)
 * e baixa o arquivo com o token JWT (um link simples não envia o header Authorization).
 */

const API_URL = "http://localhost:8000";

export const relatoriosService = {
    _auth() {
        const ra = localStorage.getItem("usuarioRA");
        const token = sessionStorage.getItem('portal_impacta_token');
        if (!ra || !token) throw new Error('Sessão expirada. Faça login novamente.');
        return { ra, headers: { 'Authorization': `Bearer ${token}` } };
    },

    async gerarEBaixar() {
        const { ra, headers } = this._auth();

        const gerar = await fetch(`${API_URL}/relatorios/${ra}/gerar`, { method: 'POST', headers });
        if (!gerar.ok) throw new Error('Erro ao gerar o relatório.');
        const { arquivo, download_url } = await gerar.json();

        const download = await fetch(`${API_URL}${download_url}`, { headers });
        if (!download.ok) throw new Error('Erro ao baixar o relatório.');
        const blob = await download.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = arquivo;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        return arquivo;
    }
};
