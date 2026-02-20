import { Player, Team } from '@/types';

const teamNames = ['Time 1', 'Time 2', 'Time 3', 'Time 4', 'Time 5', 'Time 6'];

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function calculateAverageLevel(players: Player[]): number {
    if (players.length === 0) return 0;
    const total = players.reduce((sum, p) => sum + p.skillLevel, 0);
    return total / players.length;
}

function createTeam(index: number, players: Player[]): Team {
    return {
        id: `team-${Date.now()}-${index}`,
        name: teamNames[index % teamNames.length],
        players,
        averageLevel: calculateAverageLevel(players),
    };
}

export function sortTeamsBalanced(players: Player[], playersPerTeam: number = 4): Team[] {
    if (players.length === 0) return [];

    // Sort players by skill level (highest first)
    const sortedPlayers = [...players].sort((a, b) => b.skillLevel - a.skillLevel);

    // Calculate number of teams needed
    const numFullTeams = Math.floor(players.length / playersPerTeam);
    const remainder = players.length % playersPerTeam;
    const totalTeams = numFullTeams + (remainder > 0 ? 1 : 0);

    // Initialize empty teams
    const teams: Player[][] = Array.from({ length: totalTeams }, () => []);

    // Use snake draft for balanced distribution
    // Round 1: 0, 1, 2, 3
    // Round 2: 3, 2, 1, 0
    // Round 3: 0, 1, 2, 3
    // etc.
    let direction = 1;
    let teamIndex = 0;

    for (const player of sortedPlayers) {
        teams[teamIndex].push(player);

        // Move to next team
        teamIndex += direction;

        // Reverse direction at boundaries
        if (teamIndex >= totalTeams || teamIndex < 0) {
            direction *= -1;
            teamIndex += direction;
        }
    }

    return teams.map((teamPlayers, index) => createTeam(index, teamPlayers));
}

export function sortTeamsRandom(players: Player[], playersPerTeam: number = 4): Team[] {
    if (players.length === 0) return [];

    // Shuffle all players randomly
    const shuffledPlayers = shuffleArray(players);

    // Calculate number of teams needed
    const numFullTeams = Math.floor(players.length / playersPerTeam);
    const remainder = players.length % playersPerTeam;
    const totalTeams = numFullTeams + (remainder > 0 ? 1 : 0);

    // Distribute players to teams
    const teams: Team[] = [];
    let playerIndex = 0;

    for (let i = 0; i < totalTeams; i++) {
        const isLastTeam = i === totalTeams - 1;
        const teamSize = isLastTeam && remainder > 0 ? remainder : playersPerTeam;
        const teamPlayers = shuffledPlayers.slice(playerIndex, playerIndex + teamSize);
        teams.push(createTeam(i, teamPlayers));
        playerIndex += teamSize;
    }

    return teams;
}

export function sortTeams(
    players: Player[],
    type: 'balanced' | 'random',
    playersPerTeam: number = 4
): Team[] {
    if (type === 'balanced') {
        return sortTeamsBalanced(players, playersPerTeam);
    }
    return sortTeamsRandom(players, playersPerTeam);
}