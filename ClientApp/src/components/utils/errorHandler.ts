const errorCodes: { [key: string]: string } = {
  "Authenticate: Sequence contains no matching element": "Неверно указан логин и/или пароль",
  "Login isn't unique": "Этот логин уже занят",
  "Email isn't unique": "Этот email уже занят",
  "Connection request timed out": "Нет связи с базой данных",
}


export const errorHandler = (error: any) => {
  if (error) {
    if ("error" in error) {
      const loading = (document.querySelector('.loading') as HTMLDivElement)
      loading && (loading.style.opacity = "0")

      console.error(error.error)
      alert(errorCodes[error.error])
    }
    else
      return `[Ошибка]: ${errorCodes[error]}`
  }
}