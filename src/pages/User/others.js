import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    RefreshControl
} from 'react-native';
import Storage from '../../utils/storage'
import api from '../../utils/request'
import RepoList from '../../components/ReposList'
import Userinfo from '../../components/Userinfo'
let page = 1
let isLoadingMore = false
export default class OthersPage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        title: navigation.state.params.title
    });
    constructor(props) {
	    super(props)
		this.state={
            userInfo:{},
            repoUrl:"",
            reposList:[],
            loading:true
		}
    }
    async componentDidMount(){
        await this.init();
    }
    async init(){
        const otherUrl= this.props.navigation.getParam("otherUrl")
        const netUserInfo = await this.getUserInfo(otherUrl)
        let repoUrl = netUserInfo.repos_url

        let userInfo = await Storage.get("userInfo")
        if(netUserInfo.login == userInfo.login){
            repoUrl = '/user/repos' 
        }else{
            userInfo = netUserInfo
        }
            
        this.getRepos(repoUrl)
        this.setState({
            userInfo,
            repoUrl,
            loading:false
        })
    }
    componentWillUnmount = () => {
        page = 1
        isLoadingMore = false
        this.setState = (state,callback)=>{
            return;
        };
    }
    getUserInfo(url){
        return api.get(url,{},false)
    }
    getRepos(repoUrl){
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
            this.setState({reposList})
            isLoadingMore = false
        }).catch((e) => {
            isLoadingMore = false
        })
    }
    
    onEndReached(){
        this.getRepos(this.state.repoUrl)
    }
    _Header(){
        return (
            <Userinfo
                {...this.props}
                userInfo = {this.state.userInfo}
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
                    onEndReached={this.onEndReached.bind(this)}
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
        paddingTop:0,
        backgroundColor:"white"
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});