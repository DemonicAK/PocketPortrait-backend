import mongoose, { Schema } from 'mongoose';
import { IBudget } from '../types';

const BudgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Rent', 'Shopping', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  },
  limitAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  month: {
    type: String,
    required: true // Format: "2024-01"
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique budget per user/category/month
BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);