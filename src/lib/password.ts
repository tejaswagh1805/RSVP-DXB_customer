export const isValidPassword = (password: string) =>
  password.length >= 8 &&
  password.length <= 200 &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);

