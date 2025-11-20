import AsyncStorage from '@react-native-async-storage/async-storage';

export function getCurrentUserId(): string | null {
  // AsyncStorage는 비동기이므로 동기적으로 가져올 수 없지만
  // 간단한 구현을 위해 동기 함수로 만들거나
  // 호출하는 쪽에서 await를 사용하도록 해야 합니다.
  // 여기서는 임시로 null을 반환하고, 실제로는 AsyncStorage에서 가져와야 합니다.
  return null;
}

export async function getCurrentUserIdAsync(): Promise<string | null> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return null;
  }
}

