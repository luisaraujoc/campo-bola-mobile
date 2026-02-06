import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Match, Goal, Player } from '../types';
import { matchService } from '../services/matchService';

interface MatchState {
    scoreA: number;
    scoreB: number;
    gameTime: number;
    isRunning: boolean;
    teams: Team[];
    goals: Goal[];
    guestPlayersA: Player[];
    guestPlayersB: Player[];
}

interface MatchContextData {
    matchState: MatchState;
    startMatch: (allTeams: Team[]) => void;
    pauseMatch: () => void;
    resumeMatch: () => void;
    // ATENÇÃO: Nova assinatura da função addGoal
    addGoal: (teamIndex: 0 | 1, playerId: string, assistPlayerId?: string) => void;
    finishMatch: () => Promise<void>;
    addGuestPlayer: (teamIndex: 0 | 1, player: Player) => void;
    nextMatch: () => string[];
}

const MatchContext = createContext<MatchContextData>({} as MatchContextData);

export function MatchProvider({ children }: { children: ReactNode }) {
    const [matchState, setMatchState] = useState<MatchState>({
        scoreA: 0,
        scoreB: 0,
        gameTime: 6 * 60,
        isRunning: false,
        teams: [],
        goals: [],
        guestPlayersA: [],
        guestPlayersB: [],
    });

    // Cronômetro (Mantido igual)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (matchState.isRunning && matchState.gameTime > 0) {
            interval = setInterval(() => {
                setMatchState(prev => {
                    if (prev.gameTime <= 1) {
                        clearInterval(interval);
                        return { ...prev, gameTime: 0, isRunning: false };
                    }
                    return { ...prev, gameTime: prev.gameTime - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [matchState.isRunning, matchState.gameTime]);

    const startMatch = (allTeams: Team[]) => {
        setMatchState({
            scoreA: 0,
            scoreB: 0,
            gameTime: 6 * 60,
            isRunning: false,
            teams: allTeams,
            goals: [],
            guestPlayersA: [],
            guestPlayersB: [],
        });
    };

    const pauseMatch = () => setMatchState(prev => ({ ...prev, isRunning: false }));
    const resumeMatch = () => setMatchState(prev => ({ ...prev, isRunning: true }));

    // ATUALIZADO: Recebe assistPlayerId
    const addGoal = (teamIndex: 0 | 1, playerId: string, assistPlayerId?: string) => {
        setMatchState(prev => {
            const newScoreA = teamIndex === 0 ? prev.scoreA + 1 : prev.scoreA;
            const newScoreB = teamIndex === 1 ? prev.scoreB + 1 : prev.scoreB;

            const newGoal: Goal = {
                id: Math.random().toString(),
                playerId,
                assistPlayerId, // Salva a assistência aqui!
                minute: Math.floor((360 - prev.gameTime) / 60),
            };

            const isFinished = newScoreA >= 2 || newScoreB >= 2;

            return {
                ...prev,
                scoreA: newScoreA,
                scoreB: newScoreB,
                goals: [...prev.goals, newGoal],
                isRunning: !isFinished
            };
        });
    };

    const addGuestPlayer = (teamIndex: 0 | 1, player: Player) => {
        setMatchState(prev => ({
            ...prev,
            guestPlayersA: teamIndex === 0 ? [...prev.guestPlayersA, player] : prev.guestPlayersA,
            guestPlayersB: teamIndex === 1 ? [...prev.guestPlayersB, player] : prev.guestPlayersB,
        }));
    };

    const finishMatch = async () => {
        setMatchState(prev => ({ ...prev, isRunning: false }));
        const finalMatch: Match = {
            id: Math.random().toString(),
            teamA: matchState.teams[0],
            teamB: matchState.teams[1],
            scoreA: matchState.scoreA,
            scoreB: matchState.scoreB,
            goals: matchState.goals,
            status: 'finished',
            createdAt: new Date(),
        };
        await matchService.create(finalMatch);
    };

    const nextMatch = (): string[] => {
        let removedPlayerNames: string[] = [];
        setMatchState(prev => {
            const teams = [...prev.teams];
            const winnerIndex = prev.scoreA >= prev.scoreB ? 0 : 1;
            const loserIndex = winnerIndex === 0 ? 1 : 0;

            const winnerTeam = teams[winnerIndex];
            const loserTeam = teams[loserIndex];
            const waitingTeams = teams.slice(2);

            const newOrder = [winnerTeam, ...waitingTeams, loserTeam];

            const winnerCurrentGuests = winnerIndex === 0 ? prev.guestPlayersA : prev.guestPlayersB;
            const challengerRosterIds = newOrder[1].players.map(p => p.id);

            const keptGuests = winnerCurrentGuests.filter(guest => !challengerRosterIds.includes(guest.id));
            const removedGuests = winnerCurrentGuests.filter(guest => challengerRosterIds.includes(guest.id));

            removedPlayerNames = removedGuests.map(p => p.name);

            return {
                ...prev,
                scoreA: 0,
                scoreB: 0,
                gameTime: 6 * 60,
                isRunning: false,
                goals: [],
                teams: newOrder,
                guestPlayersA: keptGuests,
                guestPlayersB: [],
            };
        });
        return removedPlayerNames;
    };

    return (
        <MatchContext.Provider value={{ matchState, startMatch, pauseMatch, resumeMatch, addGoal, finishMatch, addGuestPlayer, nextMatch }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => useContext(MatchContext);