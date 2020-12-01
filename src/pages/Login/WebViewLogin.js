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
	qs2json(qstring){
		let arr = qstring.split("&")
		let ob = {}
		for(let i of arr){
			const newARR = i.split("=")
			ob[newARR[0]] = newARR[1]
		}
		return ob
	}
	success(code){
		loadingUtils.show()
		let _this = this
		let url = `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${secret}&code=${code}`
		fetch(url)
		.then(res=>res.text())
		.then(res=>{
			let tokenInfo = this.qs2json(res)
			const token = tokenInfo.access_token         //token8个小时过期
			Storage.set("refreshToken",tokenInfo.refresh_token)    //存refresh_token   6个月过期
			console.log(tokenInfo)
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
			onNavigationStateChange={e=>{
				let url = e.url
				if (url.indexOf('http://qgithub.auth') === 0) {
					const code = url.split("?code=")[1]
					this.success(code)
					return false
				}
				return true
			}}
			onShouldStartLoadWithRequest={e=>{
				let url = e.url
				if (url.indexOf('http://qgithub.auth') === 0) {
					const code = url.split("?code=")[1]
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