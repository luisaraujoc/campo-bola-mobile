import { useState, useEffect } from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { playerService } from '@/services/playerService';
import { Player, Team } from '@/types';
import { sortTeams } from '@/lib/teamSorter';
import { TeamList } from '@/components/TeamList';
import { useMatch } from '@/context/MatchContext';
import { useTheme } from '@/context/ThemeContext';

export default function SortearScreen() {
    const router = useRouter();
    const { startMatch, finishDay, matchState } = useMatch();
    const { activeTheme } = useTheme();

    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
    const [step, setStep] = useState<'selection' | 'result'>('selection');

    useEffect(() => {
        syncPlayers();
    }, []);

    const syncPlayers = async () => {
        setLoading(true);
        try {
            const data = await playerService.getAll();
            setPlayers(data); // Preenche a lista com a galera que veio do banco!
        } catch (error) {
            alert('Erro ao conectar com o servidor! Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="text-white mt-4 font-bold">Sincronizando jogadores...</Text>
            </View>
        );
    }

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(pid => pid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === players.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(players.map(p => p.id));
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
        if (generatedTeams.length < 2) {
            Alert.alert("Ops", "Precisa de pelo menos 2 times!");
            return;
        }
        startMatch(generatedTeams);
        router.push('/game');
    };

    const handleFinishDay = () => {
        Alert.alert(
            "Finalizar o Baba?",
            "Isso vai apagar os times sorteados e o placar atual.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Finalizar Tudo",
                    style: "destructive",
                    onPress: () => {
                        finishDay();
                        reset();
                        Alert.alert("Baba Finalizado", "Tudo pronto para o próximo dia!");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
            <View className="flex-1 px-4 pt-4">

                {/* Cabeçalho */}
                <View className="mb-4 flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                            {matchState.isSessionActive ? 'Baba Rolando' : (step === 'selection' ? 'Quem vai jogar?' : 'Resultado')}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400">
                            {matchState.isSessionActive
                                ? 'Jogo em andamento'
                                : (step === 'selection' ? `${selectedIds.length} selecionados` : 'Times definidos')
                            }
                        </Text>
                    </View>

                    {matchState.isSessionActive && (
                        <TouchableOpacity onPress={handleFinishDay} className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full border border-red-200 dark:border-red-800">
                            <MaterialCommunityIcons name="flag-checkered" size={24} color="#dc2626" />
                        </TouchableOpacity>
                    )}
                </View>

                {matchState.isSessionActive ? (
                    <View className="flex-1 justify-center items-center pb-20">
                        <MaterialCommunityIcons name="soccer-field" size={80} color={activeTheme === 'dark' ? '#22c55e' : '#16a34a'} style={{ opacity: 0.8 }} />

                        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-6 text-center">
                            Já existe um baba acontecendo!
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 mb-8 px-8">
                            Você pode voltar para o placar ou finalizar o dia para sortear novos times.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/game')}
                            className="bg-green-600 dark:bg-green-700 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg active:bg-green-800"
                        >
                            <MaterialCommunityIcons name="play-circle-outline" size={32} color="white" style={{ marginRight: 10 }} />
                            <Text className="text-white font-bold text-xl">VOLTAR PRO JOGO</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleFinishDay}
                            className="mt-4 py-3"
                        >
                            <Text className="text-red-500 font-bold text-lg">Encerrar Baba</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {step === 'selection' ? (
                            <>
                                <View className="flex-row justify-end mb-2">
                                    <TouchableOpacity
                                        onPress={toggleSelectAll}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
                                    >
                                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {selectedIds.length === players.length ? 'Limpar' : 'Todos'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                                    <View className="flex-col gap-3">
                                        {players.map((player) => {
                                            const isSelected = selectedIds.includes(player.id);
                                            return (
                                                <TouchableOpacity
                                                    key={player.id}
                                                    onPress={() => toggleSelection(player.id)}
                                                    activeOpacity={0.7}
                                                    className="w-full p-4 rounded-xl border flex-row items-center justify-between"
                                                    style={{
                                                        // Precisamos usar cores condicionais no style para garantir contraste
                                                        backgroundColor: isSelected
                                                            ? (activeTheme === 'dark' ? '#064e3b' : '#f0fdf4') // green-900 vs green-50
                                                            : (activeTheme === 'dark' ? '#1f2937' : '#ffffff'), // gray-800 vs white
                                                        borderColor: isSelected
                                                            ? '#22c55e'
                                                            : (activeTheme === 'dark' ? '#374151' : '#e5e7eb'), // gray-700 vs gray-200
                                                    }}
                                                >
                                                    <View className="flex-row items-center gap-4">
                                                        <View
                                                            style={{
                                                                width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                                                                backgroundColor: isSelected ? '#22c55e' : (activeTheme === 'dark' ? '#374151' : '#f9fafb'),
                                                                borderColor: isSelected ? '#22c55e' : (activeTheme === 'dark' ? '#4b5563' : '#d1d5db')
                                                            }}
                                                        >
                                                            {isSelected && <MaterialCommunityIcons name="check" size={20} color="white" />}
                                                        </View>
                                                        <View>
                                                            <Text className="text-lg font-bold" style={{ color: isSelected ? (activeTheme === 'dark' ? '#f0fdf4' : '#14532d') : (activeTheme === 'dark' ? '#f3f4f6' : '#1f2937') }}>
                                                                {player.name}
                                                            </Text>
                                                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                                                {player.position} • Nível {player.skillLevel}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>

                                <View className="absolute bottom-4 left-4 right-4">
                                    <TouchableOpacity
                                        onPress={handleSort}
                                        className="bg-green-600 dark:bg-green-700 h-16 rounded-2xl flex-row items-center justify-center shadow-xl active:bg-green-800 elevation-5"
                                    >
                                        <MaterialCommunityIcons name="whistle" size={28} color="white" style={{marginRight: 12}} />
                                        <Text className="text-white font-bold text-xl tracking-wide">SORTEAR TIMES</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                {generatedTeams.map((team) => (
                                    <TeamList key={team.id} team={team} />
                                ))}

                                <View className="flex-row gap-3 mt-4 mb-8">
                                    <TouchableOpacity
                                        onPress={reset}
                                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-4 rounded-xl items-center shadow-sm"
                                    >
                                        <Text className="text-gray-700 dark:text-gray-200 font-bold text-lg">Refazer</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleStartMatch}
                                        className="flex-1 bg-green-600 dark:bg-green-700 py-4 rounded-xl items-center flex-row justify-center gap-2 shadow-lg active:bg-green-800"
                                    >
                                        <MaterialCommunityIcons name="soccer" size={24} color="white" />
                                        <Text className="text-white font-bold text-lg">JOGAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}