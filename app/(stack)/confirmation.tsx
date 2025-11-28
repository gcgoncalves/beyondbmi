import { ThemedText } from '@/components/themed-text';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Confirmation</ThemedText>
      <Link href="/home" style={styles.link}>
        <ThemedText type="link">Back to Home</ThemedText>
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
