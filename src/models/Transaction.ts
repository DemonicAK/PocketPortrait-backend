import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../types';

const TransactionSchema = new Schema<ITransaction>({
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
  from: {
    type: String,
    trim: true
  },
  to: {
    type: String,
    trim: true
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
  secondpartyId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true,
    // enum: ['Food', 'Rent', 'Shopping', 'Transport', 'Entertainment', 'Healthcare', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other'],
  },
  notes: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  },
  tags: [{
    type: String,
    trim: true
  }],
  recurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  secondpartyType: {
    type: String,
    enum: ['individual', 'business']
  }
}, {
  timestamps: true
});

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ recurring: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);