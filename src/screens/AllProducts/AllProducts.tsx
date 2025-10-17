import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { isSuperAdmin } from '../../utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useGlobalStyles } from '../../styles/globalStyles';
import { useThemeColors, useThemeMode } from '../../styles/theme';
import config from '../../../config';
import Lucide from '@react-native-vector-icons/lucide';
import { toggleTheme } from '../../store/slices/themeSlice';

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
};

type CategoryOption = {
  label: string;
  value: string;
};

export default function AllProducts(props: any) {
  const s = useGlobalStyles();
  const colors = useThemeColors();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [listData, setListData] = useState<Product[]>([]);
  const authUser = useAppSelector(state => state.auth.user);
  const canDelete = isSuperAdmin(String(authUser?.id ?? ''));
  const dispatch = useAppDispatch();
  const mode = useThemeMode();

  const isGroceriesScreen = props?.route?.name === 'Groceries';

  useEffect(() => {
    if (isGroceriesScreen) {
      setSelectedCategory('groceries');
    }
  }, [isGroceriesScreen]);

  const headerTitle = useMemo(
    () => (selectedCategory === 'all' ? 'All products' : selectedCategory),
    [selectedCategory],
  );

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${config.API_URL}/products/categories`);
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      // Normalize into {label, value} to avoid rendering raw objects
      let options: CategoryOption[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === 'string') {
          options = (data as string[]).map(c => ({ label: c, value: c }));
        } else if (data.length > 0 && typeof data[0] === 'object') {
          options = (data as any[]).map(c => ({
            label: c?.name ?? c?.slug ?? String(c),
            value: c?.slug ?? c?.name ?? String(c),
          }));
        }
      }
      setCategories([{ label: 'all', value: 'all' }, ...options]);
    } catch (e: any) {
      console.error(e);
      setCategories([{ label: 'all', value: 'all' }]);
    }
  };

  const fetchProducts = async (category?: string) => {
    const url =
      category && category !== 'all'
        ? `${config.API_URL}/products/category/${encodeURIComponent(category)}`
        : `${config.API_URL}/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load products');
    const data = await res.json();
    const items: Product[] = Array.isArray(data)
      ? (data as Product[])
      : (data.products as Product[]);
    return items ?? [];
  };

  const productsQuery = useQuery<Product[], Error>({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${config.API_URL}/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data?.isDeleted) {
        throw new Error('Could not delete product (simulated API)');
      }
      return id;
    },
    onSuccess: async () => {
      console.log('Deleted product', deleteMutation.variables);
      setListData(prev =>
        prev.filter(item => item.id !== deleteMutation.variables),
      );
    },
  });

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      Alert.alert('Not allowed', 'Only super admins can delete products.');
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e?.message || 'Delete failed');
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    if (!isGroceriesScreen) fetchCategories();
    productsQuery.data && setListData(productsQuery.data);
  }, [productsQuery.data]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View
      style={[
        {
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          flex: 1,
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          paddingTop: 10,
        },
      ]}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: 60, height: 60, borderRadius: 6 }}
        resizeMode="cover"
      />
      <View
        style={{
          paddingHorizontal: 10,
          paddingBottom: 10,
        }}
      >
        <Text
          style={[
            s.smallText,
            { color: colors.text.primary, flexWrap: 'wrap' },
          ]}
        >
          {item.title}
        </Text>
        {/* show more  */}
        <Text style={s.smallText}>
          {item.description?.slice(0, 50) + '...'}
        </Text>
        <Text style={[s.smallText, s.success]}>${item.price}</Text>
      </View>
      {canDelete && (
        <Pressable
          style={{ padding: 8, position: 'absolute', bottom: 0, right: 0 }}
          onPress={e => {
            handleDelete(item.id);
          }}
        >
          <Lucide name="trash" size={24} color={colors.text.secondary} />
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[s.safeArea]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 15,
        }}
      >
        <Text style={[s.header]}>{headerTitle}</Text>

        <Pressable
          onPress={() => dispatch(toggleTheme())}
          style={{ padding: 6 }}
        >
          <Lucide
            name={mode === 'dark' ? 'sun' : 'moon'}
            size={20}
            color={colors.text.secondary}
          />
        </Pressable>
      </View>

      {/* Categories */}
      {!isGroceriesScreen && (
        
        <FlatList
          data={categories}
          keyExtractor={c => c.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 50  }}
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 8,
            paddingHorizontal: 15,
            height: 50,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectCategory(item.value)}
              style={[
                {
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  height: 40,
                  borderRadius: 16,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    selectedCategory === item.value
                      ? colors.accent.tertiary
                      : colors.background.secondary,
                },
              ]}
            >
              <Text
                style={[
                  s.smallText,
                  {
                    color:
                      selectedCategory === item.value
                        ? colors.text.inverse
                        : colors.text.secondary,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      )}
      <View style={[s.container, {marginTop: 15}]}>
        {/* Products */}
        {(productsQuery.isLoading || deleteMutation.isPending) && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" color={colors.accent.primary} />
          </View>
        )}
        {productsQuery.error && (
          <Text style={[s.smallText, s.error]}>
            {productsQuery.error
              ? productsQuery.error.message
              : 'Error loading products'}
          </Text>
        )}
        {productsQuery.data && (
          <FlatList
            data={listData}
            keyExtractor={item => String(item.id)}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={{ gap: 10, flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={productsQuery.isFetching}
                onRefresh={productsQuery.refetch}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
