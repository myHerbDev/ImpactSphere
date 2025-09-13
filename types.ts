import type React from 'react';

// FIX: Add Habit type for HabitTracker component.
export interface Habit {
  id: number;
  text: string;
  completed: boolean;
}

// FIX: Add LibraryCategory and LibraryItem types for Library component.
export type LibraryCategory = 'Tips' | 'Recipes' | 'DIY Projects';
export interface LibraryItem {
  title: string;
  description: string;
}

// FIX: Add Challenge type for Challenges component.
export interface Challenge {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// FIX: Add Goal type for GoalTracker component.
export interface Goal {
  id: number;
  text: string;
  completed: boolean;
}

export interface SustainabilityTrend {
  name: string;
  value: string;
  change: number;
  insight: string;
}

export type EsgPlaybookCategory = 'ESG Value Drivers' | 'Overcoming Challenges' | 'Data Readiness Framework' | 'Industry Use Cases';

export interface ResourceItem {
  title: string;
  description: string;
}

export interface Initiative {
  title: string;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High';
}

export interface NavItem {
  name: string;
  icon: React.ReactNode;
}

export interface SustainabilityData {
  businessName: string;
  timeFrameStart: string;
  timeFrameEnd: string;
  carbonFootprint: number;
  energyConsumption: number;
  renewableEnergyMix: number;
  wasteDiversionRate: number;
  waterUsage: number;
  supplyChainEmissions: number;
  employeeEngagement: number;
  sustainableProcurement: number;
}

export interface IndustryAverageData {
  carbonFootprint: number;
  energyConsumption: number;
  supplyChainEmissions: number;
  renewableEnergyMix: number;
}

export type AssessmentCategoryName = 'Reporting process and capability' | 'Strategy and value' | 'People and culture' | 'Technology and data' | 'ESG Data Governance';

export interface AssessmentQuestion {
  text: string;
  category: AssessmentCategoryName;
}

export type AssessmentMaturity = 0 | 1 | 2; // 0: Not Started, 1: In Progress, 2: Completed
export type AssessmentAnswers = Record<AssessmentCategoryName, AssessmentMaturity[]>;
export type AssessmentScores = Record<AssessmentCategoryName, number>; // Score from 0 to 100
