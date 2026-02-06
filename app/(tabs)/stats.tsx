import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { playerService } from '@/services/playerService';
import { PlayerStats } from '@/types';

type SortCriteria = 'goals' | 'assists' | 'wins';

export default function StatsScreen() {
    const [stats, setStats] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [criteria, setCriteria] = useState<SortCriteria>('goals');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await playerService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Ordenação e Destaques
    const { sortedList, topScorer, topAssistant, topWinner } = useMemo(() => {
        const sorted = [...stats].sort((a, b) => {
            if (criteria === 'goals') return b.totalGoals - a.totalGoals;
            if (criteria === 'assists') return b.totalAssists - a.totalAssists;
            return b.wins - a.wins;
        });

        const byGoals = [...stats].sort((a, b) => b.totalGoals - a.totalGoals)[0];
        const byAssists = [...stats].sort((a, b) => b.totalAssists - a.totalAssists)[0];
        const byWins = [...stats].sort((a, b) => b.wins - a.wins)[0];

        return {
            sortedList: sorted,
            topScorer: byGoals,
            topAssistant: byAssists,
            topWinner: byWins
        };
    }, [stats, criteria]);

    // Componente de Card de Destaque (Refatorado para não usar classe dinâmica)
    const HighlightCard = ({ title, player, value, icon, type }: any) => {
        // Definindo cores explicitamente para evitar crash
        let bgStyle, iconColor;
        switch(type) {
            case 'gold': bgStyle = '#dcfce7'; iconColor = '#16a34a'; break; // Green
            case 'blue': bgStyle = '#dbeafe'; iconColor = '#2563eb'; break; // Blue
            case 'yellow': bgStyle = '#fef9c3'; iconColor = '#ca8a04'; break; // Yellow
            default: bgStyle = '#f3f4f6'; iconColor = '#6b7280';
        }

        return (
            <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-[31%] items-center">
                <View
                    className="p-2 rounded-full mb-2"
                    style={{ backgroundColor: bgStyle }}
                >
                    <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
                </View>
                <Text className="text-xs text-gray-400 font-bold uppercase mb-1 text-center">{title}</Text>
                <Text className="font-bold text-gray-800 text-center text-sm mb-1" numberOfLines={1}>
                    {player?.player.name.split(' ')[0] || '-'}
                </Text>
                <Text className="text-xl font-black text-gray-900">{value || 0}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-4 pt-4 pb-20">

                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-gray-900">Estatísticas</Text>
                        <Text className="text-gray-500">Números da temporada</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
                    ) : (
                        <>
                            {/* Destaques (Highlights) */}
                            <View className="flex-row justify-between mb-8">
                                <HighlightCard
                                    title="Artilheiro"
                                    player={topScorer}
                                    value={topScorer?.totalGoals}
                                    icon="soccer"
                                    type="gold"
                                />
                                <HighlightCard
                                    title="Garçom"
                                    player={topAssistant}
                                    value={topAssistant?.totalAssists}
                                    icon="shoe-cleat"
                                    type="blue"
                                />
                                <HighlightCard
                                    title="Vitorioso"
                                    player={topWinner}
                                    value={topWinner?.wins}
                                    icon="trophy"
                                    type="yellow"
                                />
                            </View>

                            {/* Filtros - Com Style Inline */}
                            <View className="flex-row bg-white p-1 rounded-xl border border-gray-200 mb-6">
                                {[
                                    { key: 'goals', label: 'Gols' },
                                    { key: 'assists', label: 'Assists' },
                                    { key: 'wins', label: 'Vitórias' }
                                ].map((item) => {
                                    const isActive = criteria === item.key;
                                    return (
                                        <TouchableOpacity
                                            key={item.key}
                                            onPress={() => setCriteria(item.key as SortCriteria)}
                                            className="flex-1 py-2 rounded-lg items-center"
                                            style={{
                                                backgroundColor: isActive ? '#111827' : 'transparent', // gray-900
                                            }}
                                        >
                                            <Text
                                                className="font-bold text-sm"
                                                style={{ color: isActive ? 'white' : '#6b7280' }}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Lista de Ranking */}
                            <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                {sortedList.map((stat, index) => {
                                    const rank = index + 1;
                                    const isTop3 = rank <= 3;

                                    const displayValue = criteria === 'goals' ? stat.totalGoals
                                        : criteria === 'assists' ? stat.totalAssists
                                            : stat.wins;

                                    return (
                                        <View
                                            key={stat.playerId}
                                            className="flex-row items-center p-4 border-b border-gray-100 last:border-0"
                                            style={{
                                                backgroundColor: rank === 1 ? '#fefce8' : 'white' // yellow-50
                                            }}
                                        >
                                            {/* Ranking # */}
                                            <View className="w-8 items-center justify-center mr-2">
                                                {rank === 1 && <MaterialCommunityIcons name="crown" size={20} color="#eab308" />}
                                                {rank === 2 && <MaterialCommunityIcons name="medal" size={20} color="#94a3b8" />}
                                                {rank === 3 && <MaterialCommunityIcons name="medal" size={20} color="#b45309" />}
                                                {rank > 3 && <Text className="font-bold text-gray-400 text-lg">{rank}</Text>}
                                            </View>

                                            {/* Info Jogador */}
                                            <View className="flex-1 flex-row items-center">
                                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 border border-gray-200">
                                                    <Text className="font-bold text-gray-500 text-xs">
                                                        {stat.player.position?.substring(0,3).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text className="font-bold text-gray-800 text-base">
                                                        {stat.player.name}
                                                    </Text>
                                                    <Text className="text-xs text-gray-400">
                                                        {stat.gamesPlayed} jogos
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Valor Numérico */}
                                            <View className="items-end">
                                                <Text
                                                    className="text-xl font-black"
                                                    style={{ color: isTop3 ? '#16a34a' : '#1f2937' }}
                                                >
                                                    {displayValue}
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {criteria === 'goals' ? 'GOLS' : criteria === 'assists' ? 'AST' : 'VIT'}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}