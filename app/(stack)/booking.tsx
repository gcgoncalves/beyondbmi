import { ThemedText } from '@/components/themed-text';
import { useBooking } from '@/contexts/BookingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingScreen() {
  const { selectedSlot, userName, setUserName, userEmail, setUserEmail } = useBooking();
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = () => {
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

    if (valid) {
      setUserName(nameInput);
      setUserEmail(emailInput);
      router.push('/payment');
    } else {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Booking</ThemedText>
      {selectedSlot && (
        <ThemedText type="subtitle">Booking a session at {selectedSlot.time}</ThemedText>
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
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
});
