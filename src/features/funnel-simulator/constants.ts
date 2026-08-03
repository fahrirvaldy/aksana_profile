
import { FunnelInputs } from "./types";

export const industryBase: Record<string, Partial<FunnelInputs>> = {
  fashion: { cpm: 45000, ctr: 1.2, visit: 70, atc: 4, checkout: 40 },
  beauty: { cpm: 55000, ctr: 0.8, visit: 65, atc: 3.5, checkout: 35 },
  gadget: { cpm: 35000, ctr: 0.5, visit: 60, atc: 2, checkout: 30 },
  fnb: { cpm: 25000, ctr: 1.5, visit: 80, atc: 6, checkout: 50 },
};

export const channelModifier: Record<string, Partial<FunnelInputs>> = {
  marketplace: { visit: 95, atc: 8, checkout: 60 },
  website: { visit: 75, atc: 4, checkout: 40 },
  whatsapp: { visit: 85, atc: 12, checkout: 70 },
};
