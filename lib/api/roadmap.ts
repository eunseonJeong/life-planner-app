import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoadmapItem } from '../../types/career';

const STORAGE_KEY = 'roadmap';

export async function getRoadmap(userId: string | null): Promise<{ data: RoadmapItem[] | null }> {
  try {
    if (!userId) {
      return { data: null };
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { data: [] };
    }

    const allRoadmap: RoadmapItem[] = JSON.parse(stored);
    const userRoadmap = allRoadmap.filter(item => item.userId === userId);
    return { data: userRoadmap };
  } catch (error) {
    console.error('Failed to get roadmap:', error);
    return { data: null };
  }
}

export async function saveRoadmap(userId: string, roadmap: RoadmapItem[]): Promise<{ success: boolean }> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let allRoadmap: RoadmapItem[] = stored ? JSON.parse(stored) : [];

    // 사용자의 기존 로드맵 제거
    allRoadmap = allRoadmap.filter(item => item.userId !== userId);
    
    // 새로운 로드맵 추가
    allRoadmap.push(...roadmap);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allRoadmap));
    return { success: true };
  } catch (error) {
    console.error('Failed to save roadmap:', error);
    return { success: false };
  }
}

