export const ordersData = [
  {
    id: "order_0",
    customer: "Fawaz",
    phone: "0545817432",
    type: "Pickup",
    items: [
      {
        name: "Fufu & Palm Nut Soup",
        size: "Medium",
        quantity: 1,
        price: "GHC80",
        extras: ["Extra Meat", "Extra Spicy", "No Onions"],
      },
      {
        name: "Extra Meat",
        size: "Large",
        quantity: 1,
        price: "GHC45",
        extras: [],
      },
    ],
    total: "GHC125",
    status: "delivered",
    time: "2:30 PM",
    itemsCount: 2,
    orderDate: "Today, 2:30 PM",
    estimatedTime: "25-30 minutes",
    specialInstructions: "Extra spicy, no onions",
    paymentMethod: "Cash on Pickup",
    customerNote: "Please make it extra spicy, I love hot food!",
  },
  {
    id: "order_1",
    customer: "Janet Ayi",
    phone: "0545817432",
    type: "Delivery",
    items: [
      {
        name: "Zinger Burger",
        size: "Medium",
        quantity: 1,
        price: "GHC55",
        extras: ["Extra Cheese", "Bacon"],
      },
    ],
    total: "GHC55",
    status: "preparing",
    time: "2:15 PM",
    itemsCount: 1,
    orderDate: "Today, 2:15 PM",
    estimatedTime: "35-40 minutes",
    specialInstructions: "Extra crispy fries",
    paymentMethod: "Mobile Money",
    customerNote: "Please deliver to the back gate, I'll be waiting there",
    deliveryAddress: {
      street: "Liberation Road",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
      fullAddress: "Liberation Road, Accra, Ghana",
    },
    deliveryFee: "GHC10",
  },
  {
    id: "order_2",
    customer: "Kwame Asante",
    phone: "0201234567",
    type: "Delivery",
    items: [
      {
        name: "Jollof Rice",
        size: "Large",
        quantity: 2,
        price: "GHC40",
        extras: ["Chicken", "Plantain"],
      },
      {
        name: "Chicken Wings",
        size: "Regular",
        quantity: 1,
        price: "GHC25",
        extras: ["Hot Sauce"],
      },
    ],
    total: "GHC105",
    status: "pending",
    time: "2:00 PM",
    itemsCount: 2,
    orderDate: "Today, 2:00 PM",
    estimatedTime: "45-50 minutes",
    specialInstructions: "Extra sauce on the side",
    paymentMethod: "Cash on Delivery",
    customerNote:
      "Please call when you're 5 minutes away, I'll come down to collect",
    deliveryAddress: {
      street: "Ring Road Central",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
      fullAddress: "Ring Road Central, Accra, Ghana",
    },
    deliveryFee: "GHC15",
  },
];

import * as Crypto from "expo-crypto";

