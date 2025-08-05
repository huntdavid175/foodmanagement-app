import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";

const NavigationBar = ({ activeTab = "dashboard", onTabPress }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const handleTabPress = (tab) => {
    if (onTabPress) {
      onTabPress(tab);
    }
  };

  return (
    <View style={styles.navBar}>
      <View style={styles.navLeft}>
        <Ionicons name="restaurant" size={24} color="white" />
        <View>
          <Text style={styles.navTitle}>RestaurantPro</Text>
          <Text style={styles.navSubtitle}>Delivery & Takeaway Management</Text>
        </View>
      </View>

      <View style={styles.navCenter}>
        <TouchableOpacity
          style={[
            styles.navTab,
            activeTab === "dashboard" && styles.navTabActive,
          ]}
          onPress={() => handleTabPress("dashboard")}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === "dashboard" && styles.navTabTextActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navTab, activeTab === "orders" && styles.navTabActive]}
          onPress={() => handleTabPress("orders")}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === "orders" && styles.navTabTextActive,
            ]}
          >
            All Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navTab,
            activeTab === "kitchen" && styles.navTabActive,
          ]}
          onPress={() => handleTabPress("kitchen")}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === "kitchen" && styles.navTabTextActive,
            ]}
          >
            Kitchen View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navTab, activeTab === "menu" && styles.navTabActive]}
          onPress={() => handleTabPress("menu")}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === "menu" && styles.navTabTextActive,
            ]}
          >
            Menu Management
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navRight}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <Ionicons name="notifications" size={24} color="white" />
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>A</Text>
          </View>
          <Text style={styles.userName}>Admin</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: "#FF6B35",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeToggle: {
    padding: 8,
    marginRight: 10,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  navSubtitle: {
    color: "white",
    fontSize: 12,
    marginLeft: 8,
  },
  navCenter: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "center",
  },
  navTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  navTabActive: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  navTabText: {
    color: "white",
    fontSize: 14,
  },
  navTabTextActive: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "white",
    fontWeight: "bold",
  },
  userName: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
  },
});

export default NavigationBar;
