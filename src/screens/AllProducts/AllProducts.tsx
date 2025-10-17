import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { globalStyles as s } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

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

const DUMMY_BASE = 'https://dummyjson.com';

export default function AllProducts() {
  const [loading, setLoading] = useState(false); // still used for categories
  const [error, setError] = useState<string | null>(null); // still used for categories
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [listData, setListData] = useState<Product[]>([]);
  const navigation = useNavigation<any>();
  const { authUser } = useAuth();
  const canDelete = isSuperAdmin(String(authUser?.id ?? ''));

  const headerTitle = useMemo(
    () => (selectedCategory === 'all' ? 'All products' : selectedCategory),
    [selectedCategory],
  );

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${DUMMY_BASE}/products/categories`);
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
        ? `${DUMMY_BASE}/products/category/${encodeURIComponent(category)}`
        : `${DUMMY_BASE}/products`;
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
      const res = await fetch(`${DUMMY_BASE}/products/${id}`, {
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
    fetchCategories();
    productsQuery.data && setListData(productsQuery.data);
  }, [productsQuery.data]);

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      style={[s.card, { flexDirection: 'row', gap: 10, alignItems: 'center' }]}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={{ width: 60, height: 60, borderRadius: 6 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text
          style={[s.text, { color: colors.text.secondary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={s.smallText} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[s.smallText, s.success]}>${item.price}</Text>
      </View>
      {canDelete && (
        <Pressable
          style={{ padding: 8 }}
          onPress={e => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
        >
          <Text style={[s.smallText, s.error]}>Delete</Text>
        </Pressable>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <Text style={s.header}>{headerTitle}</Text>

        {/* Categories */}
        <FlatList
          data={categories}
          keyExtractor={c => c.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectCategory(item.value)}
              style={[
                s.card,
                {
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor:
                    selectedCategory === item.value
                      ? colors.accent.secondary
                      : colors.background.elevated,
                },
              ]}
            >
              <Text
                style={[
                  s.smallText,
                  {
                    color:
                      selectedCategory === item.value
                        ? colors.text.primary
                        : colors.text.secondary,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Products */}
        {(loading || productsQuery.isLoading) && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" />
          </View>
        )}
        {(error || productsQuery.error) && (
          <Text style={[s.smallText, s.error]}>
            {productsQuery.error ? productsQuery.error.message : error}
          </Text>
        )}
        {!loading && !error && productsQuery.data && (
          <FlatList
            data={listData}
            keyExtractor={item => String(item.id)}
            renderItem={renderProduct}
            onRefresh={productsQuery.refetch}
            refreshing={productsQuery.isFetching}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
