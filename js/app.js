// https://github.com/johnboy5358/localStorageLogIn.git
/*
  * Helper functions...
  * (could be in a library)
*/
// generic helper functions.
const qs = selectorStr => document.querySelector(selectorStr)
const map = fn => coll => Array.prototype.map.call(coll, fn)
const filter = fn => coll => Array.prototype.filter.call(coll, fn)
const reduce = (fn, init) => coll => Array.prototype.reduce.call(coll, fn, init)
const pick = prop => obj => obj[prop]
const lsAddress = '_lsLoginForm'


/*
  * Onload setup localStorage, initialise Redux.store and event listeners.
*/

// If localStorage does not have this property then initialise.
if (!window.localStorage.lsAddress) {

  window.localStorage.lsAddress = JSON.stringify({
    "users": [
      {"id": "Hamish",   "pwd": "Helly54321"},
    ] 
  })
}

// make a function to get id (alias username)
const getUsername = pick('id')

// get registered users from localStorage.
const logInDat = JSON.parse(localStorage.lsAddress)

// Usernames must be unique.
const usersIndex = new Set(map(getUsername)(logInDat.users))

// Create a Redux store object.
let appStore = Redux.createStore(appReducer, {users:logInDat.users, index: usersIndex})

// Show the current table
outpHtmlTable(qs('#output-table'), appStore.getState().users)

// Display the login form
const domLogInFormWrapper = qs('#input')
domLogInFormWrapper.innerHTML = logInForm()

// Listen for form click events
const domLogInForm = qs('#loginForm')
domLogInForm.addEventListener('submit', reactToFormClicks(domLogInForm))

// When the store is changed run this function
appStore.subscribe(upDate)


/*
  * End onload setup.
*/


/*
  * App specific functions...
*/

function upDate () {
  const target = qs('#output-table')
  const appState = appStore.getState().users

  // Output html table.
  outpHtmlTable(target, appState)

  // Output to localStorage.
  const tmp = {"users": appState}
  localStorage.setItem(lsAddress, JSON.stringify(tmp))
}

function outpHtmlTable(target, source) {
  target.innerHTML = source.map(v => (`
    <tr><td>${v.id}</td><td>${v.pwd}</td></tr>
  `)).join('')
}

function reactToFormClicks(form) {
  return function(e) {
    e.preventDefault()
    const formValid = form.checkValidity()

    if(formValid) {

      const formInputs = form.elements
      const inputs = filter(v => v.dataset.input)(formInputs)
      const inputObj = reduce((p,c) => Object.assign(p, {[c.id]: c.value}),{})(inputs)

      // if a form field is not completed
      if (Object.values(inputObj).some(v => !v)) return false

      // send msg to Redux reducer.
      appStore.dispatch({type:"login", inputs: inputObj})

      // clear the form fields
      form.reset()
    }
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case "login":
      // Usernames are unique; you can't have duplicates!
      if (state.index.has(action.inputs.id)) return state
      const newIdx = state.index.add(action.inputs.id)
      const newLogged = state.users
        .concat({id: action.inputs.id, pwd: action.inputs.pwd})
      state.index = newIdx
      state.users = newLogged
      return state
      break;
    default:
      console.log('No Op!')
      return state
  }
}

function logInForm(){
  return (`
    <form action="" id="loginForm" method="post">
      <p>
        <label for="id">Username</label>
        <input id="id"
          name="username"
          data-input="user"
          type="text"
          placeholder="enter your username"
          required="true"
        >
      </p>
      <p>
        <label for="pwd">Password</label>
        <input id="pwd"
          name="password"
          data-input="pwd"
          type="password"
          pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"
          placeholder="enter your password"
          required="true"
        >
                
      </p>
      <p>
        <input id="login" type="submit" name="login" value="login">
      </p>
      <p>password with 8 or more characters and atleast 1 uppercase letter and a number</p>
    </form>
  `)
}
