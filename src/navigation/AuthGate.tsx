import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  View,
  BackHandler,
  Pressable,
  Text,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Lucide from '@react-native-vector-icons/lucide';

import { Login } from '../screens/auth/Login';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login as loginAction, logout } from '../store/slices/authSlice';
import AllProducts from '../screens/AllProducts/AllProducts';
import NetInfoComp from '../components/NetInfoComp';
import { colors } from '../styles/colors';
import { globalStyles as s } from '../styles/globalStyles';
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthScreens = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={Login} />
  </AuthStack.Navigator>
);

const HomeTabs = () => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await Keychain.resetGenericPassword({ service: 'service_key' });
      await Keychain.resetGenericPassword({ service: 'background_token' });
      dispatch(logout());
    } catch (e) {
      console.warn('Logout failed', e);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === 'Products' ? 'shopping-bag' : 'shopping-cart';
          return <Lucide name={iconName} size={size ?? 20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Products"
        component={AllProducts}
        options={{ title: 'all products' }}
      />

      <Tab.Screen
        name="Groceries"
        component={AllProducts}
        initialParams={{ category: 'groceries' }}
      />
      <Tab.Screen
        name="Logout"
        component={() => <></>}
        options={{
          title: 'Logout',
          tabBarButton: () => (
            <Pressable style={s.button} onPress={handleLogout}>
              <Lucide name="log-out" size={20} color={colors.text.primary} />
            </Pressable>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const NavigatorContainer = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const dispatch = useAppDispatch();
  const authenticated = useAppSelector(state => state.auth.authenticated);
  const authUser = useAppSelector(state => state.auth.user);

  const verifyBiometric = async () => {
    try {
      const creds = (await Keychain.getGenericPassword({
        service: 'service_key',
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      })) as any;
      if (creds && typeof creds.password === 'string') {
        setIsLocked(false);
        dispatch(
          loginAction({
            id: authUser?.id,
            name: authUser?.name,
            username: authUser?.username,
            token: creds.password,
          }),
        );
        return true;
      }

      BackHandler.exitApp();
    } catch (e) {
      console.log('Biometric verify failed:', e);
      BackHandler.exitApp();
    }
    return false;
  };

  useEffect(() => {
    let cancelled = false;
    let intervalId: NodeJS.Timeout | undefined;
    let running = false;

    const init = async () => {
      try {
        const hasCredintials = await Keychain.hasGenericPassword({
          service: 'service_key',
        });
        if (!hasCredintials) {
          setCheckingAuth(false);
          return;
        }
        setIsLocked(true);
        const ok = await verifyBiometric();

        if (ok && !cancelled) {
          try {
            const userMetaCreds = (await Keychain.getGenericPassword({
              service: 'user_meta',
            })) as any;
            const userMeta =
              userMetaCreds && typeof userMetaCreds.password === 'string'
                ? JSON.parse(userMetaCreds.password)
                : null;

            const unlocked = (await Keychain.getGenericPassword({
              service: 'service_key',
              accessControl:
                Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
            })) as any;

            if (unlocked && typeof unlocked.password === 'string') {
              dispatch(
                loginAction({
                  id: userMeta?.id,
                  name: userMeta?.name,
                  username: userMeta?.username ?? unlocked.username,
                  token: unlocked.password,
                }),
              );
            }
            setIsLocked(false);
          } catch (e) {
            console.warn('Failed to read user meta from keychain:', e);
            BackHandler.exitApp();
          }
        } else {
          BackHandler.exitApp();
        }

        if (hasCredintials) {
          // intervalId = setInterval(() => {
          //   if (running) return;
          //   running = true;
          //   setIsLocked(true);
          //   (async () => {
          //     try {
          //       let ok = await verifyBiometric();
          //       if (!ok) {
          //         BackHandler.exitApp();
          //       }
          //     } finally {
          //       running = false;
          //     }
          //   })();
          // }, 10000);
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [authenticated, AppState.currentState]);

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
  return <NavigatorContainer />;
};

export default AuthGate;
