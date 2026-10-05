/**
 * cursosService.js
 * Returns extracurricular / complementary hours courses.
 */

export const cursosService = {
    async getCursos() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 101, nome: 'Python Avançado e Análise de Dados', cargaHoraria: '40 horas', categoria: 'Tecnologia', status: 'Disponível' },
                    { id: 102, nome: 'Gestão de Projetos Ágeis com Scrum e Kanban', cargaHoraria: '20 horas', categoria: 'Gestão', status: 'Disponível' },
                    { id: 103, nome: 'Arquitetura de Cloud Computing com AWS & GCP', cargaHoraria: '60 horas', categoria: 'Infraestrutura', status: 'Disponível' },
                    { id: 104, nome: 'Design System e Componentização Web', cargaHoraria: '30 horas', categoria: 'Design', status: 'Disponível' },
                    { id: 105, nome: 'Fundamentos de Segurança da Informação e LGPD', cargaHoraria: '25 horas', categoria: 'Segurança', status: 'Disponível' },
                    { id: 106, nome: 'DevOps: Docker, Kubernetes e CI/CD Na Prática', cargaHoraria: '45 horas', categoria: 'DevOps', status: 'Disponível' }
                ]);
            }, 300);
        });
    }
};
