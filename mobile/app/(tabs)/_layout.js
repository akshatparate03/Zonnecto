// app/(tabs)/_layout.js — Bottom Tab Navigator (exact website style)
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { COLORS, RADIUS } from "../../src/constants/theme";

function TabIcon({ name, focused }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={23}
        color={focused ? COLORS.purplePale : COLORS.textMuted}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarActiveTintColor: COLORS.purplePale,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="flash" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor:
      Platform.OS === "ios" ? "transparent" : "rgba(7,7,16,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139,92,246,0.14)",
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
