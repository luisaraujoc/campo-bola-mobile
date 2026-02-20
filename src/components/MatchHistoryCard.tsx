import { View, Text } from 'react-native';
import { Match } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MatchHistoryCardProps {
    match: Match;
}

export function MatchHistoryCard({ match }: MatchHistoryCardProps) {
    const dateFormatted = new Date(match.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const isDraw = match.scoreAzul === match.scoreVermelho;
    // Cores adaptadas para dark mode
    const winnerColor = isDraw ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400';
    const loserColor = isDraw ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600';

    return (
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden shadow-sm">
            {/* Cabeçalho */}
            <View className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="calendar-clock" size={14} color="#9ca3af" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">{dateFormatted}</Text>
                </View>
                <View className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                    <Text className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">Finalizado</Text>
                </View>
            </View>

            {/* Placar */}
            <View className="flex-row items-center justify-between p-4">
                {/* Time A */}
                <View className="flex-1 items-center">
                    <Text className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1 text-center" numberOfLines={1}>
                        {match.teamAzul.name}
                    </Text>
                    <Text className={`text-4xl font-black ${match.scoreAzul > match.scoreVermelho ? winnerColor : match.scoreAzul < match.scoreVermelho ? loserColor : 'text-gray-700 dark:text-gray-300'}`}>
                        {match.scoreAzul}
                    </Text>
                </View>

                <Text className="text-gray-300 dark:text-gray-600 font-light text-2xl mx-2">X</Text>

                {/* Time B */}
                <View className="flex-1 items-center">
                    <Text className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1 text-center" numberOfLines={1}>
                        {match.teamVermelho.name}
                    </Text>
                    <Text className={`text-4xl font-black ${match.scoreVermelho > match.scoreAzul ? winnerColor : match.scoreVermelho < match.scoreAzul ? loserColor : 'text-gray-700 dark:text-gray-300'}`}>
                        {match.scoreVermelho}
                    </Text>
                </View>
            </View>

            {/* Resumo de Gols */}
            {match.goals.length > 0 && (
                <View className="px-4 pb-3 pt-0">
                    <Text className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        {match.goals.length} gols marcados
                    </Text>
                </View>
            )}
        </View>
    );
}