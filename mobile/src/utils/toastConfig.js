// src/utils/toastConfig.js — exact website notification style
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

function ToastBase({ text1, text2, borderColor, icon }) {
  return (
    <View style={[styles.toast, { borderLeftColor: borderColor }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        {text1 && (
          <Text style={[styles.text1, { color: borderColor }]}>{text1}</Text>
        )}
        {text2 && (
          <Text style={styles.text2} numberOfLines={2}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <ToastBase
      text1={text1}
      text2={text2}
      borderColor={COLORS.green}
      icon="✅"
    />
  ),
  error: ({ text1, text2 }) => (
    <ToastBase text1={text1} text2={text2} borderColor={COLORS.red} icon="❌" />
  ),
  info: ({ text1, text2 }) => (
    <ToastBase
      text1={text1}
      text2={text2}
      borderColor={COLORS.purplePale}
      icon="ℹ️"
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: "90%",
    backgroundColor: "#10091f",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 4,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { fontSize: 20 },
  text1: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  text2: { fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 18 },
});
