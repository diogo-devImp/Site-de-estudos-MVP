/**
 * horariosView.js
 * Renders weekly class schedule table with fixed evening slots (19:00 - 20:30, Intervalo, 21:00 - 22:40).
 */

import { horariosService } from '../services/horariosService.js';

export async function renderHorariosView() {
    const container = document.createElement('div');
    container.className = 'horarios-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Cronograma de Aulas & Grade Horária</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Turno Noturno — Horários fixos de Segunda a Sexta-feira.
            </p>
        </div>

        <div class="carbon-table-container">
            <table class="carbon-table" style="min-width: 800px;">
                <thead>
                    <tr>
                        <th style="width: 140px;">Horário / Slot</th>
                        <th>Segunda-feira</th>
                        <th>Terça-feira</th>
                        <th>Quarta-feira</th>
                        <th>Quinta-feira</th>
                        <th>Sexta-feira</th>
                    </tr>
                </thead>
                <tbody id="horarios-table-body">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">Carregando grade horária...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const schedule = await horariosService.getHorarios();
        const tbody = container.querySelector('#horarios-table-body');

        tbody.innerHTML = schedule.horarios.map(item => {
            if (item.tipo === 'intervalo') {
                return `
                    <tr style="background-color: #e0e0e0; font-weight: 600;">
                        <td style="font-weight: 700; color: var(--carbon-blue);">${item.slot}</td>
                        <td colspan="5" style="text-align: center; color: var(--carbon-text-secondary); letter-spacing: 1px; text-transform: uppercase; font-size: 12px;">
                            ☕ ${item.titulo}
                        </td>
                    </tr>
                `;
            }

            const dayCells = schedule.dias.map(dia => {
                const aula = item.aulas[dia];
                if (!aula) return `<td>-</td>`;
                return `
                    <td style="vertical-align: top;">
                        <div style="font-weight: 600; color: var(--carbon-text-primary); font-size: 13px;">${aula.disciplina}</div>
                        <div style="font-size: 11px; color: var(--carbon-text-secondary); margin-top: 0.25rem;">👨‍🏫 ${aula.professor}</div>
                        <div style="margin-top: 0.35rem;">
                            <span class="carbon-tag tag-gray">${aula.sala}</span>
                        </div>
                    </td>
                `;
            }).join('');

            return `
                <tr>
                    <td style="font-weight: 700; color: var(--carbon-blue); white-space: nowrap;">${item.slot}</td>
                    ${dayCells}
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }

    return container;
}
