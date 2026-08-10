
export interface ProductionData {
  [key: string]: any;
  sku: string;
  category: 'magnet' | 'profit';
  salesInput: string;
  leadTime: number;
  stock: number;
}
