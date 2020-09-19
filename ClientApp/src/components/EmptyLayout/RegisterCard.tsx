import * as React from 'react'
import M from 'materialize-css/dist/js/materialize.js'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { User } from './User'
import { ApplicationState } from '../../store'
import * as AuthenticateStore from '../../store/Authenticate';
import errorHandler from '../utils/errorHandler';


interface IRegisterProps {
  requestLogin: (data: AuthenticateStore.IAuthData) => void,
  history: any,
}


class RegisterCard extends React.Component<IRegisterProps> {

  state = {
    nameError: null,
    loginError: null,
    passwordError: null,
    emailError: null,
    cPasswordError: null,
  }


  validate = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const elements: { [key: string]: HTMLInputElement } = {
      name: document.getElementById("name") as HTMLInputElement,
      login: document.getElementById("login") as HTMLInputElement,
      email: document.getElementById("email") as HTMLInputElement,
      password: document.getElementById("password") as HTMLInputElement,
      cPassword: document.getElementById("cPassword") as HTMLInputElement,
    }


    const error: { [key: string]: string } | null = elements.name.value === ""
      ? { nameError: "Вы не указали имя" }
      : elements.login.value === ""
        ? { loginError: "Вы не указали логин" }
        : elements.email.value === ""
          ? { emailError: "Вы не указали email" }
          : elements.password.value === "" || elements.password.value.length < 6
            ? { passwordError: "Длина пароля д.б. больше 6 символов" }
            : elements.cPassword.value === "" || elements.cPassword.value !== elements.password.value
              ? { cPasswordError: "Пароль и подтверждение не совпадают" }
              : null

    const errorState: { [key: string]: string | null } = {}
    if (error) {
      for (let key in elements)
        elements[key].classList.remove("invalid")

      for (let key in this.state) {
        errorState[key] = null

        if (key in error) {
          errorState[key] = error[key]
          elements[key.slice(0, -5)].classList.add("invalid")
        }
      }

      this.setState(errorState)
      return
    }

    const user = new User(
      elements.name.value,
      elements.login.value,
      elements.email.value,
      elements.password.value
    )

    fetch("api/user", {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          M.updateTextFields()
          return M.toast({ html: errorHandler(data.error) })
        }

        this.props.requestLogin({ user: user, role: null, error: null })
        M.toast({ html: "Вы зарегистрировались и вошли в систему" })
        this.props.history.push("/")
      })
  }


  render() {

    return (
      <form onSubmit={this.validate} className="card auth-card" >
        <div className="card-content">
          <span className="card-title">РЕГИСТРАЦИЯ</span>
          <div className="input-field">
            <input id="name" type="text" className="validate" />
            <label htmlFor="name">Имя</label>
            <small className="helper-text invalid">{this.state.nameError}</small>
          </div>
          <div className="input-field">
            <input id="login" type="text" className="validate" />
            <label htmlFor="login">Логин</label>
            <small className="helper-text invalid">{this.state.loginError}</small>
          </div>
          <div className="input-field">
            <input id="email" type="text" className="validate" />
            <label htmlFor="email">Email</label>
            <small className="helper-text invalid">{this.state.emailError}</small>
          </div>
          <div className="input-field">
            <input id="password" type="password" className="validate" />
            <label htmlFor="password">Пароль</label>
            <small className="helper-text invalid">{this.state.passwordError}</small>
          </div>
          <div className="input-field">
            <input id="cPassword" type="password" className="validate" />
            <label htmlFor="cPassword">Пароль еще раз</label>
            <small className="helper-text invalid">{this.state.cPasswordError}</small>
          </div>
        </div>
        <div className="card-action">
          <button type="submit" className="btn waves-effect">ЗАРЕГИСТРИРОВАТЬСЯ</button>
          <div>Есть аккаунт? <Link to="/">ВОЙТИ</Link></div>
        </div>
      </form>
    )
  }
}


export default connect(
  (state: ApplicationState) => ({ authError: state.authenticate!.authData.error }),
  AuthenticateStore.actionCreators
)(RegisterCard as any)