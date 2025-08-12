# Testing API with curl

Since Clerk sign-in is having issues in the browser, here's how to test the API directly with curl:

## 1. Get a Test Token

You can get a test token from your Clerk dashboard or use this approach:

1. Go to your Clerk Dashboard: https://dashboard.clerk.com/
2. Navigate to your application
3. Go to "Users" section
4. Create a test user or use an existing one
5. Copy the user's ID (this will be your test user ID)

## 2. Test API Endpoints

### Health Check (No Auth Required)
```bash
curl -s http://localhost:3000/api/health | jq .
```

### Config (No Auth Required)
```bash
curl -s http://localhost:3000/api/config | jq .
```

### Create Playbook (Auth Required)
```bash
# Replace YOUR_USER_ID with an actual Clerk user ID
curl -X POST http://localhost:3000/api/playbooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_ID" \
  -d '{
    "title": "Test Trip to Paris",
    "description": "Testing the Supabase integration",
    "category": "travel",
    "visibility": "private"
  }' | jq .
```

### Get All Playbooks (Auth Required)
```bash
curl -s -H "Authorization: Bearer YOUR_USER_ID" \
  http://localhost:3000/api/playbooks | jq .
```

## 3. Alternative: Use a Real Clerk Token

If you want to use a real Clerk session token:

1. Sign in to your application through Clerk
2. Get the session token from browser dev tools (Application tab → Local Storage → Clerk session)
3. Use that token in the Authorization header

## 4. Test with Sample Data

Here's a complete test sequence:

```bash
# 1. Check server health
curl -s http://localhost:3000/api/health

# 2. Create a playbook (replace YOUR_USER_ID)
curl -X POST http://localhost:3000/api/playbooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_ID" \
  -d '{"title":"My First Trip","description":"Testing","category":"test","visibility":"private"}'

# 3. Get all playbooks
curl -s -H "Authorization: Bearer YOUR_USER_ID" \
  http://localhost:3000/api/playbooks
```

## 5. Check Supabase

After creating a playbook, check your Supabase dashboard:
- Go to Table Editor
- Look at the `playbooks` table
- You should see the new record with your user ID as `owner_id`

## Notes

- The `Authorization: Bearer YOUR_USER_ID` approach works because our backend is configured to accept Clerk user IDs directly
- In production, you'd use proper JWT tokens from Clerk
- This is just for testing - the real authentication flow would use proper Clerk tokens
