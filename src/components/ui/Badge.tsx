import { View, Text } from "react-native";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "outline" | "secondary" | "success";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
    const styles = {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        success: "bg-green-100 border border-green-200",
    };

    const textStyles = {
        default: "text-primary-foreground",
        secondary: "text-secondary-foreground",
        outline: "text-foreground",
        success: "text-green-800",
    };

    return (
        <View className={`px-2.5 py-0.5 rounded-full items-center justify-center ${styles[variant]}`}>
            <Text className={`text-xs font-semibold ${textStyles[variant]}`}>
                {children}
            </Text>
        </View>
    );
}