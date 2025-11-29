import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Define some basic colors and dimensions for consistent styling
const primaryColor = '#6200EE';
const textColor = '#333333';
const backgroundColor = '#F5F5F5';
const borderRadius = 8;
const paddingHorizontal = 20;

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: paddingHorizontal,
    backgroundColor: backgroundColor, // Apply background color
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: textColor, // Apply text color
    marginBottom: 20, // Add some bottom margin
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 25, // Adjusted padding
    backgroundColor: primaryColor, // Apply primary color to button
    borderRadius: borderRadius, // Apply border radius
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    fontSize: 18, // Adjusted font size
    color: '#FFFFFF', // White text for primary button
    fontWeight: '600', // Semi-bold text
  },
});
