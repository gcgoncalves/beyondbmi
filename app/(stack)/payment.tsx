import { useBooking } from '@/contexts/BookingContext';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
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


export default function PaymentScreen() {
  const { selectedSlot, selectedDate, userName, userEmail } = useBooking();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchPaymentSheetParams = useCallback(async () => {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not defined in the environment variables.");
      throw new Error("API_BASE_URL is not defined in the environment variables.");
    }

    const requestBody = { amount: 5000, currency: 'eur' }; // Match backend's fixed amount and currency
    console.log("Fetching payment sheet params from:", `${API_BASE_URL}/api/pay`);
    console.log("Request body:", requestBody);

    const response = await fetch(`${API_BASE_URL}/api/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Raw response status:", response.status);
    const responseText = await response.text(); // Read raw response text
    console.log("Raw response text:", responseText);

    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error(`JSON Parse Error: ${e.message}. Raw response: ${responseText}`);
    }

    const { paymentIntentClientSecret, error } = responseJson;

    if (error) {
      console.error("Error from backend:", error);
      throw new Error(error);
    }

    return {
      paymentIntentClientSecret,
    };
  }, []);

  const initializePaymentSheet = useCallback(async () => {
    setLoading(true);
    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert("Error", "Stripe publishable key not set in .env file.");
      setLoading(false);
      return;
    }

    try {
      const {
        paymentIntentClientSecret,
      } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Beyond BMI',
        paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      }
    } catch (e: any) {
      Alert.alert("Error initializing payment sheet", e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentSheetParams, initPaymentSheet]); // Added fetchPaymentSheetParams and initPaymentSheet to dependencies

  const cancelBooking = async () => {
    if (!API_BASE_URL || !selectedSlot || !selectedDate) {
      console.error("Missing info for booking cancellation.");
      return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cancel-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: selectedDate,
                time: selectedSlot.time,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Booking successfully cancelled:", data.message);
        } else {
            console.error("Failed to cancel booking:", data.message);
        }
    } catch (error) {
        console.error("Network error during booking cancellation:", error);
    }
  };


  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    await cancelBooking(); // Cancel booking in backend
    router.push('/home'); // Navigate back to home screen
  };

  const dismissCancel = () => {
    setShowCancelModal(false);
  };


  const openPaymentSheet = async () => {
    if (loading) {
      Alert.alert("Please wait", "Payment sheet is still initializing.");
      return;
    }
    try {
      const { error } = await presentPaymentSheet(); // paymentOption can be null on user dismissal

      if (error) {
        if (error.code === 'Canceled') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
            // Cancel the booking if payment was cancelled
            await cancelBooking();
        } else {
            Alert.alert(`Error code: ${error.code}`, error.message);
            // Cancel the booking if payment failed for other reasons
            await cancelBooking();
        }
        // Stay on payment page to allow user to try again
      } else {
        // Payment successful, booking is already done
        router.push('/confirmation'); // Navigate to confirmation on success
      }
    } catch (e: any) {
      Alert.alert("Error presenting payment sheet", e.message);
      await cancelBooking(); // Cancel booking if there's an unexpected error presenting sheet
    }
  };

  useEffect(() => {
    // Only initialize if API_BASE_URL and STRIPE_PUBLISHABLE_KEY are available
    if (API_BASE_URL && STRIPE_PUBLISHABLE_KEY) {
      initializePaymentSheet();
    } else if (!API_BASE_URL) {
        Alert.alert("Configuration Error", "API_BASE_URL is not set. Check your .env file and restart the server.");
    } else if (!STRIPE_PUBLISHABLE_KEY) {
        Alert.alert("Configuration Error", "STRIPE_PUBLISHABLE_KEY is not set. Check your .env file and restart the server.");
    }
  }, [initializePaymentSheet, initPaymentSheet]); // Added initPaymentSheet to dependencies

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY || ''}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Payment</Text>
        {selectedSlot && selectedDate && (
          <Text style={styles.subtitle}>Booking a session at {selectedSlot.time} on {selectedDate}</Text>
        )}
        <Text style={styles.defaultText}>Name: {userName}</Text>
        <Text style={styles.defaultText}>Email: {userEmail}</Text>

        <View style={styles.buttonContainer}>
            <Button title="Pay with Card" onPress={openPaymentSheet} disabled={loading || !selectedSlot || !userName || !userEmail} color={primaryColor} />
        </View>
        {loading && <ActivityIndicator size="large" color={primaryColor} style={styles.activityIndicator} />}
        
        <View style={styles.spacing} />
        <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={handleCancel} color={errorColor} />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showCancelModal}
          onRequestClose={dismissCancel}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.defaultText}>Are you sure you want to cancel and return to available slots? This will release your reserved slot.</Text>
              <View style={styles.modalButtons}>
                <View style={styles.modalButton}>
                  <Button title="Yes, Cancel" onPress={confirmCancel} color={errorColor} />
                </View>
                <View style={styles.spacing} />
                <View style={styles.modalButton}>
                  <Button title="No, Keep Going" onPress={dismissCancel} />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </StripeProvider>
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
  activityIndicator: {
    marginTop: marginVertical,
  },
  spacing: {
    height: 10, // Or width for horizontal spacing
    width: 10,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: marginVertical,
    borderRadius: borderRadius,
    overflow: 'hidden',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background for modal
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: borderRadius,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: borderRadius,
    overflow: 'hidden',
    flex: 1, // Distribute space
    marginHorizontal: 5,
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
    lineHeight: 28,
    color: textColor,
    marginTop: 10, // Added top margin
    marginBottom: 20, // Adjusted bottom margin
    textAlign: 'center', // Ensure text is centered
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: accentColor,
  },
});
