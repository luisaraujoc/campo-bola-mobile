import {Player, PlayerStats} from "@/types";
import {mockPlayers, mockPlayerStats} from "@/data/mockData";

export const playerService = {
    getAll: async (): Promise<Player[]> => {
        // Simulando um delay de rede (pra ficar realista)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockPlayers);
            }, 500);
        });
    },

    create: async (data: Omit<Player, 'id' | 'createdAt'>): Promise<Player> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPlayer: Player = {
                    ...data,
                    id: Math.random().toString(36).substring(7), // ID aleatório simples
                    // @ts-ignore (Se o seu type Player não tiver createdAt, pode ignorar esta linha)
                    createdAt: new Date(),
                };

                // Adiciona ao mock (em memória)
                // O unshift adiciona no começo da lista
                mockPlayers.unshift(newPlayer);

                resolve(newPlayer);
            }, 800); // Um delayzinho para parecer real
        });
    },


    getStats: async (): Promise<PlayerStats[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Ordena por padrão por gols
                const sorted = [...mockPlayerStats].sort((a, b) => b.totalGoals - a.totalGoals);
                resolve(sorted);
            }, 500);
        });
    }
};