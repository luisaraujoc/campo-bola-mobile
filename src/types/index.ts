export type UserRole = 'ADMIN' | 'JOGADOR';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface Player {
    id: string;
    name: string;
    nickname?: string;
    skillLevel: number; // 1-10
    position?: string;
    createdAt: Date;
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
    averageLevel: number;
}

export interface Goal {
    id: string;
    playerId: string;
    assistPlayerId?: string;
    minute: number;
    timeColete: 'AZUL' | 'VERMELHO';
}

export interface Match {
    id: string;
    teamAzul: Team;
    teamVermelho: Team;
    scoreAzul: number;
    scoreVermelho: number;
    goals: Goal[];
    status: 'pending' | 'ongoing' | 'finished';
    createdAt: Date;
    drawWinner?: 'AZUL' | 'VERMELHO';
}

export interface GameDay {
    id: string;
    date: Date;
    players: Player[];
    teams: Team[];
    matches: Match[];
    sortType: 'balanced' | 'random';
    status: 'draft' | 'active' | 'finished';
    createdAt: Date;
}

export interface PlayerStats {
    playerId: string;
    player: Player;
    totalGoals: number;
    totalAssists: number;
    gamesPlayed: number;
    wins: number;
}