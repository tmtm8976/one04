import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { globalStyles as s } from '../../styles/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Keychain from 'react-native-keychain';
import { colors } from '../../styles/colors';
import config from '../../../config';
import { useAppDispatch } from '../../store/hooks';
import { login as loginAction } from '../../store/slices/authSlice';

export const Login = () => {
  const [fromData, setFormData] = useState({
    username: '',
    password: '',
    expiresInMins: 3000,
  });
  const [loading, setLoading] = useState(false);
  const [validator, setValidator] = useState<{
    username?: string;
    password?: string;
  }>({});
  const dispatch = useAppDispatch();

  const handleInputChange = (key: string, value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const valid = () => {
    if (fromData.username && fromData.password) {
      setValidator({});
      return true;
    }
    setValidator({
      ...(!fromData.username && { username: "Username can't be empty" }),
      ...(!fromData.password && { password: "Password can't be empty" }),
    });
    return false;
  };

  const handleLogin = async () => {
  if (!valid()) return;
  setLoading(true);
  try {

    const response = await fetch(`${config.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fromData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }
    

    await Keychain.setGenericPassword(fromData.username, result.accessToken, {
      service: 'service_key',
      accessControl:
        Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      authenticationPrompt: {
        title: 'Biometric Authentication',
      },
    });

    await Keychain.setGenericPassword(fromData.username, result.accessToken, {
      service: 'background_token',
    });

    try {
      const userMeta = {
        id: result?.id,
        username: result?.username,
        name: result?.firstName,
        email: result?.email,
        image: result?.image,
      };
      await Keychain.setGenericPassword('user_meta', JSON.stringify(userMeta), {
        service: 'user_meta',
      });
    } catch (e) {
      console.warn('Failed to persist user meta:', e);
    }

    dispatch(loginAction({
      id: result?.id ?? '',
      name: result?.firstName ?? '',
      username: result?.username ?? '',
      token: result.accessToken ?? '',
    }));
  } catch (error: any) {
    console.error('Login error:', error.message, { error });
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <Text style={s.header}>welcom back</Text>
        {/* welcome msg based on time */}
        <Text style={s.lable}>username</Text>
        <View style={{ position: 'relative', marginBottom: 10 }}>
          <TextInput
            style={[
              s.input,
              {
                borderColor: validator?.username
                  ? colors.status.error
                  : '#808080',
              },
            ]}
            placeholderTextColor={'#808080'}
            placeholder="Enter your username"
            onChangeText={value => handleInputChange('username', value)}
            value={fromData.username}
          />
          {validator?.username && (
            <Text style={[s.smallText, s.error]}>{validator.username}</Text>
          )}
        </View>
        <Text style={s.lable}>Password</Text>
        <View style={{ position: 'relative', marginBottom: 20 }}>
          <TextInput
            placeholder="Password"
            style={[
              s.input,
              {
                borderColor: validator?.password
                  ? colors.status.error
                  : '#808080',
              },
            ]}
            placeholderTextColor={'#808080'}
            secureTextEntry
            onChange={value =>
              handleInputChange('password', value.nativeEvent.text)
            }
            value={fromData.password}
          />
          {validator?.password && (
            <Text style={[s.smallText, s.error]}>{validator.password}</Text>
          )}
        </View>
        <Pressable disabled={loading} onPress={handleLogin} style={s.button}>
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={s.buttonText}>Login</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
