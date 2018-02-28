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



/*
  * Onload setup localStorage, initialise Redux.store and event listeners.
*/

// If localStorage does not have this property then initialise.
if (!window.localStorage._jmsLogInDat) {

  window.localStorage._jmsLogInDat = JSON.stringify({
    "users": [
      {"id": "Hamish",   "pwd": "helly54321"},
    ] 
  })
}

// get registered users from localStorage.
const logInDat = JSON.parse(localStorage._jmsLogInDat)

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
domLogInForm.addEventListener('click', reactToFormClicks(domLogInForm))

// When the store is changed run this function
appStore.subscribe(upDate)


/*
  * End onload setup.
*/


/*
  * App specific functions...
*/

const getUsername = pick('id')

function upDate () {
  const target = qs('#output-table')
  const appState = appStore.getState().users

  // Output html table.
  outpHtmlTable(target, appState)

  // Output to localStorage.
  const tmp = {"users": appState}
  localStorage.setItem('_jmsLogInDat', JSON.stringify(tmp))
}

function outpHtmlTable(target, source) {
  target.innerHTML = source.map(v => (`
    <tr><td>${v.id}</td><td>${v.pwd}</td></tr>
  `)).join('')
}

function reactToFormClicks(form, e) {
  return function(e){
    e.preventDefault()
    const inputs = filter(v => v.dataset.input)(form.elements)
    const inputObj = reduce((p,c) => Object.assign(p, {[c.id]: c.value}),{})(inputs)

    switch (e.target.id) {
      case 'login':
        console.log("You want to log in with ", inputObj)
        // if a form field is not completed
        if (Object.values(inputObj).some(v => !v)) break

        appStore.dispatch({type:"login", inputs: inputObj})
        // clear the form fields
        form.reset()
        break;
      default:
        console.log("NoOp")
        break;
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
    <form action="" id="loginForm" method="get">
      <p>
        <label for="id">Username</label>
        <input id="id"
                name="username"
                data-input="user"
                type="text"
                required
                placeholder="enter your username">
      </p>
      <p>
        <label for="pwd">Password</label>
        <input id="pwd"
                name="password"
                data-input="pwd"
                type="password"
                required
                placeholder="enter your password">
      </p>
      <p>
        <input id="login" type="submit" name="login" value="login">
      </p>
    </form>
  `)
}
