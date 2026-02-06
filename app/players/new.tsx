import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { playerService } from '@/services/playerService';

export default function NewPlayerScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Estados
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [position, setPosition] = useState('Meio-Campo');
    const [skillLevel, setSkillLevel] = useState(6);

    const positions = [
        { label: 'Goleiro', icon: 'hand-back-left' },
        { label: 'Defensor', icon: 'shield-outline' },
        { label: 'Meio-Campo', icon: 'run' },
        { label: 'Atacante', icon: 'soccer' },
    ];

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Faltou o nome!', 'Precisamos saber quem é o craque.');
            return;
        }

        setLoading(true);
        try {
            await playerService.create({
                name,
                nickname: nickname.trim() || undefined,
                position,
                skillLevel,
            });
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    };

    // Cores dinâmicas para o nível
    const getLevelColor = (level: number) => {
        if (level <= 4) return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
        if (level <= 7) return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' };
        return { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200' };
    };

    const levelInfo = getLevelColor(skillLevel);

    return (
        <View className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>

                    {/* BLOCO 1: DADOS PESSOAIS (Estilo Card Único) */}
                    <Text className="text-xs font-bold text-gray-500 uppercase ml-2 mb-2">Identificação</Text>
                    <View className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-200">
                        <View className="px-4 py-3 border-b border-gray-100">
                            <Text className="text-xs text-gray-400 font-bold mb-1">NOME COMPLETO</Text>
                            <Input
                                className="border-0 h-12 p-0 text-lg font-semibold bg-transparent"
                                placeholder="Ex: Edson Arantes"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        </View>
                        <View className="px-4 py-3">
                            <Text className="text-xs text-gray-400 font-bold mb-1">APELIDO (OPCIONAL)</Text>
                            <Input
                                className="border-0 h-12 p-0 text-lg bg-transparent text-gray-700"
                                placeholder="Ex: Pelé"
                                value={nickname}
                                onChangeText={setNickname}
                            />
                        </View>
                    </View>

                    {/* BLOCO 2: POSIÇÃO (Grid 2x2) */}
                    <Text className="text-xs font-bold text-gray-500 uppercase ml-2 mb-2">Posição Tática</Text>
                    <View className="flex-row flex-wrap gap-3 mb-6">
                        {positions.map((item) => {
                            const isSelected = position === item.label;
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    onPress={() => setPosition(item.label)}
                                    activeOpacity={0.7}
                                    className={`w-[48%] flex-row items-center p-3 rounded-xl border ${
                                        isSelected
                                            ? 'bg-gray-900 border-gray-900'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={20}
                                        color={isSelected ? 'white' : '#6b7280'}
                                    />
                                    <Text className={`ml-2 font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* BLOCO 3: NIVEL (Visual Limpo) */}
                    <View className="flex-row justify-between items-end ml-2 mb-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase">Habilidade (1 a 10)</Text>
                        <Text className={`font-bold ${levelInfo.text}`}>
                            Nível {skillLevel}
                        </Text>
                    </View>

                    <View className="bg-white p-4 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                        {/* Linha 1: 1-5 */}
                        <View className="flex-row justify-between mb-4">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => setSkillLevel(level)}
                                    className={`w-10 h-10 items-center justify-center rounded-full border ${
                                        skillLevel === level
                                            ? 'bg-red-500 border-red-500'
                                            : 'bg-gray-50 border-gray-100'
                                    }`}
                                >
                                    <Text className={`font-bold ${skillLevel === level ? 'text-white' : 'text-gray-400'}`}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Divisória sutil */}
                        <View className="h-[1px] bg-gray-100 w-full mb-4" />

                        {/* Linha 2: 6-10 */}
                        <View className="flex-row justify-between">
                            {[6, 7, 8, 9, 10].map((level) => {
                                const isSelected = skillLevel === level;
                                const activeColor = level >= 8 ? 'bg-green-600 border-green-600' : 'bg-yellow-500 border-yellow-500';

                                return (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setSkillLevel(level)}
                                        className={`w-10 h-10 items-center justify-center rounded-full border ${
                                            isSelected ? activeColor : 'bg-gray-50 border-gray-100'
                                        }`}
                                    >
                                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <Button
                        onPress={handleCreate}
                        loading={loading}
                        size="lg"
                        className="w-full bg-gray-900 mb-10 shadow-lg"
                    >
                        Salvar Jogador
                    </Button>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}