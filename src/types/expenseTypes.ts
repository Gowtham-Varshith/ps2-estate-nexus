
export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface Expense {
  id: number;
  description: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  notes?: string;
  paymentMode?: string;
  attachments?: string[];
  layoutId?: number;
  layoutName?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
}

export interface ExpenseFilterOptions {
  startDate?: string;
  endDate?: string;
  category?: string[];
  vendor?: string[];
  minAmount?: number;
  maxAmount?: number;
  layout?: string[];
  status?: string[];
}
