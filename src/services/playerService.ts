import { Player } from "@/types";
import { mockPlayers } from "@/data/mockData";

export const playerService = {
    getAll: async (): Promise<Player[]> => {
        // Simulando um delay de rede (pra ficar realista)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockPlayers);
            }, 500);
        });
    },

    // Futuro: create, update, delete...
};