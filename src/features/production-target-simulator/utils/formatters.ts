
export const formatDisplayNumber = (val: string) => {
  if (!val) return "";
  const clean = val.replace(/[^\d,.]/g, "");
  return clean;
};

export const parseNumber = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(clean) || 0;
};

export const formatThousand = (n: number) => {
  return Math.ceil(n).toLocaleString('id-ID');
};
