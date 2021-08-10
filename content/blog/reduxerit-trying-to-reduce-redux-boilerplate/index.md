---
  slug: "/posts/reduxerit-trying-to-reduce-redux-boilerplate/"
  date: 2016-04-16 18:13
  title: "Reduxerit — trying to reduce redux boilerplate"
  draft: false
  description: "Basically, the idea is to easily create a reducer who expect an action with type [REDUCER_NAME]_SET_STATE. the payload of this action will be a partial state witch will be merged with the old state…"
  categories: []
  keywords: []
---
  
Basically, the idea is to easily create a reducer who expect an action with type \[REDUCER\_NAME\]\_SET_STATE. the payload of this action will be a partial state witch will be merged with the old state.

The idea is trying to reduce the redux boilerplate as much as is possible.

It’s still possible to enrich the reducer to use the classic approach for some actions.

#### WITHOUT REDUX UTILS:

**reducers/index.js**

```js
undefined
```

**actions/index.js**

```js
export const toogleEditorExpanded = () => {
 return {
   type:ACT.LAYOUT_TOOGLE_EDITOR_EXPANDED,
 }
}

export const toogleLayoutDirection => {
  return {
    type: ACT.LAYOUT_TOOGLE_DIRECTION
  }
}
```

#### WITH UTILS:

**reducers/index.js**

```js
const layoutDefState = {
 isEditorExpanded: false,
 direction:"horizontal"
}
const layout = createBasicReducer(‘LAYOUT’,layoutDefState)
```

**actions/index.js**

```js
const createLayoutAction = createUpdateStateAction(‘LAYOUT’);
const getLayoutState = getReducerState(store, ‘LAYOUT’)

export const toogleEditorExpanded = () => {
 const isEditorExpanded = !getLayoutState().isEditorExpanded;
 return updateLayoutState({
  isEditorExpanded
 })
}

export const toogleLayoutDirection = () => {
 const direction = getLayoutState().direction === 'vertical'
   ? 'horizontal'
   : 'vertical'

 return createLayoutAction({
   direction
 })
}
```

CONS:  
more responsability to the actions (is it a problem?)

actions payload are bigger

probably is harder to debug (e.g. in )

PRO:

you don’t need a lot of string constant for events name

every time you add an action, you just modify one file, non need to modify

the last point it will generate really less code. Imagine if you have to add the events “enable” and “disable” for both the property…

**the utils:**

```js
function createReducer(initialState, handlers) {
 return function reducer(state = initialState, action) {
  if (handlers.hasOwnProperty(action.type)) {
   return handlers[action.type](state, action)
  }
  else {
   return state
  }
 }
}

export const createBasicReducer = (reducerName , initialState) => {
 
 const _initialState = {
  …initialState,
  reducerName
 }
 
 return createReducer(
  _initialState,
  {
   [reducerName+’_SET_STATE’] : (state, action) => ({
   …state,
   …action.state
  }
 )
 
})}

export const getReducerState = (store, reducerName) => {
 return function(){
  const globalState = store.getState()
  const stateReducerName = Object.keys(globalState).find((p) => globalState[p].reducerName === reducerName )
  return globalState[stateReducerName]
 }
}

export const createUpdateStateAction = (reducerName) => {
 return (state) => ({
  type:reducerName+’_SET_STATE’,
  state
 })
}
```
  