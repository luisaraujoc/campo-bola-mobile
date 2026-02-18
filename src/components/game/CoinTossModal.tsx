import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Team } from '@/types';

interface CoinTossModalProps {
    visible: boolean;
    teamA: Team;
    teamB: Team;
    onFinish: (winnerId: string) => void;
    onCancel: () => void;
}

export function CoinTossModal({ visible, teamA, teamB, onFinish, onCancel }: CoinTossModalProps) {
    const [result, setResult] = useState<'cara' | 'coroa' | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [winner, setWinner] = useState<Team | null>(null);

    // Valor da animação de rotação (0 a 1)
    const spinValue = useRef(new Animated.Value(0)).current;

    // Resetar quando abrir
    useEffect(() => {
        if (visible) {
            setResult(null);
            setWinner(null);
            setIsFlipping(false);
            spinValue.setValue(0);
        }
    }, [visible]);

    const flipCoin = (choice: 'cara' | 'coroa') => {
        setIsFlipping(true);

        // 1. Define o resultado matematicamente (50/50)
        const random = Math.random();
        const outcome = random > 0.5 ? 'cara' : 'coroa';

        // Quem ganhou?
        // Vamos assumir que o Time A escolheu.
        // Se deu o que o Time A escolheu, A ganha. Se não, B ganha.
        const winnerTeam = outcome === choice ? teamA : teamB;

        // 2. Configura a Animação
        // Gira 10 voltas (3600 graus) + o ajuste para cair no lado certo
        // Cara = 0 graus (frente), Coroa = 180 graus (verso)
        const endValue = 10 + (outcome === 'cara' ? 0 : 0.5);

        Animated.timing(spinValue, {
            toValue: endValue,
            duration: 3000, // 3 segundos de suspense
            easing: Easing.out(Easing.bounce), // Efeito de quicar no final
            useNativeDriver: true,
        }).start(() => {
            setResult(outcome);
            setWinner(winnerTeam);
            setIsFlipping(false);
        });
    };

    // Interpolação para girar visualmente
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    // Interpolação para mudar a cor/conteúdo enquanto gira (ilusão de ótica)
    // Vamos fazer simples: Mostra sempre a moeda, o texto muda no final

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/90 justify-center items-center p-6">

                <Text className="text-white text-3xl font-bold mb-8 uppercase tracking-widest">Decisão no Sorteio</Text>

                {/* ÁREA DA MOEDA */}
                <View className="h-64 justify-center items-center mb-10">
                    <Animated.View
                        style={{
                            transform: [{ rotateY: spin }, { perspective: 1000 }],
                        }}
                        className={`w-48 h-48 rounded-full items-center justify-center border-4 shadow-2xl ${
                            !result ? 'bg-yellow-400 border-yellow-600' :
                                result === 'cara' ? 'bg-yellow-400 border-yellow-600' : 'bg-gray-300 border-gray-500'
                        }`}
                    >
                        <MaterialCommunityIcons
                            name={!result ? "help" : result === 'cara' ? "head-outline" : "star-four-points-outline"}
                            size={80}
                            color={!result ? "#ca8a04" : result === 'cara' ? "#a16207" : "#4b5563"}
                        />
                        {result && (
                            <Text className={`text-2xl font-black uppercase mt-2 ${result === 'cara' ? 'text-yellow-800' : 'text-gray-600'}`}>
                                {result}
                            </Text>
                        )}
                    </Animated.View>
                </View>

                {/* CONTROLES */}
                {!isFlipping && !winner && (
                    <View className="w-full">
                        <Text className="text-gray-400 text-center mb-4 text-lg">
                            <Text className="font-bold text-white">{teamA.name}</Text>, escolha:
                        </Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => flipCoin('cara')}
                                className="flex-1 bg-yellow-500 py-4 rounded-xl items-center border-b-4 border-yellow-700 active:border-b-0 active:mt-1"
                            >
                                <Text className="text-yellow-900 font-black text-xl">CARA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => flipCoin('coroa')}
                                className="flex-1 bg-gray-300 py-4 rounded-xl items-center border-b-4 border-gray-500 active:border-b-0 active:mt-1"
                            >
                                <Text className="text-gray-800 font-black text-xl">COROA</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* RESULTADO FINAL */}
                {winner && (
                    <View className="w-full items-center">
                        <Text className="text-gray-400 mb-2">Vencedor do Sorteio:</Text>
                        <Text className="text-green-400 text-3xl font-bold mb-8 text-center">{winner.name}</Text>

                        <TouchableOpacity
                            onPress={() => onFinish(winner.id)}
                            className="w-full bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-900/50"
                        >
                            <Text className="text-white font-bold text-lg">CONTINUAR BABA</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* BOTÃO CANCELAR (Só se não estiver girando) */}
                {!isFlipping && !winner && (
                    <TouchableOpacity onPress={onCancel} className="mt-8">
                        <Text className="text-gray-500 font-bold">Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modal>
    );
}