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
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [apelido, setApelido] = useState('');
    const [posicao, setPosicao] = useState('Meio-Campo');
    const [nivelGeral, setNivelGeral] = useState(6);

    const positions = [
        { label: 'Goleiro', icon: 'hand-back-left' },
        { label: 'Defensor', icon: 'shield-outline' },
        { label: 'Meio-Campo', icon: 'run' },
        { label: 'Atacante', icon: 'soccer' },
    ];

    const handleCreate = async () => {
        if (!nome.trim()) {
            Alert.alert('Faltou o nome!', 'Precisamos saber quem é o craque.');
            return;
        }

        if (!telefone.trim() || telefone.length < 8) {
            Alert.alert('Faltou o telefone!', 'Adicione um número válido (mínimo 8 dígitos).');
            return;
        }

        setLoading(true);
        try {
            await playerService.create({
                nome: nome.trim(),
                telefone: telefone.trim(),
                apelido: apelido.trim() || undefined,
                posicao: posicao,
                nivelGeral: nivelGeral,
            });
            Alert.alert('Sucesso!', 'Jogador cadastrado com sucesso!');
            router.back();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Não foi possível salvar.';
            Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: number) => {
        if (level <= 4) return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
        if (level <= 7) return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' };
        return { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200' };
    };

    const levelInfo = getLevelColor(nivelGeral);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 pt-4 pb-10" showsVerticalScrollIndicator={false}>

                    {/* BLOCO 1: DADOS PESSOAIS */}
                    <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2">Identificação</Text>
                    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <Text className="text-xs text-gray-400 font-bold mb-1">NOME COMPLETO *</Text>
                            <Input
                                className="border-0 h-12 p-0 text-lg font-bold bg-transparent dark:text-white"
                                placeholder="Ex: Edson Arantes"
                                placeholderTextColor="#9ca3af"
                                value={nome}
                                onChangeText={setNome}
                            />
                        </View>

                        <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <Text className="text-xs text-gray-400 font-bold mb-1">TELEFONE (WHATSAPP) *</Text>
                            <Input
                                className="border-0 h-12 p-0 text-lg font-bold bg-transparent dark:text-white"
                                placeholder="Ex: 71999998888"
                                placeholderTextColor="#9ca3af"
                                keyboardType="phone-pad"
                                value={telefone}
                                onChangeText={setTelefone}
                            />
                        </View>

                        <View className="px-4 py-3">
                            <Text className="text-xs text-gray-400 font-bold mb-1">APELIDO</Text>
                            <Input
                                className="border-0 h-12 p-0 text-lg font-bold bg-transparent text-gray-700 dark:text-gray-300"
                                placeholder="Ex: Pelé"
                                placeholderTextColor="#9ca3af"
                                value={apelido}
                                onChangeText={setApelido}
                            />
                        </View>
                    </View>

                    {/* BLOCO 2: POSIÇÃO */}
                    <Text className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2">Posição Primária</Text>
                    <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
                        {positions.map((item) => {
                            const isSelected = posicao === item.label;
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    onPress={() => setPosicao(item.label)}
                                    activeOpacity={0.7}
                                    className={`w-[48%] flex-row items-center p-3 rounded-xl border ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={20}
                                        color={isSelected ? 'white' : '#6b7280'}
                                    />
                                    <Text className={`ml-2 font-bold ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* BLOCO 3: NIVEL */}
                    <View className="flex-row justify-between items-end ml-1 mb-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase">Habilidade (1 a 10)</Text>
                        <Text className={`font-bold ${levelInfo.text}`}>
                            Nível {nivelGeral}
                        </Text>
                    </View>

                    <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
                        <View className="flex-row justify-between mb-4">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => setNivelGeral(level)}
                                    className={`w-10 h-10 items-center justify-center rounded-full border ${
                                        nivelGeral === level
                                            ? 'bg-red-500 border-red-500'
                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                                    }`}
                                >
                                    <Text className={`font-bold ${nivelGeral === level ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="h-[1px] bg-gray-100 dark:bg-gray-700 w-full mb-4" />

                        <View className="flex-row justify-between">
                            {[6, 7, 8, 9, 10].map((level) => {
                                const isSelected = nivelGeral === level;
                                const activeColor = level >= 8 ? 'bg-green-600 border-green-600' : 'bg-yellow-500 border-yellow-500';

                                return (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setNivelGeral(level)}
                                        className={`w-10 h-10 items-center justify-center rounded-full border ${
                                            isSelected ? activeColor : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                                        }`}
                                    >
                                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
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
                        className="w-full bg-blue-600 mb-10 shadow-lg"
                    >
                        {loading ? 'Salvando...' : 'Salvar Jogador'}
                    </Button>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}