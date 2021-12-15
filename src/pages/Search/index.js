import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
} from 'react-native'
import RepoList from '../../components/ReposList'
import api from '../../utils/request'
import { dp2px } from '../../utils/utils';
let page=1
let isLoadingMore = false


export default class SearchResultPage extends Component {
    static navigationOptions =  ({ navigation }) =>({
        headerTitle:()=>{
            return (
                <TextInput
                    style={{borderColor:"#ccc",borderBottomWidth:dp2px(2)}}
                    defaultValue={navigation.state.params.text}
                    onChangeText={navigation.state.params.onChange}/>)
                },
        headerRight:()=>(<Text onPress={navigation.state.params.onComfirm} style={{marginRight:20,backgroundColor:"#ebebeb",padding:dp2px(25)}}>确定</Text>),
    });
    constructor(props) {
	    super(props)
		this.state={
            total_count:500,
            reposList:[],
            keyword:""
        }
        this.onChange=null
        this.onComfirm = null
    }
    getRepoList(_keyword){
        if (isLoadingMore) {
            return;
        }
        isLoadingMore = true
        this.setState({keyword:_keyword})
        let params ={
            q:_keyword,
            sort:"stars",
            order:"desc",
            page:page++,
            per_page:10
        }
        var flag = (page*10)<this.state.total_count
        flag&&api.get("/search/repositories",params).then(res=>{
            let items = res.items
            const reposList=page==2?items:this.state.reposList.concat(items)
            const total_count = res.total_count
            this.setState({reposList,total_count})
            isLoadingMore = false;
        }).catch((e) => {
            isLoadingMore = false;
        })
    }
    componentDidMount(){
        const keyword = this.props.navigation.getParam("keyword")
        this.getRepoList(keyword)
        this.onChange= this.onChangeFunc.bind(this)
        this.onComfirm= this.onComfirmFunc.bind(this)
        this.setState({keyword},()=>{
            this.props.navigation.setParams({onChange:this.onChange,onComfirm:this.onComfirm,text:keyword})
        })
    }
    onChangeFunc(value){
		this.setState({
			keyword:value
        })
    }
    onComfirmFunc(){
        page = 1
        this.getRepoList(this.state.keyword)
    }
    onEndReached(){
        const keyword = this.state.keyword
        this.getRepoList(keyword)
    }
    componentWillUnmount = () => {
        this.setState = (state,callback)=>{
        return;
        };
        page = 1
        isLoadingMore = false
    }
    Header(){
        return(
            <View style={{flexDirection:"row",justifyContent:"space-between",paddingBottom:10}}>
                <Text>已显示:{this.state.reposList.length}</Text>
                <Text>总共:{this.state.total_count}</Text>
            </View>
        )
    }
    render() {
        return (
            <View style={styles.container}>
            <RepoList
                reposList={this.state.reposList}
                navigation={this.props.navigation}
                onEndReached={this.onEndReached.bind(this)}
                Header={this.Header.bind(this)}>
            </RepoList>
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