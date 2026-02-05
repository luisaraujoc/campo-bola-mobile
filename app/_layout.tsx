import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MatchProvider } from "@/context/MatchContext"; // Import novo

export default function RootLayout() {
    return (
        <MatchProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                {/* Adicionamos uma rota Modal para a tela de jogo ficar "por cima" */}
                <Stack.Screen
                    name="game/index"
                    options={{
                        presentation: 'fullScreenModal',
                        headerShown: false,
                        gestureEnabled: false // Impede fechar arrastando pra baixo sem querer
                    }}
                />
            </Stack>
            <StatusBar style="dark" />
        </MatchProvider>
    );
}