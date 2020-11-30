import {
    PixelRatio, 
  } from 'react-native'
import Storage from './storage'
import {clientID,secret} from '../config'

export function dp2px(x){
    return x / PixelRatio.get()
}

export async function refreshToken(){
  const url = 'https://github.com/login/oauth/access_token'
  const refresh_token = await Storage.get("token")
  const grant_type = await Storage.get("refreshToken")
  const params = {
    refresh_token,
    grant_type,
    client_id:clientID,
    client_secret:secret
  }
  return new Promise((resolve,reject)=>{
    fetch(url,{
      method :'POST',
      body:JSON.stringify(params)
    })
    .then(res=>res.text())
    .then(res=>{
      resolve(res)
    })
  })
}