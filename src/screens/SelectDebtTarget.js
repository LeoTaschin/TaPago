import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, moderateScale } from '../utils/dimensions';
import { getUserFriends } from '../services/userService';

export default function SelectDebtTarget({ navigation }) {
  const { colors, textStyles } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const friendsList = await getUserFriends(user.uid);
      setFriends(friendsList);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Não foi possível carregar seus amigos. Por favor, tente novamente.');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSelectTarget = (target) => {
    navigation.navigate('NewCharge', {
      selectedTarget: target,
      type: activeTab
    });
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleSelectTarget(item)}
    >
      <Image
        source={{ uri: item.photoURL || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <View style={styles.itemInfo}>
        <Text style={[textStyles.body, { color: colors.text }]}>
          {item.username}
        </Text>
        <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
          {item.email}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={moderateScale(20)} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[textStyles.body, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadFriends}
          >
            <Text style={[textStyles.button, { color: colors.white }]}>
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'friends' && friends.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            Você ainda não tem amigos adicionados
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={[textStyles.button, { color: colors.white }]}>
              Adicionar Amigos
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'groups') {
      return (
        <View style={styles.centerContainer}>
          <Text style={[textStyles.body, { color: colors.textSecondary }]}>
            Em breve você poderá dividir despesas em grupo!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.uid}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons 
            name="close" 
            size={moderateScale(24)} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={[textStyles.h2, { color: colors.text }]}>
          Nova Cobrança
        </Text>
        <View style={styles.placeholder} />
      </View>

      <SelectionToolbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  placeholder: {
    width: moderateScale(24),
  },
  list: {
    padding: SPACING.lg,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: moderateScale(8),
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: moderateScale(8),
  },
  addButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: moderateScale(8),
  },
}); 