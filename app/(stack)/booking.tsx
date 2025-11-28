import { ThemedText } from '@/components/themed-text';
import { useBooking } from '@/contexts/BookingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
          Alert.alert('Booking Reserved', data.message);
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
      <ThemedText type="title">Booking</ThemedText>
      {selectedSlot && selectedDate && (
        <ThemedText type="subtitle">Booking a session at {selectedSlot.time} on {selectedDate}</ThemedText>
      )}

      <ThemedText style={styles.label}>Name:<ThemedText style={styles.requiredAsterisk}>*</ThemedText></ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={nameInput}
        onChangeText={setNameInput}
      />
      {nameError && <ThemedText style={styles.errorText}>{nameError}</ThemedText>}

      <ThemedText style={styles.label}>Email:<ThemedText style={styles.requiredAsterisk}>*</ThemedText></ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={emailInput}
        onChangeText={setEmailInput}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <ThemedText style={styles.errorText}>{emailError}</ThemedText>}

      <Button title="Submit Booking" onPress={handleSubmit} />
      <View style={styles.spacing} />
      <Button title="Cancel" onPress={handleCancel} color="red" />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={dismissCancel}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ThemedText>Are you sure you want to cancel and return to available slots?</ThemedText>
            <View style={styles.modalButtons}>
              <Button title="Yes, Cancel" onPress={confirmCancel} color="red" />
              <View style={styles.spacing} />
              <Button title="No, Keep Going" onPress={dismissCancel} />
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
    padding: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  requiredAsterisk: {
    color: 'red',
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
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
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
});
