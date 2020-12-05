import {
    PixelRatio, 
  } from 'react-native'
import Storage from './storage'
import {clientID,secret} from '../config'

export function dp2px(x){
    return x / PixelRatio.get()
}