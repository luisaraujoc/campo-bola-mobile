import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { playerService } from '@/services/playerService';
import { PlayerStats } from '@/types';
import { useTheme } from '@/context/ThemeContext';

type SortCriteria = 'goals' | 'assists' | 'wins';

export default function StatsScreen() {
    const [stats, setStats] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [criteria, setCriteria] = useState<SortCriteria>('goals');
    const { activeTheme } = useTheme();

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

    // Componente de Card de Destaque
    const HighlightCard = ({ title, player, value, icon, type }: any) => {
        // Cores adaptadas para Dark Mode
        let bgStyle, iconColor;
        switch(type) {
            case 'gold':
                bgStyle = activeTheme === 'dark' ? '#064e3b' : '#dcfce7'; // green-900 / green-100
                iconColor = activeTheme === 'dark' ? '#4ade80' : '#16a34a';
                break;
            case 'blue':
                bgStyle = activeTheme === 'dark' ? '#1e3a8a' : '#dbeafe'; // blue-900 / blue-100
                iconColor = activeTheme === 'dark' ? '#60a5fa' : '#2563eb';
                break;
            case 'yellow':
                bgStyle = activeTheme === 'dark' ? '#422006' : '#fef9c3'; // yellow-900ish / yellow-100
                iconColor = activeTheme === 'dark' ? '#facc15' : '#ca8a04';
                break;
            default:
                bgStyle = activeTheme === 'dark' ? '#374151' : '#f3f4f6';
                iconColor = '#6b7280';
        }

        return (
            <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm w-[31%] items-center">
                <View
                    className="p-2 rounded-full mb-2"
                    style={{ backgroundColor: bgStyle }}
                >
                    <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-1 text-center">{title}</Text>
                <Text className="font-bold text-gray-800 dark:text-gray-100 text-center text-sm mb-1" numberOfLines={1}>
                    {player?.player.name.split(' ')[0] || '-'}
                </Text>
                <Text className="text-xl font-black text-gray-900 dark:text-white">{value || 0}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-4 pt-4 pb-20">

                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Estatísticas</Text>
                        <Text className="text-gray-500 dark:text-gray-400">Números da temporada</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
                    ) : (
                        <>
                            {/* Destaques */}
                            <View className="flex-row justify-between mb-8">
                                <HighlightCard title="Artilheiro" player={topScorer} value={topScorer?.totalGoals} icon="soccer" type="gold" />
                                <HighlightCard title="Garçom" player={topAssistant} value={topAssistant?.totalAssists} icon="shoe-cleat" type="blue" />
                                <HighlightCard title="Vitorioso" player={topWinner} value={topWinner?.wins} icon="trophy" type="yellow" />
                            </View>

                            {/* Filtros */}
                            <View className="flex-row bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
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
                                                backgroundColor: isActive ? (activeTheme === 'dark' ? '#374151' : '#111827') : 'transparent',
                                            }}
                                        >
                                            <Text
                                                className="font-bold text-sm"
                                                style={{ color: isActive ? 'white' : (activeTheme === 'dark' ? '#9ca3af' : '#6b7280') }}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Ranking */}
                            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {sortedList.map((stat, index) => {
                                    const rank = index + 1;
                                    const isTop3 = rank <= 3;

                                    const displayValue = criteria === 'goals' ? stat.totalGoals
                                        : criteria === 'assists' ? stat.totalAssists
                                            : stat.wins;

                                    return (
                                        <View
                                            key={stat.playerId}
                                            className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            style={{
                                                backgroundColor: rank === 1 ? (activeTheme === 'dark' ? '#422006' : '#fefce8') : undefined
                                            }}
                                        >
                                            {/* Ranking # */}
                                            <View className="w-8 items-center justify-center mr-2">
                                                {rank === 1 && <MaterialCommunityIcons name="crown" size={20} color="#eab308" />}
                                                {rank === 2 && <MaterialCommunityIcons name="medal" size={20} color="#94a3b8" />}
                                                {rank === 3 && <MaterialCommunityIcons name="medal" size={20} color="#b45309" />}
                                                {rank > 3 && <Text className="font-bold text-gray-400 dark:text-gray-500 text-lg">{rank}</Text>}
                                            </View>

                                            {/* Info Jogador */}
                                            <View className="flex-1 flex-row items-center">
                                                <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3 border border-gray-200 dark:border-gray-600">
                                                    <Text className="font-bold text-gray-500 dark:text-gray-300 text-xs">
                                                        {stat.player.position?.substring(0,3).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text className="font-bold text-gray-800 dark:text-gray-100 text-base">
                                                        {stat.player.name}
                                                    </Text>
                                                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                                                        {stat.gamesPlayed} jogos
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Valor */}
                                            <View className="items-end">
                                                <Text
                                                    className="text-xl font-black"
                                                    style={{ color: isTop3 ? '#16a34a' : (activeTheme === 'dark' ? '#fff' : '#1f2937') }}
                                                >
                                                    {displayValue}
                                                </Text>
                                                <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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