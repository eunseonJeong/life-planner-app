import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import CareerPage from './screens/CareerPage';

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  const handleHomePress = () => {
    console.log('Home pressed');
    setSidebarVisible(false);
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    setSidebarVisible(false);
  };

  const handleLogoutPress = () => {
    console.log('Logout pressed');
    setSidebarVisible(false);
  };

  const handleLoginPress = () => {
    console.log('Login pressed');
    setSidebarVisible(false);
  };

  const handleSidebarItemPress = (itemId: string) => {
    console.log('Sidebar item pressed:', itemId);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Header
          onMenuPress={handleMenuPress}
          onHomePress={handleHomePress}
          onSettingsPress={handleSettingsPress}
          onLogoutPress={handleLogoutPress}
          onLoginPress={handleLoginPress}
        />
        <CareerPage />
        <Sidebar
          visible={sidebarVisible}
          onClose={handleSidebarClose}
          onItemPress={handleSidebarItemPress}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
