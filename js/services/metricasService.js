/**
 * metricasService.js
 * Calls the Python FastAPI /metricas/{ra_aluno} endpoint
 * which calculates weighted progress, overdue alerts, and forecasts.
 */

const API_URL = "http://localhost:8000";

export const metricasService = {
    _getRA() {
        const ra = localStorage.getItem("usuarioRA");
        if (!ra) throw new Error("RA do usuário não encontrado. Faça login novamente.");
        return ra;
    },

    async getMetricas() {
        try {
            const ra = this._getRA();
            const token = sessionStorage.getItem('portal_impacta_token');
            if (!token) throw new Error('Sessão expirada. Faça login novamente.');
            const response = await fetch(`${API_URL}/metricas/${ra}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao buscar métricas');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar métricas:", error);
            throw error;
        }
    }
};
