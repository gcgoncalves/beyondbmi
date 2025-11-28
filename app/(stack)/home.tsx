import { ThemedText } from '@/components/themed-text';
import { useBooking } from '@/contexts/BookingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Slot {
  time: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchAvailableSlots = async (date: string): Promise<Slot[]> => {
  try {
    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API_BASE_URL}/api/appointments?date=${date}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
};

export default function HomeScreen() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedSlot, selectedDate, setSelectedDate } = useBooking();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(selectedDate)); // Temp date for picker

  useEffect(() => {
    const getSlots = async () => {
      try {
        const availableSlots = await fetchAvailableSlots(selectedDate);
        setSlots(availableSlots);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    };
    getSlots();
  }, [selectedDate]);

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

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // On Android, picker dismisses itself on selection/cancellation
      if (event.type === 'set' && date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const chosenDate = date;
        chosenDate.setHours(0, 0, 0, 0);

        if (chosenDate < today) {
          Alert.alert("Invalid Date", "Please select a date in the present or future.");
          return;
        }
        setSelectedDate(date.toISOString().slice(0, 10));
      }
    } else { // iOS
      if (date) {
        setTempDate(date); // Update tempDate as user scrolls
      }
      // Picker remains open until Done/Cancel is pressed
    }
  };

  const showDatepicker = () => {
    setTempDate(new Date(selectedDate)); // Initialize tempDate with current selectedDate
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chosenDate = tempDate;
    chosenDate.setHours(0, 0, 0, 0);

    if (chosenDate < today) {
      Alert.alert("Invalid Date", "Please select a date in the present or future.");
      return;
    }
    setSelectedDate(tempDate.toISOString().slice(0, 10));
    setShowDatePicker(false);
  };

  const cancelDate = () => {
    setShowDatePicker(false);
  };

  const currentMinDate = new Date(); // Today's date

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <ThemedText type="subtitle">Available Slots for {selectedDate}:</ThemedText>

      <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
        <ThemedText>Select Date: {selectedDate}</ThemedText>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'} // 'inline' for iOS
            onChange={onDateChange}
            minimumDate={currentMinDate}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosDatePickerButtons}>
              <Button title="Cancel" onPress={cancelDate} />
              <Button title="Done" onPress={confirmDate} />
            </View>
          )}
        </View>
      )}

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
  datePickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
  },
  datePickerContainer: {
    // Add styling for the container if needed
  },
  iosDatePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
