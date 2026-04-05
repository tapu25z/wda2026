import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  title: string;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading,
  title,
  disabled,
  style,
  ...props
}: ButtonProps) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isButtonDisabled && styles.disabled,
        style,
      ]}
      disabled={isButtonDisabled}
      {...props}
    >
      {/* Vòng xoay thay cho thẻ <svg> bên Web */}
      {isLoading && (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#16a34a" : "#ffffff"
          }
          style={styles.spinner}
        />
      )}
      <Text style={[styles.textBase, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Dịch các class Tailwind sang StyleSheet
const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    marginRight: 8,
  },
  // Kích thước (Sizes)
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14 },

  // Biến thể màu sắc (Variants)
  primary: { backgroundColor: "#16a34a" },
  primaryText: { color: "#ffffff", fontWeight: "600" },

  secondary: { backgroundColor: "#4b5563" },
  secondaryText: { color: "#ffffff", fontWeight: "600" },

  outline: {
    borderWidth: 2,
    borderColor: "#16a34a",
    backgroundColor: "transparent",
  },
  outlineText: { color: "#16a34a", fontWeight: "600" },

  ghost: { backgroundColor: "transparent" },
  ghostText: { color: "#4b5563", fontWeight: "600" },

  danger: { backgroundColor: "#dc2626" },
  dangerText: { color: "#ffffff", fontWeight: "600" },

  textBase: { fontSize: 16, textAlign: "center" },
});
