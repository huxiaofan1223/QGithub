import React from 'react';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import UserPage from './pages/Tabs/Home';
import SearchPage from './pages/Tabs/Search';

export const TabNav = createBottomTabNavigator(
    {
        User: {
            screen: UserPage,
        },
        Search: {
            screen: SearchPage,
        }
    },
    {
        tabBarOptions: {
            activeTintColor: '#1e90ff',
            inactiveTintColor: '#333333',
            showIcon: true,
            showLabel: true,
            upperCaseLabel: false,
            pressColor: '#788493',
            pressOpacity: 0.8,
            style: {
                backgroundColor: '#fff',
                paddingBottom: 1,
                borderTopWidth: 0.2,
                paddingTop:1,
                borderTopColor: '#ccc',
            },
            labelStyle: {
                fontSize: 13,
                margin: 0
            },
            indicatorStyle: {height: 0},
        },
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
        backBehavior: 'none'
    });