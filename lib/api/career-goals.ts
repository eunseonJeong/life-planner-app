import AsyncStorage from '@react-native-async-storage/async-storage';
import { CareerGoal } from '../../types/career';

const STORAGE_KEY = 'careerGoals';

export async function getCareerGoals(userId: string | null): Promise<{ data: CareerGoal[] | null }> {
  try {
    if (!userId) {
      return { data: null };
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { data: [] };
    }

    const allGoals: CareerGoal[] = JSON.parse(stored);
    const userGoals = allGoals.filter(goal => goal.userId === userId);
    return { data: userGoals };
  } catch (error) {
    console.error('Failed to get career goals:', error);
    return { data: null };
  }
}

export async function saveCareerGoal(userId: string, goalData: CareerGoal): Promise<{ success: boolean }> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let allGoals: CareerGoal[] = stored ? JSON.parse(stored) : [];

    // 기존 목표가 있으면 업데이트, 없으면 추가
    const existingIndex = allGoals.findIndex(g => g.id === goalData.id && g.userId === userId);
    if (existingIndex >= 0) {
      allGoals[existingIndex] = goalData;
    } else {
      allGoals.push(goalData);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allGoals));
    return { success: true };
  } catch (error) {
    console.error('Failed to save career goal:', error);
    return { success: false };
  }
}

