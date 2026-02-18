import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    className?: string;
}

export function Input({ className, ...props }: InputProps) {
    return (
        <TextInput
            className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 ${className}`}
            placeholderTextColor="#9ca3af" // gray-400 funciona bem nos dois
            {...props}
        />
    );
}