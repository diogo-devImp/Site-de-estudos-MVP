/**
 * tarefasService.js
 * Service for managing student tasks linked to disciplines with localStorage persistence.
 */

const TAREFAS_STORAGE_KEY = 'portal_impacta_tarefas';

const defaultTarefas = [
    {
        id: 1,
        disciplinaId: 1,
        titulo: 'Implementar Lista Encadeada Dupla',
        descricao: 'Desenvolver em C/C++ uma estrutura de dados de lista duplamente encadeada com operações de inserção e remoção.',
        dataPrevista: '2026-09-18',
        status: 'Pendente'
    },
    {
        id: 2,
        disciplinaId: 2,
        titulo: 'Modelagem Conceitual de e-Commerce',
        descricao: 'Entregar o Diagrama Entidade-Relacionamento (DER) para o estudo de caso de uma loja virtual.',
        dataPrevista: '2026-09-15',
        status: 'Concluída'
    },
    {
        id: 3,
        disciplinaId: 3,
        titulo: 'Elaboração da User Story & Backlog',
        descricao: 'Escrever as estórias de usuário e definir a pontuação de esforço para a Sprint 1 do projeto.',
        dataPrevista: '2026-09-22',
        status: 'Pendente'
    },
    {
        id: 4,
        disciplinaId: 5,
        titulo: 'Prototipagem de Alta Fidelidade no Figma',
        descricao: 'Criar protótipo navegável da tela de checkout utilizando a biblioteca do Carbon Design System.',
        dataPrevista: '2026-09-25',
        status: 'Pendente'
    }
];

function getStoredTarefas() {
    const data = localStorage.getItem(TAREFAS_STORAGE_KEY);
    if (!data) {
        localStorage.setItem(TAREFAS_STORAGE_KEY, JSON.stringify(defaultTarefas));
        return defaultTarefas;
    }
    return JSON.parse(data);
}

function saveTarefas(list) {
    localStorage.setItem(TAREFAS_STORAGE_KEY, JSON.stringify(list));
}

export const tarefasService = {
    async getTarefas() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getStoredTarefas());
            }, 200);
        });
    },

    async addTarefa(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!data.titulo || !data.disciplinaId || !data.dataPrevista) {
                    return reject(new Error('Título, Disciplina e Data Prevista são obrigatórios.'));
                }
                const list = getStoredTarefas();
                const newId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
                const newTarefa = {
                    id: newId,
                    disciplinaId: Number(data.disciplinaId),
                    titulo: data.titulo.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataPrevista: data.dataPrevista,
                    status: data.status || 'Pendente'
                };
                list.push(newTarefa);
                saveTarefas(list);
                resolve(newTarefa);
            }, 200);
        });
    },

    async updateTarefa(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const list = getStoredTarefas();
                const index = list.findIndex(t => t.id === Number(id));
                if (index === -1) {
                    return reject(new Error('Tarefa não encontrada.'));
                }
                list[index] = {
                    ...list[index],
                    disciplinaId: Number(data.disciplinaId),
                    titulo: data.titulo.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataPrevista: data.dataPrevista,
                    status: data.status || list[index].status
                };
                saveTarefas(list);
                resolve(list[index]);
            }, 200);
        });
    },

    async toggleStatus(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const list = getStoredTarefas();
                const task = list.find(t => t.id === Number(id));
                if (!task) {
                    return reject(new Error('Tarefa não encontrada.'));
                }
                task.status = task.status === 'Concluída' ? 'Pendente' : 'Concluída';
                saveTarefas(list);
                resolve(task);
            }, 200);
        });
    },

    async deleteTarefa(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const list = getStoredTarefas();
                const filtered = list.filter(t => t.id !== Number(id));
                if (list.length === filtered.length) {
                    return reject(new Error('Tarefa não encontrada.'));
                }
                saveTarefas(filtered);
                resolve({ success: true, message: 'Tarefa excluída com sucesso.' });
            }, 200);
        });
    }
};
