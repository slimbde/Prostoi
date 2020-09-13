const errorCodes = {
  "Authenticate: Sequence contains no matching element": "Неверно указан логин и/или пароль",
  "Login isn't unique": "Этот логин уже занят",
}


export default (error: string) => `[Ошибка]: ${errorCodes[error]}`;