import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMatch } from '@/context/MatchContext';
import { Player } from '@/types';

export default function GameScreen() {
    const router = useRouter();
    const { matchState, pauseMatch, resumeMatch, addGoal, finishMatch, nextMatch, addGuestPlayer } = useMatch();
    const { teams, scoreA, scoreB, gameTime, isRunning, guestPlayersA, guestPlayersB } = matchState;

    // Modais
    const [completeModalVisible, setCompleteModalVisible] = useState(false);
    const [assistModalVisible, setAssistModalVisible] = useState(false);

    // Estados Auxiliares
    const [selectedTeamIndex, setSelectedTeamIndex] = useState<0 | 1 | null>(null);

    // Estado temporário para o Gol (enquanto escolhemos a assistência)
    const [tempScorer, setTempScorer] = useState<{player: Player, teamIndex: 0 | 1} | null>(null);

    const teamA = teams[0];
    const teamB = teams[1];
    const waitingTeams = teams.slice(2);

    const availablePlayers = waitingTeams.flatMap(t => t.players);

    // Formata Tempo
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinish = async () => {
        pauseMatch();
        Alert.alert(
            "Fim de Jogo!",
            `Resultado: ${teamA?.name} ${scoreA} x ${scoreB} ${teamB?.name}\n\nO que fazer agora?`,
            [
                { text: "Cancelar", style: "cancel", onPress: resumeMatch },
                {
                    text: "Próxima Partida",
                    onPress: async () => {
                        await finishMatch();
                        const removedPlayers = nextMatch();
                        if (removedPlayers.length > 0) {
                            setTimeout(() => {
                                Alert.alert("Baixa no Time!", `Jogadores removidos: ${removedPlayers.join(', ')}`);
                            }, 500);
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

    // --- LÓGICA DE GOL + ASSISTÊNCIA ---

    const handleGoalClick = (teamIndex: 0 | 1, player: Player) => {
        if (maxGoalsReached) return;

        // Salva quem fez o gol e abre o modal de assistência
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
    if (!teamA || !teamB) return <View><Text>Carregando...</Text></View>;

    // Pega os companheiros de time do artilheiro (para mostrar na lista de assistência)
    const getTeammates = () => {
        if (!tempScorer) return [];
        const currentTeam = tempScorer.teamIndex === 0 ? teamA : teamB;
        const currentGuests = tempScorer.teamIndex === 0 ? guestPlayersA : guestPlayersB;

        // Junta todo mundo e remove o artilheiro da lista
        return [...currentTeam.players, ...currentGuests].filter(p => p.id !== tempScorer.player.id);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">

            {/* Placar */}
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

                {/* Cronômetro */}
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

            {/* Controles */}
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

            {/* Listas de Jogadores */}
            <View className="flex-1 flex-row mt-2">
                {/* Time A */}
                <ScrollView className="flex-1 bg-green-900/10 border-r border-gray-800">
                    {[...teamA.players, ...guestPlayersA].map((player, idx) => (
                        <TouchableOpacity
                            key={player.id + idx}
                            onPress={() => handleGoalClick(0, player)} // Alterado aqui
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
                            onPress={() => handleGoalClick(1, player)} // Alterado aqui
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

            {/* --- MODAL DE COMPLETAR TIME --- */}
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

            {/* --- MODAL DE ASSISTÊNCIA (NOVO) --- */}
            <Modal visible={assistModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center p-4">
                    <View className="bg-white w-full rounded-2xl overflow-hidden p-6">
                        <Text className="text-center text-gray-500 font-bold mb-1">GOL DE</Text>
                        <Text className="text-center text-3xl font-black text-gray-900 mb-6 uppercase">
                            {tempScorer?.player.name}
                        </Text>

                        <Text className="text-sm font-bold text-gray-400 mb-3">QUEM DEU O PASSE?</Text>

                        {/* Opção: Sem Assistência */}
                        <TouchableOpacity
                            onPress={() => confirmGoal(undefined)}
                            className="bg-gray-100 p-4 rounded-xl mb-3 border border-gray-200"
                        >
                            <Text className="text-center font-bold text-gray-600">Jogada Individual (Sem Assistência)</Text>
                        </TouchableOpacity>

                        {/* Lista de Companheiros */}
                        <View className="max-h-64">
                            <FlatList
                                data={getTeammates()}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => confirmGoal(item.id)}
                                        className="flex-row items-center p-3 border-b border-gray-100"
                                    >
                                        <MaterialCommunityIcons name="shoe-cleat" size={20} color="#16a34a" />
                                        <Text className="ml-3 font-bold text-gray-800 text-lg">{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <TouchableOpacity onPress={() => setAssistModalVisible(false)} className="mt-4 pt-4 border-t border-gray-100">
                            <Text className="text-center text-red-500 font-bold">Cancelar Gol</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}