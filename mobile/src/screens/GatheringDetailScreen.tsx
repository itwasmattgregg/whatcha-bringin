import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  Share,
  Modal,
  Platform,
  Clipboard,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemCard from '../components/ItemCard';
import { AnimatedBackground } from '../components/AnimatedBackgrounds';

export default function GatheringDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const gatheringId = (route.params as any)?.gatheringId;

  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'food' | 'drink'>('food');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviteData, setInviteData] = useState<{
    code: string;
    link: string;
    message: string;
  } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  React.useEffect(() => {
    AsyncStorage.getItem('user').then((userStr) => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id);
      }
    });
  }, []);

  const { data: gathering, isLoading: gatheringLoading } = useQuery({
    queryKey: ['gathering', gatheringId],
    queryFn: () => gatheringsService.getGathering(gatheringId),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items', gatheringId],
    queryFn: () => gatheringsService.getItems(gatheringId),
  });

  const addItemMutation = useMutation({
    mutationFn: (data: { name: string; type: 'food' | 'drink' }) =>
      gatheringsService.addItem(gatheringId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', gatheringId] });
      setNewItemName('');
      setShowAddItem(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add item');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => gatheringsService.getInviteShare(gatheringId),
    onSuccess: (data) => {
      setInviteData(data);
      setShowInviteDrawer(true);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to generate invite'
      );
    },
  });

  const handleCopyMessage = async () => {
    if (inviteData) {
      if (Platform.OS === 'web') {
        // Web fallback
        await navigator.clipboard.writeText(inviteData.message);
      } else {
        // @ts-ignore - Clipboard is deprecated but still works
        Clipboard.setString(inviteData.message);
      }
      Alert.alert('Copied!', 'Invite message copied to clipboard');
    }
  };

  const handleSendSMS = async () => {
    if (!inviteData) return;

    try {
      // Format phone number if provided
      let recipient = '';
      if (phoneNumber.trim()) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        recipient =
          cleaned.startsWith('1') && cleaned.length === 11
            ? `+${cleaned}`
            : cleaned.length === 10
            ? `+1${cleaned}`
            : phoneNumber.startsWith('+')
            ? phoneNumber
            : `+${cleaned}`;
      }

      // Open SMS app with pre-filled message and optional recipient
      const smsUrl = recipient
        ? `sms:${recipient}?body=${encodeURIComponent(inviteData.message)}`
        : `sms:?body=${encodeURIComponent(inviteData.message)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);

      if (canOpen) {
        await Linking.openURL(smsUrl);
        setShowInviteDrawer(false);
        setPhoneNumber('');
      } else {
        Alert.alert('Error', 'Unable to open messaging app');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open messaging app');
    }
  };

  const handleShare = async () => {
    if (!inviteData) return;

    try {
      const result = await Share.share({
        message: inviteData.message,
        title: `Invite to ${gathering?.name}`,
      });

      if (result.action === Share.sharedAction) {
        setShowInviteDrawer(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share');
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    addItemMutation.mutate({ name: newItemName, type: newItemType });
  };

  const handleInvite = () => {
    inviteMutation.mutate();
  };

  if (gatheringLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!gathering) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Gathering not found</Text>
      </View>
    );
  }

  const isHost = gathering.hostId === currentUserId;

  const handleEdit = () => {
    (navigation as any).navigate('EditGathering', { gatheringId });
  };

  return (
    <View style={styles.container}>
      {gathering.animatedBackground && (
        <AnimatedBackground
          type={gathering.animatedBackground as any}
          style={styles.animatedBackground}
        />
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.header}>
          {isHost && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          {gathering.coverImage && (
            <Image
              source={{ uri: gathering.coverImage }}
              style={styles.coverImage}
            />
          )}
          {gathering.image && !gathering.coverImage && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>📸</Text>
            </View>
          )}
          <Text style={styles.title}>{gathering.name}</Text>
          <Text style={styles.date}>
            {new Date(gathering.date).toLocaleDateString()} at {gathering.time}
          </Text>
          <Text style={styles.address}>{gathering.address}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What to Bring</Text>
            {isHost && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddItem(!showAddItem)}
              >
                <Text style={styles.addButtonText}>+ Add Item</Text>
              </TouchableOpacity>
            )}
          </View>

          {showAddItem && isHost && (
            <View style={styles.addItemForm}>
              <TextInput
                style={styles.input}
                placeholder='Item name (e.g., Main dish)'
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newItemType === 'food' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewItemType('food')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newItemType === 'food' && styles.typeButtonTextActive,
                    ]}
                  >
                    Food
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newItemType === 'drink' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewItemType('drink')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newItemType === 'drink' && styles.typeButtonTextActive,
                    ]}
                  >
                    Drink
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelFormButton}
                  onPress={() => {
                    setShowAddItem(false);
                    setNewItemName('');
                  }}
                >
                  <Text style={styles.cancelFormButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitFormButton}
                  onPress={handleAddItem}
                  disabled={addItemMutation.isPending}
                >
                  <Text style={styles.submitFormButtonText}>
                    {addItemMutation.isPending ? 'Adding...' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {itemsLoading ? (
            <Text>Loading items...</Text>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                gatheringId={gatheringId}
                isHost={isHost}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No items yet. Add some items to bring!
            </Text>
          )}
        </View>

        {isHost && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleInvite}
            disabled={inviteMutation.isPending}
          >
            <Text style={styles.inviteButtonText}>
              {inviteMutation.isPending ? 'Preparing...' : '📤 Share Invite'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Invite Drawer Modal */}
        <Modal
          visible={showInviteDrawer}
          transparent={true}
          animationType='slide'
          onRequestClose={() => setShowInviteDrawer(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowInviteDrawer(false)}
            />
            <View style={styles.drawerContainer}>
              <View style={styles.drawerHandle} />
              <Text style={styles.drawerTitle}>Share Invite</Text>

              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Invite Message:</Text>
                <ScrollView style={styles.messageBox}>
                  <Text style={styles.messageText}>{inviteData?.message}</Text>
                </ScrollView>
              </View>

              <View style={styles.phoneInputContainer}>
                <Text style={styles.phoneLabel}>Phone Number (optional):</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder='+1 (555) 123-4567'
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType='phone-pad'
                  autoComplete='tel'
                  textContentType='telephoneNumber'
                />
              </View>

              <View style={styles.drawerActions}>
                <TouchableOpacity
                  style={[styles.drawerButton, styles.copyButton]}
                  onPress={handleCopyMessage}
                >
                  <Text style={styles.copyButtonText}>📋 Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.drawerButton, styles.shareButton]}
                  onPress={handleShare}
                >
                  <Text style={styles.shareButtonText}>📤 Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.drawerButton, styles.smsButton]}
                  onPress={handleSendSMS}
                >
                  <Text style={styles.smsButtonText}>💬 Send SMS</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowInviteDrawer(false);
                  setPhoneNumber('');
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    borderRadius: 12,
    margin: 16,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonIcon: {
    fontSize: 18,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageText: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addItemForm: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  typeButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelFormButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelFormButtonText: {
    color: '#666',
  },
  submitFormButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitFormButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  drawerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  drawerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#f0f0f0',
  },
  copyButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#e3f2fd',
  },
  shareButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
  smsButton: {
    backgroundColor: '#4CAF50',
  },
  smsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
