import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import {
  getStatusColor,
  getStatusIcon,
  calculateTotalWithDelivery,
} from "../utils/orderUtils";

const OrderDetailModal = ({ visible, order, onClose }) => {
  const { theme } = useTheme();

  if (!order) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.modalBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleSection}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Order Details
              </Text>
              <Text
                style={[styles.modalSubtitle, { color: theme.textSecondary }]}
              >
                ORD-#{order.orderNumber}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Order Status */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={theme.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Order Status
                </Text>
              </View>
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: getStatusColor(order.status) + "20" },
                ]}
              >
                <View style={styles.statusRow}>
                  <Ionicons
                    name={getStatusIcon(order.status)}
                    size={20}
                    color={getStatusColor(order.status)}
                  />
                  <Text
                    style={[
                      styles.statusTextLarge,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {order.status?.charAt(0).toUpperCase() +
                      order.status?.slice(1)}
                  </Text>
                </View>
                <Text
                  style={[styles.statusTime, { color: theme.textSecondary }]}
                >
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </Text>
              </View>
            </View>

            {/* Customer Information */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Customer Information
                </Text>
              </View>
              <View
                style={[styles.infoCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Name
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {order.customerName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Phone
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {order.customerPhone}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Order Type
                  </Text>
                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={order.orderType === "pickup" ? "bag" : "car"}
                      size={14}
                      color={theme.primary}
                    />
                    <Text style={styles.typeText}>{order.orderType}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Order Items
                </Text>
              </View>
              <View
                style={[styles.itemsCard, { backgroundColor: theme.surface }]}
              >
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.itemSize,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.size} • Qty: {item.quantity}
                      </Text>
                      {item.extras && item.extras.length > 0 && (
                        <View style={styles.extrasContainer}>
                          <Text
                            style={[
                              styles.extrasLabel,
                              { color: theme.textSecondary },
                            ]}
                          >
                            Extras:
                          </Text>
                          <View style={styles.extrasList}>
                            {item.extras.map((extra, extraIndex) => (
                              <View
                                key={extraIndex}
                                style={[
                                  styles.extraTag,
                                  { backgroundColor: theme.borderLight },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.extraText,
                                    { color: theme.textSecondary },
                                  ]}
                                >
                                  {extra}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.itemPrice, { color: theme.primary }]}>
                      {item.price}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text
                    style={[styles.totalLabel, { color: theme.textSecondary }]}
                  >
                    Total
                  </Text>
                  <Text style={[styles.totalAmount, { color: theme.primary }]}>
                    GHC {order.total}
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Information */}
            {order.type === "Delivery" && (
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Delivery Information
                  </Text>
                </View>
                <View
                  style={[styles.infoCard, { backgroundColor: theme.surface }]}
                >
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Delivery Address
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {order.deliveryAddress?.street || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Delivery Fee
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {order.deliveryFee}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Total with Delivery
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      GHC {order.total}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Customer Note */}
            {order.customerNote && (
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="chatbubble" size={20} color={theme.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Customer Note
                  </Text>
                </View>
                <View
                  style={[
                    styles.noteCard,
                    {
                      backgroundColor: theme.surface,
                      borderLeftColor: theme.primary,
                    },
                  ]}
                >
                  <Text style={[styles.noteText, { color: theme.text }]}>
                    {order.customerNote}
                  </Text>
                </View>
              </View>
            )}

            {/* Additional Information */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Additional Information
                </Text>
              </View>
              <View
                style={[styles.infoCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Estimated Delivery
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {order.estimatedDelivery}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Payment Method
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {order.paymentMethod}
                  </Text>
                </View>
                {order.specialInstructions && (
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Special Instructions
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {order.specialInstructions}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.modalActions, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.actionButtonSecondary,
                { backgroundColor: theme.borderLight },
              ]}
            >
              <Ionicons name="call" size={20} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Call Customer
              </Text>
            </TouchableOpacity>
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <TouchableOpacity style={styles.actionButtonPrimary}>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonTextPrimary}>
                  Mark Complete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 15,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitleSection: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 15,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextLarge: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusTime: {
    fontSize: 12,
    marginTop: 5,
  },
  infoCard: {
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "bold",
    marginLeft: 5,
  },
  itemsCard: {
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemSize: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  extrasContainer: {
    marginTop: 5,
  },
  extrasLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    marginBottom: 3,
  },
  extrasList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  extraTag: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  extraText: {
    fontSize: 10,
    color: "#FF6B35",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteCard: {
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
  },
  noteText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    borderTopWidth: 1,
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
  actionButtonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
  actionButtonText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  actionButtonTextPrimary: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default OrderDetailModal;
