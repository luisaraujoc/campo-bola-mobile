import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Imports com Alias @
import { playerService } from '@/services/playerService';
import { Player, Team } from '@/types';
import { sortTeams } from '@/lib/teamSorter';
import { TeamList } from '@/components/TeamList';
import { useMatch } from '@/context/MatchContext';

export default function SortearScreen() {
    const router = useRouter();
    const { startMatch } = useMatch();

    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
    const [step, setStep] = useState<'selection' | 'result'>('selection');

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        const data = await playerService.getAll();
        setPlayers(data);
    };

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(pid => pid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === players.length) {
            setSelectedIds([]); // Desmarcar todos
        } else {
            setSelectedIds(players.map(p => p.id)); // Marcar todos
        }
    };

    const handleSort = () => {
        const selectedPlayers = players.filter(p => selectedIds.includes(p.id));

        if (selectedPlayers.length < 2) {
            Alert.alert("Ops!", "Selecione pelo menos 2 jogadores para sortear.");
            return;
        }

        const teams = sortTeams(selectedPlayers, "balanced");
        setGeneratedTeams(teams);
        setStep('result');
    };

    const reset = () => {
        setStep('selection');
        setGeneratedTeams([]);
    };

    const handleStartMatch = () => {
        if (generatedTeams.length < 2) return;
        startMatch(generatedTeams);
        router.push('/game');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-4 pt-4">

                {/* Cabeçalho */}
                <View className="mb-4 flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">
                            {step === 'selection' ? 'Quem vai jogar?' : 'Resultado'}
                        </Text>
                        <Text className="text-gray-500">
                            {step === 'selection'
                                ? `${selectedIds.length} selecionados`
                                : 'Times definidos'}
                        </Text>
                    </View>

                    {step === 'selection' ? (
                        <TouchableOpacity
                            onPress={toggleSelectAll}
                            className="px-4 py-2 bg-gray-200 rounded-lg active:bg-gray-300"
                        >
                            <Text className="text-sm font-bold text-gray-700">
                                {selectedIds.length === players.length ? 'Limpar' : 'Todos'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={reset} className="bg-gray-200 p-2 rounded-full">
                            <MaterialCommunityIcons name="refresh" size={24} color="#374151" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- MODO SELEÇÃO (Vertical e Grande) --- */}
                {step === 'selection' && (
                    <>
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                            <View className="flex-col gap-3">
                                {players.map((player) => {
                                    const isSelected = selectedIds.includes(player.id);
                                    return (
                                        <TouchableOpacity
                                            key={player.id}
                                            onPress={() => toggleSelection(player.id)}
                                            activeOpacity={0.7}
                                            className={`w-full p-4 rounded-xl border flex-row items-center justify-between ${
                                                isSelected
                                                    ? 'bg-green-50 border-green-500 shadow-sm'
                                                    : 'bg-white border-gray-200'
                                            }`}
                                        >
                                            <View className="flex-row items-center gap-4">
                                                {/* Checkbox Visual Grande */}
                                                <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                                                    isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-gray-50'
                                                }`}>
                                                    {isSelected && <MaterialCommunityIcons name="check" size={20} color="white" />}
                                                </View>

                                                <View>
                                                    <Text className={`text-lg font-bold ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>
                                                        {player.name}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500">
                                                        {player.position} • Nível {player.skillLevel}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Ícone de Posição (Opcional) */}
                                            <MaterialCommunityIcons
                                                name={player.position?.includes('Goleiro') ? 'hand-back-left' : 'soccer'}
                                                size={24}
                                                color={isSelected ? '#15803d' : '#9ca3af'}
                                                style={{ opacity: 0.5 }}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        {/* Botão Flutuante Grande */}
                        <View className="absolute bottom-4 left-4 right-4">
                            <TouchableOpacity
                                onPress={handleSort}
                                className="bg-green-600 h-16 rounded-2xl flex-row items-center justify-center shadow-xl active:bg-green-700 elevation-5"
                            >
                                <MaterialCommunityIcons name="whistle" size={28} color="white" style={{marginRight: 12}} />
                                <Text className="text-white font-bold text-xl tracking-wide">SORTEAR TIMES</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* --- MODO RESULTADO (Mantido igual) --- */}
                {step === 'result' && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        {generatedTeams.map((team) => (
                            <TeamList key={team.id} team={team} />
                        ))}

                        <View className="flex-row gap-3 mt-4 mb-8">
                            <TouchableOpacity
                                onPress={reset}
                                className="flex-1 bg-white border border-gray-200 py-4 rounded-xl items-center shadow-sm"
                            >
                                <Text className="text-gray-700 font-bold text-lg">Refazer</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleStartMatch}
                                className="flex-1 bg-green-600 py-4 rounded-xl items-center flex-row justify-center gap-2 shadow-lg active:bg-green-700"
                            >
                                <MaterialCommunityIcons name="soccer" size={24} color="white" />
                                <Text className="text-white font-bold text-lg">JOGAR</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}

            </View>
        </SafeAreaView>
    );
}