
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
  marketPrice?: number;
  govPrice?: number;
  isBlack?: boolean;
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

// Add types for notification items needed in MainLayout
export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'read' | 'unread';
  type: 'bill' | 'payment' | 'reminder' | 'alert' | 'expense' | 'warning' | 'info' | 'success' | 'error';
  actionLabel?: string;
  actionUrl?: string;
  read?: boolean; // Added to support MainLayout component
  action?: {
    label: string;
    url: string;
  }; // Added to support MainLayout component
}

// Add types for AI search results needed in MainLayout
export interface AISearchResult {
  type?: 'client' | 'layout' | 'plot' | 'expense' | 'bill';
  id?: number;
  name?: string;
  description?: string;
  matchScore?: number;
  results?: Array<{
    id: number;
    title: string;
    description: string;
    url: string;
  }>;
  totalMatches?: number;
  query?: string;
  suggestion?: string;
}

// Add backup types
export type BackupType = 'local' | 'external' | 'cloud';
export type BackupStatus = 'success' | 'warning' | 'error';

export interface BackupLog {
  id: number;
  date: string;
  time: string;
  type: BackupType;
  status: BackupStatus;
  size: string;
  user: string;
}
