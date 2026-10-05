/**
 * authService.js - Integrado com FastAPI + Firebase + JWT Bearer Token
 */

const API_URL = "http://localhost:8000";
const USER_STORAGE_KEY = 'portal_impacta_current_user';
const TOKEN_KEY = 'portal_impacta_token';

export const authService = {
    /**
     * Valida as credenciais do usuário enviando para o Back-end.
     * Armazena o token JWT retornado para uso nas chamadas autenticadas.
     */
    async login(identifier, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificador: identifier.trim(),
                    senha: password
                })
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.detail || 'Credenciais inválidas.');
            }

            const userData = await response.json();

            // Armazena o token JWT (se o back-end retornar)
            if (userData.token) {
                sessionStorage.setItem(TOKEN_KEY, userData.token);
            }

            // Salva dados do usuário (sem a senha e sem o token no objeto principal)
            const { token, ...userSemToken } = userData;
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userSemToken));

            // RA isolado para queries de serviços
            if (userData.ra) {
                localStorage.setItem('usuarioRA', userData.ra);
            }

            return userSemToken;

        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    },

    /**
     * Retorna o Bearer Token JWT para ser usado nas chamadas protegidas.
     */
    getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || null;
    },

    /**
     * Retorna os headers de autenticação prontos para uso no fetch.
     */
    getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Regista um novo aluno no Back-end/Firebase.
     */
    async cadastro({ nome, sobrenome, email, ra, senha, curso }) {
        try {
            if (!nome || !sobrenome || !email || !ra || !senha || !curso) {
                throw new Error('Todos os campos, incluindo o curso, são obrigatórios.');
            }

            const response = await fetch(`${API_URL}/usuarios/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome, sobrenome, email, ra, senha,
                    curso,
                    semestre: '1º Semestre - Noturno'
                })
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.detail || 'Erro ao realizar cadastro.');
            }

            return await response.json();

        } catch (error) {
            console.error("Erro no cadastro:", error);
            throw error;
        }
    },

    /**
     * Envia instruções de recuperação de senha.
     */
    async recuperarSenha(email) {
        try {
            const response = await fetch(`${API_URL}/recuperar-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) throw new Error('Erro ao enviar e-mail de recuperação.');
            return await response.json();

        } catch (error) {
            console.error("Erro na recuperação:", error);
            throw error;
        }
    },

    /**
     * Retorna o usuário logado atualmente a partir do sessionStorage.
     */
    getCurrentUser() {
        const data = sessionStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Termina a sessão do usuário.
     */
    logout() {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('usuarioRA');
    }
};