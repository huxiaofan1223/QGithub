import Storage from './storage'
import loadingUtils from './loadingUtils'
import {clientID,secret} from '../config'

const baseURL = "https://api.github.com"
let isRefershing = true
let requestList = []

function qs(params){
  let url = ""
  if (params) {
    let paramsArray = []
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
    if (url.search(/\?/) === -1) {
        url += '?' + paramsArray.join('&')
    } else {
        url += '&' + paramsArray.join('&')
    }
  }
  return url
}

function afterRefreshToken(){
  requestList.forEach(cb=>{
		cb()
	})
	requestList = []
}

function formQs(params){
  if (params) {
    let paramsArray = []
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
    return paramsArray.join('&')
  }
  return ""
}

async function refreshToken(){
  isRefershing = false
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
      body:formQs(params),
      headers:{
        'Accept': 'application/json',
        'Content-Type':'application/x-www-form-urlencoded'
      }
    })
    .then(res=>res.json())
    .then(res=>{
      if(res.hasOwnProperty("access_token"))
        resolve(res)
      else{
        Storage.remove("token")
        Storage.remove("refreshToken")
        Storage.remove("userInfo")
      }
    })
  })
}

const request = async (url,method,params,loading=true)=>{
  const args = arguments
  loading&&loadingUtils.show()
  const newUrl = url.indexOf("http")!= -1 ? url:`${baseURL}${url}`
  const qsURL = method=="GET"?newUrl + qs(params):newUrl
  const token = await Storage.get("token")
  return new Promise((resolve,reject)=>{
    		fetch(qsURL,{
		        method :method,
		        headers:{
		            'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': token
            },
            body: method =="POST"?JSON.stringify(params):""
		    })
			.then((res) =>{
        if(res.headers.map["content-type"].indexOf("text/html") === 0)
          return res.text()
        return res.json()
      })
			.then((responseJson) => {
        loading&&loadingUtils.hide()
        if(responseJson.message == "Bad credentials"){
          if(isRefershing)
            refreshToken().then(res=>{
              Storage.set("refreshToken",res.refresh_token)
              Storage.set("token",'token '+res.access_token).then(res=>{
                isRefershing = false
                afterRefreshToken()
              })
            })
          requestList.push(()=>resolve(request.apply(null,args)))   //这一段是真他么的精髓,我有点看不懂  thanks to:  https://blog.csdn.net/liux6687/article/details/109284018
        }
        else
          resolve(responseJson)
      })
      .catch(err=>{
        reject(err)
      })
  })
}


function get(url,params,loading){
  return request(url,"GET",params,loading)
}
function post(url,params,loading){
  return request(url,"POST",params,loading)
}

module.exports = {
  get,
  post
}