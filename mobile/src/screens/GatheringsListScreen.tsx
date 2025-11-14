import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
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

type GatheringsListNavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

export default function GatheringsListScreen() {
  const navigation = useNavigation<GatheringsListNavigationProp>();
  const insets = useSafeAreaInsets();
  const [showPast, setShowPast] = useState(false);

  const {
    data: upcomingGatherings,
    isLoading: isUpcomingLoading,
    refetch: refetchUpcoming,
    isRefetching: isUpcomingRefetching,
  } = useQuery({
    queryKey: ['gatherings', 'upcoming'],
    queryFn: gatheringsService.getUpcomingGatherings,
  });

  const {
    data: pastGatherings,
    isLoading: isPastLoading,
    refetch: refetchPast,
    isRefetching: isPastRefetching,
  } = useQuery({
    queryKey: ['gatherings', 'past'],
    queryFn: gatheringsService.getPastGatherings,
    staleTime: 1000 * 60 * 5,
  });

  const renderGathering = (item: Gathering) => (
    <TouchableOpacity
      key={item._id}
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

  const created = upcomingGatherings?.created ?? [];
  const joined = upcomingGatherings?.joined ?? [];
  const past = pastGatherings?.past ?? [];

  const refreshing = isUpcomingRefetching || (showPast && isPastRefetching);
  const isPastLoadingInitial = isPastLoading && past.length === 0;

  const handleRefresh = useCallback(() => {
    refetchUpcoming();
    if (showPast) {
      refetchPast();
    }
  }, [refetchUpcoming, refetchPast, showPast]);

  const hasUpcoming = created.length > 0 || joined.length > 0;

  if (isUpcomingLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading your gatherings...</Text>
      </View>
    );
  }

  if (!hasUpcoming) {
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
          Tap Create Gathering to start one or join an existing party with a
          code.
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
        <View style={[styles.pastSection, styles.emptyPastSection]}>
          <View style={styles.pastHeader}>
            <Text style={styles.sectionTitle}>Past gatherings</Text>
            <TouchableOpacity
              style={styles.pastToggleButton}
              onPress={() => setShowPast((prev) => !prev)}
            >
              <Text style={styles.pastToggleButtonText}>
                {showPast ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {showPast && (
            <View style={styles.pastContent}>
              {isPastLoadingInitial ? (
                <ActivityIndicator color='#4CAF50' />
              ) : past.length === 0 ? (
                <Text style={styles.sectionEmpty}>
                  No past gatherings to show.
                </Text>
              ) : (
                past.map(renderGathering)
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate('JoinGathering')}
        >
          <Text style={styles.joinButtonText}>🔑 Join with Code</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Created by you</Text>
          {created.length === 0 ? (
            <Text style={styles.sectionEmpty}>
              You haven't created any upcoming gatherings yet.
            </Text>
          ) : (
            created.map(renderGathering)
          )}
        </View>

        {joined.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Joined gatherings</Text>
            {joined.map(renderGathering)}
          </View>
        )}

        <View style={styles.pastSection}>
          <View style={styles.pastHeader}>
            <Text style={styles.sectionTitle}>Past gatherings</Text>
            <TouchableOpacity
              style={styles.pastToggleButton}
              onPress={() => setShowPast((prev) => !prev)}
            >
              <Text style={styles.pastToggleButtonText}>
                {showPast ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {showPast && (
            <View style={styles.pastContent}>
              {isPastLoadingInitial ? (
                <ActivityIndicator color='#4CAF50' />
              ) : past.length === 0 ? (
                <Text style={styles.sectionEmpty}>
                  No past gatherings to show.
                </Text>
              ) : (
                past.map(renderGathering)
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 32,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  sectionEmpty: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  pastSection: {
    marginBottom: 40,
  },
  pastHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pastToggleButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
  },
  pastToggleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pastContent: {
    marginTop: 12,
  },
  emptyPastSection: {
    marginTop: 48,
  },
});
