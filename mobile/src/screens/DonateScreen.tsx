import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { feedbackService } from '../services/feedback';
import RecaptchaWebView from '../components/RecaptchaWebView';
import { useAuth } from '../context/AuthContext';

const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/29s6gtvjb';
const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '';

export default function DonateScreen() {
  const insets = useSafeAreaInsets();
  const { logout, deleteAccount } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<
    'praise' | 'bug' | 'feature-request' | 'other'
  >('other');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const recaptchaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const feedbackMutation = useMutation({
    mutationFn: (data: {
      email: string;
      message: string;
      type: string;
      recaptchaToken: string;
    }) => feedbackService.submitFeedback(data as any),
    onSuccess: () => {
      Alert.alert(
        'Thank you!',
        'Your feedback has been submitted successfully.'
      );
      setEmail('');
      setMessage('');
      setType('other');
      setRecaptchaToken(null);
    },
    onError: (error: any) => {
      console.error('Feedback submission error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to submit feedback. Please try again.';
      Alert.alert('Error', errorMessage);
      setRecaptchaToken(null);
      setShowRecaptcha(false);
    },
  });

  const handleDonate = () => {
    Linking.openURL(BUY_ME_A_COFFEE_URL);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete your account and all potluck gatherings you have created. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              // User will be automatically redirected to auth screen
              // when user state becomes null
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.error ||
                  error.message ||
                  'Failed to delete account. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleRecaptchaVerify = (token: string) => {
    console.log('reCAPTCHA verified, token received');
    // Clear timeout if reCAPTCHA succeeds
    if (recaptchaTimeoutRef.current) {
      clearTimeout(recaptchaTimeoutRef.current);
      recaptchaTimeoutRef.current = null;
    }
    setRecaptchaToken(token);
    setShowRecaptcha(false);
    // Submit feedback once we have the token
    feedbackMutation.mutate({
      email: email.trim(),
      message: message.trim(),
      type,
      recaptchaToken: token,
    });
  };

  const handleRecaptchaError = (error: string) => {
    // Only log, don't show error to user since we're auto-submitting
    console.log('reCAPTCHA error (auto-submitting):', error);
    // Clear timeout
    if (recaptchaTimeoutRef.current) {
      clearTimeout(recaptchaTimeoutRef.current);
      recaptchaTimeoutRef.current = null;
    }
    setShowRecaptcha(false);

    // If reCAPTCHA fails to load, automatically submit with dev-token
    // The backend will handle verification (allows dev-token)
    console.log(
      'reCAPTCHA unavailable, submitting feedback without reCAPTCHA verification'
    );
    // Small delay to ensure state updates
    setTimeout(() => {
      feedbackMutation.mutate({
        email: email.trim(),
        message: message.trim(),
        type,
        recaptchaToken: 'dev-token',
      });
    }, 100);
  };

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      Alert.alert('Error', 'Please enter a message (at least 10 characters)');
      return;
    }

    // Trigger reCAPTCHA if configured, otherwise submit directly
    if (
      RECAPTCHA_SITE_KEY &&
      RECAPTCHA_SITE_KEY.length > 0 &&
      RECAPTCHA_SITE_KEY !== 'your-recaptcha-site-key'
    ) {
      console.log(
        'Triggering reCAPTCHA with site key:',
        RECAPTCHA_SITE_KEY.substring(0, 10) + '...'
      );
      setShowRecaptcha(true);
      // Clear any existing timeout
      if (recaptchaTimeoutRef.current) {
        clearTimeout(recaptchaTimeoutRef.current);
      }
      // Add a timeout in case reCAPTCHA doesn't respond (reduced to 5 seconds)
      recaptchaTimeoutRef.current = setTimeout(() => {
        console.warn(
          'reCAPTCHA timeout after 5 seconds, submitting with dev-token'
        );
        setShowRecaptcha(false);
        if (recaptchaTimeoutRef.current) {
          clearTimeout(recaptchaTimeoutRef.current);
          recaptchaTimeoutRef.current = null;
        }
        feedbackMutation.mutate({
          email: email.trim(),
          message: message.trim(),
          type,
          recaptchaToken: 'dev-token',
        });
      }, 5000); // 5 second timeout - if reCAPTCHA doesn't work quickly, fall back
    } else {
      // Submit without reCAPTCHA if not configured (development mode)
      console.log('reCAPTCHA not configured, submitting without verification');
      feedbackMutation.mutate({
        email: email.trim(),
        message: message.trim(),
        type,
        recaptchaToken: 'dev-token',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.emoji}>☕</Text>
        <Text style={styles.title}>Support Watcha Bringin</Text>
        <Text style={styles.description}>
          Keeping Whatcha Bringin alive and evolving is a one-human labor of
          love — it’s just me over here, building features, squashing bugs, and
          keeping the servers humming. There’s no team, no investors, no
          mysterious benefactors… just a guy with too many ideas and a very real
          hosting bill. If the app has made your life a little easier, smoother,
          or more delightful, tossing a coffee my way truly helps keep the
          lights on (and keeps me caffeinated enough to ship the next update).
        </Text>
        <Text style={styles.description}>
          Thank you for being part of this quirky little community and for
          cheering on an indie dev doing his best. Your support — whether it’s a
          donation, a kind message, or just opening the app every week — means
          the world. If you’d like to help Whatcha Bringin grow, the link below
          is the most magical button you can press today. 🎉
        </Text>

        <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>☕ Buy Me a Coffee</Text>
        </TouchableOpacity>

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Send Feedback</Text>
          <Text style={styles.feedbackDescription}>
            Have praise, found a bug, or have a feature request? Let me know!
            I'll try to work on requests when I have time.
          </Text>

          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'praise' && styles.typeButtonActive,
              ]}
              onPress={() => setType('praise')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'praise' && styles.typeButtonTextActive,
                ]}
              >
                👍 Praise
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'bug' && styles.typeButtonActive,
              ]}
              onPress={() => setType('bug')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'bug' && styles.typeButtonTextActive,
                ]}
              >
                🐛 Bug
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'feature-request' && styles.typeButtonActive,
              ]}
              onPress={() => setType('feature-request')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'feature-request' && styles.typeButtonTextActive,
                ]}
              >
                💡 Feature
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Email *</Text>
            <TextInput
              style={styles.input}
              placeholder='your.email@example.com'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              textContentType='emailAddress'
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Tell me what's on your mind..."
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical='top'
              maxLength={2000}
            />
            <Text style={styles.charCount}>{message.length}/2000</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              feedbackMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator
                  color='#fff'
                  size='small'
                  style={styles.submitSpinner}
                />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>

        {showRecaptcha && RECAPTCHA_SITE_KEY && (
          <RecaptchaWebView
            siteKey={RECAPTCHA_SITE_KEY}
            onVerify={handleRecaptchaVerify}
            onError={handleRecaptchaError}
          />
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  donateButton: {
    backgroundColor: '#FFDD00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  donateButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  feedbackSection: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSpinner: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 40,
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteAccountButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  deleteAccountButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
});
