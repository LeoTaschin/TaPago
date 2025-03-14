import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useTheme } from '../context/ThemeContext';
import { Friends } from '../screens/Friends';
import { Groups } from '../screens/Groups';

export function MainTabs({ activeTab, onTabChange }) {
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  const [routes] = React.useState([
    { key: 'friends', title: '' },
    { key: 'groups', title: '' },
    { key: 'activity', title: '' },
  ]);

  const index = routes.findIndex(route => route.key === activeTab);

  const renderScene = SceneMap({
    friends: Friends,
    groups: Groups,
    activity: () => (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Placeholder para a tela de Atividade */}
      </View>
    ),
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ height: 0 }}
      style={{ height: 0 }}
      labelStyle={{ display: 'none' }}
      activeColor={colors.primary}
      inactiveColor={colors.subText}
      pressColor={colors.primary + '20'}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={(index) => onTabChange(routes[index].key)}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={styles.container}
      swipeEnabled={true}
      animationEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 