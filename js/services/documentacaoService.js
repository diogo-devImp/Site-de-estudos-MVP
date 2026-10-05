const API_URL = "http://localhost:8000";

export const documentacaoService = {
    async getDocumentos() {
        try {
            const ra = localStorage.getItem('usuarioRA') || '123456789'; // Fallback de teste se necessário
            const response = await fetch(`${API_URL}/documentos/${ra}`);
            if (!response.ok) throw new Error('Erro ao buscar documentos');
            return await response.json();
        } catch (error) {
            console.error("Erro:", error);
            throw error;
        }
    },

    async uploadDocumento(nomeDocumento, tipo, file) {
        try {
            const ra = localStorage.getItem('usuarioRA') || '123456789';

            const formData = new FormData();
            formData.append('nome_documento', nomeDocumento);
            formData.append('tipo', tipo);
            formData.append('ra_aluno', ra); // Envia o RA associado
            formData.append('file', file);

            const response = await fetch(`${API_URL}/documentos/upload/`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Erro ao enviar o documento');
            return await response.json();
        } catch (error) {
            console.error("Erro no upload:", error);
            throw error;
        }
    }
};