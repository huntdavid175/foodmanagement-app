import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import {
  subscribeToOrders,
  subscribeToOrdersByStatus,
  updateOrderStatus,
  getOrderAnalytics,
} from "../services/firebaseService";
import NavigationBar from "../components/NavigationBar";
import OrderDetailModal from "../components/OrderDetailModal";
import { useTheme } from "../utils/theme";
import {
  registerForPushNotificationsAsync,
  sendNewOrderNotification,
  sendOrderStatusNotification,
  handleNotificationResponse,
} from "../utils/notificationUtils";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

const KitchenScreen = ({ activeTab = "kitchen", onTabPress }) => {
  const { theme, isDarkMode } = useTheme();
  const getWaitingTime = (createdAt) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [lastNotification, setLastNotification] = useState(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivered: 0,
    today: 0,
  });
  const notificationListener = useRef();
  const responseListener = useRef();

  // Calculate analytics
  const newOrders = orders.filter((order) => order.status === "pending").length;
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  ).length;
  const readyOrders = orders.filter((order) => order.status === "ready").length;
  const avgTime = "28m"; // This would be calculated from actual data

  // Filter and sort orders by status (oldest first for fair queue)
  const newOrdersList = orders
    .filter((order) => order.status === "pending")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

  const preparingOrdersList = orders
    .filter((order) => order.status === "preparing")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

  const readyOrdersList = orders
    .filter((order) => order.status === "ready")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // The orders will be updated automatically through the real-time listener
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status. Please try again.");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeOrderModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  // Setup real-time listeners and notifications
  useEffect(() => {
    // Subscribe to all orders for kitchen view
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    });

    // Setup notifications
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = handleNotificationResponse(response);
        if (data && data.screen === "kitchen") {
          console.log("Kitchen notification tapped:", data);
        }
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

    return () => {
      unsubscribe();
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const KPICard = ({ title, value, icon, color, subtitle }) => (
    <View
      style={[
        styles.kpiCard,
        { borderLeftColor: color, backgroundColor: theme.card },
      ]}
    >
      <View style={styles.kpiIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.kpiContent}>
        <Text style={[styles.kpiValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.kpiSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  const OrderCard = ({ order, status, onAction, onPress }) => {
    const getStatusColor = () => {
      switch (status) {
        case "pending":
          return theme.isDarkMode ? "#6BA3E8" : "#4A90E2";
        case "preparing":
          return theme.isDarkMode ? "#F7B84A" : "#F5A623";
        case "ready":
          return theme.isDarkMode ? "#FF8A65" : "#FF6B35";
        case "delivered":
          return theme.isDarkMode ? "#9EE37A" : "#7ED321";
        default:
          return theme.isDarkMode ? "#999" : "#666";
      }
    };

    const getActionButton = () => {
      switch (status) {
        case "pending":
          return {
            text: "Start Cooking",
            icon: "restaurant",
            onPress: () => onAction(order.id, "preparing"),
          };
        case "preparing":
          return {
            text: "Mark as Ready",
            icon: "checkmark",
            onPress: () => onAction(order.id, "ready"),
          };
        case "ready":
          return {
            text: "Mark as Delivered",
            icon: "checkmark-circle",
            onPress: () => onAction(order.id, "delivered"),
          };
        default:
          return null;
      }
    };

    const actionButton = getActionButton();

    const getCardBackground = () => {
      if (!isDarkMode) {
        return getStatusColor() + "10";
      }

      // Dark mode: darker versions of the status colors
      switch (status) {
        case "pending":
          return "#1A2E4A"; // Darker blue
        case "preparing":
          return "#4A3A1A"; // Darker orange
        case "ready":
          return "#4A2A1A"; // Darker red-orange
        case "delivered":
          return "#1A4A2A"; // Darker green
        default:
          return theme.surface;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: getCardBackground(),
          },
        ]}
        onPress={() => onPress(order)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={[styles.orderId, { color: theme.text }]}>
            ORD-#{order.orderNumber}
          </Text>
          <Text style={[styles.orderTime, { color: theme.textSecondary }]}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.orderType}>
          <View
            style={[styles.typeBadge, { backgroundColor: theme.borderLight }]}
          >
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>
              {order.orderType}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerRow}>
            <Ionicons name="person" size={16} color={theme.textSecondary} />
            <Text style={[styles.customerName, { color: theme.text }]}>
              {order.customerName}
            </Text>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="location" size={16} color={theme.textSecondary} />
            <Text
              style={[styles.customerLocation, { color: theme.textSecondary }]}
            >
              {order.orderType === "delivery"
                ? order.deliveryAddress?.street || "N/A"
                : "Pickup"}
            </Text>
          </View>
          <Text style={[styles.customerPhone, { color: theme.textSecondary }]}>
            {order.customerPhone}
          </Text>
        </View>

        <View style={styles.orderItems}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemText, { color: theme.text }]}>
                    {typeof item === "string" ? item : item.name || item}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.itemText, { color: theme.text }]}>
              No items
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.timer}>
            <Ionicons name="time" size={16} color={theme.textSecondary} />
            <Text style={[styles.timerText, { color: theme.textSecondary }]}>
              {order.createdAt ? getWaitingTime(order.createdAt) : "N/A"}
            </Text>
          </View>
          {actionButton && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={actionButton.onPress}
            >
              <Ionicons name={actionButton.icon} size={16} color="white" />
              <Text style={styles.actionButtonText}>{actionButton.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const OrderColumn = ({ title, count, orders, status, onAction, onPress }) => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Ionicons
          name={
            status === "pending"
              ? "alert-circle"
              : status === "preparing"
              ? "time"
              : status === "ready"
              ? "checkmark-circle"
              : "checkmark-circle"
          }
          size={20}
          color={
            status === "pending"
              ? isDarkMode
                ? "#6BA3E8"
                : "#4A90E2"
              : status === "preparing"
              ? isDarkMode
                ? "#F7B84A"
                : "#F5A623"
              : status === "ready"
              ? isDarkMode
                ? "#FF8A65"
                : "#FF6B35"
              : isDarkMode
              ? "#9EE37A"
              : "#7ED321"
          }
        />
        <Text style={[styles.columnTitle, { color: theme.text }]}>
          {title} ({count})
        </Text>
      </View>
      <View style={styles.columnContent}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            status={status}
            onAction={onAction}
            onPress={onPress}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationBar activeTab={activeTab} onTabPress={onTabPress} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <KPICard
            title="New Orders"
            value={newOrders}
            icon="alert-circle"
            color="#4A90E2"
          />
          <KPICard
            title="Preparing"
            value={preparingOrders}
            icon="time"
            color="#F5A623"
          />
          <KPICard
            title="Ready"
            value={readyOrders}
            icon="checkmark-circle"
            color="#7ED321"
          />
          <KPICard title="Avg. Time" value={avgTime} icon="time" color="#666" />
        </View>

        {/* Test New Order Button */}
        <View style={styles.testButtonContainer}>
          {lastNotification && (
            <View style={styles.notificationIndicator}>
              <Ionicons name="notifications" size={16} color="#FF6B35" />
              <Text style={styles.notificationText}>
                Last notification: {lastNotification.title} at{" "}
                {lastNotification.timestamp}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              const newOrder = {
                id: `order_${Date.now()}`,
                customer: "Test Customer",
                phone: "0545817432",
                type: "Pickup",
                items: [
                  {
                    name: "Test Burger",
                    size: "Medium",
                    quantity: 1,
                    price: "GHC45",
                    extras: ["Extra Cheese"],
                  },
                ],
                total: "GHC45",
                status: "pending",
                time: "Now",
                itemsCount: 1,
                orderDate: "Now",
                estimatedTime: "20-25 minutes",
                specialInstructions: "Test order",
                paymentMethod: "Cash on Pickup",
                customerNote: "Test notification",
              };

              setOrders((prev) => [newOrder, ...prev]);
              sendNewOrderNotification(newOrder);
              const notificationInfo = {
                title: `🆕 New Order #${newOrder.id.split("_")[1]}`,
                body: `${newOrder.customer} - ${newOrder.items.length} item (${newOrder.type})`,
                timestamp: new Date().toLocaleTimeString(),
              };
              console.log("🔔 Notification would be sent:", notificationInfo);
              setLastNotification(notificationInfo);
              Alert.alert(
                "Test Order",
                "New test order added! Check console for notification details."
              );
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.testButtonText}>Simulate New Order</Text>
          </TouchableOpacity>
        </View>

        {/* Order Management Columns */}
        <View style={styles.columnsContainer}>
          <OrderColumn
            title="New Orders"
            count={newOrdersList.length}
            orders={newOrdersList}
            status="pending"
            onAction={handleStatusChange}
            onPress={openOrderModal}
          />
          <OrderColumn
            title="Preparing"
            count={preparingOrdersList.length}
            orders={preparingOrdersList}
            status="preparing"
            onAction={handleStatusChange}
            onPress={openOrderModal}
          />
          <OrderColumn
            title="Ready"
            count={readyOrdersList.length}
            orders={readyOrdersList}
            status="ready"
            onAction={handleStatusChange}
            onPress={openOrderModal}
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
    padding: isTablet ? 24 : 16,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: isTablet ? 30 : 20,
    flexWrap: isTablet ? "wrap" : "nowrap",
  },
  kpiCard: {
    flex: isTablet ? 0 : 1,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginHorizontal: isTablet ? 8 : 4,
    marginBottom: isTablet ? 12 : 0,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: isTablet ? 180 : undefined,
  },
  kpiIcon: {
    marginBottom: 8,
  },
  kpiContent: {
    alignItems: "center",
  },
  kpiValue: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
  },
  kpiTitle: {
    fontSize: isTablet ? 14 : 12,
    marginTop: 4,
  },
  kpiSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  columnsContainer: {
    flexDirection: "row",
    marginTop: isTablet ? 30 : 20,
    minHeight: isTablet ? 800 : 600, // Ensure enough content for scrolling
    justifyContent: "space-between", // Changed from "space-around"
  },
  column: {
    flex: 1,
    marginHorizontal: isTablet ? 4 : 2,
    // Removed maxWidth constraint to let flex work properly
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 12 : 8,
  },
  columnTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  columnContent: {
    flex: 1,
  },
  orderCard: {
    padding: isTablet ? 20 : 16,
    marginBottom: isTablet ? 16 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "bold",
  },
  orderTime: {
    fontSize: isTablet ? 14 : 12,
  },
  orderType: {
    flexDirection: "row",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeText: {
    fontSize: 10,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  customerLocation: {
    fontSize: isTablet ? 14 : 12,
    marginLeft: 6,
  },
  customerPhone: {
    fontSize: isTablet ? 14 : 12,
    marginTop: 4,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemRow: {
    marginBottom: 8,
  },
  itemInfo: {
    marginBottom: 4,
  },
  itemText: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: "500",
  },
  extrasText: {
    fontSize: isTablet ? 13 : 11,
    marginTop: 2,
  },
  itemTags: {
    flexDirection: "row",
  },
  tag: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: "#4A90E2",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  actionButton: {
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  testButtonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  testButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isTablet ? 30 : 20,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: "white",
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  notificationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B35",
  },
  notificationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
});

export default KitchenScreen;
