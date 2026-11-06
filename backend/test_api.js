/**
 * TrueLens Backend Integration Test Suite
 */

const request = require('supertest');
const app = require('./src/server');

async function runTests() {
  console.log('========================================');
  console.log('TRUELENS BACKEND INTEGRATION TESTS');
  console.log('========================================');

  try {
    // 1. Health check
    console.log('\n[1/5] Testing GET /api/health ...');
    const resHealth = await request(app).get('/api/health');
    console.log('Health status:', resHealth.status, resHealth.body);
    if (resHealth.status !== 200) throw new Error('Health check failed');
    console.log('PASS: /api/health verified.');

    // 2. Auth: Register
    console.log('\n[2/5] Testing POST /api/auth/register ...');
    const testUser = {
      name: 'Test Researcher',
      email: `researcher_${Date.now()}@example.com`,
      password: 'password123',
    };
    const resReg = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    console.log('Register status:', resReg.status, resReg.body.message);
    if (resReg.status !== 201) throw new Error(`Register failed: ${JSON.stringify(resReg.body)}`);
    const token = resReg.body.token;
    console.log('PASS: Register succeeded, JWT token received.');

    // 3. Auth: Login & Profile
    console.log('\n[3/5] Testing POST /api/auth/login & GET /api/auth/profile ...');
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    console.log('Login status:', resLogin.status);
    if (resLogin.status !== 200) throw new Error('Login failed');

    const resProfile = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    console.log('Profile status:', resProfile.status, resProfile.body.user.email);
    if (resProfile.status !== 200) throw new Error('Profile fetch failed');
    console.log('PASS: Auth lifecycle verified.');

    // 4. File upload validation (reject non-image / empty requests)
    console.log('\n[4/5] Testing POST /api/analysis/predict input validation ...');
    const resBadUpload = await request(app).post('/api/analysis/predict');
    console.log('No file upload status:', resBadUpload.status, resBadUpload.body.message);
    if (resBadUpload.status !== 400) throw new Error('Expected 400 for empty upload');
    console.log('PASS: File validation verified.');

    // 5. Test history endpoint
    console.log('\n[5/5] Testing GET /api/analysis/history ...');
    const resHistory = await request(app)
      .get('/api/analysis/history')
      .set('Authorization', `Bearer ${token}`);
    console.log('History status:', resHistory.status, 'Total records:', resHistory.body.predictions.length);
    if (resHistory.status !== 200) throw new Error('History check failed');
    console.log('PASS: History endpoint verified.');

    console.log('\n========================================');
    console.log('ALL BACKEND INTEGRATION TESTS PASSED!');
    console.log('========================================');

    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

runTests();

