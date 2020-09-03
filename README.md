# FEATURES

***LAYOUT***
- withRouter wrap function allows to get current path in Navbar component
- to use icons npm install @material-ui/icons @material-ui/core
- to use M add to tsconfig >> "noImplicitAny": false << and in configureStore alter enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__() as never)
- to make TypeScript understand materialize >>> npm install --save @types/materialize-css


***THE PROPS ISSUE***
- to pass on props one should merge them with the rest props of a component
  using spread operator for instance