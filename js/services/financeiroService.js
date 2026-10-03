/**
 * financeiroService.js - Serviço para gerir dados financeiros e mensalidades com limite até ao mês atual
 */

import { authService } from './authService.js';

const API_URL = "http://localhost:8000";

export const financeiroService = {
    async getMensalidades() {
        try {
            const user = authService.getCurrentUser();
            const ra = user?.ra || '123456789';
            const curso = user?.curso || 'Engenharia de Software';

            const response = await fetch(`${API_URL}/financeiro/${ra}?curso=${encodeURIComponent(curso)}`);
            if (!response.ok) throw new Error('Erro ao buscar dados financeiros do servidor');
            return await response.json();

        } catch (error) {
            console.warn("Aviso: A usar gerador local de mensalidades:", error);
            
            // Regra de preços por curso solicitada
            const precosTabela = {
                "Engenharia de Software": 849.70,
                "Ciência da Computação (CC)": 945.60,
                "Análise e Desenvolvimento de Sistemas (ADS)": 989.80,
                "Sistemas de Informação (SI)": 890.60
            };

            const user = authService.getCurrentUser();
            const curso = user?.curso || "Engenharia de Software";
            const valorBase = precosTabela[curso] || 849.70;

            const mesesDoAno = [
                { mes: 'Janeiro/2026', num: 1 },
                { mes: 'Fevereiro/2026', num: 2 },
                { mes: 'Março/2026', num: 3 },
                { mes: 'Abril/2026', num: 4 },
                { mes: 'Maio/2026', num: 5 },
                { mes: 'Junho/2026', num: 6 },
                { mes: 'Julho/2026', num: 7 },
                { mes: 'Agosto/2026', num: 8 },
                { mes: 'Setembro/2026', num: 9 },
                { mes: 'Outubro/2026', num: 10 },
                { mes: 'Novembro/2026', num: 11 },
                { mes: 'Dezembro/2026', num: 12 }
            ];

            const dataAtual = new Date();
            const diaAtual = dataAtual.getDate();
            const mesAtual = dataAtual.getMonth() + 1; // 10 (Outubro) no teu ambiente de testes

            const isVeterano = user?.isVeterano || false; 

            return mesesDoAno.map(m => {
                // Alunos novos começam em fevereiro (ignora janeiro)
                if (!isVeterano && m.num === 1) return null;

                // Restrição: Só mostra/gera mensalidades até ao mês atual (Outubro)
                if (m.num > mesAtual) return null;

                const vencimento = `15/${String(m.num).padStart(2, '0')}/2026`;
                let valorFinal = valorBase;
                let status = 'Pago';

                if (m.num < mesAtual) {
                    // Simulação para meses anteriores passados
                    status = m.num % 2 === 0 ? 'Pago' : 'Pendente';
                    if (status === 'Pendente') {
                        valorFinal = valorBase * 1.05; // Acréscimo de 5% por atraso
                    }
                } else if (m.num === mesAtual) {
                    // Mês atual: se passou do dia 15, aplica multa de 5% e fica pendente
                    if (diaAtual > 15) {
                        status = 'Pendente';
                        valorFinal = valorBase * 1.05;
                    } else {
                        status = 'Pendente'; // Em aberto dentro do prazo
                    }
                }

                return {
                    mes: m.mes,
                    vencimento: vencimento,
                    valor: `R$ ${valorFinal.toFixed(2).replace('.', ',')}`,
                    status: status,
                    codigoBarras: `34191.79001 01043.510047 91020.150002 6 ${String(m.num).padStart(2, '0')}2684970`
                };
            }).filter(Boolean);
        }
    }
};