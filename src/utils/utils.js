import {
    PixelRatio, 
  } from 'react-native'
import Storage from './storage'
import {clientID,secret} from '../config'

export function dp2px(x){
    return x / PixelRatio.get()
}

function qs(params){
  let url = ""
  if (params) {
    let paramsArray = []
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
    return paramsArray.join('&')
  }
  return ''
}
//这段代码可能有问题我调了好久都没调成功  可能我不太懂fetch?  github api感觉不是很完整还是什么的原因 我吐了
export async function refreshToken(){
  const url = 'https://github.com/login/oauth/access_token'
  const refresh_token = await Storage.get("refreshToken")
  const params = {
    refresh_token,
    grant_type:"refresh_token",
    client_id:clientID,
    client_secret:secret
  }
  return new Promise((resolve,reject)=>{
    fetch(url,{
      method :'POST',
      body:qs(params),
      headers:{
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded'
      }
    })
    .then(res=>res.json())
    .then(res=>{
      resolve(res)
    })
  })
}