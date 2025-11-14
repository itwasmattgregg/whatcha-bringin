import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { gatheringsService } from '../services/gatherings';
import { Gathering } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AppStackParamList = {
  Main: undefined;
  CreateGathering: undefined;
  JoinGathering: undefined;
  GatheringDetail: { gatheringId: string };
  EditGathering: { gatheringId: string };
};

type GatheringsListNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function GatheringsListScreen() {
  const navigation = useNavigation<GatheringsListNavigationProp>();
  const insets = useSafeAreaInsets();

  const {
    data: gatherings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['gatherings'],
    queryFn: gatheringsService.getGatherings,
  });

  const renderGathering = ({ item }: { item: Gathering }) => (
    <TouchableOpacity
      style={styles.gatheringCard}
      onPress={() =>
        navigation.navigate('GatheringDetail', { gatheringId: item._id })
      }
    >
      {item.image && (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>📸</Text>
        </View>
      )}
      <View style={styles.gatheringInfo}>
        <Text style={styles.gatheringName}>{item.name}</Text>
        <Text style={styles.gatheringDate}>
          {new Date(item.date).toLocaleDateString()} at {item.time}
        </Text>
        <Text style={styles.gatheringAddress}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading your gatherings...</Text>
      </View>
    );
  }

  if (!gatherings || gatherings.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.emptyContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Text style={styles.emptyTitle}>No gatherings yet!</Text>
        <Text style={styles.emptySubtitle}>
          Tap Create Gathering to start one or join an existing party with a code.
        </Text>
        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate('JoinGathering')}
          >
            <Text style={styles.joinButtonText}>🔑 Join with Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateGathering')}
          >
            <Text style={styles.createButtonText}>Create Gathering</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={gatherings}
        renderItem={renderGathering}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate('JoinGathering')}
          >
            <Text style={styles.joinButtonText}>🔑 Join with Code</Text>
          </TouchableOpacity>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('CreateGathering')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  gatheringCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 48,
  },
  gatheringInfo: {
    padding: 16,
  },
  gatheringName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gatheringDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  gatheringAddress: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  emptyContainer: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActions: {
    width: '100%',
    paddingHorizontal: 16,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  joinButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});
