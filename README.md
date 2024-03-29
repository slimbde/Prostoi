# FEATURES

## LAYOUT
- withRouter wrap function allows to get current path in Navbar component
- to install icons: **npm install @material-ui/icons @material-ui/core**
- to use icons: **import MenuIcon from "@material-ui/icons/Menu"**
- to use M add to tsconfig: **"noImplicitAny": false** and in configureStore alter **enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__() as never)**
- to make TypeScript understand materialize: **npm install --save @types/materialize-css**


## THE PROPS ISSUE
- to pass on props one should merge them with the rest props of a component
  using spread operator for instance


## THE IMPLICIT ANY ISSUE
- to avoid ts errors about implicit any and it didn't find a file
  1. Create index.d.ts in ClientApp folder
  2. Add there *declare module ...*
  3. Add "index.d.ts" in "include" section of the tsconfig.json


## UNDEFINED MARKS
- correct mark names are at Excel file (right outta DB) - `ExcelToJson`
- mnlz2 densities are taken from `mnlz2-markDensity`
- config files are: `mnlz2-config, mnlz5-config`
- mnlz5 densities are `7800` by default

---
- To build production run [dotnet publish -r win10-x64 -c Release --self-contained false]


## web.config file
- within the `web.config` file there is a property `aspNetCore`
- it contains the tag `hostingModel`. By default its value is `inprocess`
- that means IIS handles this app directly (the process `w3wp` is up within the running windows processes)
- if you change that to `outofprocess` - it will override default behaviour. In this case
	the app will be hosted by Kestrel server and IIS will be a proxy between internet and Kestrel.
	The sign of such behavior is that now `w3wp` runs `dotnet` process additionally (look at process list).
	The Kestrel scheme is way more slower. That's why you should avoid `outofprocess` in production deployment
- By the way.. when you develop in vscode, Kestrel is used by the environment of the developing infrastructure.

## Adaptation
- IE doesn't support `Array.find( )` function. Use **Array.filter()[0]** instead


## If charts draw twice at the switch to another page
- The point is you forgot to dispose Idles or any other data in Redux. So it takes previous data for the first render
- Dispose that data and blinking stops

## REDUX
- The benefit of using **connect** function is it wraps your `actionCreators` with ***dispatch*** function
  so there is no need to use `useDispatch` hook. However you're unable to pass any props to the component except for redux stuff

- The benefit of using hooks to deal with redux is to avoiding using `connect` function and possibility to pass any props to the component.
