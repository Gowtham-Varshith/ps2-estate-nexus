
export enum BackupType {
  FULL = "full",
  INCREMENTAL = "incremental",
  DIFFERENTIAL = "differential",
  SNAPSHOT = "snapshot"
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
