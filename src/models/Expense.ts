import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types';

const ExpenseSchema = new Schema<IExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Rent', 'Shopping', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);