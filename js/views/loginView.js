/**
 * loginView.js
 * Renders the Login screen with IBM Carbon styling.
 */

export function renderLoginView(onNavigate, onLoginSuccess) {
    const container = document.createElement('div');
    container.className = 'auth-container';

    container.innerHTML = `
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-brand">Faculdade Impacta</div>
                <h1 class="auth-title">Portal do Aluno</h1>
                <p class="auth-subtitle">Entre com suas credenciais acadêmicas</p>
            </div>

            <div id="login-alert" style="display: none;"></div>

            <form id="login-form">
                <div class="form-group">
                    <label class="form-label" for="identifier">E-mail educacional ou RA</label>
                    <input 
                        type="text" 
                        id="identifier" 
                        class="carbon-input" 
                        placeholder="ex: aluno@impacta.edu.br ou 202400123" 
                        required 
                        autocomplete="username"
                    />
                </div>

                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <label class="form-label" for="password" style="margin-bottom: 0;">Senha</label>
                        <button type="button" id="btn-forgot-password" class="carbon-btn-ghost">Esqueceu a senha?</button>
                    </div>
                    <input 
                        type="password" 
                        id="password" 
                        class="carbon-input" 
                        placeholder="••••••••" 
                        required 
                        autocomplete="current-password"
                    />
                </div>

                <button type="submit" id="btn-submit" class="carbon-btn carbon-btn-primary carbon-btn-block" style="margin-top: 1.5rem;">
                    <span>Entrar no Portal</span>
                    <span style="font-size: 18px;">→</span>
                </button>
            </form>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--carbon-border); text-align: center;">
                <span style="font-size: 13px; color: var(--carbon-text-secondary);">Ainda não possui conta?</span>
                <button type="button" id="btn-go-register" class="carbon-btn-ghost" style="margin-left: 0.5rem; font-weight: 600;">Cadastre-se</button>
            </div>
        </div>
    `;

    // Event Bindings
    const form = container.querySelector('#login-form');
    const alertBox = container.querySelector('#login-alert');
    const btnForgot = container.querySelector('#btn-forgot-password');
    const btnRegister = container.querySelector('#btn-go-register');

    btnForgot.addEventListener('click', () => onNavigate('recuperar-senha'));
    btnRegister.addEventListener('click', () => onNavigate('cadastro'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = container.querySelector('#identifier').value;
        const password = container.querySelector('#password').value;
        const btnSubmit = container.querySelector('#btn-submit');

        alertBox.style.display = 'none';
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Autenticando...</span>';

        try {
            const { authService } = await import('../services/authService.js');
            const user = await authService.login(identifier, password);
            onLoginSuccess(user);
        } catch (err) {
            alertBox.className = 'carbon-alert carbon-alert-error';
            alertBox.textContent = err.message || 'Erro ao efetuar login.';
            alertBox.style.display = 'block';
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Entrar no Portal</span><span style="font-size: 18px;">→</span>';
        }
    });

    return container;
}
