import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    TouchableHighlight
} from 'react-native';
import api from '../../utils/request'
import { dp2px } from '../../utils/utils';

let page = 1
let isLoadingMore = false
export default class FollowingPage extends Component {
    constructor(props) {
	    super(props)
		this.state={
            followingList:[]
		}
    }
    async componentDidMount(){
        this.getFollowingList()
    }
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
        return;
        };
    }
    getFollowingList(){
        const followingUrl = this.props.navigation.getParam("followingUrl")
        if (isLoadingMore) {
            return;
        }
        isLoadingMore = true;
        let params ={
            page:page++,
            per_page:30,
        }
        api.get(followingUrl,params).then(res=>{
            let followingList = page==2?res:this.state.followingList.concat(res)
            this.setState({
                followingList
            },()=>{
                isLoadingMore = false
            })
        })
    }
    onEndReached(){
        this.getFollowingList()
    }
    _renderItem(data){
        let item = data.item
        return (
            <TouchableHighlight onPress={()=>{
                this.props.navigation.push("Others",{otherUrl:item.url,title:item.login})
            }}
            underlayColor="#ebebeb"
            style={{padding:10}}>
            <View style={{flexDirection:"row",alignItems:"center"}}>
                <Image source={{uri:item.avatar_url}} style={{marginRight:10,height:50,width:50,borderRadius:25}}></Image>
                <Text>{item.login}</Text>
            </View>
            </TouchableHighlight>
        )
    }
    _space(){
        return (
            <View style={{height:dp2px(2),backgroundColor:"#ebebeb"}}></View>
        )
    }
    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    style={{padding:20,paddingTop:10,paddingBottom:0}}
                    data={this.state.followingList}
                    renderItem={(data) => this._renderItem(data)}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={this.onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    ItemSeparatorComponent={this._space}>
                </FlatList>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop:0,
        backgroundColor:"white"
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});