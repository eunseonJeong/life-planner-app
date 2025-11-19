import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface HeaderProps {
  onMenuPress?: () => void;
  onHomePress?: () => void;
  onSettingsPress?: () => void;
  onLogoutPress?: () => void;
  onLoginPress?: () => void;
}

export function Header({
  onMenuPress,
  onHomePress,
  onSettingsPress,
  onLogoutPress,
  onLoginPress,
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');

      if (userId && userEmail) {
        setUser({
          id: userId,
          email: userEmail,
          name: userName || '사용자',
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // API 호출 (필요한 경우)
      // const response = await fetch('/api/auth/logout', { method: 'POST' });

      // AsyncStorage 클리어
      await AsyncStorage.multiRemove(['userId', 'userEmail', 'userName']);
      setUser(null);

      if (onLogoutPress) {
        onLogoutPress();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // 에러가 발생해도 로컬 스토리지는 클리어
      await AsyncStorage.multiRemove(['userId', 'userEmail', 'userName']);
      setUser(null);
      if (onLogoutPress) {
        onLogoutPress();
      }
    }
  };

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || '사';
  };

  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {onMenuPress && (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={24} color="#374151" />
            </TouchableOpacity>
          )}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>LP</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onHomePress} style={styles.titleContainer}>
            <Text style={styles.title}>Life Planner</Text>
            <Text style={styles.subtitle}>인생의 모든 순간, 함께</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          {onHomePress && (
            <TouchableOpacity
              onPress={onHomePress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="home" size={22} color="#374151" />
            </TouchableOpacity>
          )}

          {user ? (
            <>
              <TouchableOpacity
                style={[styles.iconButton, styles.disabledButton]}
                disabled
              >
                <Ionicons name="notifications-outline" size={22} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSettingsPress}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="settings-outline" size={22} color="#374151" />
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="log-out-outline" size={22} color="#374151" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={onLoginPress}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>로그인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onLoginPress}
                style={styles.signupButton}
              >
                <Text style={styles.signupButtonText}>회원가입</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    gap: 8,
    maxWidth: 150,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  loginButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signupButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

