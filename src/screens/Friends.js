import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_FRIENDS = [
  {
    id: '1',
    name: 'João Silva',
    debt: 'R$ 150,00',
    isPositive: true,
  },
  {
    id: '2',
    name: 'Maria Santos',
    debt: 'R$ 75,00',
    isPositive: false,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    debt: 'R$ 200,00',
    isPositive: true,
  },
];

export function Friends() {
  const { colors } = useTheme();

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.friendCard, { backgroundColor: colors.background }]}
      onPress={() => {}}
    >
      <View style={styles.friendInfo}>
        <View style={styles.friendHeader}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
          <Text
            style={[
              styles.debt,
              { color: item.isPositive ? colors.success : colors.error },
            ]}
          >
            {item.debt}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={SAMPLE_FRIENDS}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  friendCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
  },
  debt: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 