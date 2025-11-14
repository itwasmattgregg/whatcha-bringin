import React, { useState, useRef } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AppStackParamList = {
  Main: undefined;
  CreateGathering: undefined;
  JoinGathering: undefined;
  GatheringDetail: { gatheringId: string };
  EditGathering: { gatheringId: string };
};

type JoinGatheringNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function JoinGatheringScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const navigation = useNavigation<JoinGatheringNavigationProp>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const joinMutation = useMutation({
    mutationFn: (inviteCode: string) =>
      gatheringsService.joinGathering(inviteCode),
    onSuccess: (data) => {
      // Refresh gatherings list
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });

      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('GatheringDetail', {
          gatheringId: data.gathering._id,
        });
      }, 100);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to join gathering'
      );
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '');
    if (digit.length > 1) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered - use newCode directly
    const fullCode = newCode.join('');
    if (newCode.every((d) => d !== '') && fullCode.length === 6) {
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        joinMutation.mutate(fullCode);
      }, 0);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoin = () => {
    const inviteCode = code.join('');
    if (inviteCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit invite code');
      return;
    }
    joinMutation.mutate(inviteCode);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Join a Gathering</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit invite code you received
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType='number-pad'
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            joinMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleJoin}
          disabled={joinMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {joinMutation.isPending ? 'Joining...' : 'Join Gathering'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    fontSize: 32,
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
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
