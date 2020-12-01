import Storage from './storage'
import loadingUtils from './loadingUtils'
import {refreshToken} from './utils'
const baseURL = "https://api.github.com"

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

const request = async (url,method,params,loading=true)=>{
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
        if(responseJson.message == "Bad credentials"){
          refreshToken().then(res=>{
            Storage.set("refreshToken",res.refresh_token)
            Storage.set("token",'token '+res.access_token).then(res=>{
              return request(url,method,params,loading)
            })
          })
        }
        loading&&loadingUtils.hide()
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