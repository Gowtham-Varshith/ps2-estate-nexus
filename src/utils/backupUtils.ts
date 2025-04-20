
import { BackupType, BackupStatus } from "@/types/backupTypes";

// Map string backup types to enum values
export const getBackupType = (type: string): BackupType => {
  switch (type.toLowerCase()) {
    case "full":
      return BackupType.FULL;
    case "incremental":
      return BackupType.INCREMENTAL;
    case "differential":
      return BackupType.DIFFERENTIAL;
    case "snapshot":
      return BackupType.SNAPSHOT;
    default:
      return BackupType.FULL;
  }
};

// Map string backup statuses to enum values
export const getBackupStatus = (status: string): BackupStatus => {
  switch (status.toLowerCase()) {
    case "completed":
      return BackupStatus.COMPLETED;
    case "pending":
      return BackupStatus.PENDING;
    case "failed":
      return BackupStatus.FAILED;
    case "in-progress":
      return BackupStatus.IN_PROGRESS;
    default:
      return BackupStatus.PENDING;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random backup size
export const generateBackupSize = (): string => {
  const sizeInMB = Math.floor(Math.random() * 500) + 50; // 50-550 MB
  return formatFileSize(sizeInMB * 1024 * 1024);
};
