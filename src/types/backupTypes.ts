
export enum BackupType {
  LOCAL = "local",
  CLOUD = "cloud",
  FULL = "full",
  INCREMENTAL = "incremental"
}

export enum BackupStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  IN_PROGRESS = "in_progress",
  SCHEDULED = "scheduled"
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
