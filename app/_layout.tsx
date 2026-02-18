import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MatchProvider } from "@/context/MatchContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

// Componente interno para pegar o tema e aplicar no Navigation
function AppContent() {
    const { activeTheme } = useTheme();

    return (
        <NavThemeProvider value={activeTheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="game/index"
                    options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                    name="players/new"
                    options={{
                        presentation: 'modal',
                        title: 'Novo Jogador',
                        headerShown: true,
                        // Estilização dinâmica do Header nativo
                        headerStyle: { backgroundColor: activeTheme === 'dark' ? '#1f2937' : '#f8fafc' },
                        headerTintColor: activeTheme === 'dark' ? '#fff' : '#000',
                    }}
                />
                <Stack.Screen
                    name="settings/index"
                    options={{
                        presentation: 'modal',
                        title: 'Configurações',
                        headerStyle: { backgroundColor: activeTheme === 'dark' ? '#1f2937' : '#f8fafc' },
                        headerTintColor: activeTheme === 'dark' ? '#fff' : '#000',
                    }}
                />
            </Stack>
            {/* Status Bar Inteligente */}
            <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
        </NavThemeProvider>
    );
}

export default function RootLayout() {
    // Removido o useEffect do initDatabase
    return (
        <SafeAreaViewProvider>
            <ThemeProvider>
                <MatchProvider>
                    <AppContent />
                </MatchProvider>
            </ThemeProvider>
        </SafeAreaViewProvider>
    );
}

// Pequeno helper para corrigir o nome do provider se necessário
function SafeAreaViewProvider({ children }: { children: React.ReactNode }) {
    return <SafeAreaProvider>{children}</SafeAreaProvider>;
}