/**
 * recuperarSenhaView.js - Suporta o envio de e-mail e a redefinição direta de senha
 */

export function renderRecuperarSenhaView(onNavigate) {
    const container = document.createElement('div');
    container.className = 'auth-container';

    // Captura parâmetros da URL (ex: #recuperar-senha?email=cleyson@gmail.com)
    const fullHash = window.location.hash;
    const queryString = fullHash.includes('?') ? fullHash.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryString);
    const emailParam = urlParams.get('email');

    // SE O LINK CONTÉM UM E-MAIL, EXIBE DIRETAMENTE O ECRÃ DE NOVA SENHA
    if (emailParam) {
        container.innerHTML = `
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-brand">Faculdade Impacta</div>
                    <h1 class="auth-title">Nova Senha</h1>
                    <p class="auth-subtitle">Defina a sua nova palavra-passe para a conta <strong>${decodeURIComponent(emailParam)}</strong></p>
                </div>

                <div id="redefinir-alert" style="display: none;"></div>

                <form id="redefinir-form">
                    <div class="form-group">
                        <label class="form-label" for="nova-senha">Nova Senha</label>
                        <input type="password" id="nova-senha" class="carbon-input" placeholder="Mínimo 6 caracteres" required />
                    </div>

                    <button type="submit" id="btn-submit-redefinir" class="carbon-btn carbon-btn-primary carbon-btn-block" style="margin-top: 1rem;">
                        <span>Atualizar Palavra-Passe</span>
                        <span style="font-size: 18px;">✓</span>
                    </button>
                </form>
            </div>
        `;

        setTimeout(() => {
            const form = container.querySelector('#redefinir-form');
            const alertBox = container.querySelector('#redefinir-alert');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nova_senha = container.querySelector('#nova-senha').value;
                const btnSubmit = container.querySelector('#btn-submit-redefinir');

                alertBox.style.display = 'none';
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<span>A atualizar...</span>';

                try {
                    const response = await fetch('http://localhost:8000/redefinir-senha', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: decodeURIComponent(emailParam), nova_senha })
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.detail || 'Erro ao redefinir senha.');

                    alertBox.className = 'carbon-alert carbon-alert-success';
                    alertBox.textContent = data.message;
                    alertBox.style.display = 'block';

                    // Após atualizar com sucesso, limpa a URL e redireciona para o login após 2 segundos
                    setTimeout(() => {
                        window.location.hash = '#login';
                        window.location.reload();
                    }, 2000);

                } catch (err) {
                    alertBox.className = 'carbon-alert carbon-alert-error';
                    alertBox.textContent = err.message;
                    alertBox.style.display = 'block';
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<span>Atualizar Palavra-Passe</span><span>✓</span>';
                }
            });
        }, 0);

        return container;
    }

    // CASO CONTRÁRIO, EXIBE O ECRÃ PADRÃO DE SOLICITAÇÃO POR E-MAIL
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
                    <input type="email" id="email-recuperar" class="carbon-input" placeholder="ex: seuemail@impacta.edu.br" required />
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
        btnSubmit.innerHTML = '<span>A enviar...</span>';

      try {
            const { authService } = await import('../services/authService.js');
            const res = await authService.recuperarSenha(email);
            
            alertBox.className = 'carbon-alert carbon-alert-success';
            alertBox.innerHTML = `
                ${res.message}<br><br>
                <button type="button" id="btn-simular-link" class="carbon-btn carbon-btn-secondary carbon-btn-sm" style="margin-top: 0.5rem; background-color: #ffffff; color: var(--carbon-blue); border: 1px solid var(--carbon-blue);">
                    🔗 Simular abertura do link recebido no e-mail
                </button>
            `;
            alertBox.style.display = 'block';

            // Adiciona o evento de clique direto no botão de simulação
            container.querySelector('#btn-simular-link').addEventListener('click', () => {
                // Altera o hash da página e força o router a navegar para a view de redefinição
                window.location.hash = `#recuperar-senha?email=${encodeURIComponent(email.trim().toLowerCase())}`;
                onNavigate('recuperar-senha'); // Força o app.js a recriar a view com o parâmetro de e-mail
            });

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