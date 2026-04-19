import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreenComp from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, gestureEnabled: true }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreenComp}
            options={{ animationTypeForReplace: 'pop' }}
          />
          <Stack.Screen
            name="Main"
            component={HomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}