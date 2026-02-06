import { Match } from '@/types';

// Banco de dados em memória para as partidas
// (Dica: Se quiser persistir mesmo fechando o app, futuramente usaremos AsyncStorage aqui)
const mockMatches: Match[] = [];

export const matchService = {
    // Busca todas as partidas (da mais recente para a mais antiga)
    getAll: async (): Promise<Match[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...mockMatches].reverse());
            }, 500);
        });
    },

    // Salva uma nova partida
    create: async (match: Match): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockMatches.push(match);
                resolve();
            }, 500);
        });
    }
};