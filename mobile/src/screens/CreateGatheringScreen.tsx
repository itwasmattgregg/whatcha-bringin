import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  ANIMATED_BACKGROUNDS,
  AnimatedBackgroundType,
  AnimatedBackground,
} from '../components/AnimatedBackgrounds';

const formatBackgroundLabel = (value?: AnimatedBackgroundType) => {
  if (!value) return 'None';
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
};

export default function CreateGatheringScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [animatedBackground, setAnimatedBackground] = useState<
    AnimatedBackgroundType | undefined
  >(undefined);

  const createMutation = useMutation({
    mutationFn: gatheringsService.createGathering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create gathering'
      );
    },
  });

  const handleCreate = () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const payload: {
      name: string;
      address: string;
      date: string;
      time: string;
      coverImage?: string;
      animatedBackground?: string;
    } = {
      name,
      address,
      date: date.toISOString().split('T')[0],
      time: time.toTimeString().slice(0, 5),
    };

    if (coverImageBase64) {
      payload.coverImage = coverImageBase64;
    }

    if (animatedBackground) {
      payload.animatedBackground = animatedBackground;
    }

    createMutation.mutate(payload);
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.uri) {
        setCoverImage(asset.uri);

        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1200 } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            }
          );

          if (manipulatedImage.base64) {
            setCoverImageBase64(
              `data:image/jpeg;base64,${manipulatedImage.base64}`
            );
          }
        } catch (error) {
          console.error('Error compressing image:', error);
          Alert.alert('Error', 'Failed to process image. Please try again.');
        }
      }
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImageBase64(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create New Gathering</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gathering Name *</Text>
          <TextInput
            style={styles.input}
            placeholder='Summer BBQ Party'
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            placeholder='123 Main St, City, State'
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode='date'
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateText}>
              {time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode='time'
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cover Image</Text>
          {coverImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleImagePicker}
                >
                  <Text style={styles.imageButtonText}>Change Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageButton, styles.removeButton]}
                  onPress={handleRemoveCoverImage}
                >
                  <Text style={styles.imageButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePicker}
            >
              <Text style={styles.imagePickerText}>📸 Upload Cover Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Animated Background</Text>

          <View style={styles.backgroundPreviewLarge}>
            {animatedBackground ? (
              <AnimatedBackground
                type={animatedBackground}
                style={styles.backgroundPreviewFill}
              />
            ) : (
              <View style={styles.backgroundPreviewPlaceholder}>
                <Text style={styles.backgroundPreviewPlaceholderText}>
                  Preview will appear here
                </Text>
              </View>
            )}
          </View>

          <View style={styles.backgroundList}>
            <TouchableOpacity
              style={[
                styles.backgroundOptionSimple,
                !animatedBackground && styles.backgroundOptionSimpleSelected,
              ]}
              onPress={() => setAnimatedBackground(undefined)}
            >
              <Text
                style={[
                  styles.backgroundOptionSimpleText,
                  !animatedBackground &&
                    styles.backgroundOptionSimpleTextSelected,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>

            {ANIMATED_BACKGROUNDS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.backgroundOptionSimple,
                  animatedBackground === bg &&
                    styles.backgroundOptionSimpleSelected,
                ]}
                onPress={() => setAnimatedBackground(bg)}
              >
                <Text
                  style={[
                    styles.backgroundOptionSimpleText,
                    animatedBackground === bg &&
                      styles.backgroundOptionSimpleTextSelected,
                  ]}
                >
                  {formatBackgroundLabel(bg)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            createMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={createMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {createMutation.isPending ? 'Creating...' : 'Create Gathering'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
  },
  imageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  removeButton: {
    borderColor: '#f44336',
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f0fff4',
  },
  imagePickerText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  backgroundPreviewLarge: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  backgroundPreviewFill: {
    width: '100%',
    height: '100%',
  },
  backgroundPreviewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  backgroundPreviewPlaceholderText: {
    color: '#999',
    fontSize: 14,
  },
  backgroundList: {
    gap: 8,
  },
  backgroundOptionSimple: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backgroundOptionSimpleSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  backgroundOptionSimpleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
  },
  backgroundOptionSimpleTextSelected: {
    color: '#2e7d32',
  },
});
