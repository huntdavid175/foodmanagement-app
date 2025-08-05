import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    try {
      // For local notifications, we don't need the project ID
      // This will work for local notifications without requiring EAS project setup
      console.log("Notification permissions granted");
    } catch (error) {
      console.log("Error setting up notifications:", error);
    }
  } else {
    console.log("Must use physical device for push notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

// Send local notification for new order
export async function sendNewOrderNotification(order) {
  const customerName = order.customer;
  const orderId = order.id.split("_")[1];
  const itemCount = order.items.length;
  const orderType = order.type;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🆕 New Order #${orderId}`,
      body: `${customerName} - ${itemCount} item${
        itemCount > 1 ? "s" : ""
      } (${orderType})`,
      data: {
        orderId: order.id,
        customerName: order.customer,
        orderType: order.type,
        screen: "kitchen",
      },
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Send immediately
  });
}

// Send notification for order status change
export async function sendOrderStatusNotification(order, newStatus) {
  const customerName = order.customer;
  const orderId = order.id.split("_")[1];

  let title, body;

  switch (newStatus) {
    case "preparing":
      title = `👨‍🍳 Order #${orderId} Started`;
      body = `${customerName}'s order is now being prepared`;
      break;
    case "delivered":
      title = `✅ Order #${orderId} Ready`;
      body = `${customerName}'s order is ready for pickup`;
      break;
    default:
      return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        orderId: order.id,
        customerName: order.customer,
        newStatus,
        screen: "kitchen",
      },
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Send immediately
  });
}

// Handle notification response
export function handleNotificationResponse(response) {
  const data = response?.notification?.request?.content?.data;

  if (data) {
    console.log("Notification data:", data);
    // You can navigate to specific screens or perform actions based on the notification
    return data;
  }

  return null;
}
