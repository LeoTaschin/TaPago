import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const SPACING = 20;
const { width } = Dimensions.get('window');

export function BottomToolbar({ activeTab, onTabChange }) {
  const { colors, textStyles } = useTheme();

  const menuItems = [
    {
      name: 'Amigos',
      icon: 'person',
      tab: 'friends',
    },
    {
      name: 'Grupos',
      icon: 'people',
      tab: 'groups',
    },
    {
      name: 'Novo',
      icon: 'add-sharp',
      tab: 'new',
      isCenter: true,
    },
    {
      name: 'Atividade',
      icon: 'pulse',
      tab: 'activity',
    },
    {
      name: 'Perfil',
      icon: 'person-circle',
      tab: 'profile',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <View style={[
        styles.container,
        { 
          backgroundColor: colors.background,
          borderColor: Platform.OS === 'ios' ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.3)',
        },
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
      ]}>
        <View style={styles.content}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.isCenter && styles.centerMenuItem
              ]}
              onPress={() => onTabChange(item.tab)}
            >
              {item.isCenter ? (
                <View style={styles.centerButtonWrapper}>
                  <View style={[styles.centerButton, { backgroundColor: colors.primary }]}>
                    <Ionicons 
                      name={item.icon}
                      size={38} 
                      color={colors.white}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.iconContainer}>
                  {activeTab === item.tab && (
                    <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
                  )}
                  <Ionicons 
                    name={item.icon} 
                    size={28}
                    color={activeTab === item.tab ? colors.primary : colors.text2}
                  />
                  <Text style={[
                    styles.menuText, 
                    { 
                      color: activeTab === item.tab ? colors.primary : colors.text2
                    }
                  ]}>
                    {item.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    position: 'relative',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    width: '100%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    overflow: 'visible',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingVertical: SPACING / 2,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
  },
  centerMenuItem: {
    height: 90,
    marginTop: -30,
  },
  centerButtonWrapper: {
    height: '100%',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
    height: '100%',
  },
  menuText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: -15,
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  androidShadow: {
    elevation: 5,
  },
}); 