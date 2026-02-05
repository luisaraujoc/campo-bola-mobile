import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Team } from '@/types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TeamListProps {
    team: Team;
}

export function TeamList({ team }: TeamListProps) {
    // Cores dinâmicas sutis (Estilo Notion/Shadcn)
    const getTeamHeaderStyle = (identifier: string) => {
        const map: Record<string, string> = {
            'a': 'bg-green-50 border-green-100', // Time A (Verde bem claro)
            'b': 'bg-blue-50 border-blue-100',   // Time B (Azul bem claro)
            'c': 'bg-red-50 border-red-100',
            'd': 'bg-orange-50 border-orange-100',
        };
        return map[identifier.toLowerCase()] || 'bg-secondary';
    };

    const getIconColor = (identifier: string) => {
        const map: Record<string, string> = {
            'a': '#16a34a', // green-600
            'b': '#2563eb', // blue-600
            'c': '#dc2626',
            'd': '#ea580c',
        };
        return map[identifier.toLowerCase()] || '#64748b';
    };

    return (
        <Card className="mb-4 overflow-hidden">
            {/* Header do Card (Colorido sutilmente) */}
            <View className={`p-4 border-b ${getTeamHeaderStyle(team.color)} flex-row justify-between items-center`}>
                <View className="flex-row items-center gap-3">
                    <View className="p-2 bg-white rounded-full shadow-sm">
                        <MaterialCommunityIcons name="shield" size={20} color={getIconColor(team.color)} />
                    </View>
                    <View>
                        <Text className="font-bold text-lg text-foreground uppercase tracking-tight">
                            {team.name}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            {team.players.length} Jogadores
                        </Text>
                    </View>
                </View>

                <View className="items-end">
                    <Text className="text-xs text-muted-foreground font-medium uppercase">Média</Text>
                    <Text className="text-xl font-bold text-foreground">{team.averageLevel.toFixed(1)}</Text>
                </View>
            </View>

            {/* Lista de Jogadores */}
            <View className="p-2">
                {team.players.map((player, index) => (
                    <View
                        key={player.id}
                        className={`flex-row items-center p-3 ${index !== team.players.length - 1 ? 'border-b border-border' : ''}`}
                    >
                        {/* Posição (Avatar visual) */}
                        <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mr-3">
                            <Text className="font-bold text-xs text-muted-foreground">
                                {player.position?.substring(0,3).toUpperCase()}
                            </Text>
                        </View>

                        <View className="flex-1">
                            <Text className="text-foreground font-medium text-base">
                                {player.name}
                            </Text>
                            <Text className="text-muted-foreground text-xs">
                                {player.position || 'Jogador'}
                            </Text>
                        </View>

                        <Badge variant="secondary">
                            Ov {player.skillLevel}
                        </Badge>
                    </View>
                ))}
            </View>
        </Card>
    );
}