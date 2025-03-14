import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, moderateScale } from '../utils/dimensions';

export function SelectionToolbar({ activeTab, onTabChange }) {
  const { colors, textStyles } = useTheme();

  const tabs = [
    { id: 'friends', label: 'Amigos' },
    { id: 'groups', label: 'Grupos' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && { 
              borderBottomWidth: moderateScale(2),
              borderBottomColor: colors.primary 
            }
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text 
            style={[
              textStyles.button,
              { 
                color: activeTab === tab.id ? colors.primary : colors.text,
                fontWeight: activeTab === tab.id ? '600' : '400'
              }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: moderateScale(48),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
}); 