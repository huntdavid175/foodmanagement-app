import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const BOTTOM_TAB_BAR_HEIGHT = 64;

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "orders", label: "All Orders", icon: "list" },
  { key: "kitchen", label: "Kitchen", icon: "restaurant" },
  { key: "menu", label: "Menu", icon: "grid" },
];

const BottomTabBar = ({ activeTab = "dashboard", onTabPress }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => onTabPress && onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? "#FFFFFF" : "#D1C4E9"}
            />
            <Text
              style={[
                styles.label,
                activeTab === tab.key && styles.labelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#651FFF",
    // backgroundColor: "#FF6B35",
    zIndex: 1000,
    elevation: 16,
  },
  bar: {
    height: BOTTOM_TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#651FFF",
    // backgroundColor: "#FF6B35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 16,
    zIndex: 1000,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { color: "#D1C4E9", fontSize: 12, marginTop: 6 },
  labelActive: { color: "#FFFFFF", fontWeight: "600" },
});

export default BottomTabBar;
