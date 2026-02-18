import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Player } from '@/types';

interface PlayerCardProps {
    player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
    // Define ícone e cor baseada na posição
    const isGoalKeeper = player.position === 'Goleiro';

    return (
        <View className="w-full bg-white dark:bg-gray-800 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center gap-4">
                {/* Avatar / Ícone */}
                <View className={`w-12 h-12 rounded-full items-center justify-center ${isGoalKeeper ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Text className={`font-bold text-lg ${isGoalKeeper ? 'text-yellow-700 dark:text-yellow-500' : 'text-gray-500 dark:text-gray-300'}`}>
                        {player.position?.substring(0, 2).toUpperCase()}
                    </Text>
                </View>

                {/* Informações */}
                <View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {player.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {player.nickname ? `"${player.nickname}" • ` : ''}{player.position}
                    </Text>
                </View>
            </View>

            {/* Nível (Badge) */}
            <View className="items-end">
                <View className={`px-2 py-1 rounded-lg ${player.skillLevel >= 8 ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Text className={`text-xs font-bold ${player.skillLevel >= 8 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        NV {player.skillLevel}
                    </Text>
                </View>
            </View>
        </View>
    );
}