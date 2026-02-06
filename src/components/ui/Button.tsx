import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    loading?: boolean;
}

export function Button({
                           className,
                           variant = "default",
                           size = "default",
                           loading = false,
                           children,
                           disabled,
                           ...props
                       }: ButtonProps) {

    const variants = {
        default: "bg-primary active:opacity-90",
        outline: "border border-input bg-background active:bg-secondary",
        ghost: "bg-transparent active:bg-secondary",
        destructive: "bg-destructive active:opacity-90",
    };

    const textColors = {
        default: "text-primary-foreground",
        outline: "text-foreground",
        ghost: "text-foreground",
        destructive: "text-destructive-foreground",
    };

    const sizes = {
        default: "h-12 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-xl px-8",
    };

    return (
        <TouchableOpacity
            className={`flex-row items-center justify-center rounded-xl ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#000' : '#fff'} className="mr-2" />
            ) : null}

            {typeof children === 'string' ? (
                <Text className={`font-medium ${textColors[variant]}`}>
                    {children}
                </Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );
}