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
    isSessionActive: boolean;
}

interface MatchContextData {
    matchState: MatchState;
    startMatch: (allTeams: Team[]) => void;
    pauseMatch: () => void;
    resumeMatch: () => void;
    addGoal: (teamIndex: 0 | 1, playerId: string, assistPlayerId?: string) => void;
    finishMatch: () => Promise<void>;
    addGuestPlayer: (teamIndex: 0 | 1, player: Player) => void;
    nextMatch: (drawWinnerId?: string) => string[]; // <-- Atualizado para receber vencedor do sorteio
    finishDay: () => void;
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
            scoreA: 0,
            scoreB: 0,
            gameTime: 6 * 60,
            isRunning: false,
            teams: allTeams,
            goals: [],
            guestPlayersA: [],
            guestPlayersB: [],
            isSessionActive: true,
        });
    };

    const pauseMatch = () => setMatchState(prev => ({ ...prev, isRunning: false }));
    const resumeMatch = () => setMatchState(prev => ({ ...prev, isRunning: true }));

    const addGoal = (teamIndex: 0 | 1, playerId: string, assistPlayerId?: string) => {
        setMatchState(prev => {
            const newScoreA = teamIndex === 0 ? prev.scoreA + 1 : prev.scoreA;
            const newScoreB = teamIndex === 1 ? prev.scoreB + 1 : prev.scoreB;

            const newGoal: Goal = {
                id: Math.random().toString(),
                playerId,
                assistPlayerId,
                minute: Math.floor((360 - prev.gameTime) / 60),
            };

            // Regra dos 2 Gols (Misericórdia)
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

    // Salva no Banco de Dados (SQLite)
    const finishMatch = async () => {
        setMatchState(prev => ({ ...prev, isRunning: false }));

        // Evita salvar partidas vazias ou duplicadas se o usuário clicar várias vezes
        // (Pode adicionar validações extras aqui se necessário)

        const finalMatch: Match = {
            id: Math.random().toString(), // Será substituído por UUID no service
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

    // Lógica da Rotação de Times (O Cérebro do Baba)
    const nextMatch = (drawWinnerId?: string): string[] => {
        let removedPlayerNames: string[] = [];

        setMatchState(prev => {
            const teams = [...prev.teams];

            // 1. Determina o Vencedor
            let winnerIndex = 0; // Padrão: Rei da Mesa (Time A/0) fica no empate

            if (drawWinnerId) {
                // Se veio ID do sorteio, ele é o vencedor
                const foundIndex = teams.findIndex(t => t.id === drawWinnerId);
                if (foundIndex !== -1) winnerIndex = foundIndex;
            } else {
                // Placar normal
                if (prev.scoreA > prev.scoreB) winnerIndex = 0;
                else if (prev.scoreB > prev.scoreA) winnerIndex = 1;
                // Empate sem sorteio mantém o index 0 (Rei)
            }

            const loserIndex = winnerIndex === 0 ? 1 : 0;

            const winnerTeam = teams[winnerIndex];
            const loserTeam = teams[loserIndex];

            // 2. Manipula a Fila
            const waitingTeams = teams.slice(2);

            // O Vencedor vai pro Index 0 (Rei)
            // O Próximo da fila (Index 2) vai pro Index 1 (Desafiante)
            // O Perdedor vai pro final da fila
            const newOrder = [winnerTeam, ...waitingTeams, loserTeam];

            // 3. Verifica Conflito de "Complete" (Guest Players)
            const nextChallenger = newOrder[1]; // O time que vai jogar contra o vencedor
            const challengerRosterIds = nextChallenger.players.map(p => p.id);

            // Pega os convidados que estavam jogando no time vencedor
            const winnerCurrentGuests = winnerIndex === 0 ? prev.guestPlayersA : prev.guestPlayersB;

            // Remove convidados se eles pertencem ao time desafiante (conflito)
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
                guestPlayersA: keptGuests, // Mantém os que não deram conflito
                guestPlayersB: [], // Desafiante entra limpo
                isSessionActive: true
            };
        });

        return removedPlayerNames;
    };

    const finishDay = () => {
        setMatchState({
            scoreA: 0,
            scoreB: 0,
            gameTime: 6 * 60,
            isRunning: false,
            teams: [],
            goals: [],
            guestPlayersA: [],
            guestPlayersB: [],
            isSessionActive: false,
        });
    };

    return (
        <MatchContext.Provider value={{ matchState, startMatch, pauseMatch, resumeMatch, addGoal, finishMatch, addGuestPlayer, nextMatch, finishDay }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => useContext(MatchContext);