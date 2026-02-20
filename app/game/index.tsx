import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMatch } from '@/context/MatchContext';
import { Player } from '@/types';
import { CoinTossModal } from '@/components/game/CoinTossModal';

export default function GameScreen() {
    const router = useRouter();
    const { matchState, pauseMatch, resumeMatch, addGoal, finishMatch, nextMatch, addGuestPlayer } = useMatch();
    const { teams, scoreAzul, scoreVermelho, gameTime, isRunning, guestPlayersAzul, guestPlayersVermelho } = matchState;

    // Modais
    const [completeModalVisible, setCompleteModalVisible] = useState(false);
    const [assistModalVisible, setAssistModalVisible] = useState(false);
    const [coinModalVisible, setCoinModalVisible] = useState(false);

    // Estados Auxiliares
    const [selectedTeam, setSelectedTeam] = useState<'AZUL' | 'VERMELHO' | null>(null);
    const [tempScorer, setTempScorer] = useState<{player: Player, time: 'AZUL' | 'VERMELHO'} | null>(null);

    const teamAzul = teams[0];
    const teamVermelho = teams[1];

    // --- CORREÇÃO: LISTA DE JOGADORES DISPONÍVEIS ---
    const waitingTeams = teams.slice(2);
    // Pega os IDs de quem já está completando algum time agora
    const activeGuestIds = [...guestPlayersAzul, ...guestPlayersVermelho].map(p => p.id);
    // Lista de disponíveis = todo mundo de fora MENOS quem já tá em campo completando
    const availablePlayers = waitingTeams
        .flatMap(t => t.players)
        .filter(p => !activeGuestIds.includes(p.id));

    // Formata Tempo (mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- FUNÇÃO CENTRAL DE AVANÇAR PARTIDA ---
    const processNextMatch = async (drawWinnerId?: string) => {

        // 1. Descobre a cor de quem ganhou a moeda (se houve sorteio)
        let drawWinnerColor: 'AZUL' | 'VERMELHO' | undefined = undefined;
        if (drawWinnerId) {
            if (teamAzul.id === drawWinnerId) drawWinnerColor = 'AZUL';
            else if (teamVermelho.id === drawWinnerId) drawWinnerColor = 'VERMELHO';
        }

        // 2. Finaliza passando a cor do vencedor na sorte
        await finishMatch(drawWinnerColor);

        // 3. Gira a fila
        const removedPlayers = nextMatch(drawWinnerId);

        if (removedPlayers.length > 0) {
            setTimeout(() => {
                Alert.alert("Baixa no Time!", `O(s) jogador(es) ${removedPlayers.join(', ')} voltou(aram) para o time original.`);
            }, 500);
        }
    };

    const handleFinish = async () => {
        pauseMatch();
        const isDraw = scoreAzul === scoreVermelho;

        Alert.alert(
            "Fim de Jogo!",
            `Resultado: Azul ${scoreAzul} x ${scoreVermelho} Vermelho\n\nO que fazer agora?`,
            [
                { text: "Cancelar", style: "cancel", onPress: resumeMatch },
                {
                    text: "Próxima Partida",
                    onPress: async () => {
                        if (isDraw) {
                            setCoinModalVisible(true);
                        } else {
                            await processNextMatch();
                        }
                    }
                },
                {
                    text: "Sair",
                    style: 'destructive',
                    onPress: async () => {
                        await finishMatch();
                        router.back();
                    }
                }
            ]
        );
    };

    const handleCoinTossFinish = async (winnerId: string) => {
        setCoinModalVisible(false);
        setTimeout(() => {
            processNextMatch(winnerId);
        }, 300);
    };

    // --- LÓGICA DE GOL + ASSISTÊNCIA ---
    const handleGoalClick = (time: 'AZUL' | 'VERMELHO', player: Player) => {
        if (maxGoalsReached) return;
        setTempScorer({ player, time });
        setAssistModalVisible(true);
    };

    const confirmGoal = (assistPlayerId?: string) => {
        if (tempScorer) {
            addGoal(tempScorer.time, tempScorer.player.id, assistPlayerId);
            setAssistModalVisible(false);
            setTempScorer(null);
        }
    };

    // --- LÓGICA DE COMPLETAR TIME ---
    const openCompleteModal = (time: 'AZUL' | 'VERMELHO') => {
        setSelectedTeam(time);
        setCompleteModalVisible(true);
    };

    const confirmGuestPlayer = (player: Player) => {
        if (selectedTeam) {
            addGuestPlayer(selectedTeam, player);
            setCompleteModalVisible(false);
            setSelectedTeam(null);
        }
    };

    const maxGoalsReached = scoreAzul >= 2 || scoreVermelho >= 2;

    if (!teamAzul || !teamVermelho) return (
        <View className="flex-1 bg-gray-900 justify-center items-center">
            <Text className="text-white">Carregando partida...</Text>
        </View>
    );

    const getTeammates = () => {
        if (!tempScorer) return [];
        const currentTeam = tempScorer.time === 'AZUL' ? teamAzul : teamVermelho;
        const currentGuests = tempScorer.time === 'AZUL' ? guestPlayersAzul : guestPlayersVermelho;
        return [...currentTeam.players, ...currentGuests].filter(p => p.id !== tempScorer.player.id);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">

            {/* PLACAR E STATUS */}
            <View className="h-[35%] flex-row items-center justify-between px-4 pt-4">
                {/* TIME AZUL */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-1 text-center" numberOfLines={1}>{teamAzul.name}</Text>
                    <View className="bg-blue-600 px-2 rounded mb-2">
                        <Text className="text-white text-xs font-bold">AZUL</Text>
                    </View>
                    <View className="flex-row items-end">
                        <Text className="text-7xl font-bold text-blue-500">{scoreAzul}</Text>
                        <Text className="text-sm text-gray-500 mb-4 ml-1">/2</Text>
                    </View>
                    <TouchableOpacity onPress={() => openCompleteModal('AZUL')} className="bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                        <Text className="text-xs text-blue-400 font-bold">+ Completar</Text>
                    </TouchableOpacity>
                </View>

                {/* TEMPO */}
                <View className="items-center justify-center w-[25%]">
                    <Text className="text-gray-500 font-bold text-xs mb-1">TEMPO</Text>
                    <View className={`px-3 py-2 rounded border-2 ${gameTime === 0 ? 'bg-red-900 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
                        <Text className={`font-mono text-2xl font-bold ${gameTime < 60 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(gameTime)}
                        </Text>
                    </View>
                    {maxGoalsReached && <Text className="text-yellow-500 text-[10px] font-bold mt-2">GOL DE OURO!</Text>}
                    {!isRunning && gameTime === 6 * 60 && <Text className="text-green-400 text-[10px] font-bold mt-2">AGUARDANDO</Text>}
                    {!isRunning && gameTime < 6 * 60 && gameTime > 0 && <Text className="text-yellow-500 text-[10px] font-bold mt-2">PAUSADO</Text>}
                </View>

                {/* TIME VERMELHO */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-1 text-center" numberOfLines={1}>{teamVermelho.name}</Text>
                    <View className="bg-red-600 px-2 rounded mb-2">
                        <Text className="text-white text-xs font-bold">VERMELHO</Text>
                    </View>
                    <View className="flex-row items-end">
                        <Text className="text-7xl font-bold text-red-500">{scoreVermelho}</Text>
                        <Text className="text-sm text-gray-500 mb-4 ml-1">/2</Text>
                    </View>
                    <TouchableOpacity onPress={() => openCompleteModal('VERMELHO')} className="bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                        <Text className="text-xs text-red-400 font-bold">+ Completar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* CONTROLES PRINCIPAIS */}
            <View className="flex-row justify-center gap-6 py-6 bg-gray-800/30 border-y border-gray-800">
                {!maxGoalsReached && gameTime > 0 ? (
                    <TouchableOpacity
                        onPress={isRunning ? pauseMatch : resumeMatch}
                        className={`w-16 h-16 rounded-full items-center justify-center ${
                            isRunning
                                ? 'bg-yellow-600'
                                : gameTime === 6 * 60
                                    ? 'bg-green-500 border-4 border-green-700'
                                    : 'bg-green-600'
                        }`}
                    >
                        <MaterialCommunityIcons name={isRunning ? "pause" : "play"} size={32} color="white" />
                    </TouchableOpacity>
                ) : (
                    <View className="w-16 h-16 rounded-full items-center justify-center bg-gray-700 opacity-50">
                        <MaterialCommunityIcons name="stop" size={32} color="white" />
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleFinish}
                    className="w-16 h-16 rounded-full bg-red-600 items-center justify-center shadow-lg shadow-red-900/50"
                >
                    <MaterialCommunityIcons name="whistle" size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* LISTAS GOLS */}
            <View className="flex-1 flex-row mt-2">
                {/* Coluna Azul */}
                <ScrollView className="flex-1 bg-blue-900/10 border-r border-gray-800">
                    {[...teamAzul.players, ...guestPlayersAzul].map((player, idx) => (
                        <TouchableOpacity
                            key={player.id + idx}
                            onPress={() => handleGoalClick('AZUL', player)}
                            disabled={maxGoalsReached}
                            className="p-3 border-b border-gray-800 active:bg-blue-900/30 flex-row items-center gap-3"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#3b82f6" />
                            <View>
                                <Text className="font-bold text-gray-300">{player.name} {idx >= teamAzul.players.length && '(C)'}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Coluna Vermelha */}
                <ScrollView className="flex-1 bg-red-900/10">
                    {[...teamVermelho.players, ...guestPlayersVermelho].map((player, idx) => (
                        <TouchableOpacity
                            key={player.id + idx}
                            onPress={() => handleGoalClick('VERMELHO', player)}
                            disabled={maxGoalsReached}
                            className="p-3 border-b border-gray-800 active:bg-red-900/30 flex-row items-center gap-3"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#ef4444" />
                            <View>
                                <Text className="font-bold text-gray-300">{player.name} {idx >= teamVermelho.players.length && '(C)'}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* MODAL 1: COMPLETAR TIME */}
            <Modal visible={completeModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
                    <View className="flex-row justify-between items-center mb-6 mt-2">
                        <View>
                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-sm">REFORÇO SOLICITADO</Text>
                            <Text className="text-2xl font-black text-gray-900 dark:text-white">
                                Completar <Text className={selectedTeam === 'AZUL' ? 'text-blue-500' : 'text-red-500'}>
                                {selectedTeam}
                            </Text>
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setCompleteModalVisible(false)} className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full">
                            <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={availablePlayers}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => confirmGuestPlayer(item)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-3 flex-row items-center gap-4 active:scale-95 transition-transform"
                            >
                                <View className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center border border-gray-200 dark:border-gray-600">
                                    <Text className="font-bold text-gray-500 dark:text-gray-300">
                                        {item.position?.substring(0, 3).toUpperCase() || 'LIN'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.name}</Text>
                                    <Text className="text-sm text-gray-400 dark:text-gray-500">Nível {item.skillLevel}</Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="plus-circle"
                                    size={28}
                                    color={selectedTeam === 'AZUL' ? '#3b82f6' : '#ef4444'}
                                />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-10 mt-10">
                                <MaterialCommunityIcons name="account-search-outline" size={64} color="#4b5563" />
                                <Text className="text-center mt-4 text-gray-400 dark:text-gray-500 font-bold text-lg">
                                    Nenhum jogador disponível.
                                </Text>
                                <Text className="text-center text-gray-500 dark:text-gray-600 text-sm mt-1">
                                    Todos da reserva já estão em campo.
                                </Text>
                            </View>
                        }
                    />
                </View>
            </Modal>

            {/* MODAL 2: ASSISTÊNCIA */}
            <Modal visible={assistModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center p-4">
                    <View className="bg-white dark:bg-gray-800 w-full rounded-2xl overflow-hidden p-6">
                        <Text className="text-center text-gray-500 dark:text-gray-400 font-bold mb-1">GOL DE</Text>
                        <Text className="text-center text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase">
                            {tempScorer?.player.name}
                        </Text>
                        <Text className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-3">QUEM DEU O PASSE?</Text>

                        <TouchableOpacity onPress={() => confirmGoal(undefined)} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-3 border border-gray-200 dark:border-gray-600">
                            <Text className="text-center font-bold text-gray-600 dark:text-gray-200">Jogada Individual</Text>
                        </TouchableOpacity>

                        <View className="max-h-64">
                            <FlatList
                                data={getTeammates()}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => confirmGoal(item.id)} className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-700">
                                        <MaterialCommunityIcons name="shoe-cleat" size={20} color="#16a34a" />
                                        <Text className="ml-3 font-bold text-gray-800 dark:text-gray-200 text-lg">{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <TouchableOpacity onPress={() => setAssistModalVisible(false)} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Text className="text-center text-red-500 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL 3: MOEDA (DESEMPATE) */}
            <CoinTossModal
                visible={coinModalVisible}
                teamA={teamAzul}
                teamB={teamVermelho}
                onFinish={handleCoinTossFinish}
                onCancel={() => setCoinModalVisible(false)}
            />

        </SafeAreaView>
    );
}