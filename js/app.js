/**
 * app.js
 * Central Application Router & State Controller.
 * Manages view switching, dark sidebar layout, and session authentication state.
 */

import { authService } from './services/authService.js';
import { renderLoginView } from './views/loginView.js';
import { renderCadastroView } from './views/cadastroView.js';
import { renderRecuperarSenhaView } from './views/recuperarSenhaView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderDocumentacaoView } from './views/documentacaoView.js';
import { renderNotasView } from './views/notasView.js';
import { renderCursosView } from './views/cursosView.js';
import { renderFinanceiroView } from './views/financeiroView.js';
import { renderHorariosView } from './views/horariosView.js';
import { renderDisciplinasView } from './views/disciplinasView.js';
import { renderTarefasView } from './views/tarefasView.js';

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.currentRoute = 'login';
        this.user = authService.getCurrentUser();
    }

    init() {
        // Initial route decision
        if (this.user) {
            this.navigateTo('dashboard');
        } else {
            this.navigateTo('login');
        }
    }

    /**
     * Navigates to a specific route/view.
     */
    async navigateTo(route) {
        this.currentRoute = route;
        this.user = authService.getCurrentUser();

        // Auth guard: If trying to access protected views without login, redirect to login
        const publicRoutes = ['login', 'cadastro', 'recuperar-senha'];
        if (!this.user && !publicRoutes.includes(route)) {
            return this.navigateTo('login');
        }

        // If user is logged in and visits login/register, send to dashboard
        if (this.user && publicRoutes.includes(route)) {
            return this.navigateTo('dashboard');
        }

        this.appElement.innerHTML = '';

        if (publicRoutes.includes(route)) {
            this.renderPublicLayout(route);
        } else {
            await this.renderAuthenticatedLayout(route);
        }
    }

    /**
     * Renders public screens (Login, Cadastro, Recuperar Senha) without Sidebar.
     */
    renderPublicLayout(route) {
        let viewElement;

        switch (route) {
            case 'cadastro':
                viewElement = renderCadastroView((target) => this.navigateTo(target));
                break;
            case 'recuperar-senha':
                viewElement = renderRecuperarSenhaView((target) => this.navigateTo(target));
                break;
            case 'login':
            default:
                viewElement = renderLoginView(
                    (target) => this.navigateTo(target),
                    (user) => {
                        this.user = user;
                        this.navigateTo('dashboard');
                    }
                );
                break;
        }

        this.appElement.appendChild(viewElement);
    }

    /**
     * Renders authenticated layout with dark IBM Carbon Sidebar.
     */
    async renderAuthenticatedLayout(route) {
        const shell = document.createElement('div');
        shell.className = 'app-shell';

        // Sidebar Navigation Links Data
        const navItems = [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'disciplinas', label: 'Disciplinas', icon: '📚' },
            { id: 'tarefas', label: 'Tarefas e Trabalhos', icon: '📝' },
            { id: 'documentacao', label: 'Documentação', icon: '📁' },
            { id: 'notas', label: 'Notas e Faltas', icon: '📊' },
            { id: 'cursos', label: 'Cursos Extracurriculares', icon: '🎓' },
            { id: 'financeiro', label: 'Financeiro', icon: '💳' },
            { id: 'horarios', label: 'Horários e Grade', icon: '🗓️' },
        ];

        const titles = {
            dashboard: 'Dashboard Inicial',
            disciplinas: 'Gestão de Disciplinas',
            tarefas: 'Tarefas e Trabalhos Acadêmicos',
            documentacao: 'Documentos do Aluno',
            notas: 'Boletim de Notas e Faltas',
            cursos: 'Cursos Extracurriculares',
            financeiro: 'Gestão Financeira',
            horarios: 'Horários de Aulas'
        };

        shell.innerHTML = `
            <!-- Dark IBM Carbon Sidebar -->
            <aside class="carbon-sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-brand">FACULDADE IMPACTA</div>
                    <div class="sidebar-title">Portal do Aluno</div>
                </div>

                <div class="sidebar-user">
                    <div class="sidebar-user-name">${this.user.nome} ${this.user.sobrenome}</div>
                    <div class="sidebar-user-ra">RA: ${this.user.ra}</div>
                </div>

                <ul class="sidebar-nav">
                    ${navItems.map(item => `
                        <li class="nav-item">
                            <a href="#" class="nav-link ${route === item.id ? 'active' : ''}" data-route="${item.id}">
                                <span style="margin-right: 0.75rem;">${item.icon}</span>
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>

                <div class="sidebar-footer">
                    <button type="button" id="btn-logout" class="carbon-btn carbon-btn-secondary carbon-btn-block" style="height: 38px;">
                        <span>Sair do Portal</span>
                        <span>🚪</span>
                    </button>
                </div>
            </aside>

            <!-- Main Workspace -->
            <div class="main-wrapper">
                <header class="carbon-header">
                    <h1 class="header-page-title">${titles[route] || 'Portal do Aluno'}</h1>
                    <div class="header-status">
                        <span class="carbon-tag tag-green">Matriculado</span>
                    </div>
                </header>

                <main class="content-area" id="view-content-area">
                    <div style="padding: 2rem; text-align: center;">Carregando view...</div>
                </main>
            </div>
        `;

        // Bind navigation clicks
        shell.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetRoute = e.currentTarget.getAttribute('data-route');
                this.navigateTo(targetRoute);
            });
        });

        // Logout binding
        shell.querySelector('#btn-logout').addEventListener('click', () => {
            authService.logout();
            this.user = null;
            this.navigateTo('login');
        });

        this.appElement.appendChild(shell);

        // Render target View into #view-content-area
        const viewContentArea = shell.querySelector('#view-content-area');
        viewContentArea.innerHTML = '';

        let contentElement;
        switch (route) {
            case 'disciplinas':
                contentElement = await renderDisciplinasView();
                break;
            case 'tarefas':
                contentElement = await renderTarefasView();
                break;
            case 'documentacao':
                contentElement = await renderDocumentacaoView();
                break;
            case 'notas':
                contentElement = await renderNotasView();
                break;
            case 'cursos':
                contentElement = await renderCursosView();
                break;
            case 'financeiro':
                contentElement = await renderFinanceiroView();
                break;
            case 'horarios':
                contentElement = await renderHorariosView();
                break;
            case 'dashboard':
            default:
                contentElement = await renderDashboardView(this.user, (target) => this.navigateTo(target));
                break;
        }

        viewContentArea.appendChild(contentElement);
    }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
