/**
 * horariosService.js
 * Returns weekly class schedule for fixed evening timeslots.
 */

export const horariosService = {
    async getHorarios() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    dias: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
                    horarios: [
                        {
                            slot: '19:00 às 20:30',
                            tipo: 'aula',
                            aulas: {
                                'Segunda-feira': { disciplina: 'Algoritmos e Estruturas de Dados', professor: 'Prof. Carlos Eduardo', sala: 'Lab 302' },
                                'Terça-feira': { disciplina: 'Modelagem de Banco de Dados', professor: 'Profa. Renata Lima', sala: 'Sala 405' },
                                'Quarta-feira': { disciplina: 'Engenharia de Software', professor: 'Prof. Marcelo Souza', sala: 'Sala 201' },
                                'Quinta-feira': { disciplina: 'Arquitetura de Computadores', professor: 'Prof. Fernando Dias', sala: 'Lab 104' },
                                'Sexta-feira': { disciplina: 'Design de Interface & UX', professor: 'Profa. Mariana Costa', sala: 'Lab 306' }
                            }
                        },
                        {
                            slot: '20:30 às 21:00',
                            tipo: 'intervalo',
                            titulo: 'Intervalo / Recreio Nacional'
                        },
                        {
                            slot: '21:00 às 22:40',
                            tipo: 'aula',
                            aulas: {
                                'Segunda-feira': { disciplina: 'Algoritmos e Estruturas de Dados (Prática)', professor: 'Prof. Carlos Eduardo', sala: 'Lab 302' },
                                'Terça-feira': { disciplina: 'Modelagem de Banco de Dados (SQL)', professor: 'Profa. Renata Lima', sala: 'Lab 304' },
                                'Quarta-feira': { disciplina: 'Metodologias Ágeis (Workshop)', professor: 'Prof. Marcelo Souza', sala: 'Sala 201' },
                                'Quinta-feira': { disciplina: 'Sistemas Operacionais', professor: 'Prof. Fernando Dias', sala: 'Lab 104' },
                                'Sexta-feira': { disciplina: 'Prototipagem Figma & Frontend', professor: 'Profa. Mariana Costa', sala: 'Lab 306' }
                            }
                        }
                    ]
                });
            }, 300);
        });
    }
};
