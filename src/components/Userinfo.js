import React from 'react'
import { Text, View ,FlatList,Image,TouchableOpacity,Dimensions,Alert} from 'react-native'
import { dp2px } from '../utils/utils'
import Storage from '../utils/storage'
import {StackActions,NavigationActions} from 'react-navigation'

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Login' })],
});

const {height,width} =  Dimensions.get('window');
const userInfo = (props) => {
  // let allcount = props.userInfo.owned_private_repos?props.userInfo.public_repos+props.userInfo.owned_private_repos:props.userInfo.public_repos
  let allcount = props.userInfo.public_repos
  return (
    <View style={{marginBottom:10}}>
      <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
          <Image source={{uri:props.userInfo.avatar_url}} style={{width:60,height:60,marginRight:20,borderRadius:30}}/>
          <View>
              {props.userInfo.name&&<Text style={{fontSize:22}}>{props.userInfo.name}</Text>}
              <Text style={{color:"#444"}}>{props.userInfo.login}</Text>
          </View>
          {props.exitFlag&&(<Text style={{fontSize:12,marginLeft:20,backgroundColor:"#ebebeb",padding:10,paddingTop:5,paddingBottom:5}} 
          onPress={()=>{
            Storage.remove("userInfo")
            Storage.remove("refreshToken")
            Storage.remove("token").then(()=>{
              Alert.alert('退出登录','是否注销登录',
                  [
                      {text:"取消", onPress:()=>false},
                      {text:"确认", onPress:()=>{props.navigation.dispatch(resetAction)}}
                  ]
              );
            })
          }}>LOGOUT</Text>)}
      </View>
      <View style={{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-around"}}>
            {!!props.userInfo.location&&(<View style={{flexDirection:"row",alignItems:"center",marginTop:6}}>
              <Image source={require('../images/map.png')} style={{width:20,height:20}}></Image>
              <Text style={{color:"#444"}}>{props.userInfo.location}</Text>
          </View>)}
            {!!props.userInfo.company&&(<View style={{flexDirection:"row",alignItems:"center",marginTop:6}}>
              <Image source={require('../images/company.png')} style={{width:20,height:20}}></Image>
              <Text style={{color:"#444"}}>{props.userInfo.company}</Text>
          </View>)}
            {!!props.userInfo.blog&&(<View style={{flexDirection:"row",alignItems:"center",marginTop:6}}>
              <Image source={require('../images/link.png')} style={{width:20,height:20}}></Image>
              <Text style={{color:"#444",maxWidth:width-80}}>{props.userInfo.blog}</Text>
          </View>)}
      </View>
      <View style={{flexDirection:"row",justifyContent:"space-between",marginTop:5}}>
          <View style={{width:"30%",alignItems:"center",padding:10}}>
              <Text style={{fontSize:25}}>{allcount}</Text>
              <Text style={{color:"#555"}}>Repos</Text>
          </View>
          <TouchableOpacity style={{width:"30%",padding:10}} onPress={()=>{props.navigation.push("Followers",{followersUrl:props.userInfo.followers_url})}}>
            <View style={{alignItems:"center"}}>
                <Text style={{fontSize:25}}>{props.userInfo.followers}</Text>
                <Text style={{color:"#555"}}>Followers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{width:"30%",padding:10}} onPress={()=>{props.navigation.push("Following",{followingUrl:props.userInfo.following_url.replace("{/other_user}","")})}}>
            <View style={{alignItems:"center"}}>
                <Text style={{fontSize:25}}>{props.userInfo.following}</Text>
                <Text style={{color:"#555"}}>Following</Text>
            </View>
          </TouchableOpacity>
      </View>
    </View>
  )
}
export default userInfo
