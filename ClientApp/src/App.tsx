import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router';
import Layout from './components/Layout'
import Gant from './components/Gant';
import Efficiency from './components/Efficiency';
import { ApplicationState } from './store';
import * as GantStore from './store/Gant';

import './custom.css'


interface AppState {
  shops: string[]
  setShops: (data: string[]) => void,
}



class App extends React.Component<AppState> {

  constructor(props: AppState) {
    super(props)

    if (props.shops.length === 0) {
      fetch(`api/idle/getshops`)
        .then(resp => resp.json() as Promise<string[]>)
        .then(data => props.setShops(data))
    }
  }



  render() {
    //console.log(this.props)

    return <Layout>
      <Route exact path='/'><Redirect to='/gant' /></Route>
      <Route exact path='/gant' component={Gant} />
      <Route path='/efficiency' component={Efficiency} />
    </Layout >

  }
}

export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(App as any);