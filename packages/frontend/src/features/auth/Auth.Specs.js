/** @typedef {{ id: number|string, name: string, email: string, role: string }} AuthUser */
/** @typedef {{ name: string, email: string, password: string }} Credentials */

export const accessModes = Object.freeze({ LOGIN: 'login', SIGNUP: 'signup' })
export const accessInitialForm = Object.freeze({ name: '', email: '', password: '' })
