
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('id-ID').format(Math.floor(val));
};
