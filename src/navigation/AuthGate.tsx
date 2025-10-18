import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  View,
  BackHandler,
  Pressable,
  Text,
  StatusBar,
  Modal,
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
import { useThemeColors, useThemeMode } from '../styles/theme';
import { toggleTheme } from '../store/slices/themeSlice';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthScreens = () => {
  const dispatch = useAppDispatch();
  const themeColors = useThemeColors();
  const mode = useThemeMode();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: themeColors.background.elevated,
        },
        headerTintColor: themeColors.text.primary,
        headerRight: () => (
          <Pressable
            onPress={() => dispatch(toggleTheme())}
            style={{ padding: 6 }}
          >
            <Lucide
              name={mode === 'dark' ? 'sun' : 'moon'}
              size={20}
              color={themeColors.text.secondary}
            />
          </Pressable>
        ),
        headerTitle: 'Login',
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
    </AuthStack.Navigator>
  );
};

const HomeTabs = () => {
  const dispatch = useAppDispatch();
  const themeColors = useThemeColors();

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
        tabBarActiveTintColor: themeColors.accent.primary,
        tabBarInactiveTintColor: themeColors.text.secondary,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === 'Products' ? 'shopping-bag' : 'shopping-cart';
          return <Lucide name={iconName} size={size ?? 20} color={color} />;
        },
        tabBarStyle: {
          // bacdrop: 'none'
          backgroundColor: themeColors.background.elevated,
          borderTopWidth: 0,
          height: 72,
          paddingTop: 8,
          marginTop: 0,
        },
      })}
    >
      <Tab.Screen
        name="Products"
        component={AllProducts}
        options={{ title: 'all products' }}
      />

      <Tab.Screen name="Groceries" component={AllProducts} />
      <Tab.Screen
        name="Logout"
        options={{
          title: 'Logout',
          tabBarButton: () => (
            <Pressable
              style={{
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleLogout}
            >
              <Lucide
                name="log-out"
                size={25}
                color={themeColors.text.secondary}
              />
              <Text style={{ color: themeColors.text.secondary, fontSize: 12 }}>
                Logout
              </Text>
            </Pressable>
          ),
        }}
      >
        {() => null}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const NavigatorContainer = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const dispatch = useAppDispatch();
  const authenticated = useAppSelector(state => state.auth.authenticated);
  const authUser = useAppSelector(state => state.auth.user);
  const themeColors = useThemeColors();

  const verifyBiometric = async () => {
    try {
      const creds = (await Keychain.getGenericPassword({
        service: 'service_key',

        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      })) as any;
      if (creds && typeof creds.password === 'string') {
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
        if (!authenticated) {
          const hasCredintials = await Keychain.hasGenericPassword({
            service: 'service_key',
          });

          if (!hasCredintials) {
            setCheckingAuth(false);
            return;
          }
          setCheckingAuth(true);
          {
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

                if (
                  unlocked &&
                  typeof unlocked.password === 'string' &&
                  !authenticated
                ) {
                  dispatch(
                    loginAction({
                      id: userMeta?.id,
                      name: userMeta?.name,
                      username: userMeta?.username ?? unlocked.username,
                      token: unlocked.password,
                    }),
                  );
                }
              } catch (e) {
                console.warn('Failed to read user meta from keychain:', e);
                BackHandler.exitApp();
              }
            }
          }
        }
      } catch (error) {
        console.log('Auth init error:', error);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };

    init();

    const tick = async () => {
      if (running) return;
      running = true;
      try {
        setCheckingAuth(true);
        const ok = await verifyBiometric();
        if (!ok) {
          BackHandler.exitApp();
        }
      } finally {
        running = false;
        setCheckingAuth(false);
      }
    };

    if (authenticated) {
      intervalId = setInterval(() => {
        tick();
      }, 10000);
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('App State changed to', nextAppState);
      if (nextAppState === 'active') {
        if (authenticated) {
          tick();
        } else {
          init();
        }
      }
    });

    return () => {
      subscription.remove();
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [authenticated, AppState.currentState]);

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={themeColors.background.primary}
        barStyle="dark-content"
      />
      <NetInfoComp />
      {authenticated ? <HomeTabs /> : <AuthScreens />}
      <Modal
        visible={checkingAuth}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={themeColors.accent.primary} />
      </Modal>
    </NavigationContainer>
  );
};

const AuthGate = () => {
  return <NavigatorContainer />;
};

export default AuthGate;
