/**
 * documentacaoService.js
 * Returns document verification status for the student.
 */

export const documentacaoService = {
    async getDocumentos() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, nome: 'RG / Carteira de Identidade', status: 'Entregue', dataEnvio: '15/01/2024', obrigatorio: true },
                    { id: 2, nome: 'CPF (Cadastro de Pessoa Física)', status: 'Entregue', dataEnvio: '15/01/2024', obrigatorio: true },
                    { id: 3, nome: 'Certificado de Conclusão do Ensino Médio', status: 'Entregue', dataEnvio: '20/01/2024', obrigatorio: true },
                    { id: 4, nome: 'Histórico Escolar do Ensino Médio', status: 'Pendente', dataEnvio: '-', obrigatorio: true },
                    { id: 5, nome: 'Certificado de Dispensa Militar (CAM/CDI)', status: 'Pendente', dataEnvio: '-', obrigatorio: true },
                    { id: 6, nome: 'Comprovante de Residência Atualizado', status: 'Entregue', dataEnvio: '10/02/2026', obrigatorio: true },
                    { id: 7, nome: 'Certidão de Casamento', status: 'Opcional', dataEnvio: '-', obrigatorio: false }
                ]);
            }, 300);
        });
    }
};
