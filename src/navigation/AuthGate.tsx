import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Login } from '../screens/auth/Login';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AllProducts from '../screens/AllProducts/AllProducts';
import NetInfoComp from '../context/NetInfoComp';
import ProductDetails from '../screens/ProductDetails/ProductDetails';
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={Login} />
  </AuthStack.Navigator>
);

const HomeScreens = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="AllProducts" component={AllProducts} />
    <HomeStack.Screen name="ProductDetails" component={ProductDetails} />
  </HomeStack.Navigator>
);

const NavigatorContainer = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const { authenticated, login } = useAuth();

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const hasPassword = await Keychain.hasGenericPassword({
          service: 'service_key',
        });

        if (!hasPassword) {
          console.log('No token found');
          setCheckingAuth(false);
          return;
        }
        const creds = await Keychain.getGenericPassword({
          service: 'service_key',
          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        });

        console.log('creds', creds);

        if (creds && creds.password) {
          login({
            username: creds.username,
            token: creds.password,
          });
        }
      } catch (error) {
        console.log('No token found or biometric failed:', error);
      }
      setCheckingAuth(false);
    };

    checkStoredToken();
  }, []);

  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (authenticated) {
  //     //  if on foreground, ask for biometric

  //     const onForeground = async () => {
  //       try {
  //         const hasPassword = await Keychain.hasGenericPassword({
  //           service: 'service_key',
  //         });

  //         if (!hasPassword) {
  //           console.log('No token found');
  //           setCheckingAuth(false);
  //           return;
  //         }
  //         const creds = await Keychain.getGenericPassword({
  //           service: 'service_key',
  //           accessControl:
  //             Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
  //         });

  //         console.log('creds', creds);

  //         if (creds && creds.password) {
  //           setIsLocked(false);
  //         }
  //       } catch (error) {
  //         console.log('No token found or biometric failed:', error);
  //       }
  //     };

  //     const onBackground = () => {
  //       setIsLocked(true);
  //     };

  //     interval = setInterval(() => {
  //       //  10 seconds
  //       setIsLocked(true);
  //       if (AppState.currentState === 'active') {
  //         onForeground();
  //       } else {
  //         onBackground();
  //       }
  //     }, 10000);

  //     console.log(AppState.currentState);
  //     return () => {
  //       clearInterval(interval);
  //     };
  //   }
  // }, [authenticated, AppState.currentState]);

  if (checkingAuth || isLocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <NetInfoComp />
      {authenticated ? <HomeScreens /> : <AuthScreens />}
    </NavigationContainer>
  );
};

const AuthGate = () => {
  return (
    <AuthProvider>
      <NavigatorContainer />
    </AuthProvider>
  );
};

export default AuthGate;
