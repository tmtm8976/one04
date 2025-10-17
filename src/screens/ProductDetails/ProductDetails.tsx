import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles as s } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
};

export type HomeStackParamList = {
  AllProducts: undefined;
  ProductDetails: { product: Product };
};

export default function ProductDetails() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'ProductDetails'>>();
  const { product } = route.params;

  React.useEffect(() => {
    // If header is shown by navigator for this screen, set the title
    navigation.setOptions?.({ title: product.title });
  }, [navigation, product.title]);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={[s.container, { paddingBottom: 24 }]}>        
        <Text style={s.header}>{product.title}</Text>

        <View style={[s.card, { alignItems: 'center' }]}>          
          <Image
            source={{ uri: product.thumbnail }}
            style={{ width: '100%', height: 220, borderRadius: 8 }}
            resizeMode="cover"
          />
        </View>

        <View style={[s.card, { gap: 8 }]}>          
          <Text style={[s.text, { color: colors.text.secondary }]}>Category</Text>
          <Text style={s.smallText}>{product.category}</Text>
        </View>

        <View style={[s.card, { gap: 8 }]}>          
          <Text style={[s.text, { color: colors.text.secondary }]}>Price</Text>
          <Text style={[s.smallText, s.success]}>${product.price}</Text>
        </View>

        <View style={[s.card, { gap: 8 }]}>          
          <Text style={[s.text, { color: colors.text.secondary }]}>Description</Text>
          <Text style={s.smallText}>{product.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
