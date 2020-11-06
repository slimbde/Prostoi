import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router';
import Layout from './components/Layout'
import Gant from './components/Gant';
import CastLost from './components/LostCast';
import { ApplicationState } from './store';
import * as GantStore from './store/Gant';

import './custom.css'


interface AppProps {
  shops: string[]
  setShops: (data: string[]) => void
}



class App extends React.Component<AppProps> {

  constructor(props: AppProps) {
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
      <Route path='/castlost' component={CastLost} />
    </Layout >

  }
}



export default connect(
  (state: ApplicationState) => state.gant,
  GantStore.actionCreators
)(App as any);