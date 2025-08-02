const axios = require('axios');

const CLERK_SECRET_KEY = 'sk_test_Oc9kAW1UGnJB8Q30rgU96Hu6VoKdX9jb1cDSXjhfRM'; // replace with your secret key
const TEST_USER_ID = 'user_30hGW1WBabPlXEVgqYlsubp4fA1';     // replace with your Clerk user ID

async function getClerkToken() {
  try {
    const response = await axios.post(
      `https://api.clerk.dev/v1/sessions`,
      {
        user_id: TEST_USER_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const sessionId = response.data.id;

    // Get session token (JWT)
    const tokenResponse = await axios.post(
      `https://api.clerk.dev/v1/sessions/${sessionId}/tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        },
      }
    );

    const jwtToken = tokenResponse.data.jwt;
    console.log('Your Clerk JWT Token:\n', jwtToken);

    // You can now use jwtToken in Postman
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
  }
}

getClerkToken();
