import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Video,
    Dimensions,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking
} from 'react-native';
import api from '../../utils/request'
import { base64_decode } from '../../utils/base64'
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/styles/hljs';
import RNFetchBlob from 'react-native-fetch-blob'
import WebView from 'react-native-webview';
import MarkdownWebView from '../../components/MarkdownWebView';
import { docco } from 'react-syntax-highlighter/styles/hljs';

const {height,width} =  Dimensions.get('window');
export default class ContentPage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        title: navigation.state.params.fileName,
    });
    constructor(props) {
	    super(props)
		this.state={
            content:{},
            contentType:"",
            codeType:"",
            codeString:"",
            rawUrl:"",
            fileName:"",
            imgWidth:500,
            showLoad:false,
            loadProgress:'',
            isMarkdown:false,
            webviewHeight:0,
            markdownHTML:"",
            markdownFlag:false
		}
    }
    async componentDidMount(){
        const contentUrl = this.props.navigation.getParam("contentUrl");
        const outSize = this.props.navigation.getParam("outSize");
        const rawUrl = this.props.navigation.getParam("rawUrl");
        const fileName = this.props.navigation.getParam("fileName");
        
        let _this = this;
        if(outSize){
            this.setState({contentType:_this.nameFilter(fileName)=="img"?"img":"outSize",rawUrl,fileName});
        }
        else
            api.get(contentUrl).then(content=>{
                const contentType = _this.nameFilter(content.name);
                const codeType = _this.codeTypeFilter(content.name)
                this.setState({
                    content,
                    contentType,
                    codeType,
                    fileName
                })
            })
    }
    async loadError(){
        let _this = this
        this.setState({showLoad:true})
        let token = Storage.get('token')
        if(this.state.rawUrl)
            RNFetchBlob.config({
                // fileCache : true,
              })
            .fetch('GET', _this.state.rawUrl,{
                'Authorization': token
            })
            .progress((received, total) => {
                const loadProgress = `${_this.sizeFilter(received)}/${_this.sizeFilter(total)}`
                this.setState({loadProgress})
            })
            .then((res) => {
                const content = {content:res.base64()}
                const rawUrl = ""
                _this.setState({content,rawUrl,showLoad:false})
            })
            .catch((err)=>{console.log('err',err);_this.setState({showLoad:false})})
    }
    sizeFilter(size){
        return `${(size/1024/1024).toFixed(2)}MB`
    }
    nameFilter(fileName){
        let _this = this;
        const fileType = fileName.split('.').pop().toLowerCase()
        const dict = {
            img:["jpg","png","jpeg","bmp","svg"],
            video:["mp4","rmvb","avi","mkv"],
            code:["java","py","ts","js","html","php","html","css","less","scss","c","go","vue","dart","tsx"],
            txt:["doc","docx","xls","xlsx","ppt","pptx","txt"]
        }
        for(var key in dict){
            if(dict[key].includes(fileType)){
                return key
            }   
        }
        fileType=="md"&&this.setState({markdownFlag:true})
        return "txt"
    }
    codeTypeFilter(fileName){
        let _this = this;
        const fileType = fileName.split('.').pop().toLowerCase()
        const dict = {
            java:["java"],
            go:["go"],
            python:["py"],
            c:["c"],
            php:["php"],
            css:["css","less","scss"],
            html:["html"],
            javascript:["js","vue","ts","tsx"],
            dart:["dart"]
        }
        for(var key in dict){
            if(dict[key].includes(fileType))
                return key
        }
    }
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
            return;
        };
    }
    calcHeight(e){
        const webviewHeight = Number(e.nativeEvent.data)
        webviewHeight!=40&&this.setState({webviewHeight})
    }
    getMarkdownHTML(){
        const markdown = base64_decode(this.state.content.content)
        let params ={
            text:markdown,
        }
        api.post("/markdown",params).then(res=>{
            const markdownHTML = res
            this.setState({
                markdownHTML,
                isMarkdown:true
            })
        })
    }
    render() {
        let {content,codeType,contentType,fileName} = this.state;
        if(contentType=="code")
            return(
                   <View>
                                          <SyntaxHighlighter
                                          language={codeType}
                                          style={githubGist}
                                            >
                                          {base64_decode(this.state.content.content)}
                    </SyntaxHighlighter></View>
                   )
        else
        return (
            <ScrollView style={styles.container}>
                {this.state.showLoad&&(<View style={styles.loading}>
                    <ActivityIndicator color="white"/>
                    <Text style={styles.loadingTitle}>{this.state.loadProgress}</Text>
                </View>)}
                {contentType=="outSize"&&(<View style={{height:600,justifyContent:"center",alignItems:"center"}}>
                    <View style={{alignItems:"center"}}><Image source={require('../../images/file.png')} style={{width:100,height:100}}></Image></View>
                    <View style={{alignItems:"center",marginBottom:20}}>
                        <Text>{fileName}</Text>
                    </View>
                    <TouchableOpacity style={{backgroundColor:"#ebebeb",alignItems:"center",width:"50%",padding:10,borderRadius:2}} onPress={()=>{Linking.openURL(this.state.rawUrl)}}>
                        <Text>
                            下载
                        </Text>
                    </TouchableOpacity>
                </View>)}
                {contentType=="img"&&(<View style={{height:height-100,alignItems:"center"}}><Image source={{uri:this.state.rawUrl||`data:image/png;base64,${content.content}`}} style={{height:height-100,width:this.state.imgWidth}} resizeMode="contain" onError={this.loadError.bind(this)} onLoad={(e)=>{this.setState({imgWidth:e.nativeEvent.source.width>width?"100%":e.nativeEvent.source.width})}}></Image></View>)}
                {contentType=="video"&&(<View><Video source={{uri:this.state.rawUrl||`data:image/png;base64,${content.content}`}}></Video></View>)}
                {contentType=="txt"&&(
                <View>
                    {this.state.markdownFlag&&(<View style={{flexDirection:"row",justifyContent:"space-around",marginBottom:10}}>
                        <Text style={{color:this.state.isMarkdown?"#555":"#000",padding:10,backgroundColor:!this.state.isMarkdown?"#ccc":"white",flex:1,textAlign:"center"}} onPress={()=>{this.setState({isMarkdown:false})}}>文本</Text>
                        <Text style={{color:this.state.isMarkdown?"#000":"#555",padding:10,flex:1,textAlign:"center",backgroundColor:this.state.isMarkdown?"#ccc":"white"}} onPress={()=>{this.getMarkdownHTML()}}>MarkDown</Text>
                    </View>)}
                    {this.state.isMarkdown==false&&(<Text>{base64_decode(this.state.content.content)}</Text>)}
                    {this.state.isMarkdown&&(<WebView
                        style={{height:this.state.webviewHeight+20}}
                        originWhitelist={['*']}
                        source={{html:MarkdownWebView(this.state.markdownHTML)}}
                        injectedJavaScript='window.ReactNativeWebView.postMessage(document.body.scrollHeight)'
                        onMessage={this.calcHeight.bind(this)}
                        // onShouldStartLoadWithRequest={(e)=> {
                        //     Alert.alert('即将使用浏览器打开网页',e.url,
                        //         [
                        //             {text:"取消", onPress:()=>false},
                        //             {text:"确认", onPress:()=>{Linking.openURL(e.url)}}
                        //         ]
                        //     );
                        //     return false
                        // }}
                    ></WebView>)}
                </View>
                )}
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor:"white",
        padding:5,
        height:"100%",
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    },
    loading : {
        backgroundColor : '#10101099',
        height : 80,
        width : 100,
        borderRadius : 10,
        justifyContent : 'center',
        alignItems : 'center',
        position : 'absolute',
        top : (height - 160) / 2,
        left : (width - 100) / 2,
    },

    loadingTitle : {
        marginTop : 10,
        fontSize : 12,
        color : 'white'
    }
});