// Generate more orders for pagination testing
export const generateMoreOrders = (startId = 92, count = 50) => {
  const customers = [
    "Sarah Johnson",
    "Michael Chen",
    "Emily Rodriguez",
    "David Kim",
    "Lisa Wang",
    "James Thompson",
    "Maria Garcia",
    "Robert Lee",
    "Jennifer Davis",
    "Christopher Brown",
    "Amanda Wilson",
    "Daniel Martinez",
    "Jessica Taylor",
    "Matthew Anderson",
    "Nicole Thomas",
    "Andrew Jackson",
    "Rachel White",
    "Kevin Harris",
    "Stephanie Clark",
    "Ryan Lewis",
    "Lauren Hall",
    "Brandon Young",
    "Megan Allen",
    "Tyler King",
    "Ashley Wright",
    "Jordan Green",
    "Brittany Scott",
    "Cameron Baker",
    "Samantha Adams",
    "Nathan Nelson",
  ];

  const foodItems = [
    {
      name: "Jollof Rice",
      price: "GHC40",
      extras: ["Chicken", "Plantain", "Fish"],
    },
    {
      name: "Fufu & Palm Nut Soup",
      price: "GHC80",
      extras: ["Extra Meat", "Extra Spicy", "No Onions"],
    },
    {
      name: "Zinger Burger",
      price: "GHC55",
      extras: ["Extra Cheese", "Bacon", "Lettuce"],
    },
    {
      name: "Chicken Wings",
      price: "GHC25",
      extras: ["Hot Sauce", "BBQ Sauce", "Ranch"],
    },
    {
      name: "Pizza Margherita",
      price: "GHC65",
      extras: ["Extra Cheese", "Pepperoni", "Mushrooms"],
    },
    {
      name: "Pasta Carbonara",
      price: "GHC45",
      extras: ["Extra Bacon", "Parmesan", "Black Pepper"],
    },
    {
      name: "Grilled Salmon",
      price: "GHC90",
      extras: ["Lemon", "Herbs", "Garlic Butter"],
    },
    {
      name: "Beef Steak",
      price: "GHC120",
      extras: ["Mashed Potatoes", "Vegetables", "Gravy"],
    },
    {
      name: "Caesar Salad",
      price: "GHC35",
      extras: ["Croutons", "Parmesan", "Caesar Dressing"],
    },
    {
      name: "Chicken Curry",
      price: "GHC50",
      extras: ["Rice", "Naan Bread", "Raita"],
    },
  ];

  const statuses = ["delivered", "preparing", "pending"];
  const types = ["Pickup", "Delivery"];
  const paymentMethods = [
    "Cash on Pickup",
    "Mobile Money",
    "Cash on Delivery",
    "Card",
  ];
  const times = [
    "1:00 PM",
    "1:15 PM",
    "1:30 PM",
    "1:45 PM",
    "2:00 PM",
    "2:15 PM",
    "2:30 PM",
    "2:45 PM",
    "3:00 PM",
    "3:15 PM",
  ];
  const dates = [
    "Today",
    "Yesterday",
    "2 days ago",
    "3 days ago",
    "4 days ago",
    "5 days ago",
  ];

  const additionalOrders = [];

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    const date = dates[Math.floor(Math.random() * dates.length)];
    const paymentMethod =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const quantity = Math.floor(Math.random() * 3) + 1;
    const itemExtras = foodItem.extras.slice(
      0,
      Math.floor(Math.random() * 3) + 1
    );

    const order = {
      id: Crypto.randomUUID(),
      customer,
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      type,
      items: [
        {
          name: foodItem.name,
          size: Math.random() > 0.5 ? "Medium" : "Large",
          quantity,
          price: foodItem.price,
          extras: itemExtras,
        },
      ],
      total: foodItem.price,
      status,
      time,
      itemsCount: quantity,
      orderDate: `${date}, ${time}`,
      estimatedTime: `${Math.floor(Math.random() * 30) + 20}-${
        Math.floor(Math.random() * 30) + 35
      } minutes`,
      specialInstructions: Math.random() > 0.7 ? "Extra spicy, please" : "",
      paymentMethod,
      customerNote: Math.random() > 0.8 ? "Please call when arriving" : "",
    };

    if (type === "Delivery") {
      order.deliveryAddress = {
        street: [
          "Main Street",
          "Oak Avenue",
          "Pine Road",
          "Elm Street",
          "Cedar Lane",
        ][Math.floor(Math.random() * 5)],
        city: "Accra",
        region: "Greater Accra",
        country: "Ghana",
        fullAddress: `${
          [
            "Main Street",
            "Oak Avenue",
            "Pine Road",
            "Elm Street",
            "Cedar Lane",
          ][Math.floor(Math.random() * 5)]
        }, Accra, Ghana`,
      };
      order.deliveryFee = `GHC${Math.floor(Math.random() * 15) + 5}`;
    }

    additionalOrders.push(order);
  }

  return additionalOrders;
};

// Generate orders with simple index-based IDs
const generateOrdersWithIndexIds = () => {
  const generatedOrders = generateMoreOrders();
  // Use simple index-based IDs starting from where original orders end
  const ordersWithIds = generatedOrders.map((order, index) => ({
    ...order,
    id: `order_${index + 3}`, // Start from 3 since we have 3 original orders (0, 1, 2)
  }));
  return ordersWithIds;
};

// Combine original orders with generated ones
export const allOrdersData = [...ordersData, ...generateOrdersWithIndexIds()];
