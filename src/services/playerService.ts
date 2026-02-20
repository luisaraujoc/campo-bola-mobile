import api from './api';
import { Player, PlayerStats } from '@/types';

interface JogadorRequestDTO {
    nome: string;
    telefone: string;
    apelido?: string;
    posicao: string;
    nivelGeral: number;
}

export const playerService = {
    getAll: async (): Promise<Player[]> => {
        const response = await api.get('/jogadores');
        return response.data.map((dto: any) => ({
            id: dto.id,
            name: dto.nome,
            nickname: dto.apelido,
            skillLevel: dto.nivelGeral || 5,
            position: dto.posicao || 'LIN',
            createdAt: new Date(),
        }));
    },

    getById: async (id: string): Promise<Player> => {
        const response = await api.get(`/jogadores/${id}`);
        const dto = response.data;
        return {
            id: dto.id,
            name: dto.nome,
            nickname: dto.apelido,
            skillLevel: dto.nivelGeral,
            position: dto.posicao,
            createdAt: new Date(),
        };
    },

    getStats: async (): Promise<PlayerStats[]> => {
        const response = await api.get('/jogadores');
        return response.data.map((dto: any) => ({
            playerId: dto.id,
            player: {
                id: dto.id,
                name: dto.nome,
                nickname: dto.apelido,
                skillLevel: dto.nivelGeral,
                position: dto.posicao,
            },
            totalGoals: dto.gols || 0,
            totalAssists: dto.assistencias || 0,
            gamesPlayed: dto.partidasJogadas || 0,
            wins: dto.vitorias || 0,
        }));
    },

    create: async (data: JogadorRequestDTO): Promise<void> => {
        await api.post('/jogadores', data);
    },

    update: async (id: string, data: JogadorRequestDTO): Promise<void> => {
        await api.put(`/jogadores/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/jogadores/${id}`);
    }
};