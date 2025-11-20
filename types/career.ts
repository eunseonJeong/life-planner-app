export interface CareerGoal {
  id: string;
  userId: string;
  year: number;
  currentSalary: number;
  targetSalary: number;
  sideIncomeTarget?: number;
  techStack: string[];
  portfolioCount: number;
  networkingGoals: string;
  learningGoals: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  year: number;
  quarter: number;
  status: 'planned' | 'in-progress' | 'completed';
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerGoalFormData {
  year: number;
  currentSalary: number;
  targetSalary: number;
  sideIncomeTarget?: number;
  techStack: string[];
  portfolioCount: number;
  networkingGoals: string;
  learningGoals: string;
}

