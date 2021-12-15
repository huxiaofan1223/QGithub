import WebView from "react-native-webview";
import {clientID,secret} from '../../config'
import React,{Component} from 'react';
import Storage from '../../utils/storage'
import {StackActions,NavigationActions} from 'react-navigation'
import {ActivityIndicator,View} from 'react-native'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })],
});
let hasLogin = false;
let loginTimer = null;
function Loading(){
	return (
		<View style={{height:"100%",alignItems:"center",justifyContent:"center"}}>
			<ActivityIndicator color="#555" size="large"/>
		</View>
	)
}
const installUrl = "https://github.com/apps/qffgithub/installations/new"
// const noInstall = "https://huxiaofan1223.gitee.io/test/loading/?code=685b29b3255178b4a2a6&installation_id=13587779&setup_action=install"
const hasInstall = "https://github.com/settings/installations/"
export default class AuthPage extends Component{
	static navigationOptions =  () =>({
        title: 'Github授权登录'
    });
	constructor(props) {
		super(props)
		this.state={
			loading:true,
			url:`https://github.com/login/oauth/authorize?client_id=${clientID}`,
		}
	}
	componentDidMount(){
		hasLogin = false;
		loginTimer = null;
	}
	formQs(params){
		if (params) {
			let paramsArray = []
			Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
			return paramsArray.join('&')
		}
		return ""
	}
	success(code){
		if(hasLogin){
			return;
		}
		hasLogin = true;
		let url = 'https://github.com/login/oauth/access_token'
		let params = {
			code,
			client_id:clientID,
			client_secret:secret
		}
		fetch(url,{
			method :'POST',
      		body:this.formQs(params),
			headers:{
				'Accept': 'application/json',
				'Content-Type':'application/x-www-form-urlencoded'
			}
		}).then(res=>res.json()).then(res=>{
			const token = res.access_token;         //token8个小时过期
			Storage.set("refreshToken",res.refresh_token);    //存refresh_token   6个月过期
			Storage.set("token","token "+token).then(()=>{
				this.setState({
					url:installUrl
				})
			})
		})
	}
	render(){
		return (
			<WebView
			style={{height:"100%"}}
			source={{uri:this.state.url}}
			onNavigationStateChange={e=>{
				let url = e.url
				if (url.indexOf('https://huxiaofan1223.gitee.io/test/loading') === 0  && url.indexOf("installation_id")== -1) {
					const code = url.split("?code=")[1];
					this.success(code)
					return false
				}
				if(url.indexOf(hasInstall) === 0 || url.indexOf('https://huxiaofan1223.gitee.io/test/loading') === 0){
					if(loginTimer === null){
						loginTimer = setTimeout(()=>{
							this.props.navigation.dispatch(resetAction);
						},200)
					}
				}
				return true
			}}
			// onShouldStartLoadWithRequest={e=>{
			// 	let url = e.url
			// 	if (url.indexOf('https://huxiaofan1223.gitee.io/test/loading') === 0  && url.indexOf("installation_id")== -1) {
			// 		const code = url.split("?code=")[1]
			// 		this.success(code)
			// 		return false
			// 	}
			// 	if(url.indexOf(hasInstall) === 0 || url.indexOf('https://huxiaofan1223.gitee.io/test/loading') === 0){
			// 		this.props.navigation.dispatch(resetAction)
			// 	}
			// 	return true
			// }}
			javaScriptEnabled={true}
			domStorageEnabled={true}
			scalesPageToFit={true}
			mixedContentMode={'always'}
			automaticallyAdjustContentInsets={true}
			allowUniversalAccessFromFileURLs={true}
			mediaPlaybackRequiresUserAction={true}
			startInLoadingState = { true } 
  			renderLoading = {()=> <Loading />}
			></WebView>
		)
	}
	
}