
export enum BackupType {
  FULL = "full",
  INCREMENTAL = "incremental",
  DIFFERENTIAL = "differential",
  SNAPSHOT = "snapshot",
  LOCAL = "local",
  EXTERNAL = "external", 
  CLOUD = "cloud"
}

export enum BackupStatus {
  COMPLETED = "completed",
  PENDING = "pending",
  FAILED = "failed",
  IN_PROGRESS = "in-progress"
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

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  action?: {
    label: string;
    url?: string;
  };
}

export interface AISearchResult {
  query: string;
  results: {
    type: 'client' | 'layout' | 'expense' | 'bill' | 'plot';
    count: number;
    items?: any[];
  }[];
  suggestion?: string;
  totalMatches: number;
}
