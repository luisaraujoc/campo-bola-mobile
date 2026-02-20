import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Team } from '@/types';

interface TeamListProps {
    team: Team;
}

export function TeamList({ team }: TeamListProps) {
    return (
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden shadow-sm">
            {/* Cabeçalho do Time */}
            <View className="bg-gray-50 dark:bg-gray-700/50 p-3 border-b border-gray-100 dark:border-gray-700 flex-row justify-between items-center">
                <Text className="font-bold text-gray-900 dark:text-white text-lg ml-1">
                    {team.name}
                </Text>
                <View className="bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-500">
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-300">
                        Média {team.averageLevel.toFixed(1)}
                    </Text>
                </View>
            </View>

            {/* Lista de Jogadores */}
            <View className="p-2">
                {team.players.map((player) => (
                    <View key={player.id} className="flex-row items-center p-2 mb-1">
                        <MaterialCommunityIcons
                            name="tshirt-crew-outline"
                            size={20}
                            color="#9ca3af" /* Cor neutra (gray-400) já que os times ainda não estão em campo */
                            style={{ marginRight: 12 }}
                        />
                        <View className="flex-1">
                            <Text className="font-bold text-gray-700 dark:text-gray-200 text-base">
                                {player.name}
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500">
                                {player.position}
                            </Text>
                        </View>
                        <Text className="font-bold text-gray-300 dark:text-gray-600 text-sm">
                            {player.skillLevel}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}