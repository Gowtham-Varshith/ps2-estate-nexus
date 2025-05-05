
export type DocumentType = 'image' | 'video' | 'document';

export interface Document {
  id: number;
  name: string;
  description?: string;
  type: DocumentType;
  size: number;
  path: string;
  uploadedBy: string;
  uploadDate: string;
  entityType: 'client' | 'layout' | 'plot' | 'expense' | 'bill';
  entityId: number;
  tags?: string[];
}

export interface DocumentFilter {
  type?: DocumentType[];
  entityType?: string[];
  entityId?: number;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}
