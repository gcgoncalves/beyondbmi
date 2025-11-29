import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooking } from '@/contexts/BookingContext';

// Define some basic colors and dimensions for consistent styling
const primaryColor = '#6200EE';
const textColor = '#333333';
const backgroundColor = '#F5F5F5';
const borderRadius = 8;
const paddingHorizontal = 20;
const marginVertical = 10;

export default function ConfirmationScreen() {
  const { selectedSlot, selectedDate, userName, userEmail, resetBooking } = useBooking();
  const router = useRouter();

  const handleBackToHome = () => {
    resetBooking(); // Clear booking context
    router.replace('/'); // Navigate to the initial route (index.tsx which redirects to /booking tab)
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Booking Confirmed!</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.subtitle}>Your Appointment Details:</Text>
        {selectedDate && selectedSlot && (
          <Text style={styles.defaultText}>
            <Text style={styles.boldText}>Date:</Text> {selectedDate}
          </Text>
        )}
        {selectedSlot && (
          <Text style={styles.defaultText}>
            <Text style={styles.boldText}>Time:</Text> {selectedSlot.time}
          </Text>
        )}
        {userName && (
          <Text style={styles.defaultText}>
            <Text style={styles.boldText}>Name:</Text> {userName}
          </Text>
        )}
        {userEmail && (
          <Text style={styles.defaultText}>
            <Text style={styles.boldText}>Email:</Text> {userEmail}
          </Text>
        )}
        <Text style={[styles.defaultText, styles.paymentStatus]}>
          Payment Status: <Text style={styles.boldText}>Confirmed</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Back to Home" onPress={handleBackToHome} color={primaryColor} />
      </View>
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
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius,
    padding: paddingHorizontal,
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  paymentStatus: {
    marginTop: 15,
    fontSize: 18,
    color: primaryColor, // Highlight payment status
  },
  buttonContainer: {
    width: '100%',
    marginVertical: marginVertical,
    borderRadius: borderRadius,
    overflow: 'hidden',
  },
  // Typography styles (copied from a common set for consistency)
  defaultText: {
    fontSize: 16,
    lineHeight: 24,
    color: textColor,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
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
});
