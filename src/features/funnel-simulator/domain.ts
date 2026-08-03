
import { FunnelInputs, Profiling } from "./types";
import { industryBase, channelModifier } from "./constants";

export const calculateResults = (inputs: FunnelInputs) => {
  const impressions = (inputs.budget / inputs.cpm) * 1000;
  const clicks = impressions * (inputs.ctr / 100);
  const visitors = clicks * (inputs.visit / 100);
  const atcs = visitors * (inputs.atc / 100);
  const purchases = atcs * (inputs.checkout / 100);
  const revenue = purchases * inputs.aov;
  const profit = revenue - inputs.budget;
  const roas = inputs.budget > 0 ? revenue / inputs.budget : 0;
  const cpa = purchases > 0 ? inputs.budget / purchases : 0;
  return { impressions, clicks, visitors, atcs, purchases, revenue, profit, roas, cpa };
};

export const runDiagnostic = (inputs: FunnelInputs, profiling: Profiling) => {
  const base = industryBase[profiling.industry] || industryBase.fashion;
  const mod = channelModifier[profiling.channel] || channelModifier.website;
  const benchmark = {
    ctr: base.ctr || 1,
    visit: mod.visit || 70,
    atc: mod.atc || 4,
    checkout: mod.checkout || 40,
  };

  const leaks = [];
  if (inputs.ctr < benchmark.ctr) {
    leaks.push({ key: 'ctr', label: 'Click-Through Rate (CTR)', diff: benchmark.ctr - inputs.ctr });
  }
  if (inputs.visit < benchmark.visit) {
    leaks.push({ key: 'visit', label: 'Visit Rate (LP/Marketplace)', diff: benchmark.visit - inputs.visit });
  }
  if (inputs.atc < benchmark.atc) {
    leaks.push({ key: 'atc', label: 'Add to Cart (ATC) Rate', diff: benchmark.atc - inputs.atc });
  }
  if (inputs.checkout < benchmark.checkout) {
    leaks.push({ key: 'checkout', label: 'Checkout/Conversion Rate', diff: benchmark.checkout - inputs.checkout });
  }

  leaks.sort((a, b) => b.diff - a.diff);

  const biggestLeak = leaks[0];
  let recommendationKey = 'recommendations.default';

  if (biggestLeak) {
    recommendationKey = `recommendations.${biggestLeak.key}`;
  }

  return { biggestLeak, recommendationKey };
};
