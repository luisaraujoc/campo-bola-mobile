import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextData {
    themePreference: ThemePreference;
    setThemePreference: (theme: ThemePreference) => void;
    activeTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useNativeColorScheme();
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const [themePreference, setPreference] = useState<ThemePreference>('system');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem('theme_preference');
            if (saved) {
                setThemePreference(saved as ThemePreference);
            } else {
                setThemePreference('system');
            }
        } catch (e) {
            console.log('Erro ao carregar tema', e);
        }
    };

    const setThemePreference = async (newPref: ThemePreference) => {
        setPreference(newPref);
        await AsyncStorage.setItem('theme_preference', newPref);

        // CORREÇÃO: Passamos 'system' diretamente para o NativeWind
        // Isso destrava a escolha manual e volta a ouvir o sistema
        setColorScheme(newPref);
    };

    // Computa qual tema está visualmente ativo agora
    const activeTheme =
        themePreference === 'system'
            ? (systemColorScheme === 'dark' ? 'dark' : 'light')
            : themePreference;

    return (
        <ThemeContext.Provider value={{ themePreference, setThemePreference, activeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);