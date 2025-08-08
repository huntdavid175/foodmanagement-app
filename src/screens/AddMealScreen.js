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

const AddMealScreen = ({ onBack, onSave }) => {
  const { theme } = useTheme();
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    category: "",
    basePrice: "",
    description: "",
    image: "",
    available: true,
    comesWith: "",
    sizeOptions: [],
    extraOptions: [],
  });
  const [newSizeOption, setNewSizeOption] = useState({ name: "", price: "" });
  const [newExtraOption, setNewExtraOption] = useState({ name: "", price: "" });

  // Sample categories - in a real app, this would come from props or context
  const categories = [
    { id: "1", name: "Main Dishes", color: "#FF6B35" },
    { id: "2", name: "Appetizers", color: "#4CAF50" },
    { id: "3", name: "Desserts", color: "#9C27B0" },
    { id: "4", name: "Beverages", color: "#2196F3" },
  ];

  const handleSaveMeal = () => {
    if (
      newMenuItem.name.trim() &&
      newMenuItem.category &&
      newMenuItem.basePrice
    ) {
      const menuItem = {
        id: Date.now().toString(),
        name: newMenuItem.name.trim(),
        category: newMenuItem.category,
        price: newMenuItem.basePrice,
        description: newMenuItem.description || "",
        image:
          newMenuItem.image ||
          "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop",
        available: newMenuItem.available,
        comesWith: newMenuItem.comesWith || "",
        sizeOptions: newMenuItem.sizeOptions || [],
        extraOptions: newMenuItem.extraOptions || [],
      };

      // In a real app, you would save this to your backend/database
      console.log("✅ Menu item saved:", menuItem);

      if (onSave) {
        onSave(menuItem);
      }
    } else {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Name, Category, and Price)"
      );
    }
  };

  const handleAddSizeOption = () => {
    if (newSizeOption.name.trim() && newSizeOption.price.trim()) {
      setNewMenuItem({
        ...newMenuItem,
        sizeOptions: [...newMenuItem.sizeOptions, { ...newSizeOption }],
      });
      setNewSizeOption({ name: "", price: "" });
    } else {
      Alert.alert("Error", "Please fill in both size name and price");
    }
  };

  const handleAddExtraOption = () => {
    if (newExtraOption.name.trim() && newExtraOption.price.trim()) {
      setNewMenuItem({
        ...newMenuItem,
        extraOptions: [...newMenuItem.extraOptions, { ...newExtraOption }],
      });
      setNewExtraOption({ name: "", price: "" });
    } else {
      Alert.alert("Error", "Please fill in both extra name and price");
    }
  };

  const removeSizeOption = (index) => {
    setNewMenuItem({
      ...newMenuItem,
      sizeOptions: newMenuItem.sizeOptions.filter((_, i) => i !== index),
    });
  };

  const removeExtraOption = (index) => {
    setNewMenuItem({
      ...newMenuItem,
      extraOptions: newMenuItem.extraOptions.filter((_, i) => i !== index),
    });
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === newMenuItem.category
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Meal</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Basic Information
          </Text>

          {/* Meal Name */}
          <Text style={[styles.label, { color: theme.text }]}>Meal Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter meal name"
            placeholderTextColor={theme.textSecondary}
            value={newMenuItem.name}
            onChangeText={(text) =>
              setNewMenuItem({ ...newMenuItem, name: text })
            }
          />

          {/* Category */}
          <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor:
                      newMenuItem.category === category.id
                        ? category.color
                        : theme.surface,
                    borderColor: category.color,
                  },
                ]}
                onPress={() =>
                  setNewMenuItem({ ...newMenuItem, category: category.id })
                }
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    {
                      color:
                        newMenuItem.category === category.id
                          ? "white"
                          : theme.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price */}
          <Text style={[styles.label, { color: theme.text }]}>
            Base Price *
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
            placeholder="₵25"
            placeholderTextColor={theme.textSecondary}
            value={newMenuItem.basePrice}
            onChangeText={(text) =>
              setNewMenuItem({ ...newMenuItem, basePrice: text })
            }
            keyboardType="numeric"
          />

          {/* Description */}
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Describe your meal..."
            placeholderTextColor={theme.textSecondary}
            value={newMenuItem.description}
            onChangeText={(text) =>
              setNewMenuItem({ ...newMenuItem, description: text })
            }
            multiline
            numberOfLines={4}
          />

          {/* Comes With */}
          <Text style={[styles.label, { color: theme.text }]}>Comes With</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="e.g., Rice, Salad, Drink"
            placeholderTextColor={theme.textSecondary}
            value={newMenuItem.comesWith}
            onChangeText={(text) =>
              setNewMenuItem({ ...newMenuItem, comesWith: text })
            }
            multiline
            numberOfLines={2}
          />

          {/* Image URL */}
          <Text style={[styles.label, { color: theme.text }]}>
            Image URL (Optional)
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
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={theme.textSecondary}
            value={newMenuItem.image}
            onChangeText={(text) =>
              setNewMenuItem({ ...newMenuItem, image: text })
            }
          />
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Availability
          </Text>

          <TouchableOpacity
            style={[
              styles.availabilityToggle,
              {
                backgroundColor: newMenuItem.available
                  ? theme.primary
                  : theme.border,
              },
            ]}
            onPress={() =>
              setNewMenuItem({
                ...newMenuItem,
                available: !newMenuItem.available,
              })
            }
          >
            <Ionicons
              name={newMenuItem.available ? "checkmark-circle" : "close-circle"}
              size={20}
              color={newMenuItem.available ? "white" : theme.text}
            />
            <Text
              style={[
                styles.availabilityText,
                { color: newMenuItem.available ? "white" : theme.text },
              ]}
            >
              {newMenuItem.available ? "Available" : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Size Options Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Size Options
          </Text>

          <View style={styles.optionInput}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                  flex: 1,
                  marginRight: 8,
                },
              ]}
              placeholder="Size name (e.g., Small, Medium, Large)"
              placeholderTextColor={theme.textSecondary}
              value={newSizeOption.name}
              onChangeText={(text) =>
                setNewSizeOption({ ...newSizeOption, name: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                  flex: 1,
                  marginRight: 8,
                },
              ]}
              placeholder="Price (e.g., ₵5)"
              placeholderTextColor={theme.textSecondary}
              value={newSizeOption.price}
              onChangeText={(text) =>
                setNewSizeOption({ ...newSizeOption, price: text })
              }
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={handleAddSizeOption}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {newMenuItem.sizeOptions.length > 0 && (
            <View style={styles.optionsList}>
              <Text
                style={[styles.optionsTitle, { color: theme.textSecondary }]}
              >
                Added Size Options:
              </Text>
              {newMenuItem.sizeOptions.map((option, index) => (
                <View key={index} style={styles.optionTag}>
                  <Text
                    style={[styles.optionText, { color: theme.textSecondary }]}
                  >
                    {option.name} - {option.price}
                  </Text>
                  <TouchableOpacity onPress={() => removeSizeOption(index)}>
                    <Ionicons
                      name="close"
                      size={16}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Extra Options Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Extra Options
          </Text>

          <View style={styles.optionInput}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                  flex: 1,
                  marginRight: 8,
                },
              ]}
              placeholder="Extra name (e.g., Extra Cheese, Extra Meat)"
              placeholderTextColor={theme.textSecondary}
              value={newExtraOption.name}
              onChangeText={(text) =>
                setNewExtraOption({ ...newExtraOption, name: text })
              }
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                  flex: 1,
                  marginRight: 8,
                },
              ]}
              placeholder="Price (e.g., ₵3)"
              placeholderTextColor={theme.textSecondary}
              value={newExtraOption.price}
              onChangeText={(text) =>
                setNewExtraOption({ ...newExtraOption, price: text })
              }
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={handleAddExtraOption}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {newMenuItem.extraOptions.length > 0 && (
            <View style={styles.optionsList}>
              <Text
                style={[styles.optionsTitle, { color: theme.textSecondary }]}
              >
                Added Extra Options:
              </Text>
              {newMenuItem.extraOptions.map((option, index) => (
                <View key={index} style={styles.optionTag}>
                  <Text
                    style={[styles.optionText, { color: theme.textSecondary }]}
                  >
                    {option.name} - {option.price}
                  </Text>
                  <TouchableOpacity onPress={() => removeExtraOption(index)}>
                    <Ionicons
                      name="close"
                      size={16}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Preview Section */}
        {newMenuItem.name && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Preview
            </Text>
            <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.previewName, { color: theme.text }]}>
                {newMenuItem.name}
              </Text>
              <Text style={[styles.previewPrice, { color: theme.primary }]}>
                {newMenuItem.basePrice}
              </Text>
              {selectedCategory && (
                <View
                  style={[
                    styles.previewCategory,
                    { backgroundColor: selectedCategory.color + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewCategoryText,
                      { color: selectedCategory.color },
                    ]}
                  >
                    {selectedCategory.name}
                  </Text>
                </View>
              )}
              {newMenuItem.description && (
                <Text
                  style={[
                    styles.previewDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {newMenuItem.description}
                </Text>
              )}
            </View>
          </View>
        )}

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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  availabilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
  },
  optionsList: {
    marginTop: 8,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  previewName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewCategory: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  previewCategoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AddMealScreen;
