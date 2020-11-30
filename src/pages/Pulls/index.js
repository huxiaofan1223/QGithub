import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableHighlight,
    RefreshControl
} from 'react-native'
import api from '../../utils/request'
import { dp2px } from '../../utils/utils';
let page=1
let isLoadingMore = false
let CacheLabelItem = (props)=>{
    function _randomColor(){
        const colors = ['#409EFF','#67C23A','#E6A23C','#F56C6C','#909399']
        const index = Math.floor(Math.random()*5)
        return colors[index]
    }
    return (
        <View style={{backgroundColor:_randomColor(),padding:5,paddingTop:0,paddingBottom:0,borderRadius:10,marginRight:5,marginTop:5}}>
            <Text style={{color:"white"}}>{props.i.name}</Text>
        </View>
    )
}
CacheLabelItem = React.memo(CacheLabelItem,(prevProps,nextProps)=>true)
export default class PullsPage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        title: navigation.state.params.title,
    });
    constructor(props) {
	    super(props)
		this.state={
            pullList:[],
            loading:true
        }
    }
    pullList(){
        const issuesUrl = this.props.navigation.getParam("pullsUrl")
        if (isLoadingMore) {
            return;
        }
        this.setState({loading:true})
        isLoadingMore = true;
        let params ={
            page:page++,
            per_page:30,
        }
        api.get(issuesUrl,params,false).then(res=>{
            let pullList = page==2?res:this.state.pullList.concat(res)
            pullList = pullList.filter(item=>item.pull_request==undefined)
            this.setState({
                pullList,
                loading:false
            })
            isLoadingMore = false;
        }).catch((e) => {
            isLoadingMore = false;
        })
    }
    componentDidMount(){
        this.pullList()
    }
    onEndReached(){
        this.pullList()
    }
    refresh(){
        page = 1
        this.pullList()
    }
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
        return;
        };
        page = 1
        isLoadingMore = false
    }
    Header(){
        let flag = this.state.pullList.length!=0
        return flag&&(
            <View style={{flexDirection:"row",justifyContent:"space-between",padding:20,paddingBottom:10}}>
                <Text>已显示{this.state.pullList.length}</Text>
            </View>
        )
    }
    
    _renderItem(data){
        const item = data.item
        return (
            <TouchableHighlight style={{padding:20,paddingTop:10,paddingBottom:10}} underlayColor="#ebebeb" onPress={()=>{this.props.navigation.navigate("Pull",{pull:item})}}>
                <View>
                    <Text style={{fontSize:15,color:"#111"}}>{data.index+1}.{item.title}</Text>
                    <View style={{flexDirection:"row",flexWrap:"wrap"}}>
                        {item.labels.map((i,index)=>{
                            return (
                                <CacheLabelItem
                                i={i}
                                key={index}
                                ></CacheLabelItem>
                                )
                        })}
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
    _space(){
        return(<View style={{height: dp2px(1), width: "100%", backgroundColor: '#ebebeb'}}/>)
    }
    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.pullList}
                    renderItem={(data) => this._renderItem(data)}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this._space}
                    onEndReached={this.onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    ListHeaderComponent={this.Header.bind(this)}
                    refreshControl={
                        <RefreshControl
                        refreshing={this.state.loading}
                        onRefresh={this.refresh.bind(this)}
                        tintColor="#ff0000"
                        titleColor="#00ff00"
                        progressBackgroundColor="#ffffff"
                        />
                    }>
                    </FlatList>
                    {
                    this.state.pullList.length==0&&(
                        <View style={{justifyContent:"center",alignItems:"center",height:"100%"}}><Text style={{fontSize:20}}>暂无数据</Text></View>
                    )
                    }
            </View>
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