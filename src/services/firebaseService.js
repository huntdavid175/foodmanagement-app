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
// Categories collection reference
const CATEGORIES_COLLECTION = "categories";
// Menu Items collection reference
const MENU_ITEMS_COLLECTION = "menuItems";

// Helper: sort categories by sortOrder (nulls last), then name asc
const sortCategoriesClientSide = (categories) => {
  return [...categories].sort((a, b) => {
    const aOrder = a.sortOrder;
    const bOrder = b.sortOrder;
    const aIsNull = aOrder === null || aOrder === undefined;
    const bIsNull = bOrder === null || bOrder === undefined;

    if (aIsNull && bIsNull) {
      // Both null: fallback to name
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      return aName.localeCompare(bName);
    }
    if (aIsNull) return 1; // a after b
    if (bIsNull) return -1; // a before b
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aName = (a.name || "").toLowerCase();
    const bName = (b.name || "").toLowerCase();
    return aName.localeCompare(bName);
  });
};

// Real-time listener for categories
export const subscribeToCategories = (callback) => {
  const q = query(collection(db, CATEGORIES_COLLECTION));
  return onSnapshot(q, (querySnapshot) => {
    const categories = [];
    querySnapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(sortCategoriesClientSide(categories));
  });
};

// One-time fetch of categories
export const getCategories = async () => {
  const q = query(collection(db, CATEGORIES_COLLECTION));
  const querySnapshot = await getDocs(q);
  const categories = [];
  querySnapshot.forEach((docSnap) => {
    categories.push({ id: docSnap.id, ...docSnap.data() });
  });
  return sortCategoriesClientSide(categories);
};

// Add a new category
export const addCategory = async (categoryData) => {
  const payload = {
    name: categoryData.name || "",
    description: categoryData.description ?? "",
    color: categoryData.color || "#FF6B6B",
    active: categoryData.active ?? true,
    sortOrder: categoryData.sortOrder ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), payload);
  return docRef.id;
};

// Update category
export const updateCategory = async (categoryId, updates) => {
  const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  await updateDoc(categoryRef, { ...updates, updatedAt: serverTimestamp() });
};

// ===================== MENU ITEMS =====================
export const subscribeToMenuItems = (callback) => {
  const q = query(
    collection(db, MENU_ITEMS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const items = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(items);
  });
};

export const getMenuItems = async () => {
  const q = query(
    collection(db, MENU_ITEMS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  const items = [];
  querySnapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...docSnap.data() });
  });
  return items;
};

export const addMenuItem = async (menuItemData) => {
  const payload = {
    name: menuItemData.name || "",
    image: menuItemData.image || "",
    price: typeof menuItemData.price === "number" ? menuItemData.price : 0,
    description: menuItemData.description ?? "",
    available: menuItemData.available ?? true,
    category: menuItemData.category || "",
    sizes: Array.isArray(menuItemData.sizes) ? menuItemData.sizes : [],
    extras: Array.isArray(menuItemData.extras) ? menuItemData.extras : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, MENU_ITEMS_COLLECTION), payload);
  return docRef.id;
};

export const updateMenuItem = async (menuItemId, updates) => {
  const itemRef = doc(db, MENU_ITEMS_COLLECTION, menuItemId);
  await updateDoc(itemRef, { ...updates, updatedAt: serverTimestamp() });
};

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
