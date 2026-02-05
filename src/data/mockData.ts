import { Player, GameDay, PlayerStats } from '@/types';

export const mockPlayers: Player[] = [
    { id: '1', name: 'Carlos Silva', nickname: 'Carlão', skillLevel: 8, position: 'Atacante', createdAt: new Date() },
    { id: '2', name: 'João Pedro', nickname: 'JP', skillLevel: 7, position: 'Meio-campo', createdAt: new Date() },
    { id: '3', name: 'Rafael Costa', nickname: 'Rafa', skillLevel: 9, position: 'Goleiro', createdAt: new Date() },
    { id: '4', name: 'Bruno Santos', nickname: 'Bruninho', skillLevel: 6, position: 'Defensor', createdAt: new Date() },
    { id: '5', name: 'Lucas Oliveira', nickname: 'Luke', skillLevel: 5, position: 'Meio-campo', createdAt: new Date() },
    { id: '6', name: 'Pedro Henrique', nickname: 'PH', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
    { id: '7', name: 'Marcos Vinícius', nickname: 'Marquinhos', skillLevel: 4, position: 'Defensor', createdAt: new Date() },
    { id: '8', name: 'André Luis', nickname: 'Dedé', skillLevel: 8, position: 'Meio-campo', createdAt: new Date() },
    { id: '9', name: 'Felipe Souza', nickname: 'Felipão', skillLevel: 6, position: 'Atacante', createdAt: new Date() },
    { id: '10', name: 'Gabriel Santos', nickname: 'Gabigol', skillLevel: 10, position: 'Atacante', createdAt: new Date() },
    { id: '11', name: 'Thiago Mendes', nickname: 'Titi', skillLevel: 5, position: 'Defensor', createdAt: new Date() },
    { id: '12', name: 'Diego Alves', nickname: 'Diegão', skillLevel: 7, position: 'Goleiro', createdAt: new Date() },
];

export const mockGameDays: GameDay[] = [];

export const mockPlayerStats: PlayerStats[] = [
    { playerId: '10', player: mockPlayers[9], totalGoals: 15, totalAssists: 8, gamesPlayed: 10, wins: 7, losses: 2, draws: 1 },
    { playerId: '1', player: mockPlayers[0], totalGoals: 12, totalAssists: 5, gamesPlayed: 10, wins: 6, losses: 3, draws: 1 },
    { playerId: '6', player: mockPlayers[5], totalGoals: 9, totalAssists: 10, gamesPlayed: 10, wins: 5, losses: 4, draws: 1 },
    { playerId: '8', player: mockPlayers[7], totalGoals: 7, totalAssists: 12, gamesPlayed: 10, wins: 6, losses: 3, draws: 1 },
    { playerId: '2', player: mockPlayers[1], totalGoals: 5, totalAssists: 8, gamesPlayed: 9, wins: 5, losses: 3, draws: 1 },
];