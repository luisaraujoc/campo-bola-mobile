import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { matchService } from '@/services/matchService';
import { Match } from '@/types';
import { MatchHistoryCard } from '@/components/MatchHistoryCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MatchesScreen() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    // Recarrega sempre que entrar na tela (para pegar jogos novos que acabaram de acontecer)
    useFocusEffect(
        useCallback(() => {
            loadMatches();
        }, [])
    );

    const loadMatches = async () => {
        try {
            const data = await matchService.getAll();
            setMatches(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-4 pt-4">

                <View className="mb-6">
                    <Text className="text-3xl font-bold text-gray-900">Partidas</Text>
                    <Text className="text-gray-500">Histórico de confrontos</Text>
                </View>

                {loading ? (
                    <View className="mt-20">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <FlatList
                        data={matches}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MatchHistoryCard match={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center mt-20 opacity-50">
                                <MaterialCommunityIcons name="whistle-outline" size={64} color="#9ca3af" />
                                <Text className="mt-4 text-gray-500 font-medium text-lg">Nenhum jogo finalizado</Text>
                                <Text className="text-sm text-gray-400 text-center px-10">
                                    Vá até a aba "Sorteio", inicie uma partida e termine-a para ver o resultado aqui.
                                </Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}