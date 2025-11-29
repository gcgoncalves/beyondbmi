import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { BookingProvider } from '@/contexts/BookingContext';

export default function RootLayout() {

  return (
    <>
      <BookingProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </BookingProvider>
      <StatusBar style="auto" />
    </>
  );
}
