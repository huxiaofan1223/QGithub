import { PixelRatio } from 'react-native'

export function dp2px(x){
    return x / PixelRatio.get()
}