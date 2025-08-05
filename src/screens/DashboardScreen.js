import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, FlatList, StyleSheet } from "react-native";

import NavigationBar from "../components/NavigationBar";
import KPICards from "../components/KPICards";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModal";
import { useTheme } from "../utils/theme";
import {
  subscribeToOrders,
  getOrderAnalytics,
} from "../services/firebaseService";

const DashboardScreen = ({ activeTab = "dashboard", onTabPress }) => {
  const { theme } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivered: 0,
    today: 0,
  });

  useEffect(() => {
    // Subscribe to real-time orders
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    });

    // Get analytics
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationBar activeTab={activeTab} onTabPress={onTabPress} />
      <ScrollView style={styles.content}>
        <KPICards analytics={analytics} />

        {/* Order Management Section */}
        <View style={[styles.orderSection, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Orders
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                Manage delivery and takeaway orders
              </Text>
            </View>
          </View>

          {/* Modern Orders List */}
          <FlatList
            data={orders.slice(0, 5)} // Show only recent 5 orders
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
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
  orderSection: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  ordersList: {
    paddingBottom: 20,
  },
});

export default DashboardScreen;
