# Feedback Board SaaS MVP

## Stage 1. PocketBase database design

### Collections

1. users (auth collection)
- email (built-in)
- password (built-in)
- name (built-in or custom text)
- isPremium (bool, default false)

2. suggestions
- title (text, required)
- description (text, required)
- status (select: open, planned, in_progress, done; default open)
- user_id (relation -> users, single, required)

3. votes
- user_id (relation -> users, single, required)
- suggestion_id (relation -> suggestions, single, required)

### API Rules

users
- listRule: id = @request.auth.id
- viewRule: id = @request.auth.id
- createRule: ""
- updateRule: id = @request.auth.id
- deleteRule: id = @request.auth.id

suggestions
- listRule: ""
- viewRule: ""
- createRule: @request.auth.id != ""
- updateRule: @request.auth.id != "" && user_id = @request.auth.id
- deleteRule: @request.auth.id != "" && user_id = @request.auth.id

votes
- listRule: ""
- viewRule: ""
- createRule: @request.auth.id != "" && user_id = @request.auth.id
- updateRule: @request.auth.id != "" && user_id = @request.auth.id
- deleteRule: @request.auth.id != "" && user_id = @request.auth.id

### Recommended DB index

Create unique index to avoid duplicate votes from one user for one suggestion:

```sql
CREATE UNIQUE INDEX idx_votes_user_suggestion ON votes (user_id, suggestion_id);
```

## Stage 2. Frontend architecture

PocketBase SDK config:
- src/lib/pocketbase.js

Main app structure:
- src/components/Navbar.jsx
- src/components/SuggestionCard.jsx
- src/components/NewSuggestionForm.jsx
- src/services/auth.js
- src/services/suggestions.js
- src/services/billing.js
- src/App.jsx

## Stage 4. Stripe integration logic

1. Frontend sends current user id to backend endpoint /api/billing/create-checkout-session.
2. Backend creates Stripe Checkout Session with metadata.userId.
3. Client is redirected to Stripe hosted checkout page.
4. Stripe sends webhook checkout.session.completed.
5. Backend verifies webhook signature and updates users.isPremium = true in PocketBase.

Reference backend example:
- api-service/stripe-premium-example.js

## Stage 5. Deployment and Docker

Frontend Docker files:
- front/Dockerfile
- front/nginx.conf

PocketBase persistent volume in Coolify:
- Mount persistent volume to /pb/pb_data
- Without it, all PocketBase records/files are lost after container recreation
- Keep database and uploaded files in this volume

Example volume mapping in Coolify:
- Source: pb_data_volume
- Destination: /pb/pb_data
