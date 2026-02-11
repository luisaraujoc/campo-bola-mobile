import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context"; // <--- Importe isso
import { MatchProvider } from "@/context/MatchContext";

export default function RootLayout() {
    return (
        // Envolva TUDO com o SafeAreaProvider
        <SafeAreaProvider>
            <MatchProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="game/index"
                        options={{
                            presentation: 'fullScreenModal',
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    />
                    <Stack.Screen
                        name="players/new"
                        options={{
                            presentation: 'modal',
                            title: 'Novo Jogador',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f8fafc' },
                        }}
                    />
                </Stack>
                <StatusBar style="dark" />
            </MatchProvider>
        </SafeAreaProvider>
    );
}