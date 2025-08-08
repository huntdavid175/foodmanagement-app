import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "orders", label: "All Orders", icon: "list" },
  { key: "kitchen", label: "Kitchen View", icon: "restaurant" },
  { key: "menu", label: "Menu Management", icon: "grid" },
];

const NavigationBar = ({ activeTab = "dashboard", onTabPress }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { width: winWidth } = Dimensions.get("window");
  const drawerWidth = Math.min(320, Math.round(winWidth * 0.7));

  const handleTabPress = (tab) => {
    if (onTabPress) onTabPress(tab);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuIconBtn}>
            <Ionicons name="menu" size={26} color="white" />
          </TouchableOpacity>
          <Ionicons name="restaurant" size={24} color="white" />
          <View>
            <Text style={styles.navTitle}>RestaurantPro</Text>
          </View>
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

      {/* Side Drawer */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawerWrap, { width: drawerWidth }]}>
            <SafeAreaView
              style={[
                styles.drawer,
                { backgroundColor: "#651FFF", borderColor: "#651FFF" },
              ]}
            >
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerTitle, { color: "#FFFFFF" }]}>
                  Navigation
                </Text>
                <TouchableOpacity onPress={closeDrawer}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {NAV_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.drawerItem,
                      activeTab === item.key && styles.drawerItemActive,
                    ]}
                    onPress={() => {
                      closeDrawer();
                      handleTabPress(item.key);
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.drawerItemText, { color: "#FFFFFF" }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>

          {/* Backdrop */}
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={closeDrawer}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: "#651FFF",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeToggle: { padding: 8, marginRight: 10 },
  menuIconBtn: { padding: 8, marginRight: 8 },
  navLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  navTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  userInfo: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: "white", fontWeight: "bold" },
  userName: { color: "white", marginLeft: 8, fontSize: 14 },

  // Drawer styles
  drawerOverlay: { flex: 1, flexDirection: "row" },
  drawerWrap: { height: "100%", backgroundColor: "transparent" },
  drawer: {
    flex: 1,
    height: "100%",
    borderRightWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  drawerTitle: { fontSize: 16, fontWeight: "bold" },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
  },
  drawerItemActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  drawerItemText: { fontSize: 14 },
});

export default NavigationBar;
