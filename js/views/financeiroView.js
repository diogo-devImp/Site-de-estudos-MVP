/**
 * financeiroView.js
 * Renders monthly tuition payments, statuses (Pago/Pendente), and payment options (Boleto & PIX).
 */

import { financeiroService } from '../services/financeiroService.js';

export async function renderFinanceiroView() {
    const container = document.createElement('div');
    container.className = 'financeiro-view';

    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 20px; font-weight: 600; color: var(--carbon-text-primary);">Situação Financeira & Mensalidades</h2>
            <p style="color: var(--carbon-text-secondary); margin-top: 0.25rem;">
                Gerencie seus pagamentos, imprima boletos e realize pagamentos instantâneos via PIX.
            </p>
        </div>

        <div class="carbon-table-container">
            <table class="carbon-table">
                <thead>
                    <tr>
                        <th>Mês / Referência</th>
                        <th>Vencimento</th>
                        <th>Valor Total</th>
                        <th>Status</th>
                        <th style="text-align: right;">Ações de Pagamento</th>
                    </tr>
                </thead>
                <tbody id="financeiro-table-body">
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 2rem;">Carregando mensalidades...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal PIX Container -->
        <div id="pix-modal-overlay" class="carbon-modal-overlay" style="display: none;">
            <div class="carbon-modal">
                <div class="modal-header">
                    <div class="modal-title">Pagamento via PIX</div>
                    <button type="button" id="btn-close-pix" class="carbon-btn-ghost" style="font-size: 18px; cursor: pointer;">✕</button>
                </div>
                <div style="text-align: center; padding: 1rem 0;">
                    <p style="font-size: 13px; color: var(--carbon-text-secondary); margin-bottom: 1rem;" id="pix-modal-subtitle">
                        Escaneie o QR Code abaixo no app do seu banco ou copie o código Pix Copia e Cola:
                    </p>
                    
                    <!-- SVG QR Code Mock -->
                    <div style="background: #ffffff; padding: 1rem; display: inline-block; border: 1px solid var(--carbon-border);">
                        <svg width="180" height="180" viewBox="0 0 100 100" fill="#161616">
                            <rect width="100" height="100" fill="#ffffff" />
                            <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                            <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                            <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                            <rect x="40" y="40" width="20" height="20" />
                            <rect x="35" y="10" width="10" height="15" />
                            <rect x="55" y="15" width="10" height="10" />
                            <rect x="10" y="40" width="15" height="10" />
                            <rect x="75" y="45" width="15" height="15" />
                            <rect x="45" y="70" width="20" height="10" />
                            <rect x="75" y="75" width="15" height="15" />
                        </svg>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <label class="form-label" style="text-align: left;">Código PIX Copia e Cola:</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input 
                                type="text" 
                                id="pix-code-input" 
                                class="carbon-input" 
                                value="00020126580014br.gov.bcb.pix0136impacta-financeiro-pix-key-20265204000053039865405850.005802BR" 
                                readonly 
                            />
                            <button type="button" id="btn-copy-pix" class="carbon-btn carbon-btn-secondary carbon-btn-sm" style="height: 40px;">
                                Copiar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" id="btn-done-pix" class="carbon-btn carbon-btn-primary">Concluído</button>
                </div>
            </div>
        </div>
    `;

    try {
        const list = await financeiroService.getMensalidades();
        const tbody = container.querySelector('#financeiro-table-body');
        const pixModal = container.querySelector('#pix-modal-overlay');
        const btnClosePix = container.querySelector('#btn-close-pix');
        const btnDonePix = container.querySelector('#btn-done-pix');
        const btnCopyPix = container.querySelector('#btn-copy-pix');
        const pixCodeInput = container.querySelector('#pix-code-input');

        tbody.innerHTML = list.map(item => {
            const isPaid = item.status === 'Pago';
            const statusTag = isPaid 
                ? '<span class="carbon-tag tag-green">Pago</span>' 
                : '<span class="carbon-tag tag-red">Pendente</span>';

            return `
                <tr>
                    <td><strong style="color: var(--carbon-text-primary);">${item.mes}</strong></td>
                    <td>${item.vencimento}</td>
                    <td style="font-weight: 600;">${item.valor}</td>
                    <td>${statusTag}</td>
                    <td style="text-align: right;">
                        ${isPaid ? `
                            <span style="font-size: 12px; color: var(--carbon-text-muted);">Comprovante Disponível ✓</span>
                        ` : `
                            <div style="display: inline-flex; gap: 0.5rem;">
                                <button class="carbon-btn carbon-btn-secondary carbon-btn-sm btn-print-boleto" data-bar="${item.codigoBarras}" data-mes="${item.mes}">
                                    📄 Imprimir Boleto
                                </button>
                                <button class="carbon-btn carbon-btn-primary carbon-btn-sm btn-pay-pix" data-mes="${item.mes}" data-valor="${item.valor}">
                                    ⚡ Pagar via PIX
                                </button>
                            </div>
                        `}
                    </td>
                </tr>
            `;
        }).join('');

        // Attachment handlers
        tbody.querySelectorAll('.btn-print-boleto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mes = e.currentTarget.getAttribute('data-mes');
                const bar = e.currentTarget.getAttribute('data-bar');
                alert(`[Boleto Bancário - Impacta]\nMensalidade: ${mes}\nCódigo de Barras:\n${bar}\n\nO boleto foi gerado para impressão/download.`);
            });
        });

        tbody.querySelectorAll('.btn-pay-pix').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mes = e.currentTarget.getAttribute('data-mes');
                const valor = e.currentTarget.getAttribute('data-valor');
                container.querySelector('#pix-modal-subtitle').textContent = `Pagamento da Mensalidade (${mes}) no valor de ${valor}. Escaneie o QR Code abaixo:`;
                pixModal.style.display = 'flex';
            });
        });

        btnClosePix.addEventListener('click', () => pixModal.style.display = 'none');
        btnDonePix.addEventListener('click', () => pixModal.style.display = 'none');

        btnCopyPix.addEventListener('click', () => {
            pixCodeInput.select();
            navigator.clipboard.writeText(pixCodeInput.value);
            btnCopyPix.textContent = 'Copiado!';
            setTimeout(() => btnCopyPix.textContent = 'Copiar', 2000);
        });

    } catch (err) {
        console.error(err);
    }

    return container;
}
