import { ThemedText } from '@/components/themed-text';
import { useBooking } from '@/contexts/BookingContext';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Slot {
  time: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchAvailableSlots = async (): Promise<Slot[]> => {
  try {
    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API_BASE_URL}/api/appointments`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
};

export default function HomeScreen() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedSlot } = useBooking();
  const router = useRouter();

  useEffect(() => {
    const getSlots = async () => {
      try {
        const availableSlots = await fetchAvailableSlots();
        setSlots(availableSlots);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };
    getSlots();
  }, []);

  const handleSlotPress = useCallback((slot: Slot) => {
    setSelectedSlot(slot);
    router.push('/booking');
  }, [setSelectedSlot, router]);

  const renderSlotItem = useCallback(({ item }: { item: Slot }) => {
    return (
      <TouchableOpacity onPress={() => handleSlotPress(item)} style={styles.slotItem}>
        <ThemedText>{item.time}</ThemedText>
      </TouchableOpacity>
    );
  }, [handleSlotPress]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <ThemedText type="subtitle">Available Slots:</ThemedText>
      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.time}
          renderItem={renderSlotItem}
          contentContainerStyle={styles.slotList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotList: {
    marginTop: 10,
  },
  slotItem: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
