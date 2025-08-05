import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import DashboardScreen from "./src/screens/DashboardScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import KitchenScreen from "./src/screens/KitchenScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { ThemeProvider } from "./src/utils/theme";

export default function App() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporarily bypass authentication for testing
    setUser({ uid: "test-user" });
    setLoading(false);
  }, []);

  const handleTabPress = (tab) => {
    setActiveScreen(tab);
  };

  const handleLoginSuccess = () => {
    // User will be automatically set by the auth state listener
  };

  const renderScreen = () => {
    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Error: {error}</Text>
        </View>
      );
    }

    // Temporarily bypass login for testing
    // if (!user) {
    //   return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    // }

    try {
      switch (activeScreen) {
        case "orders":
          return (
            <OrdersScreen
              activeTab={activeScreen}
              onTabPress={handleTabPress}
            />
          );
        case "kitchen":
          return (
            <KitchenScreen
              activeTab={activeScreen}
              onTabPress={handleTabPress}
            />
          );
        case "menu":
          // TODO: Create MenuScreen
          return (
            <DashboardScreen
              activeTab={activeScreen}
              onTabPress={handleTabPress}
            />
          );
        default:
          return (
            <DashboardScreen
              activeTab={activeScreen}
              onTabPress={handleTabPress}
            />
          );
      }
    } catch (err) {
      setError(err.message);
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Error loading screen: {err.message}</Text>
        </View>
      );
    }
  };

  return (
    <ThemeProvider>
      <StatusBar style="light" backgroundColor="#FF6B35" />
      {renderScreen()}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});
