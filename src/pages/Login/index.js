import React, {Component} from "react";
import { View, StyleSheet,TextInput ,TouchableHighlight, Text, Image, ToastAndroid} from "react-native";
import { base64_encode } from '../../utils/base64'
import Storage from '../../utils/storage'
import api from '../../utils/request'
import {StackActions,NavigationActions} from 'react-navigation'
import CookieManager from 'react-native-cookies'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })],
});

class LoginPage extends Component {
	constructor(props) {
	    super(props)
		this.state={
			username:"",
			password:"",
			show:false
		}
	}
	async componentDidMount(){
		let _this = this
		const token = await Storage.get("token")
		if(token){
			_this.props.navigation.dispatch(resetAction)
		}
		else
			this.setState({show:true})
	}
	onChangeUser(value){
		this.setState({
			username:value
		})
	}
	onChangePass(value){
		this.setState({
			password:value
		})
	}
	async onLogin(){
		this.refs.usn.blur()
		this.refs.pwd.blur()
		let{ username,password } = this.state
		if (!username){
			this.refs.usn.focus()
			return ToastAndroid.show('请输入账号', ToastAndroid.SHORT)
		}
		if(!password){
			this.refs.pwd.focus()
			return ToastAndroid.show('请输入密码', ToastAndroid.SHORT)
		}
		Storage.set('token','Basic ' + base64_encode(username + ':' + password))
		api.get("/user").then(res=>{
			if(res.message == "Requires authentication"||res.message=="Bad credentials"){
				Storage.set("token","")
				return ToastAndroid.show('账号或密码错误', ToastAndroid.SHORT)
			}
			if(res.message == "Bad credentials. The API can't be accessed using username/password authentication. Please create a personal access token to access this endpoint: http://github.com/settings/tokens"){
				ToastAndroid.show('不能使用账号密码登陆,此账号api已经被封', ToastAndroid.SHORT)
				Storage.set("token","")
				CookieManager.clearAll()
				this.props.navigation.navigate("Auth")  //清空webview cookies并且跳转到github认证页面
			}
			else{
				Storage.set("userInfo",res)
				this.props.navigation.dispatch(resetAction)   //重置路由跳转至tab页
			}
		})
	}
	render(){
		return (
		  this.state.show&&(<View style={styles.container}>
			    <View style={{width:"90%",alignItems:"center",padding:30,paddingBottom:60}}>
				<Image source={require("../../images/logo.jpg")} style={{width:80,height:80,marginBottom:30,borderRadius:40}} />
				<View style={{width:"100%",marginBottom:20}}>
					<TextInput
						  style={{ height: 45,width: '100%',paddingLeft:10 ,backgroundColor:"white",borderRadius:5}}
						  onChangeText={this.onChangeUser.bind(this)}
						  placeholder="请输入帐号"
						  ref="usn"
						  value={this.state.username}
						/>
				</View>
				<View style={{width:"100%",marginBottom:40}}>
					<TextInput
							style={{ height: 45,width: '100%',paddingLeft:10 ,backgroundColor:"white",borderRadius:5}}
							onChangeText={this.onChangePass.bind(this)}
							placeholder="请输入密码"
							textContentType="password"
							secureTextEntry={true}
							ref="pwd"
							value={this.state.password}
							/>
				</View>
				  <View style={{width:"100%"}}>
				  	<TouchableHighlight onPress={this.onLogin.bind(this)} style={{height:45,alignItems:"center",justifyContent:"center",backgroundColor:"#1e90ff",borderRadius:5}} underlayColor="black">
							<Text style={{color:"#ffffff"}}>登录</Text>
					</TouchableHighlight>
				  </View>
				</View>
		  </View>)
		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
		backgroundColor:"#f7f7f7"
  }
});

export default LoginPage;