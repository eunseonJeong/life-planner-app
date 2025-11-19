import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

interface SidebarItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  items?: SidebarItem[];
  onItemPress?: (itemId: string) => void;
}

export function Sidebar({ visible, onClose, items = [], onItemPress }: SidebarProps) {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (item: SidebarItem) => {
    if (item.onPress) {
      item.onPress();
    }
    if (onItemPress) {
      onItemPress(item.id);
    }
    onClose();
  };

  const defaultItems: SidebarItem[] = [
    {
      id: 'home',
      label: '홈',
      icon: 'home-outline',
      onPress: () => console.log('Home pressed'),
    },
    {
      id: 'calendar',
      label: '캘린더',
      icon: 'calendar-outline',
      onPress: () => console.log('Calendar pressed'),
    },
    {
      id: 'tasks',
      label: '할 일',
      icon: 'checkmark-circle-outline',
      onPress: () => console.log('Tasks pressed'),
    },
    {
      id: 'goals',
      label: '목표',
      icon: 'flag-outline',
      onPress: () => console.log('Goals pressed'),
    },
    {
      id: 'notes',
      label: '노트',
      icon: 'document-text-outline',
      onPress: () => console.log('Notes pressed'),
    },
    {
      id: 'settings',
      label: '설정',
      icon: 'settings-outline',
      onPress: () => console.log('Settings pressed'),
    },
  ];

  const sidebarItems = items.length > 0 ? items : defaultItems;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarLogo}>
              <Text style={styles.sidebarLogoText}>LP</Text>
            </View>
            <Text style={styles.sidebarTitle}>Life Planner</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.sidebarContent}>
            {sidebarItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.sidebarItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={24} color="#374151" />
                <Text style={styles.sidebarItemText}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9CA3AF"
                  style={styles.chevron}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sidebarFooter}>
            <Text style={styles.footerText}>버전 1.0.0</Text>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sidebarHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sidebarTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

