import * as React from 'react'
import M from 'materialize-css/dist/js/materialize.js'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { ApplicationState } from '../../store'
import * as AuthenticateStore from '../../store/Authenticate';
import errorHandler from '../utils/errorHandler';

interface ISignInProps {
  title: string,
  btnText: string,
  hintText: string,
  hintBtnText: string,
  mode: string,
  requestAuthenticate: (login: string, password: string) => Promise<any>,
  authError: any,
}

class SignInCard extends React.Component<ISignInProps> {

  state = {
    loginError: null,
    passwordError: null,
  }

  toast: any  ////// fucking toast!!!!

  validate = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const login = document.getElementById("login")!
    const password = document.getElementById("password")!

    login.classList.remove("invalid")
    password.classList.remove("invalid")

    if (login.value === "") {
      login.classList.add("invalid")
      this.setState({ loginError: "Вы не указали логин", passwordError: null })
      return
    }

    if (password.value === "") {
      password.classList.add("invalid");
      this.setState({ passwordError: "Вы не указали пароль", loginError: null })
      return
    }

    if (password.value.length < 6) {
      password.classList.add("invalid");
      this.setState({ passwordError: "Длина пароля должна быть больше 6 символов", loginError: null })
      return
    }

    this.props.requestAuthenticate(login.value, password.value);

    login.value = ""
    password.value = ""
    this.setState({ loginError: null, passwordError: null })
  }

  componentWillUnmount() {
    this.toast && clearTimeout(this.toast);
  }

  render() {
    if (!this.state.loginError && !this.state.passwordError && this.props.authError)
      this.toast = setTimeout(() => M.toast({ html: errorHandler(this.props.authError) }), 50)

    const link = this.props.mode === "login" ? "/register" : "/"

    return (
      <form onSubmit={this.validate} className="card auth-card" >
        <div className="card-content">
          <span className="card-title">{this.props.title}</span>
          <div className="input-field">
            <input id="login" type="text" className="validate" />
            <label htmlFor="login">Login</label>
            <small className="helper-text invalid">{this.state.loginError}</small>
          </div>
          <div className="input-field">
            <input id="password" type="password" className="validate" />
            <label htmlFor="password">Password</label>
            <small className="helper-text invalid">{this.state.passwordError}</small>
          </div>
        </div>
        <div className="card-action">
          <button type="submit" className="btn waves-effect">{this.props.btnText}</button>
          <div>{this.props.hintText} <Link to={link}>{this.props.hintBtnText}</Link></div>
        </div>
      </form>
    )
  }
}


export default connect(
  (state: ApplicationState) => ({ authError: state.authenticate!.authData.error }),
  AuthenticateStore.actionCreators
)(SignInCard as any)