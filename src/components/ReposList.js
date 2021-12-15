import React from 'react';
import { Text, View ,FlatList,Image,TouchableHighlight} from 'react-native';
import { dp2px } from '../utils/utils';


const RepoList = (props) => {
    function _renderLang(lang){
        const dict = {
            "Java":"#b07219",
            "Python":"#3572A5",
            "JavaScript":"#f1e05a",
            "Vue":"#2c3e50",
            "TypeScript":"#2b7489",
            "Swift":"#ffac45",
            "Go":"#00ADD8",
            "PHP":"#4F5D95",
            "HTML":"#e34c26",
            "Dockerfile":"#384d54",
            "C":"#555555",
            "CSS":"#563d7c",
            "Shell":"#89e051",
            "Hack":"#878787",
            "Objective-C":"#438eff",
            "Lua":"#000080",
            "C#":"#178600",
            "C++":"#f34b7d",
            "Pascal":"#E3F171",
            "Perl":"#0298c3",
            "Kotlin":"#F18E33",
            "Jupyter Notebook":"#DA5B0B",
            "Dart":"#00B4AB"
        }
        return (
            <View style={{color:"#888",flexDirection:"row",alignItems:"center",marginRight:15}}>
                <View style={{height:10,width:10,borderRadius:5,backgroundColor:dict[lang],marginRight:5}}></View>
                <Text style={{color:"#555"}}>{lang}</Text>
            </View>
        )
    }
    function _timeFilter(time){
        return time.replace("T"," ").replace("Z","")
    }
    function _renderItem(data){
        const item = data.item;
        return (
            <TouchableHighlight
            onPress={()=>{props.navigation.push("Repo",{repoUrl:item.url,title:item.name})}}
            style={{marginBottom:15,borderRadius:5,borderWidth:dp2px(2),borderColor:"#ebebeb"}}
            underlayColor="#ebebeb"
            >
            <View style={{padding:20,paddingTop:15,paddingLeft:10,paddingRight:10,justifyContent:"center"}}>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Text style={{marginRight:20,fontSize:17,color:"#1e90ff"}}>{item.name}</Text>
                    {item.private&&(<View style={{height:16,backgroundColor:"red",paddingLeft:5,paddingRight:5,borderRadius:8}}><Text style={{color:"white",fontSize:10,lineHeight:16}}>Private</Text></View>)}
                </View>
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:5}}>
                    <Text style={{color:"#555"}}>{item.description}</Text>
                </View>
                <View style={{flexDirection:"row",marginTop:5,alignItems:"center",justifyContent:"space-between"}}>
                    {_renderLang(item.language)}
                    <View style={{color:"#555",marginRight:15,flexDirection:"row",alignItems:"center"}}>
                        <Image source={require("../images/collection.png")} style={{width:20,height:20,marginRight:3}}></Image>
                        <Text style={{color:"#555"}}>{item.stargazers_count}</Text>
                    </View>
                    <Text style={{color:"#555",fontSize:13}}>{_timeFilter(item.updated_at)}</Text>
                </View>
            </View>
            </TouchableHighlight>
            )
    }

  return (
    <FlatList
        style={{padding:20,paddingTop:10,paddingBottom:0}}
        data={props.reposList.sort((a,b)=>!(a.private&&!b.private))}
        renderItem={(data) => _renderItem(data)}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={props.onEndReached}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={props.Header}
        refreshControl={props.refreshControl}
        ListFooterComponent={ () => (
            !props.reposList.length ? 
            (
                <View style={{justifyContent:'center',alignItems:'center',marginTop:200}}>
                    <Text>Empty</Text>
                </View>
            )
            : null
        )}
    >
    </FlatList>
  )
}
export default RepoList;
