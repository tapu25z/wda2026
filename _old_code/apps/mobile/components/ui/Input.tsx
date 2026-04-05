import React, { forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

// Dùng forwardRef y hệt như bên Web
export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {/* Label */}
        {label && <Text style={styles.label}>{label}</Text>}

        {/* Ô nhập liệu */}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            error ? styles.inputError : styles.inputDefault,
            props.editable === false && styles.inputDisabled, // disabled:bg-gray-100
            style,
          ]}
          placeholderTextColor="#9ca3af" // Màu chữ mờ cho placeholder
          {...props}
        />

        {/* Thông báo lỗi */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Helper text (nếu không có lỗi) */}
        {helperText && !error ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151", // text-gray-700
    marginBottom: 6,
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  inputDefault: {
    borderColor: "#d1d5db", // border-gray-300
  },
  inputError: {
    borderColor: "#ef4444", // border-red-500
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6", // disabled:bg-gray-100
    color: "#9ca3af",
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: "#dc2626", // text-red-600
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280", // text-gray-500
  },
});
