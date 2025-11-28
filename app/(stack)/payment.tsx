import { ThemedText } from '@/components/themed-text';
import { useBooking } from '@/contexts/BookingContext';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PaymentScreen() {
  const { selectedSlot, userName, userEmail } = useBooking();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
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
  };

  const initializePaymentSheet = async () => {
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
  };

  const openPaymentSheet = async () => {
    if (loading) {
      Alert.alert("Please wait", "Payment sheet is still initializing.");
      return;
    }
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert('Success', 'Your order is confirmed!');
        router.push('/confirmation'); // Navigate to confirmation on success
      }
    } catch (e: any) {
      Alert.alert("Error presenting payment sheet", e.message);
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
  }, [API_BASE_URL, STRIPE_PUBLISHABLE_KEY]); // Dependencies for useEffect

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY || ''}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title">Payment</ThemedText>
        {selectedSlot && (
          <ThemedText type="subtitle">Booking a session at {selectedSlot.time}</ThemedText>
        )}
        <ThemedText>Name: {userName}</ThemedText>
        <ThemedText>Email: {userEmail}</ThemedText>

        <Button title="Pay with Card" onPress={openPaymentSheet} disabled={loading} />
        {loading && <ActivityIndicator size="large" style={styles.activityIndicator} />}
      </SafeAreaView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    marginTop: 20,
  },
});
