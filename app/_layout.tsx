import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MatchProvider } from "@/context/MatchContext";

export default function RootLayout() {
    return (
        <MatchProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Rota do Jogo (Tela Cheia) */}
                <Stack.Screen
                    name="game/index"
                    options={{
                        presentation: 'fullScreenModal',
                        headerShown: false,
                        gestureEnabled: false
                    }}
                />

                {/* NOVA ROTA: Criar Jogador (Modal Padrão iOS/Android) */}
                <Stack.Screen
                    name="players/new"
                    options={{
                        presentation: 'modal', // Faz abrir de baixo pra cima
                        title: 'Novo Jogador',
                        headerShown: true, // Mostra o título e botão de fechar nativo
                        headerStyle: { backgroundColor: '#f8fafc' }, // Cor bg-slate-50
                    }}
                />
            </Stack>
            <StatusBar style="dark" />
        </MatchProvider>
    );
}