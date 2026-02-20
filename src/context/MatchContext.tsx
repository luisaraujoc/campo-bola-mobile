import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Match, Goal, Player } from '@/types';
import { matchService } from '@/services/matchService';

interface MatchState {
    scoreAzul: number;
    scoreVermelho: number;
    gameTime: number;
    isRunning: boolean;
    teams: Team[];
    goals: Goal[];
    guestPlayersAzul: Player[];
    guestPlayersVermelho: Player[];
    isSessionActive: boolean;
}

interface MatchContextData {
    matchState: MatchState;
    startMatch: (allTeams: Team[]) => void;
    pauseMatch: () => void;
    resumeMatch: () => void;
    addGoal: (time: 'AZUL' | 'VERMELHO', playerId: string, assistPlayerId?: string) => void;
    finishMatch: (drawWinnerTeam?: 'AZUL' | 'VERMELHO') => Promise<void>;
    addGuestPlayer: (time: 'AZUL' | 'VERMELHO', player: Player) => void;
    nextMatch: (drawWinnerId?: string) => string[];
    finishDay: () => void;
}

const MatchContext = createContext<MatchContextData>({} as MatchContextData);

export function MatchProvider({ children }: { children: ReactNode }) {
    const [matchState, setMatchState] = useState<MatchState>({
        scoreAzul: 0,
        scoreVermelho: 0,
        gameTime: 6 * 60,
        isRunning: false,
        teams: [],
        goals: [],
        guestPlayersAzul: [],
        guestPlayersVermelho: [],
        isSessionActive: false,
    });

    // Cronômetro Regressivo
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
            scoreAzul: 0,
            scoreVermelho: 0,
            gameTime: 6 * 60,
            isRunning: false,
            teams: allTeams,
            goals: [],
            guestPlayersAzul: [],
            guestPlayersVermelho: [],
            isSessionActive: true,
        });
    };

    const pauseMatch = () => setMatchState(prev => ({ ...prev, isRunning: false }));
    const resumeMatch = () => setMatchState(prev => ({ ...prev, isRunning: true }));

    const addGoal = (time: 'AZUL' | 'VERMELHO', playerId: string, assistPlayerId?: string) => {
        setMatchState(prev => {
            const newScoreAzul = time === 'AZUL' ? prev.scoreAzul + 1 : prev.scoreAzul;
            const newScoreVermelho = time === 'VERMELHO' ? prev.scoreVermelho + 1 : prev.scoreVermelho;

            const newGoal: Goal = {
                id: Math.random().toString(),
                playerId,
                assistPlayerId,
                minute: Math.floor((360 - prev.gameTime) / 60),
                timeColete: time
            };

            const isFinished = newScoreAzul >= 2 || newScoreVermelho >= 2;

            return {
                ...prev,
                scoreAzul: newScoreAzul,
                scoreVermelho: newScoreVermelho,
                goals: [...prev.goals, newGoal],
                isRunning: !isFinished
            };
        });
    };

    const addGuestPlayer = (time: 'AZUL' | 'VERMELHO', player: Player) => {
        setMatchState(prev => ({
            ...prev,
            guestPlayersAzul: time === 'AZUL' ? [...prev.guestPlayersAzul, player] : prev.guestPlayersAzul,
            guestPlayersVermelho: time === 'VERMELHO' ? [...prev.guestPlayersVermelho, player] : prev.guestPlayersVermelho,
        }));
    };

    const finishMatch = async (drawWinnerTeam?: 'AZUL' | 'VERMELHO') => {
        setMatchState(prev => ({ ...prev, isRunning: false }));

        const finalMatch: Match = {
            id: Math.random().toString(),
            teamAzul: matchState.teams[0],
            teamVermelho: matchState.teams[1],
            scoreAzul: matchState.scoreAzul,
            scoreVermelho: matchState.scoreVermelho,
            goals: matchState.goals,
            status: 'finished',
            createdAt: new Date(),
            drawWinner: drawWinnerTeam,
        };
        await matchService.create(finalMatch);
    };

    const nextMatch = (drawWinnerId?: string): string[] => {
        let removedPlayerNames: string[] = [];

        setMatchState(prev => {
            const teams = [...prev.teams];
            let winnerIndex = 0; // Empate favorece o Rei (AZUL/0)

            if (drawWinnerId) {
                const foundIndex = teams.findIndex(t => t.id === drawWinnerId);
                if (foundIndex !== -1) winnerIndex = foundIndex;
            } else {
                if (prev.scoreAzul > prev.scoreVermelho) winnerIndex = 0;
                else if (prev.scoreVermelho > prev.scoreAzul) winnerIndex = 1;
            }

            const loserIndex = winnerIndex === 0 ? 1 : 0;
            const winnerTeam = teams[winnerIndex];
            const loserTeam = teams[loserIndex];

            const waitingTeams = teams.slice(2);
            const newOrder = [winnerTeam, ...waitingTeams, loserTeam];
            const nextChallenger = newOrder[1];
            const challengerRosterIds = nextChallenger.players.map(p => p.id);

            const winnerCurrentGuests = winnerIndex === 0 ? prev.guestPlayersAzul : prev.guestPlayersVermelho;
            const keptGuests = winnerCurrentGuests.filter(guest => !challengerRosterIds.includes(guest.id));
            const removedGuests = winnerCurrentGuests.filter(guest => challengerRosterIds.includes(guest.id));

            removedPlayerNames = removedGuests.map(p => p.name);

            return {
                ...prev,
                scoreAzul: 0,
                scoreVermelho: 0,
                gameTime: 6 * 60,
                isRunning: false,
                goals: [],
                teams: newOrder,
                guestPlayersAzul: keptGuests, // O vencedor que ficou assume a camisa Azul
                guestPlayersVermelho: [], // Desafiante vem sempre limpo de vermelho
                isSessionActive: true
            };
        });

        return removedPlayerNames;
    };

    const finishDay = () => {
        setMatchState({
            scoreAzul: 0, scoreVermelho: 0, gameTime: 6 * 60, isRunning: false,
            teams: [], goals: [], guestPlayersAzul: [], guestPlayersVermelho: [], isSessionActive: false,
        });
    };

    return (
        <MatchContext.Provider value={{ matchState, startMatch, pauseMatch, resumeMatch, addGoal, finishMatch, addGuestPlayer, nextMatch, finishDay }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => useContext(MatchContext);