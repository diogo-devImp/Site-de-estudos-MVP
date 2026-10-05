/**
 * notasService.js - Versão com isolamento por ra_aluno e função de update
 */

const API_URL = "http://localhost:8000";

export const notasService = {
    _getRA() {
        const ra = localStorage.getItem("usuarioRA");
        if (!ra) {
            throw new Error("RA do usuário não encontrado. Faça login novamente.");
        }
        return ra;
    },

    async getNotas() {
        try {
            const ra_aluno = this._getRA();
            const response = await fetch(`${API_URL}/notas/${ra_aluno}`);
            if (!response.ok) throw new Error('Erro ao buscar notas');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async addNota(data) {
        try {
            const ra_aluno = this._getRA();
            const dadosComRA = { ...data, ra_aluno: ra_aluno };

            const response = await fetch(`${API_URL}/notas/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosComRA)
            });
            if (!response.ok) throw new Error('Erro ao criar registo de nota');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    // ADICIONADO: Método para atualizar notas existentes
    async updateNota(id, data) {
        try {
            const response = await fetch(`${API_URL}/notas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Erro ao atualizar nota');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async deleteNota(id) {
        try {
            const response = await fetch(`${API_URL}/notas/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao excluir nota');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    }
};