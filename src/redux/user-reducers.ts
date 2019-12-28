import IuserReducers, { IUser } from "./user-reducersType";
import { getElementByUserId, getElementById } from "../api/api";
import {getItems} from '../helpers/function';
import IStore from "./storeType";

const ADD_USER = 'ADD_USER';
const ADD_USER_STORY = 'ADD_USER_STORY';
const ADD_USER_COMMETNS  = 'ADD_USER_COMMETNS';
const UP_COUT = 'UP_COUT';
const START_LOAD = 'START_LOAD';
const STOP_LOAD = 'STOP_LOAD';
const MAX_ITEMS = 'MAX_ITEMS'; 

const maxItem = (id: string) => {
  return {
    type: MAX_ITEMS,
    id,
  }
}
const startLoad = (id:string) => {
  return {
    type: START_LOAD,
    id,
  }
}
const stopLoad = (id:string) => {
  return {
    type: STOP_LOAD,
    id
  }
}

const upCout = (id:string,cout:number) => {
  return {
    type: UP_COUT,
    cout,
    id,
  }
}

const addUserStory = (id:string, storys: IStore[]) => {
  return {
    type: ADD_USER_STORY,
    id,
    storys,
  }
}
const addUserCommets = (id: string, info: any[]) => {
  return {
    type: ADD_USER_COMMETNS,
    id,
    info,
  }
}

const addUser = (info: IUser):{type:string,info:IUser} => {
  return {
    type: ADD_USER,
    info,
  }
}


export const addUserCommentsThunk = (id: string) => async (dispatch: any,
  getState: () => IuserReducers) => {
  let user = getState().users[id];
  let cunt = user.cunt;
  let StoryItems: any[] = [];
  let CommentsItems: any[] = [];
  let stop = false;
}
export const addUserStoryThunk = (id: string, whatUpNum = 25) => async (dispatch: any,
  getState: () => IStore): Promise<IStore[]> => {
    console.log('я вызвалась', id);
    dispatch(startLoad(id));
    let user = getState().users.users[id];
    let cunt = user.cunt;
    let StoryItems: IStore[] = [];
    let CommentsItems: any[] = [];
    let stop = false;
    while (StoryItems.length < whatUpNum || stop) {
      if (user.submitted) {
        let maxCunt = cunt + (whatUpNum-1);
        if (maxCunt > user.submitted.length) {
          maxCunt = user.submitted.length - 1;
          stop = true;
          dispatch(maxItem(id));
          break
        }
        let items = await getItems(user.submitted.slice(cunt,cunt+(whatUpNum-1)));
        console.log(cunt,maxCunt+(whatUpNum-1),'тут пизда')
        StoryItems = [...StoryItems,...items.story];
        CommentsItems = [...CommentsItems,...items.comments];
        cunt+=whatUpNum;
      } else {
        stop = true;
        return [];
      }
    }
    dispatch(addUserStory(id,StoryItems));
    dispatch(addUserCommets(id,CommentsItems))
    dispatch(upCout(id,cunt));
    dispatch(stopLoad(id));
    return StoryItems
}
export const addUserThunk = (id:string) => async (dispatch:any) => {
  let userInfo:IUser = await getElementByUserId(id);
  dispatch(addUser(userInfo));
}

const start:IuserReducers = {
  users: {}
}

function userReducers (state=start,action:any):IuserReducers {
  switch (action.type) {
    case ADD_USER_COMMETNS: {
      let currentUser = state.users[action.id];
      if (currentUser) {
        return {
          ...state,
          users: {...state.users,
            [action.id]: {
              ...currentUser,
              comments: [...currentUser.comments,...action.info]
            }
          }
        }
      } else {
        return state
      }
    }
    case MAX_ITEMS: {
      return {
        ...state,
        users: {...state.users,
          [action.id]:{
            ...state.users[action.id],
            maxItems: true,
          }
        }
      }
    }
    case STOP_LOAD: {
      return {
        ...state,
        users: {...state.users,
          [action.id]:{
            ...state.users[action.id],
            isLoad:false
          }
        }
      }
    }
    case START_LOAD: {
      return {
        ...state,
        users: {...state.users,
          [action.id]:{
            ...state.users[action.id],
            isLoad:true,
          }
        }
      }
    }
    case UP_COUT: {
      return {
        ...state,
        users: {...state.users,
          [action.id]:{
            ...state.users[action.id],
            cunt:state.users[action.id].cunt + action.cout,
          }}
      }
    }
    case ADD_USER: {
      return {
        ...state,
        users:{...state.users,[action.info.id]:{
          id:action.info.id,
          created:action.info.created,
          karma:action.info.karma,
          about:action.info.about,
          submitted:action.info.submitted,
          story: [],
          comments: [],
          favorites: [],
          cunt: 0,
          isLoad: false,
          maxItems: false,
        }}
      }
    }
    case ADD_USER_STORY: {
      let story: IStore[] = [];
      let user = state.users[action.id];
      if (user.story) {
        story = [...user.story,...action.storys];
      } else {
        story = [...action.storys];
      }
      return {
        ...state,
        users:{...state.users,
          [action.id]: {
            ...state.users[action.id],
            story: story,
          }
        }
      }
    }
    default: {
      return state
    }
  }
}

export default userReducers