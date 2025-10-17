import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, View } from 'react-native';
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

  const verifyBiometric = async () => {
    try {
      const creds = (await Keychain.getGenericPassword({
        service: 'service_key',
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      })) as any;
      if (creds && typeof creds.password === 'string') {
        setIsLocked(false);
        return true;
      }
    } catch (e) {
      // biometric failed -> lock, but do NOT change authenticated here
      BackHandler.exitApp();
    }
    return false;
  };

  useEffect(() => {
    let appStateSub: { remove: () => void } | undefined;
    let cancelled = false;
    let intervalId: NodeJS.Timeout | undefined;
    let running = false;

    const init = async () => {
      try {
        const has = await Keychain.hasGenericPassword({ service: 'service_key' });
        if (!has) {
          return;
        }
        setIsLocked(true);
        const ok = await verifyBiometric();

        if (ok && !cancelled) {

          try {
            const userMetaCreds = (await Keychain.getGenericPassword({ service: 'user_meta' })) as any;
            const userMeta = userMetaCreds && typeof userMetaCreds.password === 'string'
              ? JSON.parse(userMetaCreds.password)
              : null;

            const unlocked = (await Keychain.getGenericPassword({
              service: 'service_key',
              accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
            })) as any;

            if (unlocked && typeof unlocked.password === 'string') {
              login({
                id: userMeta?.id,
                name: userMeta?.name,
                username: userMeta?.username ?? unlocked.username,
                token: unlocked.password,
              });
            }
            setIsLocked(false);
          } catch (e) {
            console.warn('Failed to read user meta from keychain:', e);
            setIsLocked(false);
            BackHandler.exitApp();
          }
        } 
        else {
          setIsLocked(false);
          BackHandler.exitApp();
        }

        // Re-verify on foreground to relock/unlock
        appStateSub = AppState.addEventListener('change', state => {
          if (state === 'active' && authenticated) {
            verifyBiometric();
          }
        });
        // Periodic re-verification every 10 seconds (only when authenticated)
        if (authenticated) {
          intervalId = setInterval(() => {
            if (running) return;
            running = true;
            setIsLocked(true);
            (async () => {
              try {
                await verifyBiometric();
              } finally {
                running = false;
                setIsLocked(false);
              }
            })();
          }, 10000);
        }
      } catch (error) {
        console.log('Auth init error:', error);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };

    init();
    return () => {
      cancelled = true;
      appStateSub?.remove?.();
      if (intervalId) clearInterval(intervalId);
    };
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
