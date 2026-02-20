import api from './api';
import {Goal, Match, Player, Team} from '@/types';

// O DTO que o Java espera
interface EscalacaoDTO {
    jogadorId: string;
    timeColete: 'AZUL' | 'VERMELHO';
}

interface GolDTO {
    autorId: string;
    assistenteId?: string;
    minuto: number;
    timeColete: 'AZUL' | 'VERMELHO';
}

interface PartidaRequestDTO {
    placarAzul: number;
    placarVermelho: number;
    resultado: 'VITORIA_AZUL' | 'VITORIA_VERMELHO' | 'EMPATE';
    motivoFim: 'TEMPO_ESGOTADO' | 'GOL_DE_OURO' | 'SORTEIO_MOEDA';
    escalacoes: EscalacaoDTO[];
    gols: GolDTO[];
}

export const matchService = {
    // 1. ENVIA A PARTIDA (CREATE)
    create: async (match: Match): Promise<void> => {
        try {
            let resultado: 'VITORIA_AZUL' | 'VITORIA_VERMELHO' | 'EMPATE' = 'EMPATE';
            let motivoFim: 'TEMPO_ESGOTADO' | 'GOL_DE_OURO' | 'SORTEIO_MOEDA' = 'TEMPO_ESGOTADO';

            // Regra 1: Alguém fez 2 gols?
            if (match.scoreAzul >= 2 || match.scoreVermelho >= 2) {
                motivoFim = 'GOL_DE_OURO';
                resultado = match.scoreAzul > match.scoreVermelho ? 'VITORIA_AZUL' : 'VITORIA_VERMELHO';
            }
            // Regra 2: Acabou o tempo normal sem empate
            else if (match.scoreAzul > match.scoreVermelho) {
                resultado = 'VITORIA_AZUL';
                motivoFim = 'TEMPO_ESGOTADO';
            }
            else if (match.scoreVermelho > match.scoreAzul) {
                resultado = 'VITORIA_VERMELHO';
                motivoFim = 'TEMPO_ESGOTADO';
            }
            // Regra 3: Empate e teve Sorteio de Moeda!
            else if (match.scoreAzul === match.scoreVermelho) {
                if (match.drawWinner) {
                    motivoFim = 'SORTEIO_MOEDA';
                    // Quem ganha a moeda, leva a vitória nas estatísticas do backend!
                    resultado = match.drawWinner === 'AZUL' ? 'VITORIA_AZUL' : 'VITORIA_VERMELHO';
                } else {
                    // Caso encerrem o jogo forçadamente (clicando em Sair no empate sem girar moeda)
                    resultado = 'EMPATE';
                    motivoFim = 'TEMPO_ESGOTADO';
                }
            }

            // Montar Escalações (Junta os jogadores oficiais + completos/guests)
            const escalacoes: EscalacaoDTO[] = [];
            match.teamAzul.players.forEach(p => escalacoes.push({ jogadorId: p.id, timeColete: 'AZUL' }));
            match.teamVermelho.players.forEach(p => escalacoes.push({ jogadorId: p.id, timeColete: 'VERMELHO' }));

            // Montar Gols
            const gols: GolDTO[] = match.goals.map(g => ({
                autorId: g.playerId,
                assistenteId: g.assistPlayerId || undefined,
                minuto: g.minute,
                timeColete: g.timeColete
            }));

            // O Payload Final para o Spring Boot
            const payload: PartidaRequestDTO = {
                placarAzul: match.scoreAzul,
                placarVermelho: match.scoreVermelho,
                resultado,
                motivoFim,
                escalacoes,
                gols
            };

            await api.post('/partidas/finalizar', payload);

        } catch (error) {
            console.error('Erro ao enviar partida para o servidor:', error);
            throw error;
        }
    },

    // 2. BUSCA O HISTÓRICO (GET ALL)
    getAll: async (): Promise<Match[]> => {
        try {
            const response = await api.get('/partidas/historico');

            // O backend devolve a lista de Partidas. Vamos mapear para a interface do App!
            return response.data.map((partida: any) => {

                // Separa os jogadores pelas cores dos coletes
                const jogadoresAzul: Player[] = [];
                const jogadoresVermelho: Player[] = [];

                partida.escalacoes.forEach((esc: any) => {
                    const player: Player = {
                        id: esc.jogador.id,
                        name: esc.jogador.nome,
                        nickname: esc.jogador.apelido,
                        position: esc.jogador.posicao,
                        skillLevel: esc.jogador.nivelGeral || 5,
                        createdAt: new Date()
                    };

                    if (esc.timeColete === 'AZUL') {
                        jogadoresAzul.push(player);
                    } else {
                        jogadoresVermelho.push(player);
                    }
                });

                // Monta os times virtuais para a tela exibir
                const teamAzul: Team = {
                    id: `azul-${partida.id}`,
                    name: 'Time Azul',
                    players: jogadoresAzul,
                    averageLevel: 0
                };

                const teamVermelho: Team = {
                    id: `vermelho-${partida.id}`,
                    name: 'Time Vermelho',
                    players: jogadoresVermelho,
                    averageLevel: 0
                };

                // Formata os gols
                const goals: Goal[] = partida.gols.map((g: any) => ({
                    id: g.id,
                    playerId: g.autor.id,
                    assistPlayerId: g.assistente?.id,
                    minute: g.minuto,
                    timeColete: g.timeColete
                }));

                // Verifica se foi resolvido na moeda
                let drawWinner: 'AZUL' | 'VERMELHO' | undefined = undefined;
                if (partida.motivoFim === 'SORTEIO_MOEDA') {
                    drawWinner = partida.resultado === 'VITORIA_AZUL' ? 'AZUL' : 'VERMELHO';
                }

                // Retorna a Partida (Match) montadinha!
                return {
                    id: partida.id,
                    teamAzul,
                    teamVermelho,
                    scoreAzul: partida.placarAzul,
                    scoreVermelho: partida.placarVermelho,
                    goals,
                    status: 'finished',
                    createdAt: new Date(partida.dataHora),
                    drawWinner
                };
            });

        } catch (error) {
            console.error('Erro ao buscar histórico de partidas:', error);
            return [];
        }
    }
};