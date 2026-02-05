import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { playerService} from "@/services/playerService";
import { Player} from "@/types";
import { PlayerCard} from "@/components/PlayerCards";

export default function JogadoresScreen() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlayers();
    }, []);

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-4 pt-8 relative">
                <View className="mb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-3xl font-bold text-gray-900">Campo Bola</Text>
                        <Text className="text-gray-500">Gerenciamento da Pelada</Text>
                    </View>
                    <TouchableOpacity className="p-2 bg-white rounded-full border border-gray-200">
                        <MaterialCommunityIcons name="cog-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#16a34a" />
                    </View>
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <PlayerCard player={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}

                <TouchableOpacity
                    className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full items-center justify-center shadow-lg active:bg-green-700"
                    onPress={() => alert('Criar Jogador')}
                >
                    <MaterialCommunityIcons name="plus" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}