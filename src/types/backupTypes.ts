
export enum BackupType {
  LOCAL = "local",
  CLOUD = "cloud",
  FULL = "full",
  INCREMENTAL = "incremental",
  DIFFERENTIAL = "differential",
  SNAPSHOT = "snapshot",
  EXTERNAL = "external"
}

export enum BackupStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  IN_PROGRESS = "in_progress",
  SCHEDULED = "scheduled",
  PENDING = "pending"
}

export interface BackupLog {
  id: number;
  date: string;
  time: string;
  type: BackupType;
  status: BackupStatus;
  size: string;
  user: string;
}

export interface BackupConfig {
  autoBackup: boolean;
  frequency: string;
  retention: number;
  destination: string;
}

// Add notification and AI search types needed by MainLayout
export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'bill' | 'payment' | 'reminder' | 'alert' | 'warning' | 'info' | 'success' | 'error' | 'expense';
  action?: {
    label: string;
    url: string;
  };
}

export interface AISearchResult {
  query?: string;
  results?: Array<{
    type: string;
    count: number;
    items?: Array<any>;
  }>;
  suggestion?: string;
  totalMatches?: number;
}
