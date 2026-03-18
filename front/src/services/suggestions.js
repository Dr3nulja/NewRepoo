import pb from '../lib/pocketbase';

export async function fetchSuggestions() {
  const [suggestions, votes] = await Promise.all([
    pb.collection('suggestions').getFullList({
      sort: '-created',
      expand: 'user_id',
    }),
    pb.collection('votes').getFullList(),
  ]);

  const voteCounter = votes.reduce((acc, vote) => {
    acc[vote.suggestion_id] = (acc[vote.suggestion_id] || 0) + 1;
    return acc;
  }, {});

  return suggestions.map((item) => ({
    ...item,
    voteCount: voteCounter[item.id] || 0,
    authorName: item.expand?.user_id?.name || item.expand?.user_id?.email || 'Unknown',
  }));
}

export async function createSuggestion({ title, description }) {
  if (!pb.authStore.record?.id) {
    throw new Error('You must be logged in to create a suggestion.');
  }

  return pb.collection('suggestions').create({
    title,
    description,
    status: 'open',
    user_id: pb.authStore.record.id,
  });
}

export async function voteForSuggestion(suggestionId) {
  if (!pb.authStore.record?.id) {
    throw new Error('You must be logged in to vote.');
  }

  return pb.collection('votes').create({
    user_id: pb.authStore.record.id,
    suggestion_id: suggestionId,
  });
}
