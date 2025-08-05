import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";

const KPICards = ({ analytics = {} }) => {
  const { theme } = useTheme();
  const {
    total = 0,
    pending = 0,
    preparing = 0,
    delivered = 0,
    today = 0,
    pickup = 0,
    delivery = 0,
  } = analytics;

  const activeOrders = pending + preparing;

  return (
    <View style={styles.kpiContainer}>
      <View style={[styles.kpiCard, { backgroundColor: theme.card }]}>
        <View style={styles.kpiIcon}>
          <Ionicons name="cart" size={24} color={theme.info} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>
            Active Orders
          </Text>
          <Text style={[styles.kpiValue, { color: theme.text }]}>
            {activeOrders}
          </Text>
          <Text style={[styles.kpiTrend, { color: theme.success }]}>
            +{pending} new orders
          </Text>
        </View>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.card }]}>
        <View style={styles.kpiIcon}>
          <Ionicons name="calendar" size={24} color={theme.success} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>
            Today's Orders
          </Text>
          <Text style={[styles.kpiValue, { color: theme.text }]}>{today}</Text>
          <Text style={[styles.kpiTrend, { color: theme.success }]}>
            Total: {total}
          </Text>
        </View>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.card }]}>
        <View style={styles.kpiIcon}>
          <Ionicons name="location" size={24} color={theme.warning} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>
            Deliveries
          </Text>
          <Text style={[styles.kpiValue, { color: theme.text }]}>
            {delivery}
          </Text>
          <Text style={[styles.kpiDetail, { color: theme.textSecondary }]}>
            {pickup} takeaway
          </Text>
        </View>
      </View>

      <View style={[styles.kpiCard, { backgroundColor: theme.card }]}>
        <View style={styles.kpiIcon}>
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>
            Completed
          </Text>
          <Text style={[styles.kpiValue, { color: theme.text }]}>
            {delivered}
          </Text>
          <Text style={[styles.kpiTrend, { color: theme.success }]}>
            Preparing: {preparing}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kpiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 15,
  },
  kpiCard: {
    borderRadius: 12,
    padding: 20,
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiIcon: {
    marginBottom: 10,
  },
  kpiContent: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  kpiTrend: {
    fontSize: 12,
  },
  kpiDetail: {
    fontSize: 12,
    color: "#666",
  },
});

export default KPICards;
