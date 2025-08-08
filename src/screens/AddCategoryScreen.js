import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

const AddCategoryScreen = ({ onBack, onSave }) => {
  const { theme } = useTheme();
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#FF6B35",
  });

  const categoryColors = [
    "#FF6B35",
    "#4CAF50",
    "#9C27B0",
    "#2196F3",
    "#FF9800",
    "#E91E63",
    "#607D8B",
    "#795548",
  ];

  const handleSaveCategory = () => {
    if (newCategory.name.trim() && newCategory.color) {
      const category = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        color: newCategory.color,
        itemCount: 0,
      };

      console.log("✅ Category saved:", category);

      if (onSave) {
        onSave(category);
      }
    } else {
      Alert.alert(
        "Error",
        "Please fill in the category name and select a color"
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Category</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveCategory}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Category Information
          </Text>

          {/* Category Name */}
          <Text style={[styles.label, { color: theme.text }]}>
            Category Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter category name"
            placeholderTextColor={theme.textSecondary}
            value={newCategory.name}
            onChangeText={(text) =>
              setNewCategory({ ...newCategory, name: text })
            }
          />

          {/* Color Selection */}
          <Text style={[styles.label, { color: theme.text }]}>Color *</Text>
          <Text style={[styles.subLabel, { color: theme.textSecondary }]}>
            Choose a color for this category
          </Text>

          <View style={styles.colorGrid}>
            {categoryColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderColor:
                      newCategory.color === color ? "#333" : "transparent",
                    borderWidth: newCategory.color === color ? 3 : 0,
                  },
                ]}
                onPress={() => setNewCategory({ ...newCategory, color })}
              >
                {newCategory.color === color && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Section */}
        {newCategory.name && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Preview
            </Text>
            <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
              <View
                style={[
                  styles.previewCategory,
                  { backgroundColor: newCategory.color + "20" },
                ]}
              >
                <View
                  style={[
                    styles.previewColorDot,
                    { backgroundColor: newCategory.color },
                  ]}
                />
                <Text
                  style={[
                    styles.previewCategoryText,
                    { color: newCategory.color },
                  ]}
                >
                  {newCategory.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.previewDescription,
                  { color: theme.textSecondary },
                ]}
              >
                This is how your category will appear in the menu management
                screen.
              </Text>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tips</Text>
          <View style={[styles.tipsCard, { backgroundColor: theme.card }]}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={16} color={theme.primary} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Choose a descriptive name that clearly identifies the type of
                food
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="color-palette" size={16} color={theme.primary} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Pick a color that matches the theme of your food items
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="list" size={16} color={theme.primary} />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                You can organize your menu items by category for better
                management
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FF6B35",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  saveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  previewCategory: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  previewColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  previewCategoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

export default AddCategoryScreen;
