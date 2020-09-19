import * as React from 'react'
import M from 'materialize-css/dist/js/materialize.js'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as AuthenticateStore from '../../store/Authenticate'
import errorHandler from '../utils/errorHandler'


interface ILoginProps {
  requestLogin: (data: AuthenticateStore.IAuthData) => void,
}

interface ILoginState {
  loginError: string | null
  passwordError: string | null
}



class LoginCard extends React.Component<ILoginProps, ILoginState> {

  state = {
    loginError: null,
    passwordError: null,
  }


  validate = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    const login = document.getElementById("login") as HTMLInputElement
    const password = document.getElementById("password") as HTMLInputElement

    login.classList.remove("invalid")
    password.classList.remove("invalid")

    if (login.value === "") {
      login.classList.add("invalid")
      this.setState({ loginError: "Вы не указали логин", passwordError: null })
      return
    }

    if (password.value === "") {
      password.classList.add("invalid")
      this.setState({ passwordError: "Вы не указали пароль", loginError: null })
      return
    }

    if (password.value.length < 6) {
      password.classList.add("invalid")
      this.setState({ passwordError: "Длина пароля должна быть больше 6 символов", loginError: null })
      return
    }

    fetch(`api/user/authenticate?login=${login.value}&password=${password.value}`)
      .then(response => (response.json() as Promise<AuthenticateStore.IAuthData>))
      .then(data => {
        if (data.error) {
          M.toast({ html: errorHandler(data.error) })
          login.value = ""
          password.value = ""
          M.updateTextFields()
          this.setState({ loginError: null, passwordError: null })
          return
        }

        this.props.requestLogin({ user: data.user, role: data.role, error: null })
        M.toast({ html: "Вы успешно вошли в систему" })
      })
  }


  /////////////////////// RENDER
  render() {
    //console.log("Login-render")

    return (
      <form onSubmit={this.validate} className="card auth-card" >
        <div className="card-content">
          <span className="card-title">ВХОД В СИСТЕМУ</span>
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
          <button type="submit" className="btn waves-effect">ВОЙТИ</button>
          <div>Есть аккаунт? <Link to="/register">ЗАРЕГИСТРИРОВАТЬСЯ</Link></div>
        </div>
      </form>
    )
  }
}


export default connect(
  null,
  AuthenticateStore.actionCreators
)(LoginCard)