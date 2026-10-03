/**
 * authService.js - Versão integrada com FastAPI e Firebase
 */

const API_URL = "http://localhost:8000";
const USER_STORAGE_KEY = 'portal_impacta_current_user';

export const authService = {
    /**
     * Valida as credenciais do usuário enviando para o Back-end.
     */
    async login(identifier, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            
            // Salva a sessão no sessionStorage do navegador
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            
            // ---> ADICIONA ESTA LINHA: Guarda o RA isolado no localStorage para os serviços filtrakm os dados <---
            if (userData.ra) {
                localStorage.setItem('usuarioRA', userData.ra);
            }

            return userData;

        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    },
    
    /**
     * Regista um novo aluno no Back-end/Firebase.
     */
    async cadastro({ nome, sobrenome, email, ra, senha, curso }) { // <-- Recebe o curso
        try {
            if (!nome || !sobrenome || !email || !ra || !senha || !curso) {
                throw new Error('Todos os campos, incluindo o curso, são obrigatórios.');
            }

            const response = await fetch(`${API_URL}/usuarios/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    sobrenome,
                    email,
                    ra,
                    senha,
                    curso, // <-- Envia o curso selecionado pelo utilizador
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
                headers: {
                    'Content-Type': 'application/json'
                },
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
        localStorage.removeItem('usuarioRA'); // <--- Limpa também o RA ao sair
    }
};