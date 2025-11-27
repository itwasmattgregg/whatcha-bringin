import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Auth: undefined;
  VerifyCode: { phoneNumber: string };
};

type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Auth'>;

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  
  const sendCodeMutation = useMutation({
    mutationFn: (phone: string) => authService.sendCode(phone),
    onSuccess: () => {
      navigation.navigate('VerifyCode', { phoneNumber });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send verification code');
    },
  });
  
  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    // Format phone number to E.164 format
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    let formattedPhone: string;
    
    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      formattedPhone = cleaned;
    }
    // If it's a 10-digit US number, add +1
    else if (/^\d{10}$/.test(cleaned)) {
      formattedPhone = `+1${cleaned}`;
    }
    // If it's an 11-digit number starting with 1, add +
    else if (/^1\d{10}$/.test(cleaned)) {
      formattedPhone = `+${cleaned}`;
    }
    // If it's already 11+ digits without +, add +
    else if (/^\d{11,}$/.test(cleaned)) {
      formattedPhone = `+${cleaned}`;
    }
    // Otherwise, try adding +1 for US numbers
    else {
      formattedPhone = `+1${cleaned}`;
    }
    
    sendCodeMutation.mutate(formattedPhone);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Watcha Bringin</Text>
        <Text style={styles.subtitle}>Let's get you signed in!</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, sendCodeMutation.isPending && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={sendCodeMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {sendCodeMutation.isPending ? 'Sending...' : 'Send Verification Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

