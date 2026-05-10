// app/_layout.js — Root Layout
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../src/context/AuthContext";
import { WebSocketProvider } from "../src/context/WebSocketContext";
import { toastConfig } from "../src/utils/toastConfig";
import { COLORS } from "../src/constants/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <WebSocketProvider>
            <StatusBar style="light" backgroundColor={COLORS.bg} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.bg },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="premium" />
              <Stack.Screen name="profile-edit" />
            </Stack>
            <Toast config={toastConfig} />
          </WebSocketProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
