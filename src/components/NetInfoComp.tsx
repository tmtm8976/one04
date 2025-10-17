import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Lucide from '@react-native-vector-icons/lucide';
import { colors } from '../styles/colors';

const NetInfoComp = () => {
  const [hasInternet, setHasInternet] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setHasInternet(state.isConnected === true); // ensure boolean
      });

      return () => unsubscribe();
    }, []),
  );

  return hasInternet ? null : (
    <View style={styles.container}>
      <Text style={styles.text1}>No Internet</Text>
      <Text numberOfLines={1} style={styles.text2}>
        Please check your internet connection
      </Text>
      <Lucide name="wifi-off" size={24} color={colors.accent.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  text1: {
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,  
  },
  text2: { textAlign: 'left', fontWeight: '500' },
});

export default NetInfoComp;
