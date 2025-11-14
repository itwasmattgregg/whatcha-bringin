import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import GatheringsListScreen from '../screens/GatheringsListScreen';
import CreateGatheringScreen from '../screens/CreateGatheringScreen';
import GatheringDetailScreen from '../screens/GatheringDetailScreen';
import EditGatheringScreen from '../screens/EditGatheringScreen';
import JoinGatheringScreen from '../screens/JoinGatheringScreen';
import DonateScreen from '../screens/DonateScreen';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabScreenOptions = {
  headerShown: false as const,
  tabBarActiveTintColor: '#4CAF50' as const,
  tabBarInactiveTintColor: '#999' as const,
};

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Gatherings"
        component={GatheringsListScreen}
        options={{
          tabBarLabel: 'Gatherings',
          tabBarIcon: () => (
            <Text style={styles.tabIcon}>🎉</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Donate"
        component={DonateScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarIcon: () => (
            <Text style={styles.tabIcon}>☕</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const stackScreenOptions = {
  headerShown: false as const,
};

const modalOptions = {
  presentation: 'modal' as const,
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="CreateGathering"
        component={CreateGatheringScreen}
        options={modalOptions}
      />
      <Stack.Screen
        name="JoinGathering"
        component={JoinGatheringScreen}
        options={modalOptions}
      />
      <Stack.Screen 
        name="GatheringDetail" 
        component={GatheringDetailScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
        }}
      />
      <Stack.Screen
        name="EditGathering"
        component={EditGatheringScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Gathering',
          headerBackTitle: 'Cancel',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  
  // Ensure isLoading is explicitly boolean
  if (isLoading === true) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  
  // Ensure user check is explicit boolean - use strict comparison
  const hasUser = Boolean(user && user._id);
  
  return (
    <NavigationContainer>
      {hasUser ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tabIcon: {
    fontSize: 24,
  },
});
