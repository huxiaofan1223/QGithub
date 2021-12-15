import React, {Component} from 'react';
import {
    View,
    Image,
    StyleSheet,
    RefreshControl
} from 'react-native';
import Storage from '../../utils/storage'
import api from '../../utils/request'
import RepoList from '../../components/ReposList'
import Userinfo from '../../components/Userinfo'
let page = 1
let isLoadingMore = false
export default class UserPage extends Component {
    constructor(props) {
	    super(props)
		this.state={
            userInfo:{},
            reposList:[],
            loading:true,
            exitFlag:true
		}
    }
    componentDidMount(){
        this.init()
    }
    init(){
        page = 1
        this.getUserInfo()
        this.getRepos()
    }
    componentWillUnmount = () => {
        page = 1
        isLoadingMore = false
        this.setState = (state,callback)=>{
            return;
        };
    }
    async getUserInfo(){
        let _this = this
        api.get("/user",{},false).then(res=>{
            let userInfo = res
            Storage.set("userInfo",userInfo)
            _this.setState({userInfo})
        })
    }
    getRepos(){
        const repoUrl = '/user/repos'
        if (isLoadingMore) {
            return;
        }
        isLoadingMore = true;
        let params ={
            page:page++,
            per_page:10
        }
        api.get(repoUrl,params,true).then(res=>{
            const reposList = page==2?res:this.state.reposList.concat(res)
            this.setState({
                reposList,
                loading:false
            })
            isLoadingMore = false
        }).catch((e) => {
            console.log('getRepoList error',e);
            isLoadingMore = false
        })
    }
    static navigationOptions = {
        tabBarLabel: '我的',
        tabBarIcon: ({focused}) => {
            if (focused) {
                return (
                    <Image style={styles.tabBarIcon} source={require('../../images/user2.png')}/>
                );
            }
            return (
                <Image style={styles.tabBarIcon} source={require('../../images/user.png')}/>
            );
        },
    };
    _Header(){
        return (
            <Userinfo
                {...this.props}
                userInfo = {this.state.userInfo}
                exitFlag = {this.state.exitFlag}
            >
            </Userinfo>
        )
    }
    render() {
        return (
            <View style={styles.container}>
                <RepoList
                    reposList={this.state.reposList}
                    navigation={this.props.navigation}
                    onEndReached={()=>{this.getRepos()}}
                    Header={this._Header.bind(this)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this.init.bind(this)}
                        />
                    }
                    >
                </RepoList>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop:20,
        backgroundColor:"white"
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});