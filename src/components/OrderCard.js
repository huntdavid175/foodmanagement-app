import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStatusColor, getStatusIcon } from "../utils/orderUtils";
import { useTheme } from "../utils/theme";

const formatOrderDateTime = (createdAt) => {
  const orderDate = new Date(createdAt);
  const today = new Date();

  // Check if it's today
  if (orderDate.toDateString() === today.toDateString()) {
    return `Today, ${orderDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return `${orderDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}, ${orderDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
};

const OrderCard = ({ order, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() => onPress(order)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={[styles.orderId, { color: theme.text }]}>
            ORD-#{order.orderNumber}
          </Text>
          <Text style={[styles.orderTime, { color: theme.textSecondary }]}>
            {order.createdAt ? formatOrderDateTime(order.createdAt) : "N/A"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(order.status)}
            size={12}
            color="white"
          />
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: theme.text }]}>
              {order.customerName}
            </Text>
            <View style={styles.phoneInfo}>
              <Ionicons name="call" size={12} color={theme.textSecondary} />
              <Text
                style={[styles.phoneNumber, { color: theme.textSecondary }]}
              >
                {order.customerPhone}
              </Text>
            </View>
          </View>
          <View style={styles.orderTypeContainer}>
            <Ionicons
              name={order.orderType === "pickup" ? "bag" : "car"}
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.orderType, { color: theme.textSecondary }]}>
              {order.orderType}
            </Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Ionicons name="restaurant" size={16} color={theme.textSecondary} />
            <Text style={[styles.itemsTitle, { color: theme.text }]}>
              Order Items ({order.items ? order.items.length : 0})
            </Text>
          </View>
          <Text style={[styles.orderItems, { color: theme.textSecondary }]}>
            {order.items
              ? order.items.map((item) => item.name || item).join(", ")
              : "No items"}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.orderTotal, { color: theme.text }]}>
              GHC {order.total}
            </Text>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  orderIdContainer: {
    flexDirection: "column",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
  orderContent: {
    padding: 15,
  },
  customerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  phoneInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  phoneNumber: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  orderTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  orderType: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "bold",
    marginLeft: 5,
  },
  itemsSection: {
    marginBottom: 10,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  itemsTitle: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  orderItems: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  totalSection: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  actionButton: {
    padding: 8,
  },
});

export default OrderCard;
