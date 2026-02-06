import { View, Text } from 'react-native';
import { Match } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MatchHistoryCardProps {
    match: Match;
}

export function MatchHistoryCard({ match }: MatchHistoryCardProps) {
    // Formata a data (Ex: 05/02 - 14:30)
    const dateFormatted = new Date(match.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const isDraw = match.scoreA === match.scoreB;
    const winnerColor = isDraw ? 'text-gray-600' : 'text-green-600';
    const loserColor = isDraw ? 'text-gray-600' : 'text-gray-400';

    return (
        <View className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden shadow-sm">
            {/* Cabeçalho com Data */}
            <View className="bg-gray-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-100">
                <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="calendar-clock" size={14} color="#9ca3af" />
                    <Text className="text-xs text-gray-500 font-medium">{dateFormatted}</Text>
                </View>
                <View className="bg-gray-200 px-2 py-0.5 rounded">
                    <Text className="text-[10px] font-bold text-gray-600 uppercase">Finalizado</Text>
                </View>
            </View>

            {/* Placar */}
            <View className="flex-row items-center justify-between p-4">
                {/* Time A */}
                <View className="flex-1 items-center">
                    <Text className="font-bold text-gray-800 text-lg mb-1" numberOfLines={1}>
                        {match.teamA.name}
                    </Text>
                    <Text className={`text-4xl font-black ${match.scoreA > match.scoreB ? winnerColor : match.scoreA < match.scoreB ? loserColor : 'text-gray-700'}`}>
                        {match.scoreA}
                    </Text>
                </View>

                <Text className="text-gray-300 font-light text-2xl mx-2">X</Text>

                {/* Time B */}
                <View className="flex-1 items-center">
                    <Text className="font-bold text-gray-800 text-lg mb-1" numberOfLines={1}>
                        {match.teamB.name}
                    </Text>
                    <Text className={`text-4xl font-black ${match.scoreB > match.scoreA ? winnerColor : match.scoreB < match.scoreA ? loserColor : 'text-gray-700'}`}>
                        {match.scoreB}
                    </Text>
                </View>
            </View>

            {/* Detalhes (Quem fez gol) - Opcional, mostra só o resumo */}
            {match.goals.length > 0 && (
                <View className="px-4 pb-3 pt-0">
                    <Text className="text-xs text-gray-400 text-center">
                        {match.goals.length} gols marcados
                    </Text>
                </View>
            )}
        </View>
    );
}