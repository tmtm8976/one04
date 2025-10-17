import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Lucide from '@react-native-vector-icons/lucide';

import { Login } from '../screens/auth/Login';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AllProducts from '../screens/AllProducts/AllProducts';
import NetInfoComp from '../context/NetInfoComp';
import ProductDetails from '../screens/ProductDetails/ProductDetails';
import LogoutScreen from '../screens/Logout/LogoutScreen';
import { colors } from '../styles/colors';
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.accent.primary,
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarIcon: ({ color, size, focused }) => {
        const iconName = route.name === 'Products' ? 'shopping-bag' : 'log-out';
        return <Lucide name={iconName} size={size ?? 20} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Products"
      component={HomeScreens}
      options={{ title: 'Products' }}
    />
    <Tab.Screen
      name="Logout"
      component={LogoutScreen}
      options={{ title: 'Logout' }}
    />
  </Tab.Navigator>
);

const NavigatorContainer = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const { authenticated, login, authUser } = useAuth();

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
          let userMeta: any = null;
          try {
            const userMetaCreds = await Keychain.getGenericPassword({
              service: 'user_meta',
            });
            if (userMetaCreds && userMetaCreds.password) {
              userMeta = JSON.parse(userMetaCreds.password);
            }
          } catch (e) {
            console.warn('Failed to read user meta from keychain:', e);
          }

          login({
            id: userMeta?.id,
            name: userMeta?.name,
            username: userMeta?.username ?? creds.username,
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authenticated) {
      //  if on foreground, ask for biometric

      const checkBiometric = async () => {
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
            setIsLocked(false);
          }
        } catch (error) {
          console.log('No token found or biometric failed:', error);
        }
      };

      interval = setInterval(() => {
        //  10 seconds
        setIsLocked(true);
        checkBiometric();
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [authenticated]);

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
      {authenticated ? <HomeTabs /> : <AuthScreens />}
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
