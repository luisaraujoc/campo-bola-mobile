import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

// Imports com Alias @
import { playerService } from '@/services/playerService';
import { Player } from '@/types';
import { PlayerCard} from "@/components/PlayerCards";

export default function JogadoresScreen() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    // useFocusEffect garante que a lista atualize ao voltar de outra tela (ex: Cadastro)
    useFocusEffect(
        useCallback(() => {
            loadPlayers();
        }, [])
    );

    const loadPlayers = async () => {
        try {
            // O loading só aparece na primeira carga para não piscar a tela toda hora
            if (players.length === 0) setLoading(true);

            const data = await playerService.getAll();
            setPlayers(data);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-4 pt-4 relative">

                {/* Cabeçalho */}
                <View className="mb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-3xl font-bold text-gray-900">Campo Bola</Text>
                        <Text className="text-gray-500">Gerenciamento da Pelada</Text>
                    </View>
                    <TouchableOpacity className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                        <MaterialCommunityIcons name="cog-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Lista ou Loading */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                        <Text className="mt-2 text-gray-500 text-sm">Escalando o time...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <PlayerCard player={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }} // Espaço extra para o botão flutuante
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center mt-20 opacity-50">
                                <MaterialCommunityIcons name="soccer" size={48} color="#9ca3af" />
                                <Text className="mt-2 text-gray-500 font-medium">Nenhum jogador convocado.</Text>
                                <Text className="text-xs text-gray-400">Clique no + para adicionar.</Text>
                            </View>
                        )}
                    />
                )}

                {/* Botão Flutuante (FAB) - Abre o Modal de Novo Jogador */}
                <TouchableOpacity
                    className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full items-center justify-center shadow-lg active:bg-green-700 elevation-5"
                    onPress={() => router.push('/players/new')}
                >
                    <MaterialCommunityIcons name="plus" size={30} color="white" />
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}