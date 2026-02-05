import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Player } from '../types';

interface PlayerCardProps {
    player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
    const getSkillColor = (level: number) => {
        if (level >= 9) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (level >= 7) return 'bg-green-100 text-green-800 border-green-200';
        if (level >= 5) return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Função simples para escolher ícone baseado na posição
    const getPositionIcon = (position?: string) => {
        const p = position?.toLowerCase() || '';
        if (p.includes('goleiro')) return 'hand-back-left';
        if (p.includes('defensor') || p.includes('zagueiro')) return 'shield-outline';
        if (p.includes('atacante')) return 'soccer';
        return 'run'; // Meio-campo ou genérico
    };

    return (
        <View className="w-full bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 gap-3">
                {/* Avatar Placeholder com Ícone */}
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="account" size={24} color="#6b7280" />
                </View>

                <View>
                    <Text className="text-lg font-bold text-gray-900">
                        {player.name}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons
                            name={getPositionIcon(player.position)}
                            size={14}
                            color="#6b7280"
                        />
                        <Text className="text-sm text-gray-500 ml-1">
                            {player.nickname || player.position}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Badge de Habilidade */}
            <View className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1 ${getSkillColor(player.skillLevel)}`}>
                <MaterialCommunityIcons name="star" size={12} color="currentColor" />
                <Text className="font-bold text-xs">
                    {player.skillLevel}
                </Text>
            </View>
        </View>
    );
}