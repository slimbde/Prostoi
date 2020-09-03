import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';
import EmptyLayout from './components/EmptyLayout'
import Layout from './components/Layout';
import SignInCard from './components/EmptyLayout/SignInCard'
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import { ApplicationState } from './store';
import * as AuthenticateStore from './store/Authenticate'

import './custom.css'


interface IAppProps {
  logged: boolean
  authData: AuthenticateStore.IAuthData,
  requestAuthenticate: (login: string, password: string) => Promise<any>,
  requestLogin: (loginData: AuthenticateStore.IAuthData) => Promise<any>,
  requestLogout: () => Promise<any>
}


class App extends React.Component<IAppProps> {
  constructor(props: IAppProps) {
    super(props)

    const authCache = localStorage.getItem("authCache")
    if (authCache) {
      const loginData = JSON.parse(authCache)
      this.props.requestLogin(loginData)
    }
  }

  logout = () => {
    localStorage.removeItem("authCache")
    this.props.requestLogout()
  }


  render() {
    if (this.props.logged)
      localStorage.setItem(
        "authCache",
        JSON.stringify(this.props.authData)
      )


    // to pass on props one should merge them with the rest props of a component
    // using spread operator for instance
    const loginProps = {
      title: "ВХОД В СИСТЕМУ",
      btnText: "ВОЙТИ",
      hintText: "Нет акканута?",
      hintBtnText: "ЗАРЕГИСТРИРОВАТЬСЯ",
      mode: "login",
    }

    const registerProps = {
      title: "РЕГИСТРАЦИЯ",
      btnText: "ЗАРЕГИСТРИРОВАТЬСЯ",
      hintText: "Есть акканут?",
      hintBtnText: "ВОЙТИ",
      mode: "register",
    }


    return this.props.logged
      ? <Layout logout={this.logout} userName={this.props.authData.user.name}>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
      </Layout >

      : <EmptyLayout>
        <Route exact path='/' component={() => <SignInCard {...loginProps} />} />
        <Route exact path='/register' component={() => <SignInCard {...registerProps} />} />
      </EmptyLayout>
  }

}


export default connect(
  (state: ApplicationState) => ({
    logged: state.authenticate!.logged,
    authData: state.authenticate!.authData,
  }),
  AuthenticateStore.actionCreators
)(App as any);