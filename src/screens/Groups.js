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

const SAMPLE_GROUPS = [
  {
    id: '1',
    name: 'Viagem Praia',
    members: 5,
    lastActivity: '2h atrás',
    amount: 'R$ 450,00',
  },
  {
    id: '2',
    name: 'Churrasco',
    members: 8,
    lastActivity: '5h atrás',
    amount: 'R$ 320,00',
  },
  {
    id: '3',
    name: 'República',
    members: 4,
    lastActivity: '1d atrás',
    amount: 'R$ 890,00',
  },
];

export function Groups() {
  const { colors } = useTheme();

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.background }]}
      onPress={() => {}}
    >
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.membersContainer}>
            <Ionicons name="people" size={16} color={colors.subText} />
            <Text style={[styles.membersText, { color: colors.subText }]}>
              {item.members}
            </Text>
          </View>
        </View>
        <Text style={[styles.lastActivity, { color: colors.subText }]}>
          {item.lastActivity}
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {item.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={SAMPLE_GROUPS}
        renderItem={renderGroupItem}
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
  groupCard: {
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
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    marginLeft: 4,
    fontSize: 14,
  },
  lastActivity: {
    fontSize: 12,
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 