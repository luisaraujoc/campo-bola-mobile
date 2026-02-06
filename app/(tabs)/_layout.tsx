import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#16a34a",
                tabBarInactiveTintColor: "#6b7280",
                headerShown: false,
                tabBarStyle: { paddingBottom: 5, height: 60 },
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