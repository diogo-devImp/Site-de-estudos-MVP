/**
 * notasView.js
 * Renders semester grades (N1, N2, Média Final) and absences table.
 */

import { notasService } from '../services/notasService.js';

export async function renderNotasView() {
    const container = document.createElement('div');
    container.className = 'notas-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Boletim de Notas & Frequência</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Acompanhe o rendimento acadêmico e controle suas faltas no semestre letivo vigente.
            </p>
        </div>

        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th style="text-align: center;">Avaliação N1</th>
                        <th style="text-align: center;">Avaliação N2</th>
                        <th style="text-align: center;">Média Final</th>
                        <th style="text-align: center;">% Faltas</th>
                        <th style="text-align: center;">Situação</th>
                    </tr>
                </thead>
                <tbody id="notas-table-body">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">Carregando notas...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const list = await notasService.getNotas();
        const tbody = container.querySelector('#notas-table-body');

        tbody.innerHTML = list.map(item => {
            let statusTag = item.status === 'Aprovado' 
                ? '<span class="carbon-tag tag-green">Aprovado</span>' 
                : '<span class="carbon-tag tag-gray">Em Curso</span>';

            return `
                <tr>
                    <td><strong style="color: var(--carbon-text-primary);">${item.disciplina}</strong></td>
                    <td style="text-align: center; font-weight: 500;">${item.n1.toFixed(1)}</td>
                    <td style="text-align: center; font-weight: 500;">${item.n2.toFixed(1)}</td>
                    <td style="text-align: center; font-weight: 700; color: var(--carbon-blue); font-size: 15px;">
                        ${item.media.toFixed(1)}
                    </td>
                    <td style="text-align: center; font-weight: 500;">${item.faltasPct}</td>
                    <td style="text-align: center;">${statusTag}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }

    return container;
}
