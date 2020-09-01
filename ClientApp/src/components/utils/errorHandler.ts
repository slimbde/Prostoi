const errorCodes = {
  "Authenticate: Sequence contains no matching element": "Неверно указан логин и/или пароль",
}


export default (error: string) => `[Ошибка]: ${errorCodes[error]}`;