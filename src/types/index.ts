import { Document, ObjectId } from 'mongoose';

// MongoDB Interfaces
export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense extends Document {
  _id: ObjectId;
  userId: ObjectId;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget extends Document {
  _id: ObjectId;
  userId: ObjectId;
  category: string;
  limitAmount: number;
  currentSpent: number;
  month: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// PostgreSQL Interfaces
export interface MonthlyReport {
  id?: number;
  user_id: string;
  month: number;
  year: number;
  total_spent: number;
  top_category?: string;
  overbudget_categories?: string[];
  category_breakdown?: { [key: string]: number };
  payment_method_stats?: { [key: string]: number };
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSummary {
  id?: number;
  user_id: string;
  total_lifetime_spent: number;
  most_used_category?: string;
  most_used_payment_method?: string;
  last_updated?: Date;
}

// API Interfaces
export interface AuthRequest {
  email: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface DashboardStats {
  totalSpent: number;
  topCategory: string;
  topPaymentMethods: string[];
  categoryData: { [key: string]: number };
  monthlyData: { month: string; amount: number }[];
}