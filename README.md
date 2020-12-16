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


***UNDEFINED MARKS***
- correct mark names are at Excel file (right outta DB) - `ExcelToJson`
- mnlz2 densities are taken from `mnlz2-markDensity`
- config files are: `mnlz2-config, mnlz5-config`
- mnlz5 densities are `7800` by default

---
- To build production run [dotnet publish -r win10-x64 -c Release --self-contained false]