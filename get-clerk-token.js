// Quick script to generate a Clerk token for testing
// Run with: node get-clerk-token.js

const { clerkClient } = require('@clerk/clerk-sdk-node');

async function generateTestToken() {
  try {
    // Replace with your actual Clerk secret key
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_your_secret_key_here';
    
    if (CLERK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      console.log('❌ Please set your CLERK_SECRET_KEY environment variable');
      console.log('   export CLERK_SECRET_KEY=sk_test_your_actual_secret_key');
      return;
    }

    // Initialize Clerk client
    const clerk = clerkClient({ secretKey: CLERK_SECRET_KEY });
    
    // Get all users (for testing)
    const users = await clerk.users.getUserList({ limit: 1 });
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user in your Clerk dashboard first.');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.emailAddresses[0]?.emailAddress || user.id);
    
    // Create a session token for testing
    // Note: In production, tokens are generated on the frontend
    console.log('📝 User ID for API testing:', user.id);
    console.log('📧 Email:', user.emailAddresses[0]?.emailAddress || 'No email');
    
    console.log('\n🔧 To test your API:');
    console.log('1. Use the HTML test client (test-client.html)');
    console.log('2. Or use Clerk\'s built-in session tokens from the frontend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Valid CLERK_SECRET_KEY environment variable');
    console.log('2. At least one user in your Clerk dashboard');
  }
}

generateTestToken();