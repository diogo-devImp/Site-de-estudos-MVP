/**
 * disciplinasView.js
 * Gestão de Disciplinas com % progresso por tarefas, busca por texto e CRUD conectado ao FastAPI + Firestore.
 */

import { disciplinasService } from '../services/disciplinasService.js';
import { tarefasService } from '../services/tarefasService.js';

export async function renderDisciplinasView() {
    const container = document.createElement('div');
    container.className = 'disciplinas-view';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Disciplinas Cadastradas</h2>
                <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                    Gerencie disciplinas e acompanhe o progresso por conclusão de tarefas.
                </p>
            </div>
            <button type="button" id="btn-nova-disciplina" class="carbon-btn carbon-btn-primary">
                <span>+ Nova Disciplina</span>
            </button>
        </div>

        <!-- Busca por Texto -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center;">
            <div style="flex: 1; position: relative;">
                <input
                    type="text"
                    id="search-disciplinas"
                    class="carbon-input"
                    placeholder="🔍  Buscar por nome da disciplina ou professor..."
                    style="padding-left: 1rem;"
                />
            </div>
            <button type="button" id="btn-clear-search" class="carbon-btn carbon-btn-secondary carbon-btn-sm" style="height: 40px; display: none;">
                ✕ Limpar
            </button>
        </div>

        <!-- Sumário de Progresso Global -->
        <div id="progresso-sumario" style="margin-bottom: 1.5rem; display: none;">
            <div class="carbon-card" style="padding: 1rem; display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--carbon-text-muted);">Progresso Global</div>
                    <div id="progresso-global-num" style="font-size: 28px; font-weight: 700; color: var(--carbon-blue);">–</div>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--carbon-text-muted);">Tarefas Concluídas</div>
                    <div id="progresso-concluidas" style="font-size: 28px; font-weight: 700; color: var(--status-green-text);">–</div>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--carbon-text-muted);">Tarefas Pendentes</div>
                    <div id="progresso-pendentes" style="font-size: 28px; font-weight: 700; color: var(--status-red-text);">–</div>
                </div>
                <div style="flex: 1; min-width: 200px; max-width: 320px;">
                    <canvas id="chart-progresso-pizza" height="130"></canvas>
                </div>
            </div>
        </div>

        <!-- Disciplinas Table Container -->
        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Nome da Disciplina</th>
                        <th>Professor Responsável</th>
                        <th>Carga Horária</th>
                        <th>Vigência</th>
                        <th style="width: 180px;">Progresso (Tarefas)</th>
                        <th style="text-align: right; width: 100px;">Ações</th>
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
    const searchInput = container.querySelector('#search-disciplinas');
    const btnClearSearch = container.querySelector('#btn-clear-search');
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

    let allDisciplinas = [];
    let allTarefas = [];
    let pizzaChart = null;

    // Mapa de progresso: disciplinaId -> { total, concluidas, pct }
    const calcularProgresso = (disciplinaId) => {
        const tarefasDaDisc = allTarefas.filter(t => t.disciplinaId === disciplinaId);
        const total = tarefasDaDisc.length;
        const concluidas = tarefasDaDisc.filter(t => t.status === 'Concluída').length;
        const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        return { total, concluidas, pct };
    };

    // Render progresso bar inline
    const progressoBar = (pct) => {
        const color = pct === 100 ? 'var(--status-green-border)' : pct > 50 ? 'var(--carbon-blue)' : 'var(--status-red-border)';
        return `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="flex: 1; height: 6px; background: var(--carbon-border);">
                    <div style="width: ${pct}%; height: 100%; background: ${color}; transition: width 0.4s;"></div>
                </div>
                <span style="font-size: 12px; font-weight: 600; min-width: 32px; color: ${color};">${pct}%</span>
            </div>
        `;
    };

    // Render sumário e gráfico pizza
    const renderSumario = () => {
        const sumario = container.querySelector('#progresso-sumario');
        if (allDisciplinas.length === 0) { sumario.style.display = 'none'; return; }
        sumario.style.display = 'block';

        const totalTarefas = allTarefas.length;
        const concluidas = allTarefas.filter(t => t.status === 'Concluída').length;
        const pendentes = totalTarefas - concluidas;
        const globalPct = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

        container.querySelector('#progresso-global-num').textContent = `${globalPct}%`;
        container.querySelector('#progresso-concluidas').textContent = concluidas;
        container.querySelector('#progresso-pendentes').textContent = pendentes;

        // Gráfico Pizza com Chart.js
        const canvas = container.querySelector('#chart-progresso-pizza');
        if (pizzaChart) { pizzaChart.destroy(); }

        if (window.Chart && canvas) {
            pizzaChart = new window.Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Concluídas', 'Pendentes'],
                    datasets: [{
                        data: [concluidas || 0, pendentes || 0],
                        backgroundColor: ['#24a148', '#da1e28'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 11 } } }
                    },
                    cutout: '65%'
                }
            });
        }
    };

    // Render table rows filtered by search term
    const renderTable = (disciplinas) => {
        if (disciplinas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--carbon-text-muted);">
                        Nenhuma disciplina encontrada. Clique em "+ Nova Disciplina" para adicionar.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = disciplinas.map(item => {
            const datasStr = item.dataInicio && item.dataFim
                ? `${formatDate(item.dataInicio)} a ${formatDate(item.dataFim)}`
                : (item.dataInicio ? `Desde ${formatDate(item.dataInicio)}` : '-');

            const { total, concluidas, pct } = calcularProgresso(item.id);
            const progressoLabel = total > 0
                ? `${concluidas}/${total} tarefas`
                : 'Sem tarefas';

            return `
                <tr>
                    <td>
                        <strong style="color: var(--carbon-text-primary);">${escapeHtml(item.nome)}</strong>
                        <div style="font-size: 11px; color: var(--carbon-text-muted); margin-top: 2px;">${escapeHtml(item.descricao || '')}</div>
                    </td>
                    <td>${escapeHtml(item.professor)}</td>
                    <td><span class="carbon-tag tag-gray">${escapeHtml(item.cargaHoraria)}</span></td>
                    <td style="font-size: 12px;">${datasStr}</td>
                    <td>
                        ${progressoBar(pct)}
                        <div style="font-size: 11px; color: var(--carbon-text-muted); margin-top: 3px;">${progressoLabel}</div>
                    </td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 0.25rem;">
                            <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-edit-disc" data-id="${item.id}" title="Editar">✏️</button>
                            <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-delete-disc" data-id="${item.id}" data-nome="${escapeHtml(item.nome)}" title="Excluir" style="background-color: var(--status-red-border);">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Event handlers: edit
        tbody.querySelectorAll('.btn-edit-disc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const disc = allDisciplinas.find(d => d.id === id);
                if (disc) openModal(disc);
            });
        });

        // Event handlers: delete
        tbody.querySelectorAll('.btn-delete-disc').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
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
    };

    // Load all data from API
    const loadDisciplinas = async () => {
        try {
            [allDisciplinas, allTarefas] = await Promise.all([
                disciplinasService.getDisciplinas(),
                tarefasService.getTarefas()
            ]);
            renderSumario();
            applySearch();
        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="6" style="color: var(--status-red-text); text-align: center; padding: 1rem;">Erro ao carregar disciplinas. Verifique se o servidor FastAPI está ativo (porta 8000).</td></tr>`;
        }
    };

    // Apply text search filter
    const applySearch = () => {
        const term = searchInput.value.trim().toLowerCase();
        btnClearSearch.style.display = term ? 'inline-flex' : 'none';
        const filtered = term
            ? allDisciplinas.filter(d =>
                d.nome.toLowerCase().includes(term) ||
                (d.professor || '').toLowerCase().includes(term) ||
                (d.descricao || '').toLowerCase().includes(term)
              )
            : allDisciplinas;
        renderTable(filtered);
    };

    // Modal helpers
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

    searchInput.addEventListener('input', applySearch);
    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        applySearch();
    });

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
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
}
