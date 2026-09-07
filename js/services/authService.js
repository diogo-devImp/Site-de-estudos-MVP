/**
 * authService.js
 * Service responsible for authentication, registration, password recovery, and session state.
 */

const USER_STORAGE_KEY = 'portal_impacta_current_user';
const USERS_DB_KEY = 'portal_impacta_registered_users';

// Banco inicial padrão caso o localStorage esteja vazio
const defaultUsers = [
    {
        nome: 'Carlos',
        sobrenome: 'Silva',
        email: 'aluno@impacta.edu.br',
        ra: '202400123',
        senha: '123456',
        curso: 'Análise e Desenvolvimento de Sistemas',
        semestre: '3º Semestre - Noturno'
    }
];

// Função auxiliar para buscar usuários salvos ou inicializar o banco local
function getRegisteredUsers() {
    const stored = localStorage.getItem(USERS_DB_KEY);
    if (!stored) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(stored);
}

// Função auxiliar para salvar a lista atualizada de usuários
function saveRegisteredUsers(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export const authService = {
    /**
     * Validates user credentials.
     * Accepts either educational Email or RA.
     */
    async login(identifier, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const cleanIdentifier = identifier.trim().toLowerCase();
                const registeredUsers = getRegisteredUsers();
                const user = registeredUsers.find(
                    u => (u.email.toLowerCase() === cleanIdentifier || u.ra === cleanIdentifier) && u.senha === password
                );

                if (user) {
                    const sessionData = {
                        nome: user.nome,
                        sobrenome: user.sobrenome,
                        email: user.email,
                        ra: user.ra,
                        curso: user.curso,
                        semestre: user.semestre
                    };
                    // ALTERADO DE localStorage PARA sessionStorage
                    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionData));
                    resolve(sessionData);
                } else {
                    reject(new Error('Credenciais inválidas. Verifique seu E-mail/RA e Senha.'));
                }
            }, 400);
        });
    },
    /**
     * Registers a new student account and saves it persistently.
     */
    async cadastro({ nome, sobrenome, email, ra, senha }) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!nome || !sobrenome || !email || !ra || !senha) {
                    return reject(new Error('Todos os campos são obrigatórios.'));
                }

                const registeredUsers = getRegisteredUsers();
                const existing = registeredUsers.find(u => u.email === email || u.ra === ra);
                
                if (existing) {
                    return reject(new Error('Já existe um cadastro com este E-mail ou RA.'));
                }

                const newUser = {
                    nome,
                    sobrenome,
                    email,
                    ra,
                    senha,
                    curso: 'Engenharia de Software',
                    semestre: '1º Semestre - Noturno'
                };

                registeredUsers.push(newUser);
                saveRegisteredUsers(registeredUsers); // Salva no localStorage do navegador

                resolve({ success: true, message: 'Cadastro realizado com sucesso! Você já pode entrar.' });
            }, 400);
        });
    },

    /**
     * Sends password recovery instructions.
     */
    async recuperarSenha(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !email.includes('@')) {
                    return reject(new Error('Informe um e-mail válido para recuperação.'));
                }
                resolve({ success: true, message: `Instruções de redefinição de senha foram enviadas para ${email}.` });
            }, 400);
        });
    },

    /**
     * Gets the currently authenticated user from localStorage.
     */
    getCurrentUser() {
        // ALTERADO DE localStorage PARA sessionStorage
        const data = sessionStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Logs out current user.
     */
    logout() {
        sessionStorage.removeItem(USER_STORAGE_KEY);
    }
};