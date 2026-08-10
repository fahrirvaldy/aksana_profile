
export interface SOPData {
  [key: string]: any;
  division: string;
  formData: Record<string, string>;
  status: 'draft' | 'reviewed' | 'final';
  createdAt: string;
}

export interface FormField {
    label: string;
    placeholder: string;
    type: 'text' | 'textarea';
}

export interface Schemas {
    ops: FormField[];
    fin: FormField[];
    mkt: FormField[];
    hrd: FormField[];
}
