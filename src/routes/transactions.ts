import express, { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Budget from '../models/Budget';
import { authenticateToken } from '../middleware/auth';
import { DashboardStats } from '../types';
import { AuthRequest } from '../types';
const router = express.Router();

// interface AuthRequest extends Request {
//   user?: any;
// }

// Get all Transactions for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .limit(100);
    
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Get paginated Transactions with filters
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
        }
      };
    } else if (startDate) {
      dateFilter = {
        date: { $gte: new Date(startDate as string) }
      };
    } else if (endDate) {
      dateFilter = {
        date: { $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999)) }
      };
    }

    // Build query
    const query = {
      userId: req.user.userId,
      ...dateFilter
    };

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Get Transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Create transaction
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  // console.log('Creating transaction:', req);
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.userId
    };
    // console.log('Transaction data:', transactionData);
    const transaction = new Transaction(transactionData);
    // console.log('New transaction:', transaction);
    await transaction.save();
    // console.log('Transaction saved:', transaction);

    // Update budget currentSpent
    const month = new Date(transaction.date).toISOString().slice(0, 7); // "2024-01"
    const year = new Date(transaction.date).getFullYear();

    await Budget.findOneAndUpdate(
      { 
        userId: req.user.userId, 
        category: transaction.category, 
        month: month 
      },
      { 
        $inc: { currentSpent: transaction.amount },
        year: year
      },
      { upsert: true }
    );

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update Transaction
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});



// Get paginated Transactions with filters
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
        }
      };
    } else if (startDate) {
      dateFilter = {
        date: { $gte: new Date(startDate as string) }
      };
    } else if (endDate) {
      dateFilter = {
        date: { $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999)) }
      };
    }

    // Build query
    const query = {
      userId: req.user.userId,
      ...dateFilter
    };

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Get Transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});




// // Dashboard data
// router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response<DashboardStats>): Promise<void> => {
//   try {
//     const currentMonth = new Date().toISOString().slice(0, 7);
    
//     // Get current month Transactions
//     const transactions = await Transaction.find({
//       userId: req.user.userId,
//       date: {
//         $gte: new Date(currentMonth + '-01'),
//         $lte: new Date(new Date(currentMonth + '-01').getFullYear(), new Date(currentMonth + '-01').getMonth() + 1, 0)
//       }
//     });

//     // Calculate stats
//     // TODO : only pick those with expense type
//     const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

//     const categoryTotals: { [key: string]: number } = {};
//     const paymentMethodCounts: { [key: string]: number } = {};

//     transactions.forEach(transaction => {
//       categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
//       paymentMethodCounts[transaction.paymentMethod] = (paymentMethodCounts[transaction.paymentMethod] || 0) + 1;
//     });

//     const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
//       categoryTotals[a] > categoryTotals[b] ? a : b, ''
//     );

//     const topPaymentMethods = Object.keys(paymentMethodCounts)
//       .sort((a, b) => paymentMethodCounts[b] - paymentMethodCounts[a]);

//     // Get last 6 months data
//     const monthlyData = [];
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date();
//       date.setMonth(date.getMonth() - i);
//       const monthStr = date.toISOString().slice(0, 7);
      
//       const monthTransactions = await Transaction.find({
//         userId: req.user.userId,
//         date: {
//           $gte: new Date(monthStr + '-01'),
//           $lte: new Date(date.getFullYear(), date.getMonth() + 1, 0)
//         }
//       });

//       monthlyData.push({
//         month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
//         amount: monthTransactions.reduce((sum, Transaction) => sum + Transaction.amount, 0)
//       });
//     }

//     res.json({
//       totalSpent,
//       topCategory,
//       topPaymentMethods,
//       categoryData: categoryTotals,
//       monthlyData
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message } as any);
//   }
// });

// Dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response<DashboardStats>): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const startOfMonth = new Date(currentMonth + '-01');
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    
    // Get current month transactions
    const currentMonthTransactions = await Transaction.find({
      userId: req.user.userId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Separate income and expenses
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense' || !t.type); // fallback for old data without type
    const income = currentMonthTransactions.filter(t => t.type === 'income');

    // Calculate stats
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const netAmount = totalIncome - totalSpent;

    // Category analysis (separate for income and expenses)
    const expenseCategoryTotals: { [key: string]: number } = {};
    const incomeCategoryTotals: { [key: string]: number } = {};
    const paymentMethodCounts: { [key: string]: number } = {};

    expenses.forEach(expense => {
      expenseCategoryTotals[expense.category] = (expenseCategoryTotals[expense.category] || 0) + expense.amount;
      paymentMethodCounts[expense.paymentMethod] = (paymentMethodCounts[expense.paymentMethod] || 0) + 1;
    });

    income.forEach(inc => {
      incomeCategoryTotals[inc.category] = (incomeCategoryTotals[inc.category] || 0) + inc.amount;
      paymentMethodCounts[inc.paymentMethod] = (paymentMethodCounts[inc.paymentMethod] || 0) + 1;
    });

    // Find top categories
    const topExpenseCategory = Object.keys(expenseCategoryTotals).length > 0 
      ? Object.keys(expenseCategoryTotals).reduce((a, b) => 
          expenseCategoryTotals[a] > expenseCategoryTotals[b] ? a : b
        ) 
      : '';

    const topIncomeCategory = Object.keys(incomeCategoryTotals).length > 0
      ? Object.keys(incomeCategoryTotals).reduce((a, b) => 
          incomeCategoryTotals[a] > incomeCategoryTotals[b] ? a : b
        )
      : '';

    // Top payment methods sorted by usage
    const topPaymentMethods = Object.keys(paymentMethodCounts)
      .sort((a, b) => paymentMethodCounts[b] - paymentMethodCounts[a])
      .slice(0, 5); // Get top 5 payment methods

    // Get last 6 months data with income/expense breakdown
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const monthStart = new Date(monthStr + '-01');
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthTransactions = await Transaction.find({
        userId: req.user.userId,
        date: {
          $gte: monthStart,
          $lte: monthEnd
        }
      });

      const monthExpenses = monthTransactions.filter(t => t.type === 'expense' || !t.type);
      const monthIncome = monthTransactions.filter(t => t.type === 'income');

      const expenseAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const incomeAmount = monthIncome.reduce((sum, income) => sum + income.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        expenses: expenseAmount,
        income: incomeAmount,
        net: incomeAmount - expenseAmount,
        // Legacy field for backward compatibility
        amount: expenseAmount
      });
    }

    // Additional insights
    const transactionCounts = {
      totalTransactions: currentMonthTransactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length
    };

    // Average transaction amounts
    const averages = {
      avgExpense: expenses.length > 0 ? totalSpent / expenses.length : 0,
      avgIncome: income.length > 0 ? totalIncome / income.length : 0
    };

    // Savings rate (if there's income)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    res.json({
      // Current month summary
      totalSpent,
      totalIncome,
      netAmount,
      savingsRate: Math.round(savingsRate * 100) / 100, // Round to 2 decimal places
      
      // Category insights
      topExpenseCategory,
      topIncomeCategory,
      expenseCategoryData: expenseCategoryTotals,
      incomeCategoryData: incomeCategoryTotals,
      
      // Payment methods
      topPaymentMethods,
      paymentMethodData: paymentMethodCounts,
      
      // Historical data
      monthlyData,
      
      // Transaction counts and averages
      ...transactionCounts,
      ...averages,
      
      // Legacy fields for backward compatibility
      topCategory: topExpenseCategory,
      categoryData: expenseCategoryTotals
    });

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ message: error.message } as any);
  }
});
export default router;