import type { IndustryAverageData } from '../types';

// Simulate a network request to fetch industry benchmark data.
export const fetchIndustryAverages = (): Promise<IndustryAverageData> => {
  console.log('Fetching industry average data...');
  return new Promise((resolve) => {
    // Simulate a network delay of 1.2 seconds
    setTimeout(() => {
      console.log('Fetched industry average data.');
      resolve({
        carbonFootprint: 12500,
        energyConsumption: 11200, // 28000 MWh * 0.4 tCO2e/MWh is a common emission factor
        supplyChainEmissions: 18000,
        renewableEnergyMix: 35,
        wasteDiversionRate: 65,
        waterUsage: 55000,
      });
    }, 1200);
  });
};