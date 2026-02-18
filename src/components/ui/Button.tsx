import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    children: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Button({
                           children,
                           loading = false,
                           variant = 'primary',
                           size = 'md',
                           className = '',
                           ...props
                       }: ButtonProps) {

    // Configuração de Estilos
    const baseStyles = "rounded-xl items-center justify-center flex-row";

    const variants = {
        primary: "bg-gray-900 dark:bg-green-600", // No escuro, verde fica melhor que preto
        secondary: "bg-gray-100 dark:bg-gray-700",
        danger: "bg-red-500",
    };

    const textColors = {
        primary: "text-white",
        secondary: "text-gray-900 dark:text-white",
        danger: "text-white",
    };

    const sizes = {
        sm: "py-2 px-3",
        md: "py-3 px-4",
        lg: "py-4 px-6",
    };

    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    return (
        <TouchableOpacity
            disabled={loading}
            activeOpacity={0.7}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-70' : ''}`}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' ? '#000' : '#fff'} />
            ) : (
                <Text className={`font-bold ${textColors[variant]} ${textSizes[size]}`}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}