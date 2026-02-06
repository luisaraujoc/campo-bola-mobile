import { TextInput, TextInputProps } from "react-native";

export function Input({ className, ...props }: TextInputProps) {
    return (
        <TextInput
            className={`flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-green-500 ${className}`}
            placeholderTextColor="#94a3b8"
            {...props}
        />
    );
}