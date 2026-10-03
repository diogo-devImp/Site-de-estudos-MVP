/**
 * horariosService.js - Fornece a grade horária dinâmica com base no curso do utilizador logado
 */

import { authService } from './authService.js';

export const horariosService = {
    async getHorarios() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Obtém o utilizador logado para identificar o curso escolhido no cadastro
                const user = authService.getCurrentUser();
                const cursoAluno = user?.curso || 'Engenharia de Software';

                // Grades curriculares específicas por curso com professores e labs (1 a 210)
                const gradesPorCurso = {
                    "Engenharia de Software": {
                        slot1: {
                            'Segunda-feira': { disciplina: 'Fundamentos da Engenharia de Software', professor: 'Prof. Marcelo Souza', sala: 'Lab 102' },
                            'Terça-feira': { disciplina: 'Engenharia de Requisitos', professor: 'Profa. Vanessa Ribeiro', sala: 'Sala 45' },
                            'Quarta-feira': { disciplina: 'Modelagem de Software', professor: 'Profa. Vanessa Ribeiro', sala: 'Lab 105' },
                            'Quinta-feira': { disciplina: 'Programação Orientada a Objetos', professor: 'Prof. André Silva', sala: 'Lab 110' },
                            'Sexta-feira': { disciplina: 'Banco de Dados', professor: 'Profa. Renata Lima', sala: 'Lab 205' }
                        },
                        slot2: {
                            'Segunda-feira': { disciplina: 'Arquitetura de Software', professor: 'Profa. Mariana Costa', sala: 'Sala 112' },
                            'Terça-feira': { disciplina: 'Desenvolvimento Web', professor: 'Profa. Juliana Rocha', sala: 'Lab 150' },
                            'Quarta-feira': { disciplina: 'Testes de Software', professor: 'Prof. Gabriel Martins', sala: 'Sala 88' },
                            'Quinta-feira': { disciplina: 'Gerenciamento de Projetos', professor: 'Profa. Patrícia Lima', sala: 'Sala 50' },
                            'Sexta-feira': { disciplina: 'DevOps', professor: 'Prof. Thiago Souza', sala: 'Lab 180' }
                        }
                    },
                    "Ciência da Computação (CC)": {
                        slot1: {
                            'Segunda-feira': { disciplina: 'Algoritmos e Estruturas de Dados', professor: 'Prof. Carlos Eduardo', sala: 'Lab 12' },
                            'Terça-feira': { disciplina: 'Programação Orientada a Objetos', professor: 'Prof. André Silva', sala: 'Lab 110' },
                            'Quarta-feira': { disciplina: 'Banco de Dados', professor: 'Profa. Renata Lima', sala: 'Lab 205' },
                            'Quinta-feira': { disciplina: 'Engenharia de Software', professor: 'Prof. Marcelo Souza', sala: 'Sala 101' },
                            'Sexta-feira': { disciplina: 'Sistemas Operacionais', professor: 'Prof. Fernando Dias', sala: 'Lab 104' }
                        },
                        slot2: {
                            'Segunda-feira': { disciplina: 'Redes de Computadores', professor: 'Prof. Roberto Alves', sala: 'Lab 95' },
                            'Terça-feira': { disciplina: 'Arquitetura de Computadores', professor: 'Prof. Fernando Dias', sala: 'Lab 104' },
                            'Quarta-feira': { disciplina: 'Cálculo', professor: 'Prof. Lucas Mendes', sala: 'Sala 30' },
                            'Quinta-feira': { disciplina: 'Inteligência Artificial', professor: 'Profa. Beatriz Santos', sala: 'Lab 190' },
                            'Sexta-feira': { disciplina: 'Teoria da Computação', professor: 'Prof. Ricardo Gomes', sala: 'Sala 75' }
                        }
                    },
                    "Análise e Desenvolvimento de Sistemas (ADS)": {
                        slot1: {
                            'Segunda-feira': { disciplina: 'Algoritmos e Programação', professor: 'Prof. Carlos Eduardo', sala: 'Lab 12' },
                            'Terça-feira': { disciplina: 'Banco de Dados', professor: 'Profa. Renata Lima', sala: 'Lab 205' },
                            'Quarta-feira': { disciplina: 'Desenvolvimento Web', professor: 'Profa. Juliana Rocha', sala: 'Lab 150' },
                            'Quinta-feira': { disciplina: 'Programação Orientada a Objetos', professor: 'Prof. André Silva', sala: 'Lab 110' },
                            'Sexta-feira': { disciplina: 'Engenharia de Software', professor: 'Prof. Marcelo Souza', sala: 'Sala 101' }
                        },
                        slot2: {
                            'Segunda-feira': { disciplina: 'Análise de Sistemas', professor: 'Profa. Vanessa Ribeiro', sala: 'Sala 201' },
                            'Terça-feira': { disciplina: 'Desenvolvimento Mobile', professor: 'Prof. Bruno Costa', sala: 'Lab 165' },
                            'Quarta-feira': { disciplina: 'Redes de Computadores', professor: 'Prof. Roberto Alves', sala: 'Lab 95' },
                            'Quinta-feira': { disciplina: 'Sistemas Operacionais', professor: 'Prof. Fernando Dias', sala: 'Lab 104' },
                            'Sexta-feira': { disciplina: 'DevOps', professor: 'Prof. Thiago Souza', sala: 'Lab 180' }
                        }
                    },
                    "Sistemas de Informação (SI)": {
                        slot1: {
                            'Segunda-feira': { disciplina: 'Fundamentos de Sistemas de Informação', professor: 'Profa. Camila Duarte', sala: 'Sala 50' },
                            'Terça-feira': { disciplina: 'Banco de Dados', professor: 'Profa. Renata Lima', sala: 'Lab 205' },
                            'Quarta-feira': { disciplina: 'Engenharia de Software', professor: 'Prof. Marcelo Souza', sala: 'Sala 101' },
                            'Quinta-feira': { disciplina: 'Análise de Sistemas', professor: 'Profa. Vanessa Ribeiro', sala: 'Sala 201' },
                            'Sexta-feira': { disciplina: 'Programação', professor: 'Prof. André Silva', sala: 'Lab 110' }
                        },
                        slot2: {
                            'Segunda-feira': { disciplina: 'Redes de Computadores', professor: 'Prof. Roberto Alves', sala: 'Lab 95' },
                            'Terça-feira': { disciplina: 'Sistemas Operacionais', professor: 'Prof. Fernando Dias', sala: 'Lab 104' },
                            'Quarta-feira': { disciplina: 'Gestão de Projetos', professor: 'Profa. Patrícia Lima', sala: 'Sala 45' },
                            'Quinta-feira': { disciplina: 'Segurança da Informação', professor: 'Prof. Alexandre Ramos', sala: 'Lab 140' },
                            'Sexta-feira': { disciplina: 'Inteligência Artificial', professor: 'Profa. Beatriz Santos', sala: 'Lab 190' }
                        }
                    }
                };

                const gradeAtual = gradesPorCurso[cursoAluno] || gradesPorCurso["Engenharia de Software"];

                resolve({
                    dias: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
                    horarios: [
                        {
                            slot: '19:00 às 20:30',
                            tipo: 'aula',
                            aulas: gradeAtual.slot1
                        },
                        {
                            slot: '20:30 às 21:00',
                            tipo: 'intervalo',
                            titulo: 'Intervalo / Recreio Nacional'
                        },
                        {
                            slot: '21:00 às 22:40',
                            tipo: 'aula',
                            aulas: gradeAtual.slot2
                        }
                    ]
                });
            }, 300);
        });
    }
};