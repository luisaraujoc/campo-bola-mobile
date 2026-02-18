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
    const { teams, scoreA, scoreB, gameTime, isRunning, guestPlayersA, guestPlayersB } = matchState;

    // Modais
    const [completeModalVisible, setCompleteModalVisible] = useState(false);
    const [assistModalVisible, setAssistModalVisible] = useState(false);
    const [coinModalVisible, setCoinModalVisible] = useState(false); // Modal da Moeda

    // Estados Auxiliares
    const [selectedTeamIndex, setSelectedTeamIndex] = useState<0 | 1 | null>(null);
    const [tempScorer, setTempScorer] = useState<{player: Player, teamIndex: 0 | 1} | null>(null);

    const teamA = teams[0];
    const teamB = teams[1];

    // Lista de espera para completar time (Times 3 em diante + perdedor recente não tá aqui ainda)
    const waitingTeams = teams.slice(2);
    const availablePlayers = waitingTeams.flatMap(t => t.players);

    // Formata Tempo (mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- FUNÇÃO CENTRAL DE AVANÇAR PARTIDA ---
    // Recebe o ID do vencedor se vier do sorteio, senão undefined
    const processNextMatch = async (drawWinnerId?: string) => {
        // 1. Salva histórico
        await finishMatch();

        // 2. Roda a fila (passando o vencedor do sorteio se houver)
        const removedPlayers = nextMatch(drawWinnerId);

        // 3. Avisa se houve baixa no time vencedor
        if (removedPlayers.length > 0) {
            // Pequeno delay para não sobrepor alertas
            setTimeout(() => {
                Alert.alert("Baixa no Time!", `O(s) jogador(es) ${removedPlayers.join(', ')} voltou/voltaram para o time original.`);
            }, 500);
        }
    };

    const handleFinish = async () => {
        pauseMatch();

        const isDraw = scoreA === scoreB;

        Alert.alert(
            "Fim de Jogo!",
            `Resultado: ${teamA?.name} ${scoreA} x ${scoreB} ${teamB?.name}\n\nO que fazer agora?`,
            [
                { text: "Cancelar", style: "cancel", onPress: resumeMatch },
                {
                    text: "Próxima Partida",
                    onPress: async () => {
                        if (isDraw) {
                            // Se empatou, ABRE A MOEDA e espera o resultado
                            setCoinModalVisible(true);
                        } else {
                            // Se não empatou, segue normal
                            await processNextMatch();
                        }
                    }
                },
                {
                    text: "Sair",
                    style: 'destructive',
                    onPress: async () => {
                        await finishMatch(); // Salva mesmo saindo
                        router.back();
                    }
                }
            ]
        );
    };

    // Callback quando a moeda termina de girar
    const handleCoinTossFinish = async (winnerId: string) => {
        setCoinModalVisible(false);
        // Espera o modal fechar visualmente
        setTimeout(() => {
            processNextMatch(winnerId);
        }, 300);
    };

    // --- LÓGICA DE GOL + ASSISTÊNCIA ---
    const handleGoalClick = (teamIndex: 0 | 1, player: Player) => {
        if (maxGoalsReached) return;
        setTempScorer({ player, teamIndex });
        setAssistModalVisible(true);
    };

    const confirmGoal = (assistPlayerId?: string) => {
        if (tempScorer) {
            addGoal(tempScorer.teamIndex, tempScorer.player.id, assistPlayerId);
            setAssistModalVisible(false);
            setTempScorer(null);
        }
    };

    // --- LÓGICA DE COMPLETAR TIME ---
    const openCompleteModal = (index: 0 | 1) => {
        setSelectedTeamIndex(index);
        setCompleteModalVisible(true);
    };

    const confirmGuestPlayer = (player: Player) => {
        if (selectedTeamIndex !== null) {
            addGuestPlayer(selectedTeamIndex, player);
            setCompleteModalVisible(false);
        }
    };

    const maxGoalsReached = scoreA >= 2 || scoreB >= 2;

    // Proteção de carregamento
    if (!teamA || !teamB) return (
        <View className="flex-1 bg-gray-900 justify-center items-center">
            <Text className="text-white">Carregando partida...</Text>
        </View>
    );

    // Filtra companheiros para assistência
    const getTeammates = () => {
        if (!tempScorer) return [];
        const currentTeam = tempScorer.teamIndex === 0 ? teamA : teamB;
        const currentGuests = tempScorer.teamIndex === 0 ? guestPlayersA : guestPlayersB;
        return [...currentTeam.players, ...currentGuests].filter(p => p.id !== tempScorer.player.id);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">

            {/* PLACAR E STATUS */}
            <View className="h-[35%] flex-row items-center justify-between px-4 pt-4">
                {/* Time A */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-1 text-center" numberOfLines={1}>{teamA.name}</Text>
                    <View className="flex-row items-end">
                        <Text className="text-7xl font-bold text-green-500">{scoreA}</Text>
                        <Text className="text-sm text-gray-500 mb-4 ml-1">/2</Text>
                    </View>
                    <TouchableOpacity onPress={() => openCompleteModal(0)} className="bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                        <Text className="text-xs text-green-400 font-bold">+ Completar</Text>
                    </TouchableOpacity>
                </View>

                {/* Cronômetro Central */}
                <View className="items-center justify-center w-[25%]">
                    <Text className="text-gray-500 font-bold text-xs mb-1">TEMPO</Text>
                    <View className={`px-3 py-2 rounded border-2 ${gameTime === 0 ? 'bg-red-900 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
                        <Text className={`font-mono text-2xl font-bold ${gameTime < 60 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(gameTime)}
                        </Text>
                    </View>
                    {/* Status Text */}
                    {maxGoalsReached && <Text className="text-yellow-500 text-[10px] font-bold mt-2">GOL DE OURO!</Text>}
                    {!isRunning && gameTime === 6 * 60 && <Text className="text-green-400 text-[10px] font-bold mt-2">AGUARDANDO</Text>}
                    {!isRunning && gameTime < 6 * 60 && gameTime > 0 && <Text className="text-yellow-500 text-[10px] font-bold mt-2">PAUSADO</Text>}
                </View>

                {/* Time B */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-1 text-center" numberOfLines={1}>{teamB.name}</Text>
                    <View className="flex-row items-end">
                        <Text className="text-7xl font-bold text-blue-500">{scoreB}</Text>
                        <Text className="text-sm text-gray-500 mb-4 ml-1">/2</Text>
                    </View>
                    <TouchableOpacity onPress={() => openCompleteModal(1)} className="bg-gray-800 px-3 py-1 rounded-full mt-2 border border-gray-700">
                        <Text className="text-xs text-blue-400 font-bold">+ Completar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* CONTROLES PRINCIPAIS */}
            <View className="flex-row justify-center gap-6 py-6 bg-gray-800/30 border-y border-gray-800">
                {/* Botão Play/Pause/Iniciar */}
                {!maxGoalsReached && gameTime > 0 ? (
                    <TouchableOpacity
                        onPress={isRunning ? pauseMatch : resumeMatch}
                        className={`w-16 h-16 rounded-full items-center justify-center ${
                            isRunning
                                ? 'bg-yellow-600'
                                : gameTime === 6 * 60
                                    ? 'bg-green-500 border-4 border-green-700' // Destaque Iniciar
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

                {/* Botão Apito Final */}
                <TouchableOpacity
                    onPress={handleFinish}
                    className="w-16 h-16 rounded-full bg-red-600 items-center justify-center shadow-lg shadow-red-900/50"
                >
                    <MaterialCommunityIcons name="whistle" size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* LISTAS DE JOGADORES (GOLS) */}
            <View className="flex-1 flex-row mt-2">
                {/* Time A */}
                <ScrollView className="flex-1 bg-green-900/10 border-r border-gray-800">
                    {[...teamA.players, ...guestPlayersA].map((player, idx) => (
                        <TouchableOpacity
                            key={player.id + idx}
                            onPress={() => handleGoalClick(0, player)}
                            disabled={maxGoalsReached}
                            className="p-3 border-b border-gray-800 active:bg-green-900/30 flex-row items-center gap-3"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#22c55e" />
                            <View>
                                <Text className="font-bold text-gray-300">{player.name} {idx >= teamA.players.length && '(C)'}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Time B */}
                <ScrollView className="flex-1 bg-blue-900/10">
                    {[...teamB.players, ...guestPlayersB].map((player, idx) => (
                        <TouchableOpacity
                            key={player.id + idx}
                            onPress={() => handleGoalClick(1, player)}
                            disabled={maxGoalsReached}
                            className="p-3 border-b border-gray-800 active:bg-blue-900/30 flex-row items-center gap-3"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#3b82f6" />
                            <View>
                                <Text className="font-bold text-gray-300">{player.name} {idx >= teamB.players.length && '(C)'}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* MODAL 1: COMPLETAR TIME */}
            <Modal visible={completeModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-gray-50 p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold">Quem vai completar?</Text>
                        <TouchableOpacity onPress={() => setCompleteModalVisible(false)}>
                            <Text className="text-blue-600 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={availablePlayers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => confirmGuestPlayer(item)}
                                className="bg-white p-4 rounded-xl border border-gray-200 mb-2 flex-row items-center gap-3"
                            >
                                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                                    <Text className="font-bold text-gray-500">{item.position?.substring(0,2)}</Text>
                                </View>
                                <Text className="font-bold text-gray-800">{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text className="text-center mt-10 text-gray-400">Ninguém disponível.</Text>}
                    />
                </View>
            </Modal>

            {/* MODAL 2: ASSISTÊNCIA */}
            <Modal visible={assistModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center p-4">
                    <View className="bg-white w-full rounded-2xl overflow-hidden p-6">
                        <Text className="text-center text-gray-500 font-bold mb-1">GOL DE</Text>
                        <Text className="text-center text-3xl font-black text-gray-900 mb-6 uppercase">
                            {tempScorer?.player.name}
                        </Text>
                        <Text className="text-sm font-bold text-gray-400 mb-3">QUEM DEU O PASSE?</Text>
                        <TouchableOpacity onPress={() => confirmGoal(undefined)} className="bg-gray-100 p-4 rounded-xl mb-3 border border-gray-200">
                            <Text className="text-center font-bold text-gray-600">Jogada Individual</Text>
                        </TouchableOpacity>
                        <View className="max-h-64">
                            <FlatList
                                data={getTeammates()}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => confirmGoal(item.id)} className="flex-row items-center p-3 border-b border-gray-100">
                                        <MaterialCommunityIcons name="shoe-cleat" size={20} color="#16a34a" />
                                        <Text className="ml-3 font-bold text-gray-800 text-lg">{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <TouchableOpacity onPress={() => setAssistModalVisible(false)} className="mt-4 pt-4 border-t border-gray-100">
                            <Text className="text-center text-red-500 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL 3: MOEDA (DESEMPATE) */}
            <CoinTossModal
                visible={coinModalVisible}
                teamA={teamA}
                teamB={teamB}
                onFinish={handleCoinTossFinish}
                onCancel={() => setCoinModalVisible(false)}
            />

        </SafeAreaView>
    );
}