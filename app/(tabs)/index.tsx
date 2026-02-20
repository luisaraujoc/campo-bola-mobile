import {useState, useCallback, useEffect} from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { playerService } from "@/services/playerService";
import { Player } from "@/types";
import { PlayerCard } from "@/components/PlayerCards";
import { useMatch } from '@/context/MatchContext';
import { useTheme } from '@/context/ThemeContext'; // Importar hook do tema

export default function JogadoresScreen() {
    const router = useRouter();
    const { matchState } = useMatch();
    const { activeTheme } = useTheme(); // Para ícones condicionais se precisar
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadPlayers();
        }, [])
    );

    const loadPlayers = async () => {
        try {
            const data = await playerService.getAll();
            setPlayers(data);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // FUNDO: bg-gray-50 no claro, dark:bg-gray-900 no escuro
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
            <View className="flex-1 px-4 pt-4 relative">

                {/* Cabeçalho */}
                <View className="mb-6 flex-row justify-between items-center">
                    <View>
                        {/* TEXTO: text-gray-900 no claro, dark:text-white no escuro */}
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Campo Bola</Text>
                        <Text className="text-gray-500 dark:text-gray-400">Gerenciamento da Pelada</Text>
                    </View>

                    {/* Botão Configurações (Abre settings) */}
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                        <MaterialCommunityIcons
                            name="cog-outline"
                            size={24}
                            color={activeTheme === 'dark' ? '#fff' : '#374151'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Banner Jogo Ativo */}
                {matchState.isSessionActive && (
                    <TouchableOpacity
                        onPress={() => router.push('/game')}
                        className="bg-green-600 dark:bg-green-700 mb-6 p-4 rounded-xl shadow-lg shadow-green-900/20 flex-row items-center justify-between active:bg-green-700"
                    >
                        {/* Conteúdo do banner (texto branco fica bem em ambos) */}
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <MaterialCommunityIcons name="soccer" size={24} color="white" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">Jogo em andamento</Text>
                                <Text className="text-green-100 text-xs font-medium">
                                    {matchState.scoreAzul} x {matchState.scoreVermelho} • {Math.floor(matchState.gameTime / 60)} min restantes
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
                    </TouchableOpacity>
                )}

                {/* Lista */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text className="mt-2 text-gray-500">Escalando o time...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        // O componente PlayerCard precisa receber dark classes também (veremos abaixo)
                        renderItem={({ item }) => <PlayerCard player={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center mt-20 opacity-50">
                                <MaterialCommunityIcons name="soccer" size={48} color={activeTheme === 'dark' ? '#4b5563' : '#9ca3af'} />
                                <Text className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Nenhum jogador convocado.</Text>
                                <Text className="text-xs text-gray-400 dark:text-gray-600">Clique no + para adicionar.</Text>
                            </View>
                        )}
                    />
                )}

                {/* FAB */}
                <TouchableOpacity
                    className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 dark:bg-green-500 rounded-full items-center justify-center shadow-lg active:bg-green-700 elevation-5"
                    onPress={() => router.push('/players/new')}
                >
                    <MaterialCommunityIcons name="plus" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}