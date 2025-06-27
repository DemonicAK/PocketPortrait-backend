import express, { Request, Response } from 'express';
import Budget from '../models/Budget';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get budgets for current month
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const budgets = await Budget.find({
      userId: req.user._id,
      month: currentMonth
    });

    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update budget
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, limitAmount } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month: currentMonth
      },
      {
        limitAmount,
        year: currentYear
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json(budget);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get budget alerts
router.get('/alerts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const budgets = await Budget.find({
      userId: req.user._id,
      month: currentMonth
    });

    const alerts = budgets.filter(budget => {
      const percentage = (budget.currentSpent / budget.limitAmount) * 100;
      return percentage >= 80;
    }).map(budget => ({
      category: budget.category,
      percentage: Math.round((budget.currentSpent / budget.limitAmount) * 100),
      spent: budget.currentSpent,
      limit: budget.limitAmount,
      severity: budget.currentSpent >= budget.limitAmount ? 'high' : 'medium'
    }));

    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;