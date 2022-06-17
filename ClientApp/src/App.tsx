import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import Layout from './components/Layout'
import Gant from './components/Gant';
import LostSteel from './components/LostSteel';
import Stats from "./components/Stats";
import './custom.scss'


export default class App extends React.Component {

  notFound = <div className="display-5 not-found">404 - Запрашиваемая страница не найдена на сервере</div>

  render() {
    //console.log(this.props)

    return <Layout>
      <Switch>
        <Route exact path='/gant' component={Gant} />
        <Route exact path='/lost-steel' component={LostSteel} />
        <Route exact path='/stats' component={Stats} />
        <Redirect exact from='/' to='/gant' />
        <Route path="/*" render={() => this.notFound} />
      </Switch>
    </Layout >

  }
}
