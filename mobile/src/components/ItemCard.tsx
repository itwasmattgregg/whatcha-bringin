import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';

const LAST_USED_NAME_KEY = '@whatcha_bringin_last_used_name';

interface ItemCardProps {
  item: Item;
  gatheringId: string;
  isHost: boolean;
  currentUserId?: string;
}

export default function ItemCard({ item, gatheringId, isHost, currentUserId }: ItemCardProps) {
  const queryClient = useQueryClient();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [name, setName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  
  // Load last used name when modal opens
  useEffect(() => {
    if (showClaimModal) {
      AsyncStorage.getItem(LAST_USED_NAME_KEY).then((lastName) => {
        if (lastName) {
          setName(lastName);
        }
      });
    }
  }, [showClaimModal]);
  
  const claimMutation = useMutation({
    mutationFn: ({ claimName, description }: { claimName: string; description?: string }) =>
      gatheringsService.claimItem(gatheringId, item._id, claimName, description),
    onSuccess: async (_, variables) => {
      // Save the name for next time
      if (variables.claimName) {
        await AsyncStorage.setItem(LAST_USED_NAME_KEY, variables.claimName);
      }
      queryClient.invalidateQueries({ queryKey: ['gathering', gatheringId] });
      queryClient.invalidateQueries({ queryKey: ['items', gatheringId] });
      setShowClaimModal(false);
      setCustomDescription('');
      setName('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to claim item');
    },
  });
  
  const isClaimed = !!item.claimedBy;
  const isClaimedByMe = item.claimedBy === currentUserId;
  
  const handleClaim = () => {
    if (isClaimedByMe) {
      // Unclaim - no name needed
      claimMutation.mutate({ claimName: item.claimedByName || '' });
    } else if (!isClaimed) {
      setShowClaimModal(true);
    }
  };
  
  return (
    <>
      <TouchableOpacity
        style={[styles.card, isClaimed && styles.claimedCard]}
        onPress={handleClaim}
        disabled={isClaimed && !isClaimedByMe}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{item.type === 'food' ? '🍽️' : '🥤'}</Text>
        </View>
        {isClaimed && (
          <View style={styles.claimedInfo}>
            <Text style={styles.claimedText}>
              {isClaimedByMe ? '✓ Claimed by you' : `✓ Claimed by ${item.claimedByName || 'someone'}`}
            </Text>
            {item.customDescription && (
              <Text style={styles.description}>{item.customDescription}</Text>
            )}
          </View>
        )}
        {!isClaimed && (
          <Text style={styles.unclaimedText}>Tap to claim</Text>
        )}
      </TouchableOpacity>
      
      <Modal
        visible={showClaimModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClaimModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Claim {item.name}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What are you bringing? (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.descriptionInput]}
                placeholder="e.g., Homemade mac and cheese"
                value={customDescription}
                onChangeText={setCustomDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowClaimModal(false);
                  setCustomDescription('');
                  setName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, !name.trim() && styles.confirmButtonDisabled]}
                onPress={() => {
                  if (!name.trim()) {
                    Alert.alert('Error', 'Please enter your name');
                    return;
                  }
                  claimMutation.mutate({ 
                    claimName: name.trim(), 
                    description: customDescription || undefined 
                  });
                }}
                disabled={claimMutation.isPending || !name.trim()}
              >
                <Text style={styles.confirmButtonText}>
                  {claimMutation.isPending ? 'Claiming...' : 'Claim'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  claimedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemType: {
    fontSize: 24,
  },
  claimedInfo: {
    marginTop: 8,
  },
  claimedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  unclaimedText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

