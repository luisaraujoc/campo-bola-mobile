import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#16a34a",
                tabBarInactiveTintColor: "#6b7280",
                headerShown: false,
                tabBarStyle: {
                    // A altura será: 60px (nosso tamanho) + o espaço do sistema (insets.bottom)
                    height: 60 + insets.bottom,
                    // O padding também precisa considerar isso pra não colar o ícone na borda
                    paddingBottom: 5 + insets.bottom,
                    paddingTop: 5,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb', // gray-200
                    backgroundColor: '#ffffff',
                    elevation: 0, // Remove sombra padrão feia do Android
                },
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