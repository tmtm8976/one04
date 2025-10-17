import React from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { globalStyles as s } from '../../styles/globalStyles';
import { useAppDispatch } from '../../store/hooks';
import { logout as logoutAction } from '../../store/slices/authSlice';
import * as Keychain from 'react-native-keychain';

export default function LogoutScreen() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await Keychain.resetGenericPassword({ service: 'service_key' });
      await Keychain.resetGenericPassword({ service: 'background_token' });
      dispatch(logoutAction());
    } catch (e) {
      console.warn('Logout failed', e);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <Text style={s.header}>Logout</Text>
        <Text style={s.smallText}>Tap the button below to sign out.</Text>
        <Pressable onPress={handleLogout} style={s.button}>
          <Text style={s.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
