/**
 * cadastroView.js
 * Renders the Student Registration form.
 */

export function renderCadastroView(onNavigate) {
    const container = document.createElement('div');
    container.className = 'auth-container';

    container.innerHTML = `
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-brand">Faculdade Impacta</div>
                <h1 class="auth-title">Novo Cadastro</h1>
                <p class="auth-subtitle">Crie sua conta para acessar o Portal do Aluno</p>
            </div>

            <div id="cadastro-alert" style="display: none;"></div>

            <form id="cadastro-form">
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="nome">Nome</label>
                        <input type="text" id="nome" class="carbon-input" placeholder="ex: Carlos" required />
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="sobrenome">Sobrenome</label>
                        <input type="text" id="sobrenome" class="carbon-input" placeholder="ex: Silva" required />
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="email">E-mail Educacional</label>
                    <input type="email" id="email" class="carbon-input" placeholder="ex: carlos.silva@impacta.edu.br" required />
                </div>

                <div class="form-group">
                    <label class="form-label" for="ra">RA (Registro Acadêmico)</label>
                    <input type="text" id="ra" class="carbon-input" placeholder="ex: 202400999" required />
                </div>

                <div class="form-group">
                    <label class="form-label" for="senha">Senha de Acesso</label>
                    <input type="password" id="senha" class="carbon-input" placeholder="Mínimo 6 caracteres" required />
                </div>

                <button type="submit" id="btn-submit-cadastro" class="carbon-btn carbon-btn-primary carbon-btn-block" style="margin-top: 1rem;">
                    <span>Concluir Cadastro</span>
                    <span style="font-size: 18px;">✓</span>
                </button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center;">
                <button type="button" id="btn-back-login" class="carbon-btn-ghost">← Voltar para o Login</button>
            </div>
        </div>
    `;

    // Event Bindings
    const form = container.querySelector('#cadastro-form');
    const alertBox = container.querySelector('#cadastro-alert');
    const btnBack = container.querySelector('#btn-back-login');

    btnBack.addEventListener('click', () => onNavigate('login'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = container.querySelector('#nome').value;
        const sobrenome = container.querySelector('#sobrenome').value;
        const email = container.querySelector('#email').value;
        const ra = container.querySelector('#ra').value;
        const senha = container.querySelector('#senha').value;
        const btnSubmit = container.querySelector('#btn-submit-cadastro');

        alertBox.style.display = 'none';
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Cadastrando...</span>';

        try {
            const { authService } = await import('../services/authService.js');
            const result = await authService.cadastro({ nome, sobrenome, email, ra, senha });
            alertBox.className = 'carbon-alert carbon-alert-success';
            alertBox.textContent = result.message;
            alertBox.style.display = 'block';
            setTimeout(() => onNavigate('login'), 1500);
        } catch (err) {
            alertBox.className = 'carbon-alert carbon-alert-error';
            alertBox.textContent = err.message || 'Erro ao realizar cadastro.';
            alertBox.style.display = 'block';
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Concluir Cadastro</span><span>✓</span>';
        }
    });

    return container;
}
