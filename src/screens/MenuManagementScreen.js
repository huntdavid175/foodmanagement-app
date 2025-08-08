import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Dimensions,
  RefreshControl,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import NavigationBar from "../components/NavigationBar";
import AddMealScreen from "./AddMealScreen";
import AddCategoryScreen from "./AddCategoryScreen";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

const MenuManagementScreen = ({ activeTab = "menu", onTabPress }) => {
  const { theme, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([
    { id: "1", name: "Main Dishes", color: "#FF6B35", itemCount: 5 },
    { id: "2", name: "Appetizers", color: "#4CAF50", itemCount: 3 },
    { id: "3", name: "Desserts", color: "#9C27B0", itemCount: 2 },
    { id: "4", name: "Beverages", color: "#2196F3", itemCount: 4 },
  ]);

  // Menu items state
  const [menuItems, setMenuItems] = useState([
    {
      id: "1",
      name: "Jollof Rice",
      category: "1",
      price: "₵25",
      description: "Spicy rice cooked with tomatoes and spices",
      image:
        "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Rice, Salad, Drink",
      sizeOptions: [
        { name: "Small", price: "₵20" },
        { name: "Medium", price: "₵25" },
        { name: "Large", price: "₵30" },
      ],
      extraOptions: [
        { name: "Extra Meat", price: "₵5" },
        { name: "Extra Sauce", price: "₵2" },
      ],
    },
    {
      id: "2",
      name: "Fufu with Palm Nut Soup",
      category: "1",
      price: "₵30",
      description: "Traditional Ghanaian dish with rich palm nut soup",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Fufu, Soup, Meat",
      sizeOptions: [
        { name: "Regular", price: "₵30" },
        { name: "Large", price: "₵35" },
      ],
      extraOptions: [
        { name: "Extra Meat", price: "₵5" },
        { name: "Extra Fish", price: "₵3" },
      ],
    },
    {
      id: "3",
      name: "Banku with Tilapia",
      category: "1",
      price: "₵35",
      description: "Fermented corn and cassava dough with grilled fish",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Banku, Fish, Sauce",
      sizeOptions: [
        { name: "Regular", price: "₵35" },
        { name: "Large", price: "₵40" },
      ],
      extraOptions: [
        { name: "Extra Fish", price: "₵5" },
        { name: "Extra Sauce", price: "₵2" },
      ],
    },
    {
      id: "4",
      name: "Grilled Chicken Wings",
      category: "2",
      price: "₵15",
      description: "Crispy grilled chicken wings with special seasoning",
      image:
        "https://images.unsplash.com/photo-1567620832904-9d64bcd682f2?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Wings, Sauce, Fries",
      sizeOptions: [
        { name: "6 Pieces", price: "₵15" },
        { name: "12 Pieces", price: "₵25" },
      ],
      extraOptions: [
        { name: "Extra Sauce", price: "₵2" },
        { name: "Extra Fries", price: "₵3" },
      ],
    },
    {
      id: "5",
      name: "Chocolate Cake",
      category: "3",
      price: "₵12",
      description: "Rich chocolate cake with creamy frosting",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Cake, Frosting, Decoration",
      sizeOptions: [
        { name: "Slice", price: "₵12" },
        { name: "Whole Cake", price: "₵45" },
      ],
      extraOptions: [
        { name: "Extra Frosting", price: "₵2" },
        { name: "Nuts", price: "₵1" },
      ],
    },
    {
      id: "6",
      name: "Fresh Fruit Juice",
      category: "4",
      price: "₵8",
      description: "Freshly squeezed fruit juice with no added sugar",
      image:
        "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
      available: true,
      comesWith: "Juice, Ice, Straw",
      sizeOptions: [
        { name: "Small", price: "₵8" },
        { name: "Large", price: "₵12" },
      ],
      extraOptions: [
        { name: "Extra Ice", price: "₵1" },
        { name: "Mint", price: "₵1" },
      ],
    },
  ]);

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [showAddMealScreen, setShowAddMealScreen] = useState(false);
  const [showAddCategoryScreen, setShowAddCategoryScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // Form states
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#FF6B35",
  });
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("🔄 Menu Management refreshed successfully");
      // In a real app, you would reload data from your backend here
    } catch (error) {
      console.error("Error refreshing menu management:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim() && newCategory.color) {
      const category = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        color: newCategory.color,
        itemCount: 0,
      };
      setCategories([...categories, category]);
      setNewCategory({ name: "", color: "#FF6B35" });
      setShowAddCategoryModal(false);
      console.log("✅ Category added:", category);
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const handleAddMenuItem = () => {
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
      setMenuItems([...menuItems, menuItem]);

      // Update category item count
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === newMenuItem.category
            ? { ...cat, itemCount: cat.itemCount + 1 }
            : cat
        )
      );

      setNewMenuItem({
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
      setNewSizeOption({ name: "", price: "" });
      setNewExtraOption({ name: "", price: "" });
      setShowAddMenuItemModal(false);
      console.log("✅ Menu item added:", menuItem);
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const handleEditMenuItem = () => {
    if (
      editingMenuItem &&
      editingMenuItem.name.trim() &&
      editingMenuItem.category &&
      editingMenuItem.basePrice
    ) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingMenuItem.id ? editingMenuItem : item
        )
      );
      setShowEditMenuItemModal(false);
      setEditingMenuItem(null);
      console.log("✅ Menu item updated:", editingMenuItem);
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const handleDeleteMenuItem = (itemId) => {
    Alert.alert(
      "Delete Menu Item",
      "Are you sure you want to delete this menu item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const itemToDelete = menuItems.find((item) => item.id === itemId);
            setMenuItems((prev) => prev.filter((item) => item.id !== itemId));

            // Update category item count
            if (itemToDelete) {
              setCategories((prev) =>
                prev.map((cat) =>
                  cat.id === itemToDelete.category
                    ? { ...cat, itemCount: Math.max(0, cat.itemCount - 1) }
                    : cat
                )
              );
            }
            console.log("🗑️ Menu item deleted:", itemId);
          },
        },
      ]
    );
  };

  const handleToggleAvailability = (itemId) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const openEditModal = (item) => {
    setEditingMenuItem({ ...item });
    setShowEditMenuItemModal(true);
  };

  const getFilteredMenuItems = () => {
    if (selectedCategory === "all") {
      return menuItems;
    }
    return menuItems.filter((item) => item.category === selectedCategory);
  };

  const CategoryCard = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: isSelected ? category.color : theme.surface,
          borderColor: category.color,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.categoryName,
          {
            color: isSelected ? "white" : theme.text,
          },
        ]}
      >
        {category.name}
      </Text>
      <Text
        style={[
          styles.categoryCount,
          {
            color: isSelected ? "rgba(255,255,255,0.8)" : theme.textSecondary,
          },
        ]}
      >
        {category.itemCount} items
      </Text>
    </TouchableOpacity>
  );

  const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
    const category = categories.find((cat) => cat.id === item.category);

    return (
      <View
        style={[
          styles.menuItemCard,
          {
            backgroundColor: isDarkMode ? theme.surface : theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.menuItemHeader}>
          <View style={styles.menuItemInfo}>
            <Text
              style={[styles.menuItemName, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.menuItemPrice, { color: theme.primary }]}>
              {item.price}
            </Text>
          </View>
          <View style={styles.menuItemActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: item.available ? "#4CAF50" : "#F44336" },
              ]}
              onPress={() => onToggleAvailability(item.id)}
            >
              <Ionicons
                name={item.available ? "checkmark-circle" : "close-circle"}
                size={14}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create" size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#F44336" }]}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {item.image && (
          <Image source={{ uri: item.image }} style={styles.menuItemImage} />
        )}

        <Text
          style={[styles.menuItemDescription, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {category && (
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: category.color + "20" },
            ]}
          >
            <Text
              style={[styles.categoryTagText, { color: category.color }]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </View>
        )}

        {item.sizeOptions && item.sizeOptions.length > 0 && (
          <View style={styles.optionsContainer}>
            <Text style={[styles.optionsTitle, { color: theme.textSecondary }]}>
              Sizes:
            </Text>
            <View style={styles.optionsList}>
              {item.sizeOptions.slice(0, 2).map((option, index) => (
                <View
                  key={index}
                  style={[
                    styles.optionTag,
                    {
                      backgroundColor: isDarkMode ? theme.border : "#F0F0F0",
                    },
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {option.name} - {option.price}
                  </Text>
                </View>
              ))}
              {item.sizeOptions.length > 2 && (
                <Text
                  style={[
                    styles.moreOptionsText,
                    { color: theme.textSecondary },
                  ]}
                >
                  +{item.sizeOptions.length - 2} more
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showAddMealScreen ? (
        <AddMealScreen
          onBack={() => setShowAddMealScreen(false)}
          onSave={(mealData) => {
            console.log("✅ Meal saved:", mealData);
            setMenuItems([...menuItems, mealData]);
            setShowAddMealScreen(false);
          }}
        />
      ) : showAddCategoryScreen ? (
        <AddCategoryScreen
          onBack={() => setShowAddCategoryScreen(false)}
          onSave={(categoryData) => {
            console.log("✅ Category saved:", categoryData);
            setCategories([...categories, categoryData]);
            setShowAddCategoryScreen(false);
          }}
        />
      ) : (
        <>
          <NavigationBar activeTab={activeTab} onTabPress={onTabPress} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu Management</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                ]}
                onPress={() => {
                  console.log("🔍 Opening Add Category Screen");
                  setShowAddCategoryScreen(true);
                }}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.headerButtonText}>Add Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                ]}
                onPress={() => {
                  console.log("🔍 Opening Add Meal Screen");
                  setShowAddMealScreen(true);
                }}
              >
                <Ionicons name="restaurant" size={20} color="white" />
                <Text style={styles.headerButtonText}>Add Menu Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 100,
              right: 20,
              backgroundColor: "red",
              padding: 10,
              borderRadius: 5,
              zIndex: 1000,
            }}
            onPress={() => {
              console.log("🧪 Test button pressed!");
              setShowAddCategoryModal(true);
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              TEST MODAL
            </Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          >
            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Categories ({categories.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
              >
                <CategoryCard
                  category={{
                    id: "all",
                    name: "All Items",
                    color: "#666",
                    itemCount: menuItems.length,
                  }}
                  isSelected={selectedCategory === "all"}
                  onPress={() => setSelectedCategory("all")}
                />
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    onPress={() => setSelectedCategory(category.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Menu Items Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Menu Items ({getFilteredMenuItems().length})
              </Text>
              {getFilteredMenuItems().length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="restaurant"
                    size={48}
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No menu items found
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Add your first menu item to get started
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={getFilteredMenuItems()}
                  keyExtractor={(item) => item.id}
                  numColumns={isTablet ? 3 : 2}
                  renderItem={({ item, index }) => (
                    <View
                      style={[
                        styles.menuItemContainer,
                        {
                          width: isTablet ? `${100 / 3}%` : `${100 / 2}%`,
                          paddingHorizontal: 4,
                        },
                      ]}
                    >
                      <MenuItemCard
                        item={item}
                        onEdit={openEditModal}
                        onDelete={handleDeleteMenuItem}
                        onToggleAvailability={handleToggleAvailability}
                      />
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.menuItemsGrid}
                />
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCategoryModal(false)}
        onShow={() => console.log("🔍 Add Category Modal shown")}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#333" }]}>
                Add New Category
              </Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Category Name"
                placeholderTextColor="#999"
                value={newCategory.name}
                onChangeText={(text) => {
                  console.log("📝 Category name changed:", text);
                  setNewCategory({ ...newCategory, name: text });
                }}
              />

              <Text style={[styles.label, { color: "#333" }]}>Color:</Text>
              <View style={styles.colorPicker}>
                {categoryColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderColor:
                          newCategory.color === color ? "#333" : "transparent",
                      },
                    ]}
                    onPress={() => {
                      console.log("🎨 Color selected:", color);
                      setNewCategory({ ...newCategory, color });
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E0E0E0" }]}
                onPress={() => setShowAddCategoryModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#333" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF6B35" }]}
                onPress={handleAddCategory}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Menu Item Modal */}
      <Modal
        visible={showAddMenuItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMenuItemModal(false)}
        onShow={() => console.log("🔍 Add Menu Item Modal shown")}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#333" }]}>
                Add New Menu Item
              </Text>
              <TouchableOpacity onPress={() => setShowAddMenuItemModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Item Name */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Item Name"
                placeholderTextColor="#999"
                value={newMenuItem.name}
                onChangeText={(text) => {
                  console.log("📝 Menu item name changed:", text);
                  setNewMenuItem({ ...newMenuItem, name: text });
                }}
              />

              {/* Category */}
              <Text style={[styles.label, { color: "#333" }]}>Category:</Text>
              <View style={styles.categoryPicker}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor:
                          newMenuItem.category === category.id
                            ? category.color
                            : "white",
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
                              : "#333",
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Base Price */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Base Price (e.g., ₵25)"
                placeholderTextColor="#999"
                value={newMenuItem.basePrice}
                onChangeText={(text) =>
                  setNewMenuItem({ ...newMenuItem, basePrice: text })
                }
                keyboardType="numeric"
              />

              {/* Description */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Description"
                placeholderTextColor="#999"
                value={newMenuItem.description}
                onChangeText={(text) =>
                  setNewMenuItem({ ...newMenuItem, description: text })
                }
                multiline
                numberOfLines={3}
              />

              {/* Comes With */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Comes With (e.g., Rice, Salad, Drink)"
                placeholderTextColor="#999"
                value={newMenuItem.comesWith}
                onChangeText={(text) =>
                  setNewMenuItem({ ...newMenuItem, comesWith: text })
                }
                multiline
                numberOfLines={2}
              />

              {/* Image URL */}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "white",
                    color: "#333",
                    borderColor: "#E0E0E0",
                  },
                ]}
                placeholder="Image URL (optional)"
                placeholderTextColor="#999"
                value={newMenuItem.image}
                onChangeText={(text) =>
                  setNewMenuItem({ ...newMenuItem, image: text })
                }
              />

              {/* Availability Toggle */}
              <View style={styles.availabilityContainer}>
                <Text style={[styles.label, { color: "#333" }]}>
                  Availability:
                </Text>
                <TouchableOpacity
                  style={[
                    styles.availabilityToggle,
                    {
                      backgroundColor: newMenuItem.available
                        ? "#FF6B35"
                        : "#E0E0E0",
                    },
                  ]}
                  onPress={() =>
                    setNewMenuItem({
                      ...newMenuItem,
                      available: !newMenuItem.available,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      { color: newMenuItem.available ? "white" : "#333" },
                    ]}
                  >
                    {newMenuItem.available ? "Available" : "Unavailable"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Size Options */}
              <Text style={[styles.label, { color: theme.text || "#333" }]}>
                Size Options:
              </Text>
              <View style={styles.optionInput}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface || "white",
                      color: theme.text || "#333",
                      borderColor: theme.border || "#E0E0E0",
                      flex: 1,
                      marginRight: 8,
                    },
                  ]}
                  placeholder="Size name (e.g., Small, Medium, Large)"
                  placeholderTextColor={theme.textSecondary || "#999"}
                  value={newSizeOption.name}
                  onChangeText={(text) =>
                    setNewSizeOption({ ...newSizeOption, name: text })
                  }
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface || "white",
                      color: theme.text || "#333",
                      borderColor: theme.border || "#E0E0E0",
                      flex: 1,
                      marginRight: 8,
                    },
                  ]}
                  placeholder="Price (e.g., ₵5)"
                  placeholderTextColor={theme.textSecondary || "#999"}
                  value={newSizeOption.price}
                  onChangeText={(text) =>
                    setNewSizeOption({ ...newSizeOption, price: text })
                  }
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[
                    styles.addOptionButton,
                    { backgroundColor: theme.primary || "#FF6B35" },
                  ]}
                  onPress={() => {
                    if (
                      newSizeOption.name.trim() &&
                      newSizeOption.price.trim()
                    ) {
                      setNewMenuItem({
                        ...newMenuItem,
                        sizeOptions: [
                          ...newMenuItem.sizeOptions,
                          { ...newSizeOption },
                        ],
                      });
                      setNewSizeOption({ name: "", price: "" });
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {newMenuItem.sizeOptions.length > 0 && (
                <View style={styles.optionsList}>
                  <Text
                    style={[
                      styles.optionsTitle,
                      { color: theme.textSecondary || "#999" },
                    ]}
                  >
                    Added Size Options:
                  </Text>
                  {newMenuItem.sizeOptions.map((option, index) => (
                    <View key={index} style={styles.optionTag}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.textSecondary || "#999" },
                        ]}
                      >
                        {option.name} - {option.price}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setNewMenuItem({
                            ...newMenuItem,
                            sizeOptions: newMenuItem.sizeOptions.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        <Ionicons
                          name="close"
                          size={16}
                          color={theme.textSecondary || "#999"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Extra Options */}
              <Text style={[styles.label, { color: theme.text || "#333" }]}>
                Extra Options:
              </Text>
              <View style={styles.optionInput}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface || "white",
                      color: theme.text || "#333",
                      borderColor: theme.border || "#E0E0E0",
                      flex: 1,
                      marginRight: 8,
                    },
                  ]}
                  placeholder="Extra name (e.g., Extra Cheese, Extra Meat)"
                  placeholderTextColor={theme.textSecondary || "#999"}
                  value={newExtraOption.name}
                  onChangeText={(text) =>
                    setNewExtraOption({ ...newExtraOption, name: text })
                  }
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface || "white",
                      color: theme.text || "#333",
                      borderColor: theme.border || "#E0E0E0",
                      flex: 1,
                      marginRight: 8,
                    },
                  ]}
                  placeholder="Price (e.g., ₵3)"
                  placeholderTextColor={theme.textSecondary || "#999"}
                  value={newExtraOption.price}
                  onChangeText={(text) =>
                    setNewExtraOption({ ...newExtraOption, price: text })
                  }
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[
                    styles.addOptionButton,
                    { backgroundColor: theme.primary || "#FF6B35" },
                  ]}
                  onPress={() => {
                    if (
                      newExtraOption.name.trim() &&
                      newExtraOption.price.trim()
                    ) {
                      setNewMenuItem({
                        ...newMenuItem,
                        extraOptions: [
                          ...newMenuItem.extraOptions,
                          { ...newExtraOption },
                        ],
                      });
                      setNewExtraOption({ name: "", price: "" });
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {newMenuItem.extraOptions.length > 0 && (
                <View style={styles.optionsList}>
                  <Text
                    style={[
                      styles.optionsTitle,
                      { color: theme.textSecondary || "#999" },
                    ]}
                  >
                    Added Extra Options:
                  </Text>
                  {newMenuItem.extraOptions.map((option, index) => (
                    <View key={index} style={styles.optionTag}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.textSecondary || "#999" },
                        ]}
                      >
                        {option.name} - {option.price}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setNewMenuItem({
                            ...newMenuItem,
                            extraOptions: newMenuItem.extraOptions.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        <Ionicons
                          name="close"
                          size={16}
                          color={theme.textSecondary || "#999"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.border || "#E0E0E0" },
                ]}
                onPress={() => setShowAddMenuItemModal(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.text || "#333" },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.primary || "#FF6B35" },
                ]}
                onPress={handleAddMenuItem}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  Add Menu Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Test Modal for Debugging */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCategoryModal(false)}
        onShow={() => console.log("🔍 Test Modal shown")}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "white",
              borderRadius: 15,
              padding: 20,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Add New Category
              </Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  backgroundColor: "white",
                  borderColor: "#E0E0E0",
                  color: "#333",
                }}
                placeholder="Category Name"
                placeholderTextColor="#999"
                value={newCategory.name}
                onChangeText={(text) => {
                  console.log("📝 Category name changed:", text);
                  setNewCategory({ ...newCategory, name: text });
                }}
              />

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                  color: "#333",
                }}
              >
                Color:
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {categoryColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 3,
                      backgroundColor: color,
                      borderColor:
                        newCategory.color === color ? "#333" : "transparent",
                    }}
                    onPress={() => {
                      console.log("🎨 Color selected:", color);
                      setNewCategory({ ...newCategory, color });
                    }}
                  />
                ))}
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
                paddingTop: 15,
                borderTopWidth: 1,
                borderTopColor: "#E0E0E0",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginHorizontal: 8,
                  backgroundColor: "#E0E0E0",
                }}
                onPress={() => setShowAddCategoryModal(false)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginHorizontal: 8,
                  backgroundColor: "#FF6B35",
                }}
                onPress={handleAddCategory}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#FF6B35",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 2,
  },
  menuItemsGrid: {
    paddingHorizontal: 8,
  },
  menuItemContainer: {
    marginBottom: 16,
  },
  menuItemCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: isTablet ? 300 : 360,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  menuItemImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  comesWithContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  comesWithLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  comesWithText: {
    fontSize: 12,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  optionsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  optionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  optionText: {
    fontSize: 12,
  },
  moreOptionsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: 15,
    padding: 20,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addOptionButton: {
    padding: 12,
    borderRadius: 8,
  },
  optionsList: {
    marginTop: 8,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  optionText: {
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  availabilityToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MenuManagementScreen;
