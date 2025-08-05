import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Orders collection reference
const ORDERS_COLLECTION = "orders";

// Add a new order to Firebase
export const addOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "pending", // Default status
    };

    const docRef = await addDoc(
      collection(db, ORDERS_COLLECTION),
      orderWithTimestamp
    );
    console.log("Order added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    console.log("Order status updated:", orderId, "to", newStatus);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Get all orders
export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return orders;
  } catch (error) {
    console.error("Error getting orders by status:", error);
    throw error;
  }
};

// Real-time listener for orders
export const subscribeToOrders = (callback) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      const orderData = {
        id: doc.id,
        ...doc.data(),
      };
      orders.push(orderData);
    });

    callback(orders);
  });
};

// Real-time listener for orders by status
export const subscribeToOrdersByStatus = (status, callback) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    callback(orders);
  });
};

// Get order analytics
export const getOrderAnalytics = async () => {
  try {
    const allOrders = await getAllOrders();

    const analytics = {
      total: allOrders.length,
      pending: allOrders.filter((order) => order.status === "pending").length,
      preparing: allOrders.filter((order) => order.status === "preparing")
        .length,
      ready: allOrders.filter((order) => order.status === "ready").length,
      delivered: allOrders.filter((order) => order.status === "delivered")
        .length,
      pickup: allOrders.filter((order) => order.type === "Pickup").length,
      delivery: allOrders.filter((order) => order.type === "Delivery").length,
      today: allOrders.filter((order) => {
        const today = new Date();
        // Handle string timestamp format from your Firebase data
        let orderDate;
        if (order.createdAt) {
          orderDate = new Date(order.createdAt);
        } else {
          orderDate = new Date();
        }

        return orderDate.toDateString() === today.toDateString();
      }).length,
    };

    return analytics;
  } catch (error) {
    console.error("Error getting analytics:", error);
    throw error;
  }
};
