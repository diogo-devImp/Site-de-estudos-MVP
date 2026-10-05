const API_URL = "http://localhost:8000";

function authHeaders() {
    const token = sessionStorage.getItem('portal_impacta_token');
    if (!token) throw new Error('Sessão expirada. Faça login novamente.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const tarefasService = {
    async getTarefas() {
        try {
            const ra = localStorage.getItem('usuarioRA') || '123456789';
            const response = await fetch(`${API_URL}/tarefas/${ra}`, { headers: authHeaders() });
            if (!response.ok) throw new Error('Erro ao buscar tarefas');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async addTarefa(tarefaData) {
        try {
            const ra = localStorage.getItem('usuarioRA');
            const dadosComRA = { ...tarefaData, ra_aluno: ra };

            const response = await fetch(`${API_URL}/tarefas/`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(dadosComRA)
            });

            if (!response.ok) throw new Error('Erro ao criar tarefa');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async updateTarefa(id, tarefaData) {
        try {
            const ra = localStorage.getItem('usuarioRA');
            const dadosComRA = { ...tarefaData, ra_aluno: ra };

            const response = await fetch(`${API_URL}/tarefas/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(dadosComRA)
            });

            if (!response.ok) throw new Error('Erro ao atualizar tarefa');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async deleteTarefa(id) {
        try {
            const response = await fetch(`${API_URL}/tarefas/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (!response.ok) throw new Error('Erro ao excluir tarefa');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async toggleStatus(id) {
        try {
            const tarefas = await this.getTarefas();
            const tarefa = tarefas.find(t => t.id === id);
            
            if (!tarefa) throw new Error("Tarefa não encontrada");

            const novoStatus = tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';
            const ra = localStorage.getItem('usuarioRA');
            
            const dadosAtualizados = {
                disciplinaId: tarefa.disciplinaId,
                titulo: tarefa.titulo,
                descricao: tarefa.descricao,
                dataPrevista: tarefa.dataPrevista,
                status: novoStatus,
                ra_aluno: ra
            };

            const response = await fetch(`${API_URL}/tarefas/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(dadosAtualizados)
            });

            if (!response.ok) throw new Error('Erro ao alterar status da tarefa');
            return await response.json();
        } catch (error) {
            console.error("Erro no toggleStatus:", error);
            throw error;
        }
    },
    
};