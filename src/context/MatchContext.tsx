import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team } from '../types';

interface MatchState {
    scoreA: number;
    scoreB: number;
    gameTime: number; // em segundos
    isRunning: boolean;
    teams: Team[]; // [TeamA, TeamB]
}

interface MatchContextData {
    matchState: MatchState;
    startMatch: (teams: Team[]) => void;
    pauseMatch: () => void;
    resumeMatch: () => void;
    addGoal: (teamIndex: 0 | 1, playerId: string) => void;
    finishMatch: () => void;
}

const MatchContext = createContext<MatchContextData>({} as MatchContextData);

export function MatchProvider({ children }: { children: ReactNode }) {
    const [matchState, setMatchState] = useState<MatchState>({
        scoreA: 0,
        scoreB: 0,
        gameTime: 0,
        isRunning: false,
        teams: [],
    });

    // Cronômetro
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (matchState.isRunning) {
            interval = setInterval(() => {
                setMatchState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [matchState.isRunning]);

    const startMatch = (teams: Team[]) => {
        setMatchState({
            scoreA: 0,
            scoreB: 0,
            gameTime: 0, // Começa do zero
            isRunning: true,
            teams: teams,
        });
    };

    const pauseMatch = () => setMatchState(prev => ({ ...prev, isRunning: false }));

    const resumeMatch = () => setMatchState(prev => ({ ...prev, isRunning: true }));

    const addGoal = (teamIndex: 0 | 1, playerId: string) => {
        setMatchState(prev => ({
            ...prev,
            scoreA: teamIndex === 0 ? prev.scoreA + 1 : prev.scoreA,
            scoreB: teamIndex === 1 ? prev.scoreB + 1 : prev.scoreB,
            // Aqui futuramente podemos salvar QUEM fez o gol (playerId) num histórico
        }));
    };

    const finishMatch = () => {
        setMatchState(prev => ({ ...prev, isRunning: false }));
        // Aqui poderia salvar no histórico geral
    };

    return (
        <MatchContext.Provider value={{ matchState, startMatch, pauseMatch, resumeMatch, addGoal, finishMatch }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => useContext(MatchContext);