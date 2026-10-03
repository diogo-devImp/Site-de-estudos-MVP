/**
 * notasView.js - Renders student grades with editing, auto-calculation, and status colors
 */

import { notasService } from '../services/notasService.js';
import { disciplinasService } from '../services/disciplinasService.js';

export async function renderNotasView() {
    const container = document.createElement('div');
    container.className = 'notas-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Notas e Faltas Acadêmicas</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Acompanhe o seu desempenho por disciplina, avaliações e controlo de presenças.
            </p>
        </div>

        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th>AV1</th>
                        <th>AV2</th>
                        <th>Média</th>
                        <th>Faltas</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="notas-table-body">
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">Carregando notas...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MODAL DE EDIÇÃO DE NOTAS -->
        <div id="modal-editar-nota" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:white; padding:2rem; border-radius:8px; width:400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 id="modal-titulo-disc" style="margin-bottom: 1rem; font-size: 18px; font-weight: 600;">Editar Notas</h3>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:0.25rem;">Nota AV1</label>
                    <input type="number" id="input-av1" step="0.1" min="0" max="10" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" />
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:0.25rem;">Nota AV2</label>
                    <input type="number" id="input-av2" step="0.1" min="0" max="10" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" />
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:0.25rem;">Quantidade de Faltas</label>
                    <input type="number" id="input-faltas" min="0" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" />
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button id="btn-cancelar-modal" style="padding: 8px 16px; background:#ccc; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
                    <button id="btn-salvar-modal" style="padding: 8px 16px; background:#0f62fe; color:white; border:none; border-radius:4px; cursor:pointer;">Salvar</button>
                </div>
            </div>
        </div>
    `;

    async function carregarDados() {
        try {
            const tbody = container.querySelector('#notas-table-body');
            const [disciplinas, notasSalvas] = await Promise.all([
                disciplinasService.getDisciplinas(),
                notasService.getNotas()
            ]);

            if (disciplinas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--carbon-text-muted);">Nenhuma disciplina encontrada para exibir notas.</td></tr>`;
                return;
            }

            tbody.innerHTML = disciplinas.map(disc => {
                // Procura se já existe um registo de notas para esta disciplina
                const notaRegisto = notasSalvas.find(n => n.disciplina.trim().toLowerCase() === disc.nome.trim().toLowerCase());
                
                const av1 = notaRegisto ? notaRegisto.av1 : '-';
                const av2 = notaRegisto ? notaRegisto.av2 : '-';
                const media = notaRegisto ? notaRegisto.media : '-';
                const faltas = notaRegisto ? notaRegisto.faltas : 0;
                const status = notaRegisto ? notaRegisto.status : 'Em curso';

                // Cores dinâmicas para o Status
                let tagClass = "carbon-tag tag-gray";
                if (status === "Aprovado") tagClass = "carbon-tag tag-green";
                else if (status === "Reprovado") tagClass = "carbon-tag tag-red";

                return `
                    <tr>
                        <td><strong style="color: var(--carbon-text-primary);">${disc.nome}</strong></td>
                        <td>${av1}</td>
                        <td>${av2}</td>
                        <td><strong>${media}</strong></td>
                        <td>${faltas}</td>
                        <td><span class="${tagClass}">${status}</span></td>
                        <td>
                            <div style="display: inline-flex; gap: 0.25rem;">
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-editar-nota" data-disc="${disc.nome}" data-id="${notaRegisto ? notaRegisto.id : ''}" title="Editar Notas">
                                    ✏️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Adicionar eventos aos botões de editar
            container.querySelectorAll('.btn-editar-nota').forEach(button => {
                button.addEventListener('click', (e) => {
                    const disciplinaNome = e.currentTarget.getAttribute('data-disc');
                    const notaId = e.currentTarget.getAttribute('data-id');
                    const notaRegisto = notasSalvas.find(n => n.id === notaId);

                    abrirModal(disciplinaNome, notaRegisto, disciplinas);
                });
            });

        } catch (err) {
            console.error("Erro ao carregar notas:", err);
        }
    }

    function abrirModal(disciplinaNome, notaRegisto, disciplinas) {
        const modal = container.querySelector('#modal-editar-nota');
        const titulo = container.querySelector('#modal-titulo-disc');
        const inputAv1 = container.querySelector('#input-av1');
        const inputAv2 = container.querySelector('#input-av2');
        const inputFaltas = container.querySelector('#input-faltas');

        titulo.innerText = `Editar Notas: ${disciplinaNome}`;
        inputAv1.value = notaRegisto ? notaRegisto.av1 : '';
        inputAv2.value = notaRegisto ? notaRegisto.av2 : '';
        inputFaltas.value = notaRegisto ? notaRegisto.faltas : 0;

        modal.style.display = 'flex';

        // Botão Fechar / Cancelar
        const fecharModal = () => { modal.style.display = 'none'; };
        container.querySelector('#btn-cancelar-modal').onclick = fecharModal;

        // Botão Salvar com Cálculo Automático
        container.querySelector('#btn-salvar-modal').onclick = async () => {
            const av1 = parseFloat(inputAv1.value) || 0;
            const av2 = parseFloat(inputAv2.value) || 0;
            const faltas = parseInt(inputFaltas.value) || 0;

            // CÁLCULO AUTOMÁTICO DA MÉDIA (Adivido por 2)
            const media = Number(((av1 + av2) / 2).toFixed(1));

            // REGRA DE STATUS AUTOMÁTICA (>= 6.0 Aprovado, senão Reprovado)
            const status = media >= 6.0 ? "Aprovado" : "Reprovado";

            const payload = {
                disciplina: disciplinaNome,
                av1: av1,
                av2: av2,
                media: media,
                faltas: faltas,
                status: status
            };

            try {
                if (notaRegisto && notaRegisto.id) {
                    // Atualiza registo existente
                    await notasService.updateNota(notaRegisto.id, payload);
                } else {
                    // Cria novo registo se ainda não existia na base de dados
                    await notasService.addNota(payload);
                }
                fecharModal();
                carregarDados(); // Recarrega a tabela com os novos valores calculados
            } catch (error) {
                alert("Erro ao salvar notas: " + error.message);
            }
        };
    }

    await carregarDados();
    return container;
}