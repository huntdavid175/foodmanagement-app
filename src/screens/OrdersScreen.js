import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import NavigationBar from "../components/NavigationBar";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModal";
import { useTheme } from "../utils/theme";
import {
  subscribeToOrders,
  getOrderAnalytics,
} from "../services/firebaseService";

const ITEMS_PER_PAGE = 20;

const OrdersScreen = ({ activeTab = "orders", onTabPress }) => {
  const { theme } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivered: 0,
    today: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [displayedOrders, setDisplayedOrders] = useState([]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeOrderModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const renderOrderCard = ({ item }) => (
    <OrderCard order={item} onPress={openOrderModal} />
  );

  // Load more orders when scrolling
  const loadMoreOrders = useCallback(() => {
    if (loading || !hasMoreData) return;

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const filteredOrders = getFilteredOrders();
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newOrders = filteredOrders.slice(startIndex, endIndex);

      if (newOrders.length > 0) {
        setDisplayedOrders((prev) => [...prev, ...newOrders]);
        setCurrentPage((prev) => prev + 1);
        setHasMoreData(endIndex < filteredOrders.length);
      } else {
        setHasMoreData(false);
      }

      setLoading(false);
    }, 1000);
  }, [currentPage, loading, hasMoreData, activeFilter]);

  // Reset pagination when filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setDisplayedOrders([]);
    setCurrentPage(1);
    setHasMoreData(true);
    setLoading(false);
  };

  // Setup real-time listeners
  useEffect(() => {
    // Subscribe to real-time orders
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    });

    // Load analytics
    const loadAnalytics = async () => {
      try {
        const analyticsData = await getOrderAnalytics();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };
    loadAnalytics();

    return unsubscribe;
  }, []);

  // Calculate analytics from state
  const totalOrders = analytics.total;
  const todayOrders = analytics.today;

  // Filter orders based on active filter
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case "delivered":
        return orders.filter((order) => order.status === "delivered");
      case "pending":
        return orders.filter((order) => order.status === "pending");
      case "preparing":
        return orders.filter((order) => order.status === "preparing");
      case "pickup":
        return orders.filter((order) => order.type === "Pickup");
      case "delivery":
        return orders.filter((order) => order.type === "Delivery");
      default:
        return orders;
    }
  };

  const AnalyticsCard = ({ title, value, icon, color, subtitle }) => (
    <View
      style={[
        styles.analyticsCard,
        { borderLeftColor: color, backgroundColor: theme.card },
      ]}
    >
      <View style={styles.analyticsIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.analyticsContent}>
        <Text style={[styles.analyticsValue, { color: theme.text }]}>
          {value}
        </Text>
        <Text style={[styles.analyticsTitle, { color: theme.textSecondary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.analyticsSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  const FilterButton = ({ title, count, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: isActive ? theme.primary : theme.card },
        isActive && styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: isActive ? "white" : theme.textSecondary },
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.filterCount,
          { backgroundColor: isActive ? "white" : theme.border },
        ]}
      >
        <Text
          style={[
            styles.filterCountText,
            { color: isActive ? theme.primary : theme.textSecondary },
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationBar activeTab={activeTab} onTabPress={onTabPress} />

      <ScrollView style={styles.content}>
        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Order Analytics
          </Text>
          <View style={styles.analyticsGrid}>
            <AnalyticsCard
              title="Total Orders"
              value={totalOrders}
              icon="list"
              color="#4A90E2"
            />
            <AnalyticsCard
              title="Today's Orders"
              value={todayOrders}
              icon="calendar"
              color="#7ED321"
            />
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Filter Orders
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            <FilterButton
              title="All"
              count={totalOrders}
              isActive={activeFilter === "all"}
              onPress={() => setActiveFilter("all")}
            />
            <FilterButton
              title="Delivered"
              count={analytics.delivered}
              isActive={activeFilter === "delivered"}
              onPress={() => handleFilterChange("delivered")}
            />
            <FilterButton
              title="Pending"
              count={analytics.pending}
              isActive={activeFilter === "pending"}
              onPress={() => handleFilterChange("pending")}
            />
            <FilterButton
              title="Preparing"
              count={analytics.preparing}
              isActive={activeFilter === "preparing"}
              onPress={() => handleFilterChange("preparing")}
            />
            <FilterButton
              title="Pickup"
              count={analytics.pickup || 0}
              isActive={activeFilter === "pickup"}
              onPress={() => handleFilterChange("pickup")}
            />
            <FilterButton
              title="Delivery"
              count={analytics.delivery || 0}
              isActive={activeFilter === "delivery"}
              onPress={() => handleFilterChange("delivery")}
            />
          </ScrollView>
        </View>

        {/* Orders List */}
        <View style={[styles.ordersSection, { backgroundColor: theme.card }]}>
          <View style={styles.ordersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              All Orders ({getFilteredOrders().length})
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="funnel" size={20} color={theme.textSecondary} />
              <Text
                style={[styles.sortButtonText, { color: theme.textSecondary }]}
              >
                Sort
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={getFilteredOrders()}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
          />
        </View>
      </ScrollView>

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={modalVisible}
        order={selectedOrder}
        onClose={closeOrderModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  analyticsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  analyticsCard: {
    borderRadius: 12,
    padding: 20,
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  analyticsIcon: {
    marginBottom: 10,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  analyticsTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  analyticsSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderTypesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  orderTypesGrid: {
    flexDirection: "row",
    gap: 15,
  },
  orderTypeCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderTypeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  orderTypeLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: "row",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#FF6B35",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterCount: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterCountText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
  },
  filterCountTextActive: {
    color: "white",
  },
  ordersSection: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  ordersList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});

export default OrdersScreen;
