/**
 * disciplinasService.js
 * Service for managing student subjects / disciplines with localStorage persistence.
 */

const DISCIPLINAS_STORAGE_KEY = 'portal_impacta_disciplinas';

const defaultDisciplinas = [
    {
        id: 1,
        nome: 'Algoritmos e Estruturas de Dados',
        professor: 'Prof. Carlos Eduardo',
        cargaHoraria: '80 horas',
        descricao: 'Estudo de estruturas de dados fundamentais, listas, árvores, grafos e algoritmos de ordenação e busca.',
        dataInicio: '2026-02-02',
        dataFim: '2026-06-25'
    },
    {
        id: 2,
        nome: 'Modelagem de Banco de Dados',
        professor: 'Profa. Renata Lima',
        cargaHoraria: '60 horas',
        descricao: 'Conceitos de bancos de dados relacionais, linguagem SQL, modelagem relacional ER e normalização.',
        dataInicio: '2026-02-03',
        dataFim: '2026-06-26'
    },
    {
        id: 3,
        nome: 'Engenharia de Software e Metodologias',
        professor: 'Prof. Marcelo Souza',
        cargaHoraria: '60 horas',
        descricao: 'Ciclo de vida do software, engenharia de requisitos, arquitetura e métodos ágeis (Scrum/Kanban).',
        dataInicio: '2026-02-04',
        dataFim: '2026-06-27'
    },
    {
        id: 4,
        nome: 'Arquitetura de Computadores & SO',
        professor: 'Prof. Fernando Dias',
        cargaHoraria: '80 horas',
        descricao: 'Organização de processadores, gestão de memória, concorrência e processos em sistemas operacionais modernos.',
        dataInicio: '2026-02-05',
        dataFim: '2026-06-28'
    },
    {
        id: 5,
        nome: 'Design de Interface & Experiência do Usuário (UX)',
        professor: 'Profa. Mariana Costa',
        cargaHoraria: '40 horas',
        descricao: 'Princípios de design de interface, arquitetura de informação, usabilidade, heurísticas e prototipagem em Figma.',
        dataInicio: '2026-02-06',
        dataFim: '2026-06-29'
    }
];

function getStoredDisciplinas() {
    const data = localStorage.getItem(DISCIPLINAS_STORAGE_KEY);
    if (!data) {
        localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(defaultDisciplinas));
        return defaultDisciplinas;
    }
    return JSON.parse(data);
}

function saveDisciplinas(list) {
    localStorage.setItem(DISCIPLINAS_STORAGE_KEY, JSON.stringify(list));
}

export const disciplinasService = {
    async getDisciplinas() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getStoredDisciplinas());
            }, 200);
        });
    },

    async addDisciplina(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!data.nome || !data.professor || !data.cargaHoraria) {
                    return reject(new Error('Nome, Professor e Carga Horária são obrigatórios.'));
                }
                const list = getStoredDisciplinas();
                const newId = list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1;
                const newDisciplina = {
                    id: newId,
                    nome: data.nome.trim(),
                    professor: data.professor.trim(),
                    cargaHoraria: data.cargaHoraria.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataInicio: data.dataInicio || '',
                    dataFim: data.dataFim || ''
                };
                list.push(newDisciplina);
                saveDisciplinas(list);
                resolve(newDisciplina);
            }, 200);
        });
    },

    async updateDisciplina(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const list = getStoredDisciplinas();
                const index = list.findIndex(d => d.id === Number(id));
                if (index === -1) {
                    return reject(new Error('Disciplina não encontrada.'));
                }
                list[index] = {
                    ...list[index],
                    nome: data.nome.trim(),
                    professor: data.professor.trim(),
                    cargaHoraria: data.cargaHoraria.trim(),
                    descricao: (data.descricao || '').trim(),
                    dataInicio: data.dataInicio || '',
                    dataFim: data.dataFim || ''
                };
                saveDisciplinas(list);
                resolve(list[index]);
            }, 200);
        });
    },

    async deleteDisciplina(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const list = getStoredDisciplinas();
                const filtered = list.filter(d => d.id !== Number(id));
                if (list.length === filtered.length) {
                    return reject(new Error('Disciplina não encontrada.'));
                }
                saveDisciplinas(filtered);
                resolve({ success: true, message: 'Disciplina excluída com sucesso.' });
            }, 200);
        });
    }
};
