import AsyncStorage from '@react-native-async-storage/async-storage';

const get = async (key) =>{
      return await AsyncStorage.getItem(key).then((value) => {
          let jsonValue = "";
          try {
            jsonValue = JSON.parse(value);
          } catch (error) {
            jsonValue = value;
          }
          return jsonValue;
      });
  }

  const set = async (key,value) =>{
      return await AsyncStorage.setItem(key, typeof value === 'string' ? value:JSON.stringify(value));
  }

  const remove = async (key) =>{
      return await AsyncStorage.removeItem(key);
  }

  module.exports = {
    get,
    set,
    remove
  }