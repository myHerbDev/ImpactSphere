import type { IndustryAverageData } from '../types';

export const fetchIndustryAverages = async (): Promise<IndustryAverageData> => ({
  carbonFootprint: 12500,
  energyConsumption: 11200,
  supplyChainEmissions: 18000,
  renewableEnergyMix: 35,
  wasteDiversionRate: 65,
  waterUsage: 55000,
});
