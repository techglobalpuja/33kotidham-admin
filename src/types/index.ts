// Common types used across the application

export interface PujaCard {
  id: string;
  image: string;
  title: string;
  temple: string;
  description: string;
  date: string;
  isNew?: boolean;
  timer?: boolean;
  shareLabel?: string;
}

export interface HoroscopeCard {
  id: string;
  icon: string;
  name: string;
  dateRange: string;
}

export interface ProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  location: string;
  datetime: string;
  isHighlighted?: boolean;
  imageSrc?: string;
}

export interface Testimonial {
  id: string;
  avatar: string;
  name: string;
  role: string;
  rating: string;
  testimonial: string;
}

export interface Article {
  id: string;
  image: string;
  date: string;
  author: string;
  comments: string;
  title: string;
  excerpt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  isAuthenticated?: boolean;
  // OAuth2 token fields
  access_token?: string;
  token_type?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isLoginModalOpen: boolean;
  isMobileMenuOpen: boolean;
  isLoading: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  totalPujas: number;
  totalEarnings: number;
  totalOrders: number;
  monthlyGrowth: {
    users: number;
    pujas: number;
    earnings: number;
    orders: number;
  };
}

export interface PujaFormData {
  // Puja Section
  pujaName: string;
  subHeading: string;
  about: string;
  date: string;
  time: string;
  pujaImages: string[];
  
  // Temple Section
  templeImage: string;
  templeAddress: string;
  templeDescription: string;
  
  // Puja Benefits (4 benefits with titles and descriptions)
  benefits: {
    title: string;
    description: string;
  }[];
  
  // Plan Details
  selectedPlanIds: string[]; // Changed to array for multi-select
  
  // Prasad
  prasadPrice: number;
  prasadStatus: boolean;
  
  // Dakshina
  dakshinaPrices: string; // Changed to string for comma-separated values
  dakshinaPricesUSD: string; // Changed to string for comma-separated values
  dakshinaStatus: boolean;
  
  // Manokamna Parchi
  manokamanaPrices: string; // Changed to string for comma-separated values
  manokamanaPricesUSD: string; // Changed to string for comma-separated values
  manokamnaStatus: boolean;
  
  // General
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface ChawadaItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  quantity: number;
}

export interface ChawadaFormData {
  name: string;
  price: number;
  image: string;
  description: string;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  price: number;
  image: string;
  description: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  quantity: number;
  isActive: boolean;
  createdDate: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
}

export interface ContentUpload {
  id: string;
  title: string;
  type: 'video' | 'image' | 'document' | 'certificate';
  url: string;
  category: string;
  uploadDate: string;
  size: string;
}

export interface PlanFormData {
  name: string;
  price: number;
  image: string;
  category: 'Normal' | 'VIP';
  description: {
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
  };
  isActive: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'Normal' | 'VIP';
  description: {
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
  };
  isActive: boolean;
  createdDate: string;
}

// User Dashboard Types
export interface UserPuja {
  id: string;
  title: string;
  temple: string;
  date: string;
  time: string;
  status: 'completed' | 'upcoming' | 'processing';
  amount: number;
  image: string;
  videoUrl?: string;
  certificateUrl?: string;
}

// Complete Puja Details Interface
export interface Puja {
  id: string;
  pujaName: string;
  subHeading: string;
  about: string;
  date: string;
  time: string;
  pujaImages: string[];
  templeImage: string;
  templeAddress: string;
  templeDescription: string;
  benefits: {
    title: string;
    description: string;
  }[];
  selectedPlanIds: string[];
  prasadPrice: number;
  prasadStatus: boolean;
  dakshinaPrices: string;
  dakshinaPricesUSD: string;
  dakshinaStatus: boolean;
  manokamanaPrices: string;
  manokamanaPricesUSD: string;
  manokamnaStatus: boolean;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  createdDate: string;
  selectedPlans?: Plan[]; // Populated plans data
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  trackingNumber?: string;
}

export interface UserProfile {
  personalInfo: {
    name: string;
    email: string;
    mobile: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  spiritualInfo: {
    favoriteDeities: string[];
    birthTime?: string;
    birthPlace?: string;
    gotra?: string;
  };
}