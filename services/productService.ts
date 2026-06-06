import { Product } from "@/context/AppContext";

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Quantum Sound Wireless Headphones",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.8,
    ratingCount: 142,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    category: "electronics",
    description: "Experience music like never before with Smart Stock's flagship wireless headphones. Features hybrid active noise cancellation, 40-hour battery life, and spatial audio technology for an immersive listening session.",
    inStock: true,
    stockCount: 18,
    colors: ["Obsidian Black", "Arctic White", "Midnight Blue"],
    specifications: {
      "Driver Size": "40mm Dynamic",
      "Frequency Response": "20Hz - 20kHz",
      "Connectivity": "Bluetooth 5.2 & 3.5mm Aux",
      "Battery Life": "Up to 40 Hours (ANC On)",
      "Charging Port": "USB Type-C",
      "Weight": "250g"
    },
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: "prod-2",
    name: "AeroTrack GPS Smartwatch",
    price: 249.99,
    rating: 4.6,
    ratingCount: 98,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80"
    ],
    category: "accessories",
    description: "Track your health and navigate your runs with the AeroTrack GPS Smartwatch. Features 24/7 heart rate monitoring, advanced sleep analysis, and built-in offline maps. Water resistant up to 50 meters.",
    inStock: true,
    stockCount: 12,
    colors: ["Slate Gray", "Rose Gold", "Alpine Green"],
    specifications: {
      "Display": "1.4-inch AMOLED Touchscreen",
      "Water Resistance": "5 ATM (50 meters)",
      "Battery Life": "Up to 10 days (Smartwatch mode)",
      "Sensors": "Heart Rate, SpO2, GPS, Gyroscope",
      "Compatibility": "iOS & Android"
    },
    isFeatured: true,
    isLatest: true
  },
  {
    id: "prod-3",
    name: "Classic Leather Minimalist Watch",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.4,
    ratingCount: 56,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80"
    ],
    category: "accessories",
    description: "A timeless accessory for any occasion. Made with premium genuine leather straps, stainless steel casing, and scratch-resistant sapphire glass. Water-resistant up to 30 meters.",
    inStock: true,
    stockCount: 25,
    colors: ["Chestnut Brown", "Midnight Black"],
    specifications: {
      "Case Material": "316L Stainless Steel",
      "Strap Material": "Genuine Italian Leather",
      "Movement": "Japanese Quartz",
      "Dial Diameter": "40mm",
      "Water Resistance": "3 ATM"
    },
    isBestSeller: true
  },
  {
    id: "prod-4",
    name: "Premium Leather Card Wallet",
    price: 45.00,
    rating: 4.7,
    ratingCount: 212,
    image: "https://images.unsplash.com/photo-1627124765135-5652a9ae9993?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1627124765135-5652a9ae9993?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1627124766137-b05249337b51?w=800&auto=format&fit=crop&q=80"
    ],
    category: "fashion",
    description: "Sleek and compact, this card wallet holds up to 8 cards and folded bills. Handcrafted from vegetable-tanned leather that develops a beautiful patina over time. Equipped with RFID blocking layers.",
    inStock: true,
    stockCount: 40,
    colors: ["Cognac", "Espresso", "Classic Black"],
    specifications: {
      "Material": "Full-Grain Vegetable-Tanned Leather",
      "Capacity": "8 Cards + Cash Pocket",
      "Dimensions": "10.5cm x 7.8cm x 0.5cm",
      "RFID Protection": "Yes"
    },
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: "prod-5",
    name: "Ergonomic Office Chair",
    price: 349.99,
    originalPrice: 429.99,
    rating: 4.5,
    ratingCount: 74,
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80"
    ],
    category: "home-living",
    description: "Designed for long hours of comfort, this chair features mesh back ventilation, adjustable 3D armrests, dynamic lumbar support, and smooth silent casters. Maximize your workspace productivity.",
    inStock: true,
    stockCount: 6,
    colors: ["Tech Black", "Cool Gray"],
    specifications: {
      "Back Type": "High-Density Breathable Mesh",
      "Base": "Reinforced Aluminum Frame",
      "Recline": "90° - 135° with Tilt Lock",
      "Weight Capacity": "Up to 300 lbs",
      "Assembly Required": "Yes"
    },
    isLatest: true
  },
  {
    id: "prod-6",
    name: "Stainless Steel Thermal Bottle",
    price: 29.99,
    rating: 4.9,
    ratingCount: 380,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589362489871-33230a1bf64c?w=800&auto=format&fit=crop&q=80"
    ],
    category: "fitness",
    description: "Stay hydrated throughout your active day. Double-walled vacuum insulation keeps cold drinks ice-cold for 24 hours, or hot beverages warm for 12 hours. Sweat-free exterior powder coat finish.",
    inStock: true,
    stockCount: 150,
    colors: ["Navy Blue", "Forest Green", "Stellar Black"],
    specifications: {
      "Capacity": "32 oz (950ml)",
      "Material": "18/8 Pro-Grade Stainless Steel",
      "BPA Free": "Yes",
      "Temp Retention": "24h Cold / 12h Hot",
      "Leakproof": "Yes (Straw Lid Included)"
    },
    isFeatured: true,
    isBestSeller: true
  },
  {
    id: "prod-7",
    name: "Urban Explorer Backpack",
    price: 79.99,
    rating: 4.3,
    ratingCount: 47,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1575844019799-2c97692a8b3d?w=800&auto=format&fit=crop&q=80"
    ],
    category: "fashion",
    description: "The ultimate bag for commuters and weekend travelers. Featuring a padded 16-inch laptop compartment, weather-resistant fabric, and intelligent organizational compartments for your everyday accessories.",
    inStock: true,
    stockCount: 15,
    colors: ["Charcoal Grey", "Olive Green"],
    specifications: {
      "Capacity": "24 Liters",
      "Material": "Water-Repellent 900D Nylon",
      "Laptop Pocket": "Fits up to 16\" MacBook",
      "Dimensions": "48cm x 30cm x 15cm"
    },
    isLatest: true
  },
  {
    id: "prod-8",
    name: "Premium Ceramic Coffee Dripper",
    price: 34.50,
    rating: 4.8,
    ratingCount: 63,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
    ],
    category: "home-living",
    description: "Brew café-quality pour-over coffee at home with this beautiful, high-quality ceramic coffee dripper. Ribbed interior walls promote optimal water flow for balanced extraction.",
    inStock: true,
    stockCount: 30,
    colors: ["Glossy White", "Matte Black"],
    specifications: {
      "Material": "High-Fire Japanese Ceramic",
      "Capacity": "1-4 Cups",
      "Filter Compatibility": "V60 Size 02 Paper Filters",
      "Dishwasher Safe": "Yes"
    },
    isLatest: true
  },
  {
    id: "prod-9",
    name: "Wireless Multi-Device Keyboard",
    price: 99.00,
    originalPrice: 129.00,
    rating: 4.5,
    ratingCount: 110,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
    ],
    category: "electronics",
    description: "Boost your multitasking efficiency. Connect to up to three devices via Bluetooth or 2.4 GHz receiver, and toggle between typing on your laptop, phone, and tablet with a single keypress.",
    inStock: false,
    stockCount: 0,
    colors: ["Space Gray", "Pearl White"],
    specifications: {
      "Keys Layout": "Full-size with Numpad",
      "Connectivity": "Bluetooth 5.0 & USB 2.4GHz Dongle",
      "Key Switches": "Scissor keys (Low-profile)",
      "Battery Type": "Rechargeable USB-C (Up to 5 months)",
      "Operating System": "Windows, macOS, ChromeOS, iPadOS"
    },
    isFeatured: false
  },
  {
    id: "prod-10",
    name: "Ultra-Grip Yoga Mat",
    price: 55.00,
    rating: 4.7,
    ratingCount: 125,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80"
    ],
    category: "fitness",
    description: "Designed for premium stability during your practice. Eco-friendly natural rubber base provides non-slip traction even during intense sweat sessions. Features laser-engraved alignment lines.",
    inStock: true,
    stockCount: 22,
    colors: ["Deep Teal", "Sunset Violet"],
    specifications: {
      "Material": "Eco-Friendly Polyurethane & Natural Rubber",
      "Thickness": "4.5mm Cushioning",
      "Dimensions": "180cm x 66cm",
      "Weight": "2.8kg",
      "PVC Free": "Yes"
    },
    isBestSeller: true
  }
];

export const productService = {
  getAllProducts: (): Product[] => {
    return mockProducts;
  },

  getProductById: (id: string): Product | undefined => {
    return mockProducts.find((p) => p.id === id);
  },

  getProductsByCategory: (category: string): Product[] => {
    return mockProducts.filter((p) => p.category === category);
  },

  getFeaturedProducts: (): Product[] => {
    return mockProducts.filter((p) => p.isFeatured);
  },

  getBestSellers: (): Product[] => {
    return mockProducts.filter((p) => p.isBestSeller);
  },

  getLatestProducts: (): Product[] => {
    return mockProducts.filter((p) => p.isLatest);
  },

  searchProducts: (query: string): Product[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
};
