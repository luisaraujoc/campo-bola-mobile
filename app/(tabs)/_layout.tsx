import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#16a34a", // Verde do seu app
                tabBarInactiveTintColor: "#6b7280",
                headerShown: false, // Vamos usar o header da própria tela se precisar
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
        </Tabs>
    );
}