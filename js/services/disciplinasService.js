/**
 * disciplinasService.js - Versão com isolamento por ra_aluno
 */

const API_URL = "http://localhost:8000";

function authHeaders() {
    const token = sessionStorage.getItem('portal_impacta_token');
    if (!token) throw new Error('Sessão expirada. Faça login novamente.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const disciplinasService = {
    // Helper privado para obter o RA do localStorage
    _getRA() {
        const ra = localStorage.getItem("usuarioRA");
        if (!ra) {
            throw new Error("RA do usuário não encontrado. Faça login novamente.");
        }
        return ra;
    },

    async getDisciplinas() {
        try {
            const ra_aluno = this._getRA();
            // Passa o ra_aluno no URL à semelhança das tarefas: /disciplinas/{ra}
            const response = await fetch(`${API_URL}/disciplinas/${ra_aluno}`, { headers: authHeaders() });
            if (!response.ok) throw new Error('Erro ao buscar disciplinas');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async addDisciplina(data) {
        try {
            if (!data.nome || !data.professor || !data.cargaHoraria) {
                throw new Error('Nome, Professor e Carga Horária são obrigatórios.');
            }

            const ra_aluno = this._getRA();

            const response = await fetch(`${API_URL}/disciplinas/`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    ra_aluno: ra_aluno, // Vincula a disciplina ao RA do utilizador logado
                    nome: data.nome.trim(),
                    professor: data.professor.trim(),
                    semestre: data.semestre || '3º Semestre',
                    cor: data.cor || '#3b82f6',
                    cargaHoraria: data.cargaHoraria.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataInicio: data.dataInicio || '',
                    dataFim: data.dataFim || ''
                })
            });

            if (!response.ok) throw new Error('Erro ao criar disciplina');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async updateDisciplina(id, data) {
        try {
            const ra_aluno = this._getRA();

            const response = await fetch(`${API_URL}/disciplinas/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    ra_aluno: ra_aluno,
                    nome: data.nome.trim(),
                    professor: data.professor.trim(),
                    semestre: data.semestre || '3º Semestre',
                    cor: data.cor || '#3b82f6',
                    cargaHoraria: data.cargaHoraria.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataInicio: data.dataInicio || '',
                    dataFim: data.dataFim || ''
                })
            });

            if (!response.ok) throw new Error('Erro ao atualizar disciplina');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async deleteDisciplina(id) {
        try {
            const response = await fetch(`${API_URL}/disciplinas/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });

            if (!response.ok) throw new Error('Erro ao excluir disciplina');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    }
};