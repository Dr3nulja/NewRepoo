import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Reuse a single Auth0 client instance for all server requests.
export const auth0 = new Auth0Client();
