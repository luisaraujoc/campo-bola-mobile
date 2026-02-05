import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMatch } from '@/context/MatchContext';

export default function GameScreen() {
    const router = useRouter();
    const { matchState, pauseMatch, resumeMatch, addGoal, finishMatch } = useMatch();

    const { teams, scoreA, scoreB, gameTime, isRunning } = matchState;
    const teamA = teams[0];
    const teamB = teams[1];

    // Formata segundos para MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        pauseMatch();
        Alert.alert(
            "Fim de Jogo!",
            `Placar Final:\n${teamA?.name}: ${scoreA}\n${teamB?.name}: ${scoreB}`,
            [
                { text: "Continuar jogando", onPress: resumeMatch, style: "cancel" },
                {
                    text: "Encerrar",
                    style: 'destructive',
                    onPress: () => {
                        finishMatch();
                        router.back();
                    }
                }
            ]
        );
    };

    if (!teamA || !teamB) return <View><Text>Carregando...</Text></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Placar Principal */}
            <View className="h-[30%] flex-row items-center justify-between px-4 pt-4">
                {/* Time A */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-2">{teamA.name}</Text>
                    <Text className="text-7xl font-bold text-green-500">{scoreA}</Text>
                </View>

                {/* Cronômetro e VS */}
                <View className="items-center justify-center w-[20%]">
                    <Text className="text-gray-400 font-bold text-xl mb-2">VS</Text>
                    <View className="bg-gray-800 px-3 py-1 rounded border border-gray-700">
                        <Text className="text-white font-mono text-lg">{formatTime(gameTime)}</Text>
                    </View>
                </View>

                {/* Time B */}
                <View className="items-center flex-1">
                    <Text className="text-white font-bold text-xl mb-2">{teamB.name}</Text>
                    <Text className="text-7xl font-bold text-blue-500">{scoreB}</Text>
                </View>
            </View>

            {/* Controles do Jogo */}
            <View className="flex-row justify-center gap-4 py-4 bg-gray-800/50">
                <TouchableOpacity
                    onPress={isRunning ? pauseMatch : resumeMatch}
                    className={`w-16 h-16 rounded-full items-center justify-center ${isRunning ? 'bg-yellow-600' : 'bg-green-600'}`}
                >
                    <MaterialCommunityIcons name={isRunning ? "pause" : "play"} size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleFinish}
                    className="w-16 h-16 rounded-full bg-red-600 items-center justify-center"
                >
                    <MaterialCommunityIcons name="whistle" size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* Área de Gol (Clique no jogador para marcar gol) */}
            <View className="flex-1 bg-gray-100 rounded-t-3xl mt-4 overflow-hidden flex-row">

                {/* Lista Time A */}
                <ScrollView className="flex-1 border-r border-gray-200 bg-green-50/50">
                    <View className="p-4 items-center"><Text className="font-bold text-green-800 mb-2">GOL DO TIME A</Text></View>
                    {teamA.players.map(player => (
                        <TouchableOpacity
                            key={player.id}
                            onPress={() => addGoal(0, player.id)}
                            className="p-3 border-b border-green-100 active:bg-green-200 flex-row items-center gap-2"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#16a34a" />
                            <View>
                                <Text className="font-bold text-gray-800">{player.name}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Lista Time B */}
                <ScrollView className="flex-1 bg-blue-50/50">
                    <View className="p-4 items-center"><Text className="font-bold text-blue-800 mb-2">GOL DO TIME B</Text></View>
                    {teamB.players.map(player => (
                        <TouchableOpacity
                            key={player.id}
                            onPress={() => addGoal(1, player.id)}
                            className="p-3 border-b border-blue-100 active:bg-blue-200 flex-row items-center gap-2"
                        >
                            <MaterialCommunityIcons name="soccer" size={20} color="#2563eb" />
                            <View>
                                <Text className="font-bold text-gray-800">{player.name}</Text>
                                <Text className="text-xs text-gray-500">{player.position}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

            </View>
        </SafeAreaView>
    );
}