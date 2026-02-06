import { Text, TextProps } from "react-native";

export function Label({ className, ...props }: TextProps) {
    return (
        <Text
            className={`text-sm font-medium leading-none text-foreground mb-2 ${className}`}
            {...props}
        />
    );
}