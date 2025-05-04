
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

// Add missing types referenced in errors
export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'read' | 'unread';
  type: 'bill' | 'payment' | 'reminder' | 'alert';
  actionLabel?: string;
}

export interface AISearchResult {
  type: 'client' | 'layout' | 'plot' | 'expense' | 'bill';
  id: number;
  name: string;
  description: string;
  matchScore: number;
}
