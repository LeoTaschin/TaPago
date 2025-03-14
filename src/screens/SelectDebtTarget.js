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
import { auth } from '../firebase/firebaseConfig';

export default function SelectDebtTarget({ navigation }) {
  const { colors, textStyles } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('SelectDebtTarget - useEffect - user:', user?.uid);
    console.log('SelectDebtTarget - useEffect - auth.currentUser:', auth.currentUser?.uid);

    if (!user) {
      console.log('SelectDebtTarget - useEffect - Usuário não autenticado');
      setLoading(false);
      setError('Usuário não autenticado');
      return;
    }

    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user?.uid) {
      console.log('SelectDebtTarget - loadFriends - Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('SelectDebtTarget - loadFriends - Buscando amigos para:', user.uid);
      const friendsList = await getUserFriends(user.uid);
      console.log('SelectDebtTarget - loadFriends - Lista de amigos:', friendsList);
      setFriends(friendsList);
    } catch (err) {
      console.error('SelectDebtTarget - loadFriends - Erro:', err);
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
    console.log('SelectDebtTarget - Iniciando navegação para NewCharge');
    console.log('SelectDebtTarget - Amigo selecionado:', target);
    console.log('SelectDebtTarget - Tipo:', activeTab);

    if (!target?.id) {
      console.error('SelectDebtTarget - Erro: amigo sem ID');
      return;
    }

    // Garantir que o amigo tem todos os campos necessários
    const selectedTarget = {
      id: target.id,
      username: target.username || '',
      email: target.email || '',
      photoURL: target.photoURL || null
    };

    const params = {
      selectedTarget,
      type: activeTab
    };

    console.log('SelectDebtTarget - Parâmetros de navegação:', params);
    
    // Usar setTimeout para garantir que a navegação aconteça no próximo ciclo
    setTimeout(() => {
      navigation.navigate('NewCharge', params);
    }, 0);
  };

  const renderFriendItem = ({ item }) => {
    console.log('Renderizando amigo:', item);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: colors.cardBackground }]}
        onPress={() => {
          console.log('Clique no amigo:', item);
          handleSelectTarget(item);
        }}
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
  };

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
        keyExtractor={item => item.id}
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