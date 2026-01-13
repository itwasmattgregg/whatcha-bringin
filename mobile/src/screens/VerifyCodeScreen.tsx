import React, { useState, useRef, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VerifyCodeScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { setAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const phoneNumber = (route.params as any)?.phoneNumber || '';
  
  const verifyCodeMutation = useMutation({
    mutationFn: ({ phone, code: verificationCode }: { phone: string; code: string }) =>
      authService.verifyCode(phone, verificationCode),
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });
  
  const handleCodeChange = (value: string, index: number) => {
    // Handle paste: if value length > 1, it's a paste operation
    if (value.length > 1) {
      // Extract only digits from the pasted value
      const digits = value.replace(/\D/g, '').slice(0, 6);
      
      if (digits.length === 0) return;
      
      // If pasting 6 digits into the first box, replace everything
      // Otherwise, preserve existing digits before the paste position
      const newCode = index === 0 && digits.length === 6 
        ? ['', '', '', '', '', ''] 
        : [...code];
      
      // Fill in the digits starting from the current index
      for (let i = 0; i < digits.length && (index + i) < 6; i++) {
        newCode[index + i] = digits[i];
      }
      
      setCode(newCode);
      
      // Focus on the next empty input or the last input if all are filled
      const nextEmptyIndex = newCode.findIndex((digit, idx) => idx >= index && digit === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + digits.length, 5);
      
      // Auto-submit if all 6 digits are filled
      if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
        setTimeout(() => {
          verifyCodeMutation.mutate({ phone: phoneNumber, code: newCode.join('') });
        }, 0);
      } else {
        // Focus the appropriate input after paste
        setTimeout(() => {
          inputRefs.current[focusIndex]?.focus();
        }, 0);
      }
      
      return;
    }
    
    // Handle single character input (normal typing)
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 6 digits are entered - use newCode directly
    const fullCode = newCode.join('');
    if (newCode.every(digit => digit !== '') && fullCode.length === 6) {
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        verifyCodeMutation.mutate({ phone: phoneNumber, code: fullCode });
      }, 0);
    }
  };
  
  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleVerify = () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }
    verifyCodeMutation.mutate({ phone: phoneNumber, code: verificationCode });
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a code to {phoneNumber}
        </Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              selectTextOnFocus
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.button, verifyCodeMutation.isPending && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={verifyCodeMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.resendText}>Change phone number</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
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
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});

