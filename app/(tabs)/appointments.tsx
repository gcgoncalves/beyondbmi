import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, FlatList, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface Appointment {
  date: string;
  time: string;
}

export default function AppointmentsScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [futureAppointments, setFutureAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // New state to track if fetch has occurred

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const fetchAppointments = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is mandatory');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!valid) {
      return;
    }

    if (!API_BASE_URL) {
      Alert.alert("Configuration Error", "API_BASE_URL is not set. Cannot fetch appointments.");
      return;
    }

    setIsLoading(true);
    setHasFetched(false); // Reset hasFetched before new fetch
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Split appointments on the frontend
        const now = new Date(); // Current date and time
        const fetchedFutureAppointments: Appointment[] = [];
        const fetchedPastAppointments: Appointment[] = [];

        (data.appointments || []).forEach((booking: Appointment) => {
            const [year, month, day] = booking.date.split('-').map(Number);
            const [hours, minutes] = booking.time.split(':').map(Number);
            const bookingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

            if (bookingDateTime.getTime() >= now.getTime()) {
                fetchedFutureAppointments.push(booking);
            } else {
                fetchedPastAppointments.push(booking);
            }
        });
        setFutureAppointments(fetchedFutureAppointments);
        setPastAppointments(fetchedPastAppointments);

      } else {
        Alert.alert('Error', data.message || 'Failed to fetch appointments.');
        setFutureAppointments([]);
        setPastAppointments([]);
      }
    } catch (error: any) {
      Alert.alert('Network Error', 'Could not connect to the service: ' + error.message);
      setFutureAppointments([]);
      setPastAppointments([]);
    } finally {
      setIsLoading(false);
      setHasFetched(true); // Set hasFetched to true after fetch attempt
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentItem}>
      <Text style={styles.defaultText}>{item.date} at {item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
        <View style={styles.buttonContainer}>
            <Button title="Fetch Appointments" onPress={fetchAppointments} disabled={isLoading} color={primaryColor} />
        </View>
      </View>

      {isLoading ? (
        <Text style={styles.defaultText}>Loading appointments...</Text>
      ) : (
        <View style={styles.appointmentsListsContainer}>
          {futureAppointments.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.subtitle}>Future Appointments:</Text>
              <FlatList
                data={futureAppointments}
                keyExtractor={(item, index) => `${item.date}-${item.time}-${index}`}
                renderItem={renderAppointmentItem}
                style={styles.list}
              />
            </View>
          )}

          {pastAppointments.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.subtitle}>Past Appointments:</Text>
              <FlatList
                data={pastAppointments}
                keyExtractor={(item, index) => `${item.date}-${item.time}-${index}`}
                renderItem={renderAppointmentItem}
                style={styles.list}
              />
            </View>
          )}

          {!isLoading && hasFetched && futureAppointments.length === 0 && pastAppointments.length === 0 && (
            <Text style={styles.defaultText}>No appointments found for this email.</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: paddingHorizontal,
    backgroundColor: backgroundColor,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: marginVertical,
    marginBottom: 5,
    fontSize: 16,
    lineHeight: 24,
    color: textColor,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: borderRadius,
    paddingHorizontal: 10,
    marginBottom: marginVertical,
    backgroundColor: '#fff',
    color: textColor,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: marginVertical,
    borderRadius: borderRadius,
    overflow: 'hidden', // Ensures button background color respects border radius
  },
  errorText: {
    color: errorColor,
    alignSelf: 'flex-start',
    marginBottom: marginVertical,
    fontSize: 14, // Slightly smaller for error messages
    lineHeight: 20,
  },
  appointmentsListsContainer: {
    flex: 1,
    width: '100%',
  },
  listSection: {
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  appointmentItem: {
    padding: 15, // Increased padding
    marginVertical: 5,
    backgroundColor: '#fff', // White background for each item
    borderRadius: borderRadius,
    shadowColor: '#000', // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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
  link: { // This style might not be used directly, but kept for consistency if needed
    lineHeight: 30,
    fontSize: 16,
    color: accentColor,
  },
});
