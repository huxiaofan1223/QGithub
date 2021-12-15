import React, {Component} from "react";
import { View, StyleSheet,TextInput ,TouchableHighlight, Text, Image} from "react-native";
import { base64_encode } from '../../utils/base64'
import Storage from '../../utils/storage'
import api from '../../utils/request'
import {StackActions,NavigationActions} from 'react-navigation'
import CookieManager from 'react-native-cookies'
import MyToast from "../../utils/Toast";


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
		const token = await Storage.get("token")
		// const refreshToken = await Storage.get("refreshToken")
		if(token){
			this.props.navigation.dispatch(resetAction)
		}
		else{
			this.setState({show:true})
			setTimeout(()=>{
				this.onLogin();
			},1000)
		}
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
		CookieManager.clearAll().then(()=>{
			// console.log("清空cookies成功");
			this.props.navigation.navigate("Auth")  //清空webview cookies并且跳转到github认证页面
		})
		return 
		if (!username){
			this.refs.usn.focus()
			return MyToast("请输入账号")
		}
		if(!password){
			this.refs.pwd.focus()
			return MyToast("请输入密码")
		}

		// await Storage.set('token','Basic ' + base64_encode(username + ':' + password))
		// api.get("/user").then(res=>{
		// 	if(res.message == "Requires authentication"||res.message=="Bad credentials"){
		// 		Storage.set("token","")
		// 		return MyToast("账号或密码错误")
		// 	}
		// 	if(res.message == "Bad credentials. The API can't be accessed using username/password authentication. Please create a personal access token to access this endpoint: http://github.com/settings/tokens"){
		// 		MyToast("不能使用账号密码登陆,此api已经被封")
		// 		Storage.set("token","")
		// 		CookieManager.clearAll()
		// 		this.props.navigation.navigate("Auth")  //清空webview cookies并且跳转到github认证页面
		// 	}
		// 	else{
		// 		Storage.set("userInfo",res)
		// 		this.props.navigation.dispatch(resetAction)   //重置路由跳转至tab页
		// 	}
		// })
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
				<View style={{marginTop:20,position:"absolute",bottom:30}}>
					<Text style={{color:"#666"}}>提示:登录api被封,请直接点击登录(可能很慢,请尽量用代理)</Text>
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