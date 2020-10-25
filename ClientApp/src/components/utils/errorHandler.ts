const errorCodes: { [key: string]: string } = {
  "Authenticate: Sequence contains no matching element": "Неверно указан логин и/или пароль",
  "Login isn't unique": "Этот логин уже занят",
  "Email isn't unique": "Этот email уже занят",
}


export default (error: string | null) => error && `[Ошибка]: ${errorCodes[error]}`;