import React, { useState, useEffect, useMemo } from "react";
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
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import BottomTabBar from "../components/BottomTabBar";
import NavigationBar from "../components/NavigationBar";
import AddMealScreen from "./AddMealScreen";
import AddCategoryScreen from "./AddCategoryScreen";
import {
  subscribeToCategories,
  getCategories,
  addCategory,
  subscribeToMenuItems,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
} from "../services/firebaseService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768; // retained if used elsewhere

// Orientation state for responsive columns
const getOrientation = () =>
  screenWidth > screenHeight ? "landscape" : "portrait";

const MenuManagementScreen = ({ activeTab = "menu", onTabPress }) => {
  const { theme, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { width, height } = useWindowDimensions();
  const shortest = Math.min(width, height);
  const isPad = Platform.OS === "ios" && Platform.isPad;
  const isTabletNow = isPad || shortest >= 768; // treat >=768dp as tablet
  const isLandscape = width > height;
  const gridColumns = 3;
  useEffect(() => {
    console.log(
      `Menu grid -> width:${width}, height:${height}, isPad:${isPad}, isTablet:${isTabletNow}, isLandscape:${isLandscape}, cols:${gridColumns}`
    );
  }, [width, height, isTabletNow, isLandscape, gridColumns]);

  // Derived categories from menuItems
  // const [categories, setCategories] = useState([]);
  // const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Menu items state (from Firestore)
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(true);

  // Subscribe to Firestore menu items
  useEffect(() => {
    const unsubscribe = subscribeToMenuItems((items) => {
      setMenuItems(items);
      setMenuItemsLoading(false);
    });
    getMenuItems()
      .then((items) => setMenuItems(items))
      .finally(() => setMenuItemsLoading(false));
    return () => unsubscribe && unsubscribe();
  }, []);

  // Categories state (from Firestore)
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Subscribe to Firestore categories
  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setCategories(cats);
      setCategoriesLoading(false);
    });
    getCategories()
      .then((cats) => setCategories(cats))
      .finally(() => setCategoriesLoading(false));
    return () => unsub && unsub();
  }, []);

  // Compute item counts for categories from menuItems
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map();
    for (const item of menuItems) {
      const key = item.category || "Uncategorized";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return categories.map((cat) => ({
      ...cat,
      itemCount: counts.get(cat.name) || 0,
    }));
  }, [categories, menuItems]);

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [showEditMenuItemModal, setShowEditMenuItemModal] = useState(false);
  const [showAddMealScreen, setShowAddMealScreen] = useState(false);
  const [showAddCategoryScreen, setShowAddCategoryScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [showMenuItemDetailModal, setShowMenuItemDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const openMenuItemDetail = (item) => {
    setDetailItem(item);
    setShowMenuItemDetailModal(true);
  };
  const closeMenuItemDetail = () => {
    setShowMenuItemDetailModal(false);
    setDetailItem(null);
  };
  const startEditFromDetail = () => {
    if (!detailItem) return;
    setShowMenuItemDetailModal(false);
    setEditingMenuItem(detailItem);
    setShowAddMealScreen(true);
  };

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

  // categoriesWithCounts is computed in a memo below

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const cats = await getCategories();
      const withCounts = cats.map((cat) => ({
        ...cat,
        itemCount:
          cat.id === "all"
            ? menuItems.length
            : menuItems.filter((m) => m.category === cat.id).length,
      }));
      setCategories(withCounts);
      console.log("🔄 Menu Management refreshed successfully");
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

  // Adapt selected category filter for Firestore shape (category is a string name)
  const getFilteredMenuItems = () => {
    if (selectedCategory === "all") return menuItems;
    return menuItems.filter(
      (item) => (item.category || "Uncategorized") === selectedCategory
    );
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
    const isBestseller =
      Boolean(item.bestseller) || (item.deliveredCount ?? 0) >= 50;
    const ratingsCount = item.ratingsCount ?? item.reviewsCount ?? 0;
    const deliveredCount = item.deliveredCount ?? item.ordersCount ?? 0;
    const priceNumber =
      typeof item.price === "number"
        ? item.price
        : Number(String(item.price).replace(/[^0-9.]/g, ""));

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
        {/* Image with badge */}
        {item.image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            {isBestseller && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BESTSELLER</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Title */}
        <Text
          style={[styles.menuItemName, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Ratings row */}
        <View style={styles.ratingsRow}>
          <Ionicons name="star" size={14} color="#FFC107" />
          <Ionicons name="star" size={14} color="#FFC107" />
          <Ionicons name="star" size={14} color="#FFC107" />
          <Ionicons name="star" size={14} color="#FFC107" />
          <Ionicons name="star-outline" size={14} color="#FFC107" />
          <Text style={[styles.ratingsText, { color: theme.textSecondary }]}>
            {`  ${ratingsCount} ratings | ${deliveredCount} delivered`}
          </Text>
        </View>

        {/* Price */}
        <Text style={[styles.menuItemPriceLarge, { color: theme.text }]}>
          {`₵${Number.isFinite(priceNumber) ? priceNumber : 0}`}
        </Text>
      </View>
    );
  };

  const headerCategories = [
    {
      id: "all",
      name: "All Items",
      color: "#666",
      itemCount: menuItems.length,
    },
    ...categoriesWithCounts,
  ];

  // Helper: pad data so last row is filled to keep fixed grid widths
  const padToFullRows = useMemo(() => {
    return (items, columns) => {
      if (!Array.isArray(items) || !columns) return items || [];
      const remainder = items.length % columns;
      if (remainder === 0) return items;
      const padCount = columns - remainder;
      const padded = [...items];
      for (let i = 0; i < padCount; i += 1) {
        padded.push({ __empty: true, id: `__empty-${i}` });
      }
      return padded;
    };
  }, []);

  const filteredItems = useMemo(
    () => getFilteredMenuItems(),
    [menuItems, selectedCategory]
  );
  const gridData = useMemo(
    () => padToFullRows(filteredItems, gridColumns),
    [filteredItems, gridColumns, padToFullRows]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showAddMealScreen ? (
        <AddMealScreen
          onBack={() => {
            setShowAddMealScreen(false);
            setEditingMenuItem(null);
          }}
          categories={categories}
          initialItem={editingMenuItem || null}
          onSave={async (mealData) => {
            try {
              if (mealData?.id) {
                await updateMenuItem(mealData.id, mealData);
                console.log("✅ Menu item updated:", mealData.id);
              } else {
                const newId = await addMenuItem(mealData);
                console.log("✅ Menu item added:", newId);
              }
            } catch (e) {
              console.error("Failed to save menu item", e);
              Alert.alert("Error", "Failed to save menu item");
            } finally {
              setShowAddMealScreen(false);
              setEditingMenuItem(null);
            }
          }}
        />
      ) : showAddCategoryScreen ? (
        <AddCategoryScreen
          onBack={() => setShowAddCategoryScreen(false)}
          onSave={async (categoryData) => {
            try {
              const newId = await addCategory(categoryData);
              console.log("✅ Category added:", newId);
            } catch (e) {
              console.error("Failed to add category", e);
              Alert.alert("Error", "Failed to add category");
            } finally {
              setShowAddCategoryScreen(false);
            }
          }}
        />
      ) : (
        <>
          <NavigationBar activeTab={activeTab} onTabPress={onTabPress} />
          {/* <BottomTabBar activeTab={activeTab} onTabPress={onTabPress} />  */}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu </Text>
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

          <FlatList
            style={styles.content}
            data={gridData}
            keyExtractor={(item, index) =>
              item?.id ? String(item.id) : `__empty-${index}`
            }
            numColumns={gridColumns}
            key={`cols-${gridColumns}`}
            extraData={{
              gridColumns,
              selectedCategory,
              count: filteredItems.length,
            }}
            renderItem={({ item }) =>
              item.__empty ? (
                <View
                  style={[
                    styles.menuItemContainer,
                    styles.menuItemPlaceholder,
                    { width: `${100 / gridColumns}%`, paddingHorizontal: 4 },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.menuItemContainer,
                    { width: `${100 / gridColumns}%`, paddingHorizontal: 4 },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openMenuItemDetail(item)}
                  >
                    <MenuItemCard
                      item={item}
                      onEdit={openEditModal}
                      onDelete={handleDeleteMenuItem}
                      onToggleAvailability={handleToggleAvailability}
                    />
                  </TouchableOpacity>
                </View>
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuItemsGrid}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              <>
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
                    {headerCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={{
                          ...category,
                          color: category.color || "#666",
                        }}
                        isSelected={
                          category.id === "all"
                            ? selectedCategory === "all"
                            : selectedCategory === category.name
                        }
                        onPress={() =>
                          setSelectedCategory(
                            category.id === "all" ? "all" : category.name
                          )
                        }
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* Menu Items Section Header */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Menu Items (
                    {menuItemsLoading
                      ? "loading..."
                      : getFilteredMenuItems().length}
                    )
                  </Text>
                </View>
              </>
            }
            ListEmptyComponent={
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
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Add your first menu item to get started
                </Text>
              </View>
            }
          />
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

      {/* Menu Item Detail Modal */}
      <Modal
        visible={showMenuItemDetailModal}
        animationType="fade"
        transparent
        onRequestClose={closeMenuItemDetail}
      >
        <View style={styles.detailOverlay}>
          <View
            style={[
              styles.detailCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {detailItem?.image ? (
              <View style={styles.detailImageWrapper}>
                <Image
                  source={{ uri: detailItem.image }}
                  style={styles.detailImage}
                />
                {Boolean(detailItem?.bestseller) && (
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>BESTSELLER</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={closeMenuItemDetail}
                >
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.detailCloseTopRight}
                onPress={closeMenuItemDetail}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            )}

            <View style={styles.detailBody}>
              <Text
                style={[styles.detailTitle, { color: theme.text }]}
                numberOfLines={2}
              >
                {detailItem?.name}
              </Text>

              {detailItem?.description ? (
                <Text
                  style={[
                    styles.detailDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {detailItem.description}
                </Text>
              ) : null}

              <View style={styles.detailMetaRow}>
                <View style={styles.detailRatingRow}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Ionicons name="star-outline" size={14} color="#FFC107" />
                  <Text
                    style={[
                      styles.detailMetaText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {" "}
                    {detailItem?.ratingsCount ?? 0} ratings
                  </Text>
                </View>
                <Text style={[styles.detailPrice, { color: theme.text }]}>
                  ₵
                  {typeof detailItem?.price === "number"
                    ? detailItem.price
                    : Number(
                        String(detailItem?.price || "").replace(/[^0-9.]/g, "")
                      ) || 0}
                </Text>
              </View>

              {/* Sizes */}
              {Array.isArray(detailItem?.sizes) &&
                detailItem.sizes.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.detailSectionTitle, { color: theme.text }]}
                    >
                      Sizes
                    </Text>
                    <View style={styles.detailChipsRow}>
                      {detailItem.sizes.map((s, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.detailChip,
                            {
                              backgroundColor: theme.surface,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailChipText,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {s.name} - ₵{s.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* Extras */}
              {Array.isArray(detailItem?.extras) &&
                detailItem.extras.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.detailSectionTitle, { color: theme.text }]}
                    >
                      Extras
                    </Text>
                    <View style={styles.detailChipsRow}>
                      {detailItem.extras.map((e, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.detailChip,
                            {
                              backgroundColor: theme.surface,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.detailChipText,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {e.name} - ₵{e.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* Action buttons */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailBtn, { backgroundColor: theme.primary }]}
                  onPress={startEditFromDetail}
                >
                  <Text style={styles.detailBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailBtn, { backgroundColor: "#E0E0E0" }]}
                  onPress={closeMenuItemDetail}
                >
                  <Text style={[styles.detailBtnText, { color: "#333" }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 10,
    // backgroundColor: "#FF6B35",
    backgroundColor: "#651FFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
  menuItemPlaceholder: {
    height: 0, // Placeholder for empty rows
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
    // Remove fixed height so content determines height
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
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    objectFit: "cover",
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
  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  ratingsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  menuItemPriceLarge: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  detailImageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 1.2,
    borderRadius: 15,
    overflow: "hidden",
  },
  detailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  detailBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  detailBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  detailCloseTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 12,
  },
  detailBody: {
    padding: 20,
    paddingTop: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailMetaText: {
    fontSize: 14,
  },
  detailPrice: {
    fontSize: 28,
    fontWeight: "bold",
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  detailChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  detailChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  detailBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default MenuManagementScreen;
