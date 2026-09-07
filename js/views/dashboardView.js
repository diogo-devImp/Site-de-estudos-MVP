/**
 * dashboardView.js
 * Renders the main dashboard screen post-login with overview cards:
 * - Announcements / Avisos
 * - Absence % summary / Faltas
 * - Next Classes / Próximas Aulas
 */

export async function renderDashboardView(user, onNavigate) {
    const container = document.createElement('div');
    container.className = 'dashboard-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 24px; font-weight: 400; color: var(--carbon-text-primary);">
                Bem-vindo(a), ${user.nome} ${user.sobrenome} 👋
            </h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Curso: <strong>${user.curso || 'Análise e Desenvolvimento de Sistemas'}</strong> — ${user.semestre || '3º Semestre'} (RA: ${user.ra})
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

            <!-- Card 2: Frequência e Faltas -->
            <div class="carbon-card">
                <div class="card-title">
                    <span>📊 Resumo de Frequência</span>
                    <span class="carbon-tag tag-gray">Semestre Atual</span>
                </div>
                
                <div style="text-align: center; padding: 1rem 0; border-bottom: 1px solid var(--carbon-border);">
                    <div style="font-size: 42px; font-weight: 700; color: var(--carbon-blue);">95%</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
                        Frequência Global do Aluno
                    </div>
                </div>

                <div style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 0.5rem;">
                        <span>Faltas em Banco de Dados:</span>
                        <strong style="color: var(--carbon-text-primary);">10%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 0.5rem;">
                        <span>Faltas em Arquitetura de Comp.:</span>
                        <strong style="color: var(--status-red-text);">12%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>Limite Máximo Permitido:</span>
                        <strong style="color: var(--carbon-text-muted);">25%</strong>
                    </div>
                </div>

                <button type="button" id="btn-ver-notas" class="carbon-btn carbon-btn-secondary carbon-btn-block" style="margin-top: 1.5rem; height: 38px;">
                    Ver Detalhes de Notas & Faltas →
                </button>
            </div>

            <!-- Card 3: Próximas Aulas de Hoje -->
            <div class="carbon-card">
                <div class="card-title">
                    <span>🗓️ Próximas Aulas de Hoje</span>
                    <span class="carbon-tag tag-green">Noturno</span>
                </div>

                <div style="margin-bottom: 1rem; padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-blue);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-blue); text-transform: uppercase;">19:00 - 20:30</div>
                    <div style="font-weight: 600; font-size: 14px; margin-top: 0.25rem;">Algoritmos e Estruturas de Dados</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary);">Prof. Carlos Eduardo • Lab 302</div>
                </div>

                <div style="margin-bottom: 1rem; padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-text-muted);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-text-muted); text-transform: uppercase;">20:30 - 21:00</div>
                    <div style="font-weight: 600; font-size: 13px;">Intervalo</div>
                </div>

                <div style="padding: 0.75rem; background-color: var(--carbon-bg); border-left: 3px solid var(--carbon-blue);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--carbon-blue); text-transform: uppercase;">21:00 - 22:40</div>
                    <div style="font-weight: 600; font-size: 14px; margin-top: 0.25rem;">Algoritmos e Estruturas de Dados (Prática)</div>
                    <div style="font-size: 12px; color: var(--carbon-text-secondary);">Prof. Carlos Eduardo • Lab 302</div>
                </div>

                <button type="button" id="btn-ver-horarios" class="carbon-btn carbon-btn-secondary carbon-btn-block" style="margin-top: 1.5rem; height: 38px;">
                    Ver Grade Semanal Completa →
                </button>
            </div>
        </div>
    `;

    // Event listeners
    container.querySelector('#btn-ver-notas').addEventListener('click', () => onNavigate('notas'));
    container.querySelector('#btn-ver-horarios').addEventListener('click', () => onNavigate('horarios'));

    return container;
}
