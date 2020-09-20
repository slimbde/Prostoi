# FEATURES

***LAYOUT***
- withRouter wrap function allows to get current path in Navbar component
- to install icons: **npm install @material-ui/icons @material-ui/core**
- to use icons: **import MenuIcon from "@material-ui/icons/Menu"**
- to use M add to tsconfig: **"noImplicitAny": false** and in configureStore alter **enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__() as never)**
- to make TypeScript understand materialize: **npm install --save @types/materialize-css**


***THE PROPS ISSUE***
- to pass on props one should merge them with the rest props of a component
  using spread operator for instance


***THE IMPLICIT ANY ISSUE***
- to avoid ts errors about implicit any and it didn't find a file
  1. Create index.d.ts in ClientApp folder
  2. Add there *declare module ...*
  3. Add "index.d.ts" in "include" section of the tsconfig.json
