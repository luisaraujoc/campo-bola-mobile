import { Player, GameDay, PlayerStats } from '@/types';

// Gerando 30 jogadores para ter:
// 6 Times Completos (24 jogadores)
// 2 Times Incompletos (6 jogadores)
// Total: 30
export const mockPlayers: Player[] = [
    // --- Goleiros (4-5) ---
    { id: '1', name: 'Alisson Becker', nickname: 'Alisson', skillLevel: 8, position: 'Goleiro', createdAt: new Date() },
    { id: '2', name: 'Ederson Moraes', nickname: 'Ederson', skillLevel: 8, position: 'Goleiro', createdAt: new Date() },
    { id: '3', name: 'Weverton Pereira', nickname: 'Weverton', skillLevel: 7, position: 'Goleiro', createdAt: new Date() },
    { id: '4', name: 'Cássio Ramos', nickname: 'Gigante', skillLevel: 6, position: 'Goleiro', createdAt: new Date() },
    { id: '5', name: 'Bento Krepski', nickname: 'Bento', skillLevel: 7, position: 'Goleiro', createdAt: new Date() },

    // --- Defensores (8-9) ---
    { id: '6', name: 'Marquinhos', nickname: 'Marqui', skillLevel: 8, position: 'Defensor', createdAt: new Date() },
    { id: '7', name: 'Thiago Silva', nickname: 'Monstro', skillLevel: 7, position: 'Defensor', createdAt: new Date() },
    { id: '8', name: 'Eder Militão', nickname: 'Militão', skillLevel: 8, position: 'Defensor', createdAt: new Date() },
    { id: '9', name: 'Bremer Silva', nickname: 'Bremer', skillLevel: 7, position: 'Defensor', createdAt: new Date() },
    { id: '10', name: 'Danilo Luiz', nickname: 'Danilo', skillLevel: 6, position: 'Defensor', createdAt: new Date() },
    { id: '11', name: 'Guilherme Arana', nickname: 'Arana', skillLevel: 7, position: 'Defensor', createdAt: new Date() },
    { id: '12', name: 'Fagner Conserva', nickname: 'Fagner', skillLevel: 6, position: 'Defensor', createdAt: new Date() },
    { id: '13', name: 'Fabrício Bruno', nickname: 'Fabrício', skillLevel: 7, position: 'Defensor', createdAt: new Date() },

    // --- Meio-Campo (8-9) ---
    { id: '14', name: 'Lucas Paquetá', nickname: 'Paquetá', skillLevel: 8, position: 'Meio-campo', createdAt: new Date() },
    { id: '15', name: 'Bruno Guimarães', nickname: 'Bruninho', skillLevel: 8, position: 'Meio-campo', createdAt: new Date() },
    { id: '16', name: 'André Trindade', nickname: 'André', skillLevel: 7, position: 'Meio-campo', createdAt: new Date() },
    { id: '17', name: 'Raphael Veiga', nickname: 'Veiga', skillLevel: 7, position: 'Meio-campo', createdAt: new Date() },
    { id: '18', name: 'Gerson Santos', nickname: 'Coringa', skillLevel: 8, position: 'Meio-campo', createdAt: new Date() },
    { id: '19', name: 'Everton Ribeiro', nickname: 'Miteiro', skillLevel: 6, position: 'Meio-campo', createdAt: new Date() },
    { id: '20', name: 'Renato Augusto', nickname: 'Rei', skillLevel: 6, position: 'Meio-campo', createdAt: new Date() },
    { id: '21', name: 'Andreas Pereira', nickname: 'Andreas', skillLevel: 7, position: 'Meio-campo', createdAt: new Date() },

    // --- Atacantes (8-9) ---
    { id: '22', name: 'Vinicius Jr', nickname: 'Malvadeza', skillLevel: 9, position: 'Atacante', createdAt: new Date() },
    { id: '23', name: 'Rodrygo Goes', nickname: 'Rayo', skillLevel: 8, position: 'Atacante', createdAt: new Date() },
    { id: '24', name: 'Raphinha Dias', nickname: 'Raphinha', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
    { id: '25', name: 'Gabriel Martinelli', nickname: 'Martinelli', skillLevel: 8, position: 'Atacante', createdAt: new Date() },
    { id: '26', name: 'Endrick Felipe', nickname: 'Endrick', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
    { id: '27', name: 'Pedro Guilherme', nickname: 'Queixada', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
    { id: '28', name: 'Hulk Paraíba', nickname: 'Hulk', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
    { id: '29', name: 'Paulinho', nickname: 'Paulinho', skillLevel: 6, position: 'Atacante', createdAt: new Date() },
    { id: '30', name: 'Dudu', nickname: 'Baixola', skillLevel: 7, position: 'Atacante', createdAt: new Date() },
];

export const mockGameDays: GameDay[] = [];

// Stats atualizados para bater com os IDs novos
export const mockPlayerStats: PlayerStats[] = [
    { playerId: '22', player: mockPlayers[21], totalGoals: 15, totalAssists: 8, gamesPlayed: 10, wins: 7, losses: 2, draws: 1 }, // Vini Jr
    { playerId: '6', player: mockPlayers[5], totalGoals: 3, totalAssists: 1, gamesPlayed: 10, wins: 6, losses: 3, draws: 1 }, // Marquinhos
    { playerId: '14', player: mockPlayers[13], totalGoals: 9, totalAssists: 10, gamesPlayed: 10, wins: 5, losses: 4, draws: 1 }, // Paquetá
    { playerId: '1', player: mockPlayers[0], totalGoals: 0, totalAssists: 2, gamesPlayed: 10, wins: 6, losses: 3, draws: 1 }, // Alisson
    { playerId: '23', player: mockPlayers[22], totalGoals: 12, totalAssists: 5, gamesPlayed: 9, wins: 5, losses: 3, draws: 1 }, // Rodrygo
];