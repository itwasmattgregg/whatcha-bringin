import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility to clear all AsyncStorage data
 * Use this if you're experiencing data corruption issues
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    return false;
  }
}

