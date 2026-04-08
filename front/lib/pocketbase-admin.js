import PocketBase, { ClientResponseError } from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL;
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

let pbInstance;

function createPocketBaseClient() {
    if (!POCKETBASE_URL) {
        throw new Error('POCKETBASE_URL is required');
    }

    const pb = new PocketBase(POCKETBASE_URL);
    pb.autoCancellation(false);
    return pb;
}

function ensurePocketBaseClient() {
    if (!pbInstance) {
        pbInstance = createPocketBaseClient();
    }

    return pbInstance;
}

async function ensurePocketBaseAdminAuth(pb) {
    if (pb.authStore.isValid) {
        return;
    }

    if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
        throw new Error('POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are required');
    }

    await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
}

function escapeFilterValue(value) {
    return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

export async function markRecordAsPaidByEmail({ collectionName = 'feedback', email, paymentIntentId }) {
    if (!email) {
        throw new Error('Email is required to update PocketBase');
    }

    const pb = ensurePocketBaseClient();
    await ensurePocketBaseAdminAuth(pb);

    // Lookup by email to implement update-or-create behavior.
    const filter = `email=\"${escapeFilterValue(email)}\"`;
    const payload = {
        email,
        status: 'paid',
        paymentStatus: 'confirmed',
        paymentIntentId,
    };

    try {
        const existing = await pb.collection(collectionName).getFirstListItem(filter);
        const updated = await pb.collection(collectionName).update(existing.id, payload);
        return {
            action: 'updated',
            id: updated.id,
        };
    } catch (error) {
        // PocketBase returns 404 when no record matches filter.
        if (error instanceof ClientResponseError && error.status === 404) {
            const created = await pb.collection(collectionName).create(payload);
            return {
                action: 'created',
                id: created.id,
            };
        }

        throw error;
    }
}
