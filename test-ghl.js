// Load environment variables first
require('dotenv').config();

const GHLService = require('./server/services/ghl-service');
const Logger = require('./server/utils/logger');

async function testGHLConnection() {
  console.log('🧪 Testing GoHighLevel API Connection...\n');
  console.log('Location ID:', process.env.GHL_LOCATION_ID);
  console.log('API Key starts with:', process.env.GHL_API_KEY?.substring(0, 10) + '...');
  console.log('');

  // Check if environment variables are loaded
  if (!process.env.GHL_API_KEY || process.env.GHL_API_KEY === 'test_ghl_api_key_123') {
    console.log('❌ ERROR: GHL_API_KEY not found in .env file');
    console.log('💡 Make sure you updated the .env file with your actual API key');
    return;
  }

  if (!process.env.GHL_LOCATION_ID || process.env.GHL_LOCATION_ID === 'your-ghl-location-id') {
    console.log('❌ ERROR: GHL_LOCATION_ID not found in .env file');
    console.log('💡 Make sure you updated the .env file with your actual Location ID');
    return;
  }

  try {
    // Test 1: Validate credentials
    console.log('1. Validating API credentials...');
    const isValid = await GHLService.validateCredentials();
    console.log('✅ API credentials valid:', isValid);

    if (isValid) {
      // Rest of the test code remains the same...
      console.log('\n2. Fetching locations...');
      const locations = await GHLService.getLocations();
      console.log(`✅ Found ${locations.length} locations:`);
      locations.forEach((loc, index) => {
        console.log(`   ${index + 1}. ${loc.name} (ID: ${loc.id})`);
        if (loc.id === process.env.GHL_LOCATION_ID) {
          console.log('      ⭐ THIS IS YOUR CURRENT LOCATION');
        }
      });

      console.log('\n🎉 GHL API Connection Test PASSED!');
    } else {
      console.log('\n❌ GHL API Connection Test FAILED!');
    }

  } catch (error) {
    console.log('\n❌ GHL API Connection Test FAILED!');
    console.log('Error:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testGHLConnection();
}

module.exports = testGHLConnection;
