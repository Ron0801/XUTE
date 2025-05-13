import { useFonts } from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from "@/components/authContext";
import * as React from 'react';

export default function RootLayout() {
  const [loaded] = useFonts({
    Anton: require('@/assets/fonts/Anton.ttf'),
    Montserrat: require('@/assets/fonts/Montserrat.ttf'),
  });

  if (!loaded) {
    return null;
  }
  
  return (
    <AuthProvider>
      <Slot />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
