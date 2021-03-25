import * as React from 'react';
import { Redirect, Route } from 'react-router';
import Layout from './components/Layout'
import Gant from './components/Gant';
import CastLost from './components/LostCast';
import { dbHandler } from "./models/handlers/DbHandler";
import { connect } from "react-redux";
import * as store from './store/GantStore'
import './custom.css'


class App extends React.Component<{ setShops: (shops: string[]) => store.SetShops }> {

  constructor(props: any) {
    super(props)

    dbHandler.getShopsAsync()
      .then(shops => this.props.setShops(shops))
      .catch((error: Error) => console.error(`[App]: ${error.message}`))
  }

  render() {
    //console.log(this.props)

    return <Layout>
      <Route Route exact path='/' > <Redirect to='/gant' /></Route >
      <Route exact path='/gant' component={Gant} />
      <Route path='/castlost' component={CastLost} />
    </Layout >

  }
}



export default connect(
  null,
  store.actionCreators
)(App as any);