import React, {Component} from 'react';
import {
    View,
    TextInput,
    Image,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import MyToast from '../../utils/Toast';
import {dp2px} from '../../utils/utils'
export default class SearchPage extends Component {
    constructor(props) {
	    super(props)
		this.state={
            keyword:""
		}
	}
    static navigationOptions = {
        tabBarLabel: '搜索',
        tabBarIcon: ({focused}) => {
            if (focused) {
                return (
                    <Image style={styles.tabBarIcon} source={require('../../images/search_select.png')}/>
                );
            }
            return (
                <Image style={styles.tabBarIcon} source={require('../../images/search.png')}/>
            );
        },
    };
    search(){
        this.refs.search.blur()
        var _this = this
        if(!this.state.keyword){
			this.refs.search.focus()
            return MyToast("请输入")
		}
        this.props.navigation.navigate("SearchResult",{keyword:_this.state.keyword,title:_this.state.keyword})
    }
    onChangeText(value){
		this.setState({
			keyword:value
		})
	}
    render() {
        return (
            <View style={styles.container}>
                <TextInput
                ref="search"
                style={{borderWidth:dp2px(2),width:"100%",borderColor:"#888",paddingLeft:10,height:50}}
                onChangeText={this.onChangeText.bind(this)}
                />
                <TouchableHighlight onPress={this.search.bind(this)} style={{borderLeftWidth:dp2px(2),height:50,marginLeft:10,position:"absolute",right:30,alignItems:"center",justifyContent:"center",padding:10,borderColor:"#888"}} underlayColor="#888">
                    <Image source={require("../../images/search.png")} style={{width:25,height:25}}></Image>
                </TouchableHighlight>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:"#ffffff",
        position:"relative",
        padding:30
    },
    tabBarIcon: {
        width: 21,
        height: 21,
    }
});