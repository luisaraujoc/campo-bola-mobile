import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { activeTheme } = useTheme();

    const isDark = activeTheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                // Cores dos Ícones e Textos
                tabBarActiveTintColor: isDark ? "#4ade80" : "#16a34a",
                tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280",

                headerShown: false,

                tabBarStyle: {
                    // CORREÇÃO: Usar insets.bottom real para calcular a altura
                    // Altura = Tamanho da Barra (60) + Área de Gestos (insets.bottom)
                    height: 60 + insets.bottom,

                    // Padding para empurrar os ícones para cima da barra de gestos
                    paddingBottom: 5 + insets.bottom,
                    paddingTop: 5,

                    borderTopWidth: 1,
                    elevation: 0,

                    // --- Cores do Tema ---
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderTopColor: isDark ? '#374151' : '#e5e7eb',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Jogadores",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sortear"
                options={{
                    title: "Sorteio",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="soccer" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="matches"
                options={{
                    title: "Partidas",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="notebook" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Estatísticas",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="podium" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}