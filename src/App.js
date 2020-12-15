import React from 'react';
import { createStackNavigator } from 'react-navigation-stack'
import {createAppContainer } from 'react-navigation'
import {TabNav} from "./TabBar";
import LoginPage from "./pages/Login/index";
import AuthPage from "./pages/Login/WebViewLogin";
import MyLoading from "./components/MyLoading";
import RepoPage from "./pages/Repo/index";
import ContentPage from "./pages/Content/index";
import SearchResultPage from "./pages/Search/index";
import IssuesPage from "./pages/Issues/index";
import IssuePage from "./pages/Issues/Issue";
import PullsPage from "./pages/Pulls/index";
import PullPage from "./pages/Pulls/Pull";
import OthersPage from "./pages/User/others";
import FollowerPage from "./pages/Follow/follower";
import FollowingPage from "./pages/Follow/following";
import {View,StatusBar} from 'react-native'
import { enableScreens } from 'react-native-screens';
import { RootSiblingParent } from 'react-native-root-siblings';
enableScreens();

const Container = createStackNavigator({
        Login: {
            screen: LoginPage,
            navigationOptions: ({navigation}) => ({
                headerShown: false
            })
        },
        Main: {
            screen: TabNav,
            navigationOptions: ({navigation}) => ({
                headerShown: false
            })
        },
        Repo:{screen:RepoPage},
        Content:{screen:ContentPage},
        SearchResult:{screen:SearchResultPage},
        Issues:{screen:IssuesPage},
        Issue:{screen:IssuePage},
        Pulls:{screen:PullsPage},
        Pull:{screen:PullPage},
        Others:{screen:OthersPage},
        Followers:{screen:FollowerPage},
        Following:{screen:FollowingPage},
        Auth:{screen:AuthPage},
    },
    {
        initialRouteName: 'Login',
        headerMode: 'screen',
        defaultNavigationOptions: {
            gestureEnabled: true
        },
    });

const Appcontainer = createAppContainer(Container)

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const Wrapper = Platform.OS === 'ios' ? React.Fragment : RootSiblingParent;
        return (
            <Wrapper>
            <View style={{flex : 1}}>
                <StatusBar barStyle='dark-content' backgroundColor='rgba(0,0,0,0)' translucent={true}></StatusBar>
                <Appcontainer/>
                <MyLoading
                    ref={(ref) => {
                        global.mLoadingComponentRef = ref;
                    }}
                />
            </View>
            </Wrapper>
        );
    }

}