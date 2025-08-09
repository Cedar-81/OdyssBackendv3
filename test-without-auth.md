# Testing APIs Without Authentication (Development Only)

## Quick Test Commands

If you want to temporarily test the API logic without authentication, you can:

### 1. Comment out the global auth guard in app.module.ts:
```typescript
// {
//   provide: APP_GUARD,
//   useClass: ClerkAuthGuard,
// },
```

### 2. Comment out the interceptor in playbooks.controller.ts:
```typescript
// @UseInterceptors(SupabaseUserInterceptor)
```

### 3. Modify the controller methods to use a test user ID:
```typescript
const userId = req.supabaseUser?.id || '550e8400-e29b-41d4-a716-446655440000';
```

### 4. Test with curl:

```bash
# Create a playbook
curl -X POST http://localhost:3000/api/playbooks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Trip to Paris","destination":"Paris, France","startDate":"2025-08-03","endDate":"2025-08-21"}'

# Get all playbooks
curl -X GET http://localhost:3000/api/playbooks

# Get specific playbook (replace {id} with actual ID from create response)
curl -X GET http://localhost:3000/api/playbooks/{id}

# Create playbook data
curl -X POST http://localhost:3000/api/playbooks/data \
  -H "Content-Type: application/json" \
  -d '{"playbookId":"{playbook-id}","data":{"itinerary":[{"day":1,"activities":["Visit Eiffel Tower"]}]}}'

# Update playbook
curl -X PATCH http://localhost:3000/api/playbooks/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Trip Title"}'

# Delete playbook
curl -X DELETE http://localhost:3000/api/playbooks/{id}
```

⚠️ **Remember to re-enable authentication after testing!**