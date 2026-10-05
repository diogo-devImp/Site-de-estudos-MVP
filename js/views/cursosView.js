/**
 * cursosView.js
 * Renders Extracurricular / Complementary Hours courses in a CSS Grid layout.
 */

import { cursosService } from '../services/cursosService.js';

export async function renderCursosView() {
    const container = document.createElement('div');
    container.className = 'cursos-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Cursos Extracurriculares & Horas Complementares</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Inscreva-se em cursos livres para acumular horas de Atividades Complementares (AAC).
            </p>
        </div>

        <div id="cursos-grid" class="carbon-grid">
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fff;">Carregando cursos disponíveis...</div>
        </div>
    `;

    try {
        const cursos = await cursosService.getCursos();
        const grid = container.querySelector('#cursos-grid');

        grid.innerHTML = cursos.map(curso => `
            <div class="carbon-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <span class="carbon-tag tag-gray">${curso.categoria}</span>
                        <span style="font-size: 12px; font-weight: 600; color: var(--carbon-blue);">${curso.cargaHoraria}</span>
                    </div>
                    <h3 style="font-size: 16px; font-weight: 600; color: var(--carbon-text-primary); margin-bottom: 0.5rem; line-height: 1.3;">
                        ${curso.nome}
                    </h3>
                    <p style="font-size: 13px; color: var(--carbon-text-secondary); margin-bottom: 1.5rem;">
                        Curso modalidade EAD com emissão automática de certificado válido para comprovação acadêmica.
                    </p>
                </div>

                <button type="button" class="carbon-btn carbon-btn-primary btn-acessar-curso" data-id="${curso.id}" data-nome="${curso.nome}">
                    <span>Acessar Curso</span>
                    <span style="font-size: 16px;">→</span>
                </button>
            </div>
        `).join('');

        // Event handler
        grid.querySelectorAll('.btn-acessar-curso').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const nomeCurso = target.getAttribute('data-nome');
                alert(`[Inscrição Realizada] Você iniciou a matrícula no curso: "${nomeCurso}". Redirecionando para o ambiente de aprendizagem...`);
            });
        });

    } catch (err) {
        console.error(err);
    }

    return container;
}
