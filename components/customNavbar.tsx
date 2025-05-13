import * as React from 'react';

import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Calendar, Profile, Pomodoro } from '@/components/Icons';
import { ThemedText } from './ThemedText';

const CustomNavbar = ({ selectedIcon }: { selectedIcon: string }) => {
  const router = useRouter();

  const getIconColor = (iconName: string) => {
    return selectedIcon === iconName ? '#8075FF' : '#F8FFE5';
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/home")}
      >
        <Home width={24} height={24} color={getIconColor('home')} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/calendar")}
      >
        <Calendar width={24} height={24} color={getIconColor('calendar')} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/profile")}
      >
        <Profile width={24} height={24} color={getIconColor('profile')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.middleBtn}>
        <Pomodoro />
        <ThemedText type="default" style={{ color: '#F8FBEF', marginBottom: -2 }} onPress={() => router.replace("/pomodoro")}>
          Pomodoro
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#090809',
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 24,
    height: 60,
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleBtn: {
    backgroundColor: '#8075FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 99,
    width: 128,
    gap: 8,
  },
});

export default CustomNavbar;
