/**
 * documentacaoView.js
 * Renders document verification checklist with IBM Carbon styled tags.
 */

import { documentacaoService } from '../services/documentacaoService.js';

export async function renderDocumentacaoView() {
    const container = document.createElement('div');
    container.className = 'documentacao-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Status de Documentação Acadêmica</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Confira a validação dos seus documentos exigidos pela Secretaria de Registro Acadêmico.
            </p>
        </div>

        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Documento</th>
                        <th>Obrigatório</th>
                        <th>Data de Envio</th>
                        <th>Status da Secretaria</th>
                        <th style="text-align: right;">Ação</th>
                    </tr>
                </thead>
                <tbody id="docs-list-body">
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 2rem;">Carregando documentos...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const docs = await documentacaoService.getDocumentos();
        const tbody = container.querySelector('#docs-list-body');
        
        tbody.innerHTML = docs.map(doc => {
            let tagClass = 'tag-gray';
            if (doc.status === 'Entregue') tagClass = 'tag-green';
            else if (doc.status === 'Pendente') tagClass = 'tag-red';

            return `
                <tr>
                    <td>
                        <strong style="color: var(--carbon-text-primary);">${doc.nome}</strong>
                    </td>
                    <td>${doc.obrigatorio ? 'Sim' : 'Não (Opcional)'}</td>
                    <td>${doc.dataEnvio}</td>
                    <td>
                        <span class="carbon-tag ${tagClass}">${doc.status}</span>
                    </td>
                    <td style="text-align: right;">
                        ${doc.status === 'Pendente' 
                            ? `<button class="carbon-btn carbon-btn-primary carbon-btn-sm btn-upload-doc" data-doc="${doc.nome}">Enviar Arquivo</button>` 
                            : `<span style="font-size: 12px; color: var(--carbon-text-muted);">Validado ✓</span>`
                        }
                    </td>
                </tr>
            `;
        }).join('');

        // Attachment handler mock
        tbody.querySelectorAll('.btn-upload-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docName = e.target.getAttribute('data-doc');
                alert(`[Simulação] Selecione o arquivo PDF/Imagem para enviar: "${docName}".\nO documento será enviado para análise da Secretaria.`);
            });
        });

    } catch (err) {
        console.error(err);
    }

    return container;
}
