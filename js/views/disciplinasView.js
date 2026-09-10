/**
 * disciplinasView.js
 * Renders the Disciplines / Subjects management interface with CRUD operations and IBM Carbon Modal.
 */

import { disciplinasService } from '../services/disciplinasService.js';

export async function renderDisciplinasView() {
    const container = document.createElement('div');
    container.className = 'disciplinas-view';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Disciplinas Cadastradas</h2>
                <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                    Gerencie o escopo, professores, carga horária e vigência das matérias do seu curso.
                </p>
            </div>
            <button type="button" id="btn-nova-disciplina" class="carbon-btn carbon-btn-primary">
                <span>+ Nova Disciplina</span>
            </button>
        </div>

        <!-- Disciplinas Table Container -->
        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Nome da Disciplina</th>
                        <th>Professor Responsável</th>
                        <th>Carga Horária</th>
                        <th>Vigência (Início - Fim)</th>
                        <th>Descrição</th>
                        <th style="text-align: right; width: 140px;">Ações</th>
                    </tr>
                </thead>
                <tbody id="disciplinas-table-body">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">Carregando disciplinas...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Cadastro / Edição de Disciplina -->
        <div id="disciplina-modal-overlay" class="carbon-modal-overlay" style="display: none;">
            <div class="carbon-modal" style="max-width: 550px;">
                <div class="modal-header">
                    <div class="modal-title" id="disciplina-modal-title">Nova Disciplina</div>
                    <button type="button" id="btn-close-modal" class="carbon-btn-ghost" style="font-size: 18px; cursor: pointer;">✕</button>
                </div>

                <div id="disciplina-modal-alert" style="display: none;"></div>

                <form id="disciplina-form">
                    <input type="hidden" id="disciplina-id" value="" />

                    <div class="form-group">
                        <label class="form-label" for="disc-nome">Nome da Disciplina *</label>
                        <input type="text" id="disc-nome" class="carbon-input" placeholder="ex: Algoritmos e Programação" required />
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="disc-prof">Professor *</label>
                            <input type="text" id="disc-prof" class="carbon-input" placeholder="ex: Prof. Carlos Eduardo" required />
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="disc-ch">Carga Horária *</label>
                            <input type="text" id="disc-ch" class="carbon-input" placeholder="ex: 80 horas" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="disc-desc">Descrição</label>
                        <textarea id="disc-desc" class="carbon-input" style="height: 70px; padding: 0.5rem; resize: vertical;" placeholder="Breve ementa ou tópicos principais da disciplina..."></textarea>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="disc-inicio">Data Início</label>
                            <input type="date" id="disc-inicio" class="carbon-input" />
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="disc-fim">Data Fim</label>
                            <input type="date" id="disc-fim" class="carbon-input" />
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-modal" class="carbon-btn carbon-btn-secondary">Cancelar</button>
                        <button type="submit" id="btn-save-disciplina" class="carbon-btn carbon-btn-primary">Salvar Disciplina</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // DOM References
    const tbody = container.querySelector('#disciplinas-table-body');
    const modalOverlay = container.querySelector('#disciplina-modal-overlay');
    const modalTitle = container.querySelector('#disciplina-modal-title');
    const modalAlert = container.querySelector('#disciplina-modal-alert');
    const form = container.querySelector('#disciplina-form');
    
    const inputId = container.querySelector('#disciplina-id');
    const inputNome = container.querySelector('#disc-nome');
    const inputProf = container.querySelector('#disc-prof');
    const inputCh = container.querySelector('#disc-ch');
    const inputDesc = container.querySelector('#disc-desc');
    const inputInicio = container.querySelector('#disc-inicio');
    const inputFim = container.querySelector('#disc-fim');

    const btnNova = container.querySelector('#btn-nova-disciplina');
    const btnClose = container.querySelector('#btn-close-modal');
    const btnCancel = container.querySelector('#btn-cancel-modal');

    // Render Table Helper
    const loadDisciplinas = async () => {
        try {
            const list = await disciplinasService.getDisciplinas();
            if (list.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--carbon-text-muted);">
                            Nenhuma disciplina cadastrada. Clique em "+ Nova Disciplina" para adicionar.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = list.map(item => {
                const datasStr = item.dataInicio && item.dataFim 
                    ? `${formatDate(item.dataInicio)} a ${formatDate(item.dataFim)}`
                    : (item.dataInicio ? `Desde ${formatDate(item.dataInicio)}` : '-');

                return `
                    <tr>
                        <td><strong style="color: var(--carbon-text-primary);">${escapeHtml(item.nome)}</strong></td>
                        <td>${escapeHtml(item.professor)}</td>
                        <td><span class="carbon-tag tag-gray">${escapeHtml(item.cargaHoraria)}</span></td>
                        <td style="font-size: 12px;">${datasStr}</td>
                        <td style="max-width: 250px; font-size: 12px; color: var(--carbon-text-secondary);">${escapeHtml(item.descricao || '-')}</td>
                        <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 0.25rem;">
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-edit-disc" data-id="${item.id}" title="Editar">
                                    ✏️
                                </button>
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-delete-disc" data-id="${item.id}" data-nome="${escapeHtml(item.nome)}" title="Excluir" style="background-color: var(--status-red-border);">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach edit/delete event handlers
            tbody.querySelectorAll('.btn-edit-disc').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    const discList = await disciplinasService.getDisciplinas();
                    const disc = discList.find(d => d.id === id);
                    if (disc) openModal(disc);
                });
            });

            tbody.querySelectorAll('.btn-delete-disc').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    const nome = e.currentTarget.getAttribute('data-nome');
                    if (confirm(`Tem certeza que deseja excluir a disciplina "${nome}"?`)) {
                        try {
                            await disciplinasService.deleteDisciplina(id);
                            loadDisciplinas();
                        } catch (err) {
                            alert(err.message || 'Erro ao excluir disciplina.');
                        }
                    }
                });
            });

        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--status-red-text); text-align: center;">Erro ao carregar disciplinas.</td></tr>`;
        }
    };

    // Modal Helpers
    const openModal = (disc = null) => {
        modalAlert.style.display = 'none';
        if (disc) {
            modalTitle.textContent = 'Editar Disciplina';
            inputId.value = disc.id;
            inputNome.value = disc.nome;
            inputProf.value = disc.professor;
            inputCh.value = disc.cargaHoraria;
            inputDesc.value = disc.descricao || '';
            inputInicio.value = disc.dataInicio || '';
            inputFim.value = disc.dataFim || '';
        } else {
            modalTitle.textContent = 'Nova Disciplina';
            inputId.value = '';
            form.reset();
        }
        modalOverlay.style.display = 'flex';
    };

    const closeModal = () => {
        modalOverlay.style.display = 'none';
        form.reset();
    };

    // Event Listeners
    btnNova.addEventListener('click', () => openModal());
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = inputId.value;
        const data = {
            nome: inputNome.value,
            professor: inputProf.value,
            cargaHoraria: inputCh.value,
            descricao: inputDesc.value,
            dataInicio: inputInicio.value,
            dataFim: inputFim.value
        };

        modalAlert.style.display = 'none';

        try {
            if (id) {
                await disciplinasService.updateDisciplina(id, data);
            } else {
                await disciplinasService.addDisciplina(data);
            }
            closeModal();
            loadDisciplinas();
        } catch (err) {
            modalAlert.className = 'carbon-alert carbon-alert-error';
            modalAlert.textContent = err.message || 'Erro ao salvar disciplina.';
            modalAlert.style.display = 'block';
        }
    });

    // Initial Load
    await loadDisciplinas();

    return container;
}

// Utility Helpers
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}
