import Toast from 'react-native-root-toast';

export default function MyToast(msg){
  return Toast.show(msg, {
    position: -80,
    backgroundColor:"rgba(0,0,0,.6)",
    opacity:1,
    textColor:"#ffffff",
    shadow: false
  })
}