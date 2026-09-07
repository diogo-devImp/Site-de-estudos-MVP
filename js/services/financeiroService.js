/**
 * financeiroService.js
 * Returns tuition fees and payment status.
 */

export const financeiroService = {
    async getMensalidades() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, mes: 'Janeiro / 2026', vencimento: '10/01/2026', valor: 'R$ 850,00', status: 'Pago', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10010000085000' },
                    { id: 2, mes: 'Fevereiro / 2026', vencimento: '10/02/2026', valor: 'R$ 850,00', status: 'Pago', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10020000085000' },
                    { id: 3, mes: 'Março / 2026', vencimento: '10/03/2026', valor: 'R$ 850,00', status: 'Pago', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10030000085000' },
                    { id: 4, mes: 'Abril / 2026', vencimento: '10/04/2026', valor: 'R$ 850,00', status: 'Pendente', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10040000085000' },
                    { id: 5, mes: 'Maio / 2026', vencimento: '10/05/2026', valor: 'R$ 850,00', status: 'Pendente', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10050000085000' },
                    { id: 6, mes: 'Junho / 2026', vencimento: '10/06/2026', valor: 'R$ 850,00', status: 'Pendente', codigoBarras: '34191.79001 01043.510047 91020.150008 8 10060000085000' }
                ]);
            }, 300);
        });
    }
};
