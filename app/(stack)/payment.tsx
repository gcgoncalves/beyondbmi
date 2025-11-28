import { ThemedText } from '@/components/themed-text';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  return (
      <SafeAreaView style={styles.container}>

        <Link href="/confirmation" style={styles.link}>
          <ThemedText type="link">Next (Skip Payment)</ThemedText>
        </Link>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
});
