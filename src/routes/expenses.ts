import express, { Request, Response } from 'express';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import { authenticateToken } from '../middleware/auth';
import { DashboardStats } from '../types';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get all expenses for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(100);
    
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Get paginated expenses with filters
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
      userId: req.user._id,
      ...dateFilter
    };

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      expenses,
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


// Create expense
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user._id
    };

    const expense = new Expense(expenseData);
    await expense.save();

    // Update budget currentSpent
    const month = new Date(expense.date).toISOString().slice(0, 7); // "2024-01"
    const year = new Date(expense.date).getFullYear();

    await Budget.findOneAndUpdate(
      { 
        userId: req.user._id, 
        category: expense.category, 
        month: month 
      },
      { 
        $inc: { currentSpent: expense.amount },
        year: year
      },
      { upsert: true }
    );

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});



// Get paginated expenses with filters
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
      userId: req.user._id,
      ...dateFilter
    };

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      expenses,
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




// Dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response<DashboardStats>): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get current month expenses
    const expenses = await Expense.find({
      userId: req.user._id,
      date: {
        $gte: new Date(currentMonth + '-01'),
        $lte: new Date(new Date(currentMonth + '-01').getFullYear(), new Date(currentMonth + '-01').getMonth() + 1, 0)
      }
    });

    // Calculate stats
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryTotals: { [key: string]: number } = {};
    const paymentMethodCounts: { [key: string]: number } = {};

    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      paymentMethodCounts[expense.paymentMethod] = (paymentMethodCounts[expense.paymentMethod] || 0) + 1;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, ''
    );

    const topPaymentMethods = Object.keys(paymentMethodCounts)
      .sort((a, b) => paymentMethodCounts[b] - paymentMethodCounts[a]);

    // Get last 6 months data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      const monthExpenses = await Expense.find({
        userId: req.user._id,
        date: {
          $gte: new Date(monthStr + '-01'),
          $lte: new Date(date.getFullYear(), date.getMonth() + 1, 0)
        }
      });

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      });
    }

    res.json({
      totalSpent,
      topCategory,
      topPaymentMethods,
      categoryData: categoryTotals,
      monthlyData
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message } as any);
  }
});


export default router;