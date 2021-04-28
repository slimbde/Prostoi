import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Layout from './components/Layout'
import Gant from './components/Gant';
import CastLost from './components/LostCast';
import Stats from "./components/Stats";
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

  notFound = <div className="display-5 not-found">404 - Запрашиваемая страница не найдена на сервере</div>

  render() {
    //console.log(this.props)

    return <Layout>
      <Switch>
        <Route exact path='/gant' component={Gant} />
        <Route exact path='/castlost' component={CastLost} />
        <Route exact path='/stats' component={Stats} />
        <Redirect exact from='/' to='/gant' />
        <Route path="/*" render={() => this.notFound} />
      </Switch>
    </Layout >

  }
}



export default connect(
  null,
  store.actionCreators
)(App as any);