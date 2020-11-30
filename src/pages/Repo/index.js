import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableHighlight,
    ScrollView,
    BackHandler,
    Linking,
    Alert,
    RefreshControl
} from 'react-native';
import api from '../../utils/request'
import { base64_decode } from '../../utils/base64'
import WebView from 'react-native-webview'
import MarkdownWebView from '../../components/MarkdownWebView'
import {HeaderBackButton} from 'react-navigation-stack'
import { dp2px } from '../../utils/utils';

//这个组件逻辑偏乱 有能力的慢慢看
let pathArr = []
export default class RepoPage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        title: navigation.state.params.title,
        headerLeft:()=>(
            <HeaderBackButton onPress={()=>{navigation.state.params.back(true)}}>
            </HeaderBackButton>
        )

    });
    constructor(props) {
	    super(props)
		this.state={
            repoUrl:"",
            repoInfo:{
                owner:{

                }
            },
            readMe:"",
            contentsList:[],
            nowPath:"",
            htmlContent:"<h1></h1>",
            webviewHeight:300,
        }
        this.backFunction=null
    }
    getRepoInfo(repoUrl){
        api.get(repoUrl,{},false).then(res=>{
            const repoInfo = res
            this.setState({repoInfo})
        })
    }
    getReadme(repoUrl){
        const readmeUrl = `${repoUrl}/readme`
        return api.get(readmeUrl,{},false)
    }
    getContentsList(repoUrl){
        const contentsUrl = `${repoUrl}/contents`
        api.get(contentsUrl,{},false).then(res=>{
            const contentsList = res.sort((a,b)=>!(a.type == "dir"&& b.type=="file"))  //文件夹和文件排序排序   保证文件夹在文件前面
            this.setState({contentsList})
        })
    }
    getGithubHTML(readMeCotent){
        let params ={
            text:readMeCotent,
        }
        return api.post("/markdown",params,false)
    }
    async componentDidMount(){
        this.backFunction= this.onBackHandler.bind(this)
        BackHandler.addEventListener('hardwareBackPress',this.backFunction)  //监听返回
        this._unsubscribe = this.props.navigation.addListener('didFocus', payload =>{
            BackHandler.addEventListener('hardwareBackPress',this.backFunction)
        })  //路由监听返回并且再监听按键返回
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>{
            BackHandler.removeEventListener('hardwareBackPress',this.backFunction)
        })  //路由监听跳转并且再取消监听返回
        this.props.navigation.setParams({back:this.backFunction.bind(true)})  //或许不要bind(true)也行，我懒得试了  传函数给appbar调用
        this.init()
    }
    async init(){
        this.setState({loading:true})
        const repoUrl = this.props.navigation.getParam("repoUrl")
        this.getRepoInfo(repoUrl)  //获取仓库信息
        this.getContentsList(repoUrl)   //获取仓库文件内容
        const readMeObject = await this.getReadme(repoUrl)  //获取readme的base64格式
        const htmlContent=await this.getGithubHTML(base64_decode(readMeObject.content))   //获取readme的html格式
        this.setState({
            repoUrl,
            htmlContent,
            loading:false
        })
    }
    componentWillUnmount = () => {
        this._unsubscribe&&this._unsubscribe.remove()   //路由返回监听取消
        this._willBlurSubscription&&this._willBlurSubscription.remove()  //路由跳转监听取消
        BackHandler.removeEventListener('hardwareBackPress',this.backFunction)  //返回监听取消
        pathArr=[]
        this.setState = (state,callback)=>{
            return
        }
    }
    handleClickDir(path,flag=true){
        this.setState({loading:true})
        const repoUrl = this.props.navigation.getParam("repoUrl")
        flag&&pathArr.push(this.state.nowPath)
        const contentsUrl = `${repoUrl}/contents/${path}`
        api.get(contentsUrl,{},false).then(res=>{
            this.setState({
                contentsList:res.sort((a,b)=>!(a.type == "dir"&& b.type=="file")),
                nowPath:path,
                loading:false
            })
        })
    }
    onBackHandler(headerLeftButton=false) {
        if(pathArr.length==0){
            headerLeftButton&&this.props.navigation.goBack()  //appbar中需要调用navigation.back()
            return false
        }
        else{
            this.handleClickDir(pathArr.pop(),false)
            return true
        }
    }
    handleContentClick(item){
        if(item.type=="dir"){
            return this.handleClickDir(item.path)
        }else if(item.type=="file"){
            if(item.size>1024*1024)
                return this.props.navigation.navigate("Content",{contentUrl:item.url,outSize:true,rawUrl:item.download_url,fileName:item.name})  //最为垃圾的代码,github api不按套路出牌
            else
                return this.props.navigation.navigate("Content",{contentUrl:item.url,outSize:false,fileName:item.name})   //最为垃圾的代码,github api不按套路出牌,超过1M的文件和未超过的格式不同，后期懒得改了
        }
    }
    _nameFilter(fileName){
        const fileType = fileName.split('.').pop().toLowerCase()
        const dict = {
            jpg:["jpg","png","jpeg","bmp","svg"],
            video:["mp4","rmvb","avi","mkv"],
            code:["java","py","ts","js","html","php","html","css","less","scss","c","go"],
            txt:["doc","docx","xls","xlsx","ppt","pptx","txt"]
        }
        const dictValue ={
            jpg:require('../../images/filetype/pic.png'),
            video:require('../../images/filetype/video.png'),
            code:require('../../images/filetype/html.png'),
            txt:require('../../images/filetype/txt.png'),
        }
        for(var key in dict){
            if(dict[key].includes(fileType))
                return dictValue[key]
        }
        return require('../../images/filetype/txt.png')
    }
    _picURI(item){
        if(item.type=="dir"){
            return require('../../images/filetype/dir.png')
        }else if(item.type=="file"){
            return this._nameFilter(item.name)
        }
    }
    _renderItem(item,index){
        return (
            <TouchableHighlight key={index} onPress={this.handleContentClick.bind(this,item)} underlayColor="#ebebeb">
                <View style={{flexDirection:"row",alignItems:"center",paddingTop:8,paddingBottom:8,borderTopWidth:index!=0?dp2px(2):0,borderColor:"#ebebeb"}}>
                    <Image source={this._picURI(item)} style={{width:15,height:15,marginRight:10,marginLeft:10}}></Image>
                    <Text style={{color:"#555"}}>{item.name}</Text>
                </View>
            </TouchableHighlight>
        )
    }
    calcHeight(e){
        const webviewHeight = Number(e.nativeEvent.data)
        webviewHeight!=40&&this.setState({webviewHeight})
    }
    toUser(){
        const flag = this.state.repoInfo.owner.url!=undefined
        flag&&this.props.navigation.push("Others",{otherUrl:this.state.repoInfo.owner.url,title:this.state.repoInfo.owner.login})
    }
    render() {
        const {repoInfo} = this.state
        return (
                <ScrollView style={styles.container}
                    refreshControl={
                        <RefreshControl
                        refreshing={this.state.loading}
                        onRefresh={this.init.bind(this)}
                        tintColor="#ff0000"
                        titleColor="#00ff00"
                        progressBackgroundColor="#ffffff"
                        />
                    }
                >
                    <View style={{padding:20,paddingTop:0,paddingBottom:0}}>
                        <View style={{flexDirection:"row",marginBottom:10,marginTop:20}}>
                            <View style={{flexDirection:"row",alignItems:"center"}}>
                                <Text style={{fontWeight:'600',fontSize:18,color:"#1e90ff"}} onPress={this.toUser.bind(this)}>{this.state.repoInfo.owner.login}</Text>
                                <Text style={{marginLeft:5,marginRight:5,fontSize:18}}>/</Text>
                                <Text style={{fontWeight:'900',fontSize:20,color:"#1e90ff"}}>{this.state.repoInfo.name}</Text>
                            </View>
                        </View>
                        <View style={{marginBottom:10}}>
                            <Text>{this.state.repoInfo.description}</Text>
                        </View>
                        <View style={{flexDirection:"row",marginBottom:10}}>
                            <View style={{flexDirection:"row",alignItems:"center"}}>
                                <Image source={require('../../images/collection.png')} style={{height:20,width:20,marginRight:5}}></Image>
                                <Text style={{fontWeight:"bold",color:"#555"}}>{this.state.repoInfo.stargazers_count}</Text><Text style={{marginRight:20,color:"#555"}}> stars</Text>
                            </View>
                            <View style={{flexDirection:"row",alignItems:"center"}}>
                                <Image source={require('../../images/branch.png')} style={{height:16,width:16,marginRight:5}}></Image>
                                <Text style={{fontWeight:"bold",color:"#555"}}>{this.state.repoInfo.forks_count}</Text><Text style={{color:"#555"}}> forks</Text>
                            </View>
                            
                        </View>
                        <View style={{flexDirection:"row",marginBottom:5,alignItems:"center"}}>
                            <View style={{padding:10,borderBottomWidth:2,borderColor:"#f9826c",flexDirection:"row"}}>
                                <Image source={require('../../images/code.png')} style={{height:20,width:20}}></Image>
                                <Text>Code</Text>
                            </View>
                            <View style={{padding:10,flexDirection:"row",alignItems:"center"}}>
                                <Image source={require('../../images/issues.png')} style={{height:14,width:14,marginRight:5}}></Image>
                                <Text style={{color:"#555",marginRight:5}} 
                                onPress={()=>{this.props.navigation.navigate('Issues',{issuesUrl:`${repoInfo.url}/issues`})}}>Issues</Text>
                                <View style={{height:20,borderRadius:10,padding:5,paddingTop:0,backgroundColor:"#d1d5da80",paddingBottom:0}}><Text style={{color:"#24292e"}}>{this.state.repoInfo.open_issues_count}</Text></View>
                            </View>
                            <View style={{padding:10,flexDirection:"row",alignItems:"center"}}>
                                <Image source={require('../../images/pulls.png')} style={{height:16,width:16}}></Image>
                                <Text style={{color:"#555"}}
                                onPress={()=>{this.props.navigation.navigate('Pulls',{pullsUrl:`${repoInfo.url}/pulls`})}}
                                >Pull Requests</Text>
                            </View>
                        </View>
                        <View style={{borderColor:"#ebebeb",borderWidth:dp2px(2),borderRadius:5,borderTopColor:"#F1F8FF"}}>
                            <TouchableHighlight style={{backgroundColor:"#F1F8FF",padding:10,flexDirection:"row"}} onPress={this.toUser.bind(this)} underlayColor="#f7f7f7">
                                <View style={{flexDirection:"row"}}>
                                    <Image source={{uri:repoInfo.owner.avatar_url}} style={{width:24,height:24,marginRight:10,borderRadius:12}}></Image>
                                    <Text>{repoInfo.owner.login}</Text>
                                </View>
                            </TouchableHighlight>
                            {this.state.contentsList.map((item,index)=>{
                                return this._renderItem(item,index)
                            })}
                        </View>
                    </View>
                    <WebView
                        style={{height:this.state.webviewHeight+20}}
                        originWhitelist={['*']}
                        source={{html:MarkdownWebView(this.state.htmlContent)}}
                        injectedJavaScript='window.ReactNativeWebView.postMessage(document.body.scrollHeight)'
                        onMessage={this.calcHeight.bind(this)}
                        onShouldStartLoadWithRequest={(e)=> {
                            Alert.alert('即将使用浏览器打开网页',e.url,
                                [
                                    {text:"取消", onPress:()=>false},
                                    {text:"确认", onPress:()=>{Linking.openURL(e.url)}}
                                ]
                            );
                            return false
                        }}
                    ></WebView>
                </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding:0,
        backgroundColor:"white",
        paddingTop:0,
        paddingBottom:0,
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});
