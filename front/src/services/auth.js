import pb from '../lib/pocketbase';

export async function register({ email, password, name }) {
  const user = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
    isPremium: false,
  });

  await pb.collection('users').authWithPassword(email, password);
  return user;
}

export async function login({ email, password }) {
  const authData = await pb.collection('users').authWithPassword(email, password);
  return authData.record;
}

export function logout() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.record;
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}
