/**
 * tarefasView.js
 * Renders the Student Tasks management interface linked to registered disciplines.
 */

import { tarefasService } from '../services/tarefasService.js';
import { disciplinasService } from '../services/disciplinasService.js';

export async function renderTarefasView() {
    const container = document.createElement('div');
    container.className = 'tarefas-view';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Tarefas & Trabalhos Acadêmicos</h2>
                <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                    Organize suas entregas, projetos e atividades vinculadas às suas disciplinas.
                </p>
            </div>
            <button type="button" id="btn-nova-tarefa" class="carbon-btn carbon-btn-primary">
                <span>+ Nova Tarefa</span>
            </button>
        </div>

        <!-- Filter Controls -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center;">
            <label class="form-label" for="filter-status" style="margin-bottom: 0; white-space: nowrap;">Filtrar Status:</label>
            <select id="filter-status" class="carbon-input" style="max-width: 200px;">
                <option value="todos">Todas as Tarefas</option>
                <option value="Pendente">Pendentes</option>
                <option value="Concluída">Concluídas</option>
            </select>
        </div>

        <!-- Tasks Table Container -->
        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th style="width: 110px;">Status</th>
                        <th>Título da Tarefa</th>
                        <th>Disciplina</th>
                        <th>Data Prevista</th>
                        <th>Descrição</th>
                        <th style="text-align: right; width: 180px;">Ações</th>
                    </tr>
                </thead>
                <tbody id="tarefas-table-body">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">Carregando tarefas...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Cadastro / Edição de Tarefa -->
        <div id="tarefa-modal-overlay" class="carbon-modal-overlay" style="display: none;">
            <div class="carbon-modal" style="max-width: 550px;">
                <div class="modal-header">
                    <div class="modal-title" id="tarefa-modal-title">Nova Tarefa</div>
                    <button type="button" id="btn-close-modal" class="carbon-btn-ghost" style="font-size: 18px; cursor: pointer;">✕</button>
                </div>

                <div id="tarefa-modal-alert" style="display: none;"></div>

                <form id="tarefa-form">
                    <input type="hidden" id="tarefa-id" value="" />

                    <div class="form-group">
                        <label class="form-label" for="tar-disciplina">Disciplina Vinculada *</label>
                        <select id="tar-disciplina" class="carbon-input" required>
                            <option value="">Selecione uma disciplina...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tar-titulo">Título da Tarefa *</label>
                        <input type="text" id="tar-titulo" class="carbon-input" placeholder="ex: Entrega do Projeto Integrador" required />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tar-desc">Descrição / Detalhes</label>
                        <textarea id="tar-desc" class="carbon-input" style="height: 70px; padding: 0.5rem; resize: vertical;" placeholder="Orientações do professor, requisitos ou links..."></textarea>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="tar-data">Data Prevista de Entrega *</label>
                            <input type="date" id="tar-data" class="carbon-input" required />
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="tar-status">Status Inicial</label>
                            <select id="tar-status" class="carbon-input">
                                <option value="Pendente">Pendente</option>
                                <option value="Concluída">Concluída</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" id="btn-cancel-modal" class="carbon-btn carbon-btn-secondary">Cancelar</button>
                        <button type="submit" id="btn-save-tarefa" class="carbon-btn carbon-btn-primary">Salvar Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // DOM References
    const tbody = container.querySelector('#tarefas-table-body');
    const filterStatus = container.querySelector('#filter-status');
    const modalOverlay = container.querySelector('#tarefa-modal-overlay');
    const modalTitle = container.querySelector('#tarefa-modal-title');
    const modalAlert = container.querySelector('#tarefa-modal-alert');
    const form = container.querySelector('#tarefa-form');

    const inputId = container.querySelector('#tarefa-id');
    const selectDisciplina = container.querySelector('#tar-disciplina');
    const inputTitulo = container.querySelector('#tar-titulo');
    const inputDesc = container.querySelector('#tar-desc');
    const inputData = container.querySelector('#tar-data');
    const selectStatus = container.querySelector('#tar-status');

    const btnNova = container.querySelector('#btn-nova-tarefa');
    const btnClose = container.querySelector('#btn-close-modal');
    const btnCancel = container.querySelector('#btn-cancel-modal');

    let disciplinasList = [];

    // Helper: Populate Discipline Select Dropdown
    const populateDisciplinasDropdown = async () => {
        disciplinasList = await disciplinasService.getDisciplinas();
        selectDisciplina.innerHTML = '<option value="">Selecione uma disciplina...</option>' + 
            disciplinasList.map(d => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
    };

    // Helper: Find discipline name by ID
    const getDisciplinaNome = (id) => {
        const disc = disciplinasList.find(d => d.id === id);
        return disc ? disc.nome : 'Disciplina não encontrada';
    };

    // Helper: Load Tarefas Table
    const loadTarefas = async () => {
        try {
            await populateDisciplinasDropdown();
            let list = await tarefasService.getTarefas();

            const selectedFilter = filterStatus.value;
            if (selectedFilter !== 'todos') {
                list = list.filter(t => t.status === selectedFilter);
            }

            if (list.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--carbon-text-muted);">
                            Nenhuma tarefa encontrada. Clique em "+ Nova Tarefa" para cadastrar.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = list.map(item => {
                const isConcluida = item.status === 'Concluída';
                const statusTag = isConcluida 
                    ? '<span class="carbon-tag tag-green">Concluída</span>' 
                    : '<span class="carbon-tag tag-red">Pendente</span>';

                return `
                    <tr style="${isConcluida ? 'opacity: 0.75;' : ''}">
                        <td>${statusTag}</td>
                        <td>
                            <strong style="color: var(--carbon-text-primary); ${isConcluida ? 'text-decoration: line-through;' : ''}">
                                ${escapeHtml(item.titulo)}
                            </strong>
                        </td>
                        <td>
                            <span class="carbon-tag tag-gray">${escapeHtml(getDisciplinaNome(item.disciplinaId))}</span>
                        </td>
                        <td style="font-size: 13px; font-weight: 500;">
                            📅 ${formatDate(item.dataPrevista)}
                        </td>
                        <td style="max-width: 250px; font-size: 12px; color: var(--carbon-text-secondary);">
                            ${escapeHtml(item.descricao || '-')}
                        </td>
                        <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 0.25rem;">
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-toggle-task" data-id="${item.id}" title="${isConcluida ? 'Reabrir Tarefa' : 'Marcar como Concluída'}">
                                    ${isConcluida ? '↩' : '✓'}
                                </button>
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-edit-task" data-id="${item.id}" title="Editar">
                                    ✏️
                                </button>
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-delete-task" data-id="${item.id}" data-titulo="${escapeHtml(item.titulo)}" title="Excluir" style="background-color: var(--status-red-border);">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Event Handlers for Action Buttons
            tbody.querySelectorAll('.btn-toggle-task').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    await tarefasService.toggleStatus(id);
                    loadTarefas();
                });
            });

            tbody.querySelectorAll('.btn-edit-task').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    const taskList = await tarefasService.getTarefas();
                    const task = taskList.find(t => t.id === id);
                    if (task) openModal(task);
                });
            });

            tbody.querySelectorAll('.btn-delete-task').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.currentTarget.getAttribute('data-id'));
                    const titulo = e.currentTarget.getAttribute('data-titulo');
                    if (confirm(`Tem certeza que deseja excluir a tarefa "${titulo}"?`)) {
                        try {
                            await tarefasService.deleteTarefa(id);
                            loadTarefas();
                        } catch (err) {
                            alert(err.message || 'Erro ao excluir tarefa.');
                        }
                    }
                });
            });

        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--status-red-text); text-align: center;">Erro ao carregar tarefas.</td></tr>`;
        }
    };

    // Modal Helpers
    const openModal = async (task = null) => {
        modalAlert.style.display = 'none';
        await populateDisciplinasDropdown();

        if (task) {
            modalTitle.textContent = 'Editar Tarefa';
            inputId.value = task.id;
            selectDisciplina.value = task.disciplinaId;
            inputTitulo.value = task.titulo;
            inputDesc.value = task.descricao || '';
            inputData.value = task.dataPrevista;
            selectStatus.value = task.status;
        } else {
            modalTitle.textContent = 'Nova Tarefa';
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
    filterStatus.addEventListener('change', loadTarefas);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = inputId.value;
        const data = {
            disciplinaId: selectDisciplina.value,
            titulo: inputTitulo.value,
            descricao: inputDesc.value,
            dataPrevista: inputData.value,
            status: selectStatus.value
        };

        modalAlert.style.display = 'none';

        try {
            if (id) {
                await tarefasService.updateTarefa(id, data);
            } else {
                await tarefasService.addTarefa(data);
            }
            closeModal();
            loadTarefas();
        } catch (err) {
            modalAlert.className = 'carbon-alert carbon-alert-error';
            modalAlert.textContent = err.message || 'Erro ao salvar tarefa.';
            modalAlert.style.display = 'block';
        }
    });

    // Initial Load
    await loadTarefas();

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
