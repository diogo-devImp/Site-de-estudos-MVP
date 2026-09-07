/**
 * recuperarSenhaView.js
 * Renders the Password Recovery screen.
 */

export function renderRecuperarSenhaView(onNavigate) {
    const container = document.createElement('div');
    container.className = 'auth-container';

    container.innerHTML = `
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-brand">Faculdade Impacta</div>
                <h1 class="auth-title">Recuperação de Senha</h1>
                <p class="auth-subtitle">Digite seu e-mail cadastrado para receber as instruções</p>
            </div>

            <div id="recuperar-alert" style="display: none;"></div>

            <form id="recuperar-form">
                <div class="form-group">
                    <label class="form-label" for="email-recuperar">E-mail Cadastrado</label>
                    <input 
                        type="email" 
                        id="email-recuperar" 
                        class="carbon-input" 
                        placeholder="ex: seuemail@impacta.edu.br" 
                        required 
                    />
                </div>

                <button type="submit" id="btn-submit-recuperar" class="carbon-btn carbon-btn-primary carbon-btn-block" style="margin-top: 1rem;">
                    <span>Enviar Link de Recuperação</span>
                    <span style="font-size: 18px;">✉</span>
                </button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center;">
                <button type="button" id="btn-back-login" class="carbon-btn-ghost">← Voltar para o Login</button>
            </div>
        </div>
    `;

    // Event Bindings
    const form = container.querySelector('#recuperar-form');
    const alertBox = container.querySelector('#recuperar-alert');
    const btnBack = container.querySelector('#btn-back-login');

    btnBack.addEventListener('click', () => onNavigate('login'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = container.querySelector('#email-recuperar').value;
        const btnSubmit = container.querySelector('#btn-submit-recuperar');

        alertBox.style.display = 'none';
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Enviando...</span>';

        try {
            const { authService } = await import('../services/authService.js');
            const res = await authService.recuperarSenha(email);
            alertBox.className = 'carbon-alert carbon-alert-success';
            alertBox.textContent = res.message;
            alertBox.style.display = 'block';
        } catch (err) {
            alertBox.className = 'carbon-alert carbon-alert-error';
            alertBox.textContent = err.message || 'Erro ao processar solicitação.';
            alertBox.style.display = 'block';
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Enviar Link de Recuperação</span><span>✉</span>';
        }
    });

    return container;
}
