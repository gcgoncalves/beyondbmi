import { useBooking } from '@/contexts/BookingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Slot {
  time: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Define some basic colors and dimensions for consistent styling
const primaryColor = '#6200EE';
const accentColor = '#03DAC6';
const textColor = '#333333';
const backgroundColor = '#F5F5F5';
const errorColor = 'red';
const borderRadius = 8;
const paddingHorizontal = 20;
const marginVertical = 10;

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
    router.push('/booking-details');
  }, [setSelectedSlot, router]);

  const renderSlotItem = useCallback(({ item }: { item: Slot }) => {
    return (
      <TouchableOpacity onPress={() => handleSlotPress(item)} style={styles.slotItem}>
        <Text style={styles.defaultText}>{item.time}</Text>
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
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Available Slots for {selectedDate}:</Text>

      <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>Select Date: {selectedDate}</Text>
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
        <Text style={styles.errorText}>{error}</Text>
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
    padding: paddingHorizontal,
    backgroundColor: backgroundColor,
  },
  datePickerButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: borderRadius,
    marginVertical: marginVertical,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    fontSize: 18,
    color: primaryColor,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    // Add styling for the container if needed
  },
  iosDatePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: marginVertical,
  },
  slotList: {
    marginTop: marginVertical,
    width: '100%', // Take full width
  },
  slotItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  errorText: {
    color: errorColor,
    marginTop: marginVertical,
    fontSize: 16,
    lineHeight: 24,
  },
  // Typography styles
  defaultText: {
    fontSize: 16,
    lineHeight: 24,
    color: textColor,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: textColor,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: textColor,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColor,
    marginBottom: 15,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: accentColor,
  },
});