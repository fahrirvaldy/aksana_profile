
export const calculateCacLtv = (
  adSpend: number,
  opsCost: number,
  newCustomers: number,
  aov: number,
  frequency: number,
  lifespan: number,
  margin: number
) => {
  const calculatedCac = (adSpend + opsCost) / (newCustomers || 1);
  const calculatedLtv = aov * frequency * lifespan * (margin / 100);
  const calculatedRatio = calculatedLtv / (calculatedCac || 1);
  
  return {
    cac: calculatedCac,
    ltv: calculatedLtv,
    ratio: Number(calculatedRatio.toFixed(2))
  };
}
