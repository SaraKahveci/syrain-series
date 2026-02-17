import { auth } from '../firebase'

export async function getToken() {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}
