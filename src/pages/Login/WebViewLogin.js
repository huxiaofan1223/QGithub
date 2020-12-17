import WebView from "react-native-webview";
import {clientID,secret} from '../../config'
import React,{Component} from 'react';
import Storage from '../../utils/storage'
import {StackActions,NavigationActions} from 'react-navigation'
import loadingUtils from '../../utils/loadingUtils'
import {Text,ActivityIndicator,View} from 'react-native'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })],
});

function Loading(){
	return (
		<View style={{height:"100%",alignItems:"center",justifyContent:"center"}}>
				<ActivityIndicator color="#555" size="large"/>
		</View>
	)
}
export default class AuthPage extends Component{
	constructor(props) {
		super(props)
		this.state={
			loading:true
		}
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
		loadingUtils.show()
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
    })
    .then(res=>res.json())
		.then(res=>{
			const token = res.access_token         //token8个小时过期
			console.log(token)
			Storage.set("refreshToken",res.refresh_token)    //存refresh_token   6个月过期
			Storage.set("token","token "+token).then(()=>{
				loadingUtils.hide()
				this.props.navigation.dispatch(resetAction)
			})
		})
	}
	render(){
		return (
			<WebView
			style={{height:"100%"}}
			source={{uri:`https://github.com/login/oauth/authorize?client_id=${clientID}`}}
			// source={{uri:'https://github.com/apps/qffgithub/installations/new'}}
			onNavigationStateChange={e=>{
				let url = e.url
				console.log(url)
				if (url.indexOf('http://qgithub.auth') === 0) {
					const code = url.split("?code=")[1]
					console.log(code)
					this.success(code)
					return false
				}
				return true
			}}
			onShouldStartLoadWithRequest={e=>{
				let url = e.url
				console.log(url)
				if (url.indexOf('http://qgithub.auth') === 0) {
					const code = url.split("?code=")[1]
					console.log(code)
					this.success(code)
					return false
				}
				return true
			}}
			javaScriptEnabled={true}
			domStorageEnabled={true}
			scalesPageToFit={true}
			mixedContentMode={'always'}
			automaticallyAdjustContentInsets={true}
			allowUniversalAccessFromFileURLs={true}
			mediaPlaybackRequiresUserAction={true}
			startInLoadingState={true}
			startInLoadingState = { true } 
  		renderLoading = {()=> <Loading />}
			></WebView>
		)
	}
	
}