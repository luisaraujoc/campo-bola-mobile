import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
    const { themePreference, setThemePreference } = useTheme();

    const options = [
        { key: 'system', label: 'Padrão do Sistema', icon: 'cellphone' },
        { key: 'light', label: 'Modo Claro', icon: 'white-balance-sunny' },
        { key: 'dark', label: 'Modo Escuro', icon: 'weather-night' },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView className="p-4">
                <Text className="text-sm font-bold text-gray-500 mb-2 uppercase ml-2">Aparência</Text>

                <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {options.map((opt, index) => (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => setThemePreference(opt.key as any)}
                            className={`flex-row items-center p-4 ${index !== options.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${themePreference === opt.key ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <MaterialCommunityIcons
                                    name={opt.icon as any}
                                    size={18}
                                    color={themePreference === opt.key ? '#16a34a' : '#9ca3af'}
                                />
                            </View>

                            <Text className="flex-1 text-base font-medium text-gray-900 dark:text-gray-100">
                                {opt.label}
                            </Text>

                            {themePreference === opt.key && (
                                <MaterialCommunityIcons name="check" size={20} color="#16a34a" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-center text-gray-400 text-xs mt-10">
                    Campo Bola v1.0 • Feito com ⚽ e ☕
                </Text>
            </ScrollView>
        </View>
    );
}