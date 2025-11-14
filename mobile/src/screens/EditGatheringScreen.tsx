import React, { useState, useEffect } from 'react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
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

export default function EditGatheringScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const gatheringId = (route.params as any)?.gatheringId;

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
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const { data: gathering, isLoading } = useQuery({
    queryKey: ['gathering', gatheringId],
    queryFn: () => gatheringsService.getGathering(gatheringId),
    enabled: !!gatheringId,
  });

  useEffect(() => {
    if (gathering) {
      setName(gathering.name);
      setAddress(gathering.address);
      setDate(new Date(gathering.date));
      const [hours, minutes] = gathering.time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10));
      timeDate.setMinutes(parseInt(minutes, 10));
      setTime(timeDate);
      setCoverImage(gathering.coverImage || null);
      setAnimatedBackground(
        gathering.animatedBackground as AnimatedBackgroundType | undefined
      );
    }
  }, [gathering]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      date?: string;
      time?: string;
      address?: string;
      coverImage?: string;
      animatedBackground?: string;
      removeCoverImage?: boolean;
    }) => gatheringsService.updateGathering(gatheringId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
      queryClient.invalidateQueries({ queryKey: ['gatherings'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update gathering'
      );
    },
  });

  const handleImagePicker = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1, // Get full quality first, we'll compress it
      base64: false, // Don't get base64 yet, we'll compress first
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.uri) {
        // Show the selected image immediately
        setCoverImage(asset.uri);

        // Compress and resize the image before converting to base64
        try {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [
              { resize: { width: 1200 } }, // Resize to max width of 1200px
            ],
            {
              compress: 0.7, // Compress to 70% quality
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true, // Get base64 after compression
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

  const handleUpdate = () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const updateData: any = {
      name,
      address,
      date: date.toISOString().split('T')[0],
      time: time.toTimeString().slice(0, 5),
    };

    // Handle cover image
    if (coverImageBase64) {
      updateData.coverImage = coverImageBase64;
    } else if (!coverImage && gathering?.coverImage) {
      // If we removed the image
      updateData.removeCoverImage = true;
    }

    // Handle animated background
    if (animatedBackground !== undefined) {
      updateData.animatedBackground = animatedBackground;
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <View style={styles.content}>
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

        {/* Cover Image Section */}
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

        {/* Animated Background Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Animated Background</Text>
          <TouchableOpacity
            style={styles.backgroundPickerButton}
            onPress={() => setShowBackgroundPicker(!showBackgroundPicker)}
          >
            <Text style={styles.backgroundPickerText}>
              {animatedBackground
                ? `Selected: ${formatBackgroundLabel(animatedBackground)}`
                : 'Select Background'}
            </Text>
            <Text style={styles.backgroundPickerArrow}>
              {showBackgroundPicker ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showBackgroundPicker && (
            <View style={styles.backgroundGrid}>
              <TouchableOpacity
                style={[
                  styles.backgroundOption,
                  !animatedBackground && styles.backgroundOptionSelected,
                ]}
                onPress={() => {
                  setAnimatedBackground(undefined);
                  setShowBackgroundPicker(false);
                }}
              >
                <View style={styles.backgroundPreview} />
                <Text style={styles.backgroundOptionText}>None</Text>
              </TouchableOpacity>

              {ANIMATED_BACKGROUNDS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.backgroundOption,
                    animatedBackground === bg &&
                      styles.backgroundOptionSelected,
                  ]}
                  onPress={() => {
                    setAnimatedBackground(bg);
                    setShowBackgroundPicker(false);
                  }}
                >
                  <View style={styles.backgroundPreviewContainer}>
                    <AnimatedBackground
                      type={bg}
                      style={styles.backgroundPreview}
                    />
                  </View>
                  <Text style={styles.backgroundOptionText}>
                    {formatBackgroundLabel(bg)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            updateMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {updateMutation.isPending ? 'Updating...' : 'Update Gathering'}
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  imageContainer: {
    marginTop: 8,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4444',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
  },
  backgroundPickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backgroundPickerText: {
    fontSize: 16,
    color: '#333',
  },
  backgroundPickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  backgroundOption: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backgroundOptionSelected: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  backgroundPreviewContainer: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  backgroundPreview: {
    width: '100%',
    height: '100%',
  },
  backgroundOptionText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
