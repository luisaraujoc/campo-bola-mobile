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
    color: 'a' | 'b' | 'c' | 'd' | 'e';
    players: Player[];
    averageLevel: number;
}

export interface Goal {
    id: string;
    playerId: string;
    assistPlayerId?: string;
    minute?: number;
}

export interface Match {
    id: string;
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    goals: Goal[];
    status: 'pending' | 'ongoing' | 'finished';
    createdAt: Date;
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
    losses: number;
    draws: number;
}