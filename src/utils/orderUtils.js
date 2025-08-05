export const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "#7ED321";
    case "preparing":
      return "#F5A623";
    case "pending":
      return "#FF6B35";
    default:
      return "#666";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return "checkmark-circle";
    case "preparing":
      return "time";
    case "pending":
      return "hourglass";
    default:
      return "ellipsis-horizontal";
  }
};

export const calculateTotalWithDelivery = (order) => {
  if (order.type === "Delivery" && order.deliveryFee) {
    const orderTotal = parseInt(order.total.replace("GHC", ""));
    const deliveryFee = parseInt(order.deliveryFee.replace("GHC", ""));
    return orderTotal + deliveryFee;
  }
  return parseInt(order.total.replace("GHC", ""));
};
