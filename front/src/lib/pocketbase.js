import PocketBase from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

if (!pocketbaseUrl) {
  throw new Error('Missing VITE_POCKETBASE_URL in environment variables.');
}

const pb = new PocketBase(pocketbaseUrl);
pb.autoCancellation(false);

export default pb;
