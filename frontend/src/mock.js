// Mock data for Happy Drives car rental website

export const cars = [
  {
    id: 1,
    name: "Porsche 911",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1580679568899-be51739ba2df?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    pricePerDay: 8999,
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    featured: true
  },
  {
    id: 2,
    name: "Mercedes Benz S-Class",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    pricePerDay: 5999,
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    featured: true
  },
  {
    id: 3,
    name: "Mercedes Coupe",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    pricePerDay: 6999,
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 4,
    featured: false
  },
  {
    id: 4,
    name: "Porsche Cayenne",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1532988633349-d3dfb28ee834?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    pricePerDay: 7999,
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    featured: true
  },
  {
    id: 5,
    name: "Premium Sedan",
    category: "Sedan",
    image: "https://images.pexels.com/photos/33987626/pexels-photo-33987626.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    pricePerDay: 4999,
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    featured: false
  },
  {
    id: 6,
    name: "Audi R8",
    category: "Sports",
    image: "https://images.pexels.com/photos/33987617/pexels-photo-33987617.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    pricePerDay: 9999,
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 2,
    featured: false
  }
];

export const packages = [
  {
    id: 1,
    title: "Mountain Adventure",
    destination: "Himalayas",
    duration: "5 Days / 4 Nights",
    price: 45999,
    image: "https://images.unsplash.com/photo-1607970461177-efa3ae2ba986",
    inclusions: ["Luxury Car", "Professional Driver", "Fuel", "Accommodation", "Breakfast"],
    description: "Experience the majestic Himalayas with our premium mountain adventure package."
  },
  {
    id: 2,
    title: "Misty Roads",
    destination: "Hill Stations",
    duration: "3 Days / 2 Nights",
    price: 29999,
    image: "https://images.unsplash.com/photo-1755441171969-85fc6bb8ab85",
    inclusions: ["Self-Drive Car", "Fuel", "Accommodation", "Breakfast"],
    description: "Drive through misty mountain roads and discover serene hill stations."
  },
  {
    id: 3,
    title: "Coastal Paradise",
    destination: "Goa Beaches",
    duration: "4 Days / 3 Nights",
    price: 35999,
    image: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd",
    inclusions: ["Luxury Car", "Driver Available", "Fuel", "Beach Resort", "All Meals"],
    description: "Relax on pristine beaches and explore the vibrant coastal culture."
  },
  {
    id: 4,
    title: "Heritage Explorer",
    destination: "Rajasthan",
    duration: "7 Days / 6 Nights",
    price: 65999,
    image: "https://images.unsplash.com/photo-1525849306000-cc26ceb5c1d7",
    inclusions: ["Premium SUV", "Professional Driver", "Fuel", "Heritage Hotels", "All Meals", "Guide"],
    description: "Discover royal palaces and vibrant culture of incredible Rajasthan."
  }
];

export const driverServices = {
  standardRate: 1000,
  premiumRate: 1500,
  features: [
    "Professional & Experienced Drivers",
    "Verified Background Check",
    "Local Area Expertise",
    "Safe & Courteous Service",
    "Available 24/7",
    "Multi-language Support"
  ]
};

export const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    rating: 5,
    comment: "Excellent service! The car was in pristine condition and the booking process was seamless.",
    date: "2024-12-15"
  },
  {
    id: 2,
    name: "Priya Sharma",
    rating: 5,
    comment: "Best car rental experience. The driver was professional and the trip was memorable.",
    date: "2024-12-10"
  },
  {
    id: 3,
    name: "Amit Patel",
    rating: 5,
    comment: "Great service and competitive prices. Highly recommend Happy Drives for self-drive cars.",
    date: "2024-12-05"
  }
];

export const faqs = [
  {
    id: 1,
    question: "What documents are required for self-drive car rental?",
    answer: "You need a valid driving license (minimum 1 year old), Aadhar card, and a security deposit."
  },
  {
    id: 2,
    question: "Is fuel included in the rental price?",
    answer: "No, fuel is not included in self-drive rentals. The car will be provided with full tank and should be returned with full tank."
  },
  {
    id: 3,
    question: "What are the charges for hiring a driver?",
    answer: "Standard driver charges are ₹1,000 per day and premium experienced drivers are ₹1,500 per day."
  },
  {
    id: 4,
    question: "Can I cancel my booking?",
    answer: "Yes, you can cancel up to 24 hours before pickup for a full refund. Cancellations within 24 hours will incur a 30% charge."
  },
  {
    id: 5,
    question: "Are package trips customizable?",
    answer: "Yes! We offer custom package trips. Contact us with your requirements and we'll create a personalized itinerary."
  },
  {
    id: 6,
    question: "What is the minimum rental period?",
    answer: "The minimum rental period is 24 hours for self-drive cars. For driver services and packages, it varies by selection."
  }
];

export const aboutUs = {
  mission: "To provide seamless, safe, and luxurious self-drive car rental experiences that empower our customers to explore India with complete freedom and confidence.",
  vision: "To become India's most trusted and preferred car rental partner, known for exceptional service, premium vehicles, and unforgettable travel experiences.",
  values: [
    "Customer First",
    "Safety & Reliability",
    "Transparency",
    "Innovation",
    "Excellence"
  ],
  stats: {
    happyCustomers: "10,000+",
    carsAvailable: "150+",
    citiesCovered: "25+",
    yearsExperience: "8+"
  }
};
