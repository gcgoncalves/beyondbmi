import { useBooking } from '@/contexts/BookingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function BookingScreen() {
  const { selectedSlot, selectedDate, userName, setUserName, userEmail, setUserEmail } = useBooking();
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!nameInput.trim()) {
      setNameError('Name is required');
      valid = false;
    } else {
      setNameError(null);
    }

    if (!emailInput.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(emailInput)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!selectedSlot || !selectedDate) {
      Alert.alert('Booking Error', 'No slot or date selected. Please go back to Home and select a slot and date.');
      valid = false;
    }

    if (valid) {
      // First, attempt to book the slot on the backend
      if (!API_BASE_URL) {
        Alert.alert("Configuration Error", "API_BASE_URL is not set. Cannot book appointment.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            date: selectedDate,
            time: selectedSlot?.time,
            userName: nameInput,
            userEmail: emailInput,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // If booking is successful, save user info to context and proceed to payment
          setUserName(nameInput);
          setUserEmail(emailInput);
          router.push('/payment');
        } else {
          Alert.alert('Booking Error', data.message || 'Failed to reserve slot. It might be already booked.');
        }
      } catch (error: any) {
        Alert.alert('Network Error', 'Could not connect to the booking service: ' + error.message);
      }
    } else {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    router.push('/home'); // Navigate back to home screen
  };

  const dismissCancel = () => {
    setShowCancelModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Booking</Text>
      {selectedSlot && selectedDate && (
        <Text style={styles.subtitle}>Booking a session at {selectedSlot.time} on {selectedDate}</Text>
      )}

      <Text style={styles.label}>Name:<Text style={styles.requiredAsterisk}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#888"
        value={nameInput}
        onChangeText={setNameInput}
      />
      {nameError && <Text style={styles.errorText}>{nameError}</Text>}

      <Text style={styles.label}>Email:<Text style={styles.requiredAsterisk}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        value={emailInput}
        onChangeText={setEmailInput}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      
      <View style={styles.buttonContainer}>
          <Button title="Submit Booking" onPress={handleSubmit} color={primaryColor} />
      </View>
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
            <Text style={styles.defaultText}>Are you sure you want to cancel and return to available slots?</Text>
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
    overflow: 'hidden',
  },
  errorText: {
    color: errorColor,
    alignSelf: 'flex-start',
    marginBottom: marginVertical,
    fontSize: 14,
    lineHeight: 20,
  },
  requiredAsterisk: {
    color: errorColor,
    fontSize: 16,
  },
  spacing: {
    height: 10, // Or width for horizontal spacing
    width: 10,
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
    flex: 1,
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
    color: textColor,
    marginBottom: 15,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: accentColor,
  },
});
