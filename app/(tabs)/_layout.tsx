import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Tabs } from 'expo-router';


export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gifts',
          tabBarIcon: ({color}) => {
            return <FontAwesome size={28} name='gift' color={color} />
          }
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({color}) => {
            return <FontAwesome size={28} name='dribbble' color={color} />
          }
        }}
      />
    </Tabs>
  );
}
