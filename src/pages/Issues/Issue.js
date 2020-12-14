import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Linking,
    Image
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import api from '../../utils/request'
import WebView from 'react-native-webview'
import MarkdownWebView from '../../components/MarkdownWebView'

let page=1
let isLoadingMore = false

export default class IssuePage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        // title: navigation.state.params.title,
    });
    constructor(props) {
	    super(props)
		  this.state={
            body:"",
            htmlContent:"",
            commentsHtmlList:[],
            test:"123456",
            HeightArr:[]
        }
    }
    componentDidMount(){
        this.commentHtml()
    }
    comment2html(text){
      let params ={
        text:text,
      }
      return api.post("/markdown",params,true)
    }
    getCommentList(){
      const issueUrl = this.props.navigation.getParam("issue")
      const params = {
        sort:"updated"
      }
      return api.get(issueUrl.comments_url)
    }
    async commentHtml(){
      let commentsHtmlList = await this.getCommentList()
      const issue = this.props.navigation.getParam("issue")
      commentsHtmlList.unshift(issue)
      let _this = this
      commentsHtmlList.forEach(async(element) => {
        element.markdownHTML = await _this.comment2html(element.body)
        _this.setState({commentsHtmlList})
      })
    }
    onEndReached(){

    }
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
        return;
        };
        page = 1
        isLoadingMore = false
    }
    calcHeight(index,e){
      const webviewHeight = e.nativeEvent.data
      let HeightArr = this.state.HeightArr
      HeightArr[index]=Number(webviewHeight)+20
      this.setState({HeightArr})
    }
    _timeFilter(time){
      return time.replace("T"," ").replace("Z","")
    }
    render() {
        return (
            <ScrollView style={styles.container}>
              { 
                this.state.commentsHtmlList.map((item,index)=>{
                  return (
                    <View key={index}>
                    <View style={{flexDirection:"row",paddingLeft:10,paddingRight:10,marginBottom:-10,zIndex:10,paddingTop:10,alignItems:"center",borderTopColor:"#ebebeb",borderTopWidth:1}}>
                      <Image source={{uri:item.user.avatar_url}} style={{width:30,height:30,borderRadius:15,marginRight:10}}></Image>
                      <Text style={{fontSize:16,color:"#1e90ff"}}>{item.user.login}</Text>
                      <Text style={{color:"#333",marginLeft:"auto",fontSize:12}}>{this._timeFilter(item.updated_at)}</Text>
                    </View>
                    <WebView
                        style={{height:this.state.HeightArr[index]}}
                        originWhitelist={['*']}
                        source={{html:MarkdownWebView(item.markdownHTML)}}
                        injectedJavaScript='window.ReactNativeWebView.postMessage(document.body.scrollHeight)'
                        onMessage={this.calcHeight.bind(this,index)}
                        // onShouldStartLoadWithRequest={(e)=> {
                        //     Alert.alert('即将使用浏览器打开网页',e.url,
                        //         [
                        //             {text:"取消", onPress:()=>false},
                        //             {text:"确认", onPress:()=>{Linking.openURL(e.url)}}
                        //         ]
                        //     );
                        //     return false
                        // }}
                    ></WebView>
                    
                    </View>
                  )
                })
              }
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        height:"100%",
        backgroundColor:"white"
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});