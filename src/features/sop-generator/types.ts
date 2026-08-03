
export interface SOPData {
  division: string;
  formData: Record<string, string>;
  status: 'draft' | 'reviewed' | 'final';
  createdAt: string;
}
