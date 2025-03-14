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
import { SPACING, moderateScale } from '../utils/dimensions';

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
  const { colors, textStyles } = useTheme();

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.background }]}
      onPress={() => {}}
    >
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.membersContainer}>
            <Ionicons name="people" size={moderateScale(16)} color={colors.text2} />
            <Text style={[styles.membersText, { color: colors.text2 }]}>
              {item.members}
            </Text>
          </View>
        </View>
        <Text style={[styles.lastActivity, { color: colors.text2 }]}>
          {item.lastActivity}
        </Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {item.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[textStyles.body, { color: colors.text2, textAlign: 'center' }]}>
        Você ainda não tem grupos criados.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={SAMPLE_GROUPS}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  groupCard: {
    borderRadius: moderateScale(15),
    padding: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groupName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersText: {
    marginLeft: SPACING.xs,
    fontSize: moderateScale(14),
  },
  lastActivity: {
    fontSize: moderateScale(12),
    marginBottom: SPACING.sm,
  },
  amount: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  separator: {
    height: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
}); 