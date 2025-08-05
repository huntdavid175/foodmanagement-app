import React, { createContext, useContext, useState } from "react";

// Theme configuration for light and dark modes
export const lightTheme = {
  // Primary colors
  primary: "#FF6B35",
  primaryLight: "#FF8A65",
  primaryDark: "#E55A2B",

  // Background colors
  background: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",

  // Text colors
  text: "#333333",
  textSecondary: "#666666",
  textTertiary: "#999999",

  // Status colors
  success: "#7ED321",
  warning: "#F5A623",
  error: "#FF4444",
  info: "#4A90E2",

  // Border colors
  border: "#E0E0E0",
  borderLight: "#F0F0F0",

  // Navigation
  navBackground: "#FF6B35",
  navText: "#FFFFFF",

  // Modal
  modalBackground: "#FFFFFF",
  modalOverlay: "rgba(0,0,0,0.5)",

  // Kitchen columns
  newOrders: "#4A90E2",
  preparing: "#F5A623",
  ready: "#FF6B35",
  delivered: "#7ED321",
};

export const darkTheme = {
  // Primary colors
  primary: "#FF6B35",
  primaryLight: "#FF8A65",
  primaryDark: "#E55A2B",

  // Background colors
  background: "#121212",
  surface: "#1E1E1E",
  card: "#2D2D2D",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#808080",

  // Status colors
  success: "#7ED321",
  warning: "#F5A623",
  error: "#FF4444",
  info: "#4A90E2",

  // Border colors
  border: "#404040",
  borderLight: "#2A2A2A",

  // Navigation
  navBackground: "#FF6B35",
  navText: "#FFFFFF",

  // Modal
  modalBackground: "#2D2D2D",
  modalOverlay: "rgba(0,0,0,0.7)",

  // Kitchen columns
  newOrders: "#4A90E2",
  preparing: "#F5A623",
  ready: "#FF6B35",
  delivered: "#7ED321",
};

// Theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
