/**
 * notasService.js
 * Returns grades and attendance percentage per subject.
 */

export const notasService = {
    async getNotas() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { disciplina: 'Algoritmos e Estruturas de Dados', n1: 8.5, n2: 9.0, media: 8.8, faltasPct: '5%', status: 'Aprovado' },
                    { disciplina: 'Modelagem de Banco de Dados', n1: 7.0, n2: 8.5, media: 7.8, faltasPct: '8%', status: 'Em Curso' },
                    { disciplina: 'Engenharia de Software e Metodologias', n1: 9.5, n2: 9.0, media: 9.3, faltasPct: '2%', status: 'Aprovado' },
                    { disciplina: 'Arquitetura de Computadores & SO', n1: 6.5, n2: 7.5, media: 7.0, faltasPct: '12%', status: 'Em Curso' },
                    { disciplina: 'Design de Interface & Experiência do Usuário (UX)', n1: 10.0, n2: 9.5, media: 9.8, faltasPct: '0%', status: 'Aprovado' }
                ]);
            }, 300);
        });
    }
};
