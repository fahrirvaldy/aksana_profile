
export const formatValue = (val: number, currency: 'IDR' | 'USD', isCurrency = false, isPercent = false) => {
  if (isPercent) return `${val}%`;
  if (isCurrency) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  }
  return val.toLocaleString('id-ID');
};
