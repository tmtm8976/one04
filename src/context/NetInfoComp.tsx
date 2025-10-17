import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { StyleSheet, Text } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';

const NetInfoComp = () => {
  const [hasInternet, setHasInternet] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setHasInternet(state.isConnected === true); // ensure boolean
      });

      return () => unsubscribe();
    }, [])
  );

  console.log("hasInternet", hasInternet);

  return !hasInternet ? (
    <Animated.View entering={BounceIn.delay(400)} style={styles.container}>
      <Text style={styles.text1}>No Internet</Text>
      <Text numberOfLines={1} style={styles.text2}>
        Please check your internet connection
      </Text>
    </Animated.View>
  ) : null;
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingVertical: 15,
    position: 'absolute',
    zIndex: 1,
    marginHorizontal: 10,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderStartWidth: 5,
    borderColor: 'red',
  },
  text1: { textAlign: 'left', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  text2: { textAlign: 'left', fontWeight: '500' },
});

export default NetInfoComp;
