/**
 * dashboardView.js - Versão dinâmica integrada com Notas, Disciplinas e Horários do Aluno
 */

import { notasService } from '../services/notasService.js';
import { disciplinasService } from '../services/disciplinasService.js';
import { horariosService } from '../services/horariosService.js'; // <-- Importa o serviço de horários

export async function renderDashboardView(user, onNavigate) {
    const container = document.createElement('div');
    container.className = 'dashboard-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 24px; font-weight: 400; color: var(--carbon-text-primary);">
                Bem-vindo(a), ${user.nome} ${user.sobrenome} 👋
            </h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Curso: <strong>${user.curso || 'Engenharia de Software'}</strong> — ${user.semestre || '1º Semestre - Noturno'} (RA: ${user.ra})
            </p>
        </div>

        <div class="carbon-grid">
            <!-- Card 1: Avisos Importantes -->
            <div class="carbon-card">
                <div class="card-title">
                    <span>📢 Avisos da Secretaria</span>
                    <span class="carbon-tag tag-green">Atualizado</span>
                </div>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 0.75rem 0; border-bottom: 1px solid var(--carbon-border);">
                        <strong style="color: var(--carbon-blue); font-size: 13px;">Prazo de Rematrícula 2026/2</strong>
                        <p style="font-size: 12px; color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                            Abertura das rematrículas online a partir de 15/10. Mantenha seus documentos em dia.
                        </p>
                    </li>
                    <li style="padding: 0.75rem 0; border-bottom: 1px solid var(--carbon-border);">
                        <strong style="color: var(--carbon-text-primary); font-size: 13px;">Feira de Tecnologia Impacta Tech</strong>
                        <p style="font-size: 12px; color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                            Inscrições abertas para apresentação de trabalhos de TCC e projetos integradores.
                        </p>
                    </li>
                    <li style="padding: 0.75rem 0;">
                        <strong style="color: var(--carbon-text-primary); font-size: 13px;">Horas Complementares</strong>
                        <p style="font-size: 12px; color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                            Envie seus certificados de cursos livres na aba "Cursos Extracurriculares".
                        </p>
                    </li>
                </ul>
            </div>

            <!-- Card 2: Frequência e Faltas (DINÂMICO COM PORCENTAGEM) -->
            <div class="carbon-card">
                <div class="card-title">
                    <span>📊 Resumo de Frequência</span>
                    <span class="carbon-tag tag-gray">Semestre Atual</span>
                </div>
                
                <div style="text-align: center; padding: 1rem 0; border-bottom: 1px solid var(--carbon-border);">
                    <div id="dashboard-frequencia-global" style="font-size: 36px; font-weight: 700; color: var(--carbon-blue);">...</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
                        Frequência Média Global
                    </div>
                </div>

                <div id="dashboard-lista-faltas" style="margin-top: 1rem; max-height: 140px; overflow-y: auto;">
                    <div style="font-size: 13px; color: var(--carbon-text-secondary); text-align: center; padding: 1rem;">Carregando faltas...</div>
                </div>

                <div style="border-top: 1px solid var(--carbon-border); padding-top: 0.75rem; margin-top: 0.75rem; display: flex; justify-content: space-between; font-size: 13px;">
                    <span style="color: var(--carbon-text-secondary);">Limite Máximo de Faltas:</span>
                    <strong style="color: var(--carbon-text-muted);">25% (12 aulas)</strong>
                </div>

                <button type="button" id="btn-ver-notas" class="carbon-btn carbon-btn-secondary carbon-btn-block" style="margin-top: 1.5rem; height: 38px;">
                    Ver Detalhes de Notas & Faltas →
                </button>
            </div>

            <!-- Card 3: Próximas Aulas de Hoje (DINÂMICO) -->
            <div class="carbon-card">
                <div class="card-title">
                    <span>🗓️ Próximas Aulas de Hoje</span>
                    <span class="carbon-tag tag-green">Noturno</span>
                </div>

                <div id="dashboard-aulas-hoje">
                    <div style="font-size: 13px; color: var(--carbon-text-secondary); text-align: center; padding: 1.5rem;">Carregando aulas...</div>
                </div>

                <button type="button" id="btn-ver-horarios" class="carbon-btn carbon-btn-secondary carbon-btn-block" style="margin-top: 1.5rem; height: 38px;">
                    Ver Grade Semanal Completa →
                </button>
            </div>
        </div>
    `;

    // Função para carregar os dados reais de disciplinas, faltas e aulas do dia
    async function carregarResumoDashboard() {
        try {
            const [disciplinas, notasSalvas, schedule] = await Promise.all([
                disciplinasService.getDisciplinas(),
                notasService.getNotas(),
                horariosService.getHorarios()
            ]);

            // 1. Processamento de Frequência e Faltas
            const elFreqGlobal = container.querySelector('#dashboard-frequencia-global');
            const elListaFaltas = container.querySelector('#dashboard-lista-faltas');

            if (disciplinas.length === 0) {
                elFreqGlobal.textContent = "0%";
                elListaFaltas.innerHTML = `<div style="font-size: 13px; color: var(--carbon-text-secondary); text-align: center; padding: 1rem;">Nenhuma disciplina encontrada.</div>`;
            } else {
                let somaPorcentagemFrequencia = 0;
                const totalAulasSemestre = 48;

                elListaFaltas.innerHTML = disciplinas.map(disc => {
                    const registo = notasSalvas.find(n => n.disciplina.trim().toLowerCase() === disc.nome.trim().toLowerCase());
                    const faltas = registo ? (registo.faltas || 0) : 0;

                    const percentualFaltas = ((faltas / totalAulasSemestre) * 100).toFixed(1);
                    const percentualPresenca = Math.max(0, (100 - percentualFaltas)).toFixed(0);
                    
                    somaPorcentagemFrequencia += parseFloat(percentualPresenca);
                    const corFaltas = percentualFaltas > 25 ? 'var(--status-red-text)' : 'var(--carbon-text-primary)';

                    return `
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 0.5rem; border-bottom: 1px dashed var(--carbon-border); padding-bottom: 0.25rem;">
                            <span style="color: var(--carbon-text-secondary);">${disc.nome}:</span>
                            <div>
                                <strong style="color: ${corFaltas};">${faltas} faltas</strong> 
                                <span style="font-size: 11px; color: var(--carbon-text-secondary);">(${percentualFaltas}%)</span>
                            </div>
                        </div>
                    `;
                }).join('');

                const mediaGlobal = (somaPorcentagemFrequencia / disciplinas.length).toFixed(0);
                elFreqGlobal.textContent = `${mediaGlobal}%`;
            }

            // 2. Processamento das Aulas de Hoje (Dinâmicas com base no dia da semana atual)
            const elAulasHoje = container.querySelector('#dashboard-aulas-hoje');
            const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            const diaAtualIndex = new Date().getDay();
            
            // Se for fim de semana (Domingo ou Sábado), exibe Segunda-feira por defeito, senão o dia respetivo
            const diaHojeStr = (diaAtualIndex === 0 || diaAtualIndex === 6) ? 'Segunda-feira' : diasSemana[diaAtualIndex];

            const slot1Item = schedule.horarios.find(h => h.slot === '19:00 às 20:30');
            const slot2Item = schedule.horarios.find(h => h.slot === '21:00 às 22:40');

            const aulaSlot1 = slot1Item?.aulas[diaHojeStr] || { disciplina: 'Sem aula programada', professor: '-', sala: '-' };
            const aulaSlot2 = slot2Item?.aulas[diaHojeStr] || { disciplina: 'Sem aula programada', professor: '-', sala: '-' };

            elAulasHoje.innerHTML = `
                <div style="margin-bottom: 1rem; padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-blue);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-blue); text-transform: uppercase;">19:00 - 20:30 (${diaHojeStr})</div>
                    <div style="font-weight: 600; font-size: 14px; margin-top: 0.25rem;">${aulaSlot1.disciplina}</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary);">${aulaSlot1.professor} • ${aulaSlot1.sala}</div>
                </div>

                <div style="margin-bottom: 1rem; padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-text-muted);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-text-muted); text-transform: uppercase;">20:30 - 21:00</div>
                    <div style="font-weight: 600; font-size: 13px;">Intervalo / Recreio Nacional</div>
                </div>

                <div style="padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-blue);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-blue); text-transform: uppercase;">21:00 - 22:40 (${diaHojeStr})</div>
                    <div style="font-weight: 600; font-size: 14px; margin-top: 0.25rem;">${aulaSlot2.disciplina}</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary);">${aulaSlot2.professor} • ${aulaSlot2.sala}</div>
                </div>
            `;

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        }
    }

    // Executa o carregamento ao montar a view
    carregarResumoDashboard();

    // Event listeners
    container.querySelector('#btn-ver-notas').addEventListener('click', () => onNavigate('notas'));
    container.querySelector('#btn-ver-horarios').addEventListener('click', () => onNavigate('horarios'));

    return container;
}