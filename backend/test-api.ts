import { app } from './src/app';
import { prisma } from './src/config/db';
import { Server } from 'http';

let server: Server;
const TEST_PORT = 3899;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('🧪 Starting API Integration Tests for MoonFit...');

  server = app.listen(TEST_PORT);
  let adminToken = '';
  let userToken = '';
  let userRefreshToken = '';
  let testUserId = '';
  let samplePhotoId = '';
  let customRoutineId = 0;

  try {
    // 1. Health Check
    console.log('\n1. Testing GET /health');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = (await healthRes.json()) as any;
    console.log('   Status:', healthRes.status, '| Response:', healthJson.data.status);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // 2. Admin Login
    console.log('\n2. Testing Admin Login (POST /api/auth/login)');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rogeeromontufar@gmail.com',
        password: 'password',
      }),
    });
    const adminLoginJson = (await adminLoginRes.json()) as any;
    console.log('   Status:', adminLoginRes.status, '| Success:', adminLoginJson.success);
    if (adminLoginRes.status !== 200 || !adminLoginJson.data?.accessToken) {
      throw new Error('Admin login failed: ' + JSON.stringify(adminLoginJson));
    }
    adminToken = adminLoginJson.data.accessToken;
    console.log('   Admin Role:', adminLoginJson.data.user.role);

    // 3. User Registration
    console.log('\n3. Testing User Registration (POST /api/auth/register)');
    const testEmail = `test_${Date.now()}@moonfit.com`;
    const userRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Carlos Fitness',
        email: testEmail,
        password: 'Password123!',
        age: 28,
        height_cm: 178,
        initial_weight_kg: 85.5,
      }),
    });
    const userRegJson = (await userRegRes.json()) as any;
    console.log('   Status:', userRegRes.status, '| User:', userRegJson.data?.user?.name);
    if (userRegRes.status !== 201) throw new Error('User register failed: ' + JSON.stringify(userRegJson));
    userToken = userRegJson.data.accessToken;
    userRefreshToken = userRegJson.data.refreshToken;
    testUserId = userRegJson.data.user.id;

    // 4. Test Refresh Token Rotation
    console.log('\n4. Testing Refresh Token Rotation (POST /api/auth/refresh)');
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: userRefreshToken }),
    });
    const refreshJson = (await refreshRes.json()) as any;
    console.log('   Status:', refreshRes.status, '| New tokens issued');
    if (refreshRes.status !== 200) throw new Error('Refresh token failed');
    userToken = refreshJson.data.accessToken;

    // 4b. Verify old refresh token is revoked
    const reuseRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: userRefreshToken }),
    });
    console.log('   Reusing old token status:', reuseRes.status, '(Expected: 401)');
    if (reuseRes.status !== 401) throw new Error('Token reuse detection failed');

    // 5. Complete Onboarding
    console.log('\n5. Testing Complete Onboarding (POST /api/users/onboarding)');
    const onbRes = await fetch(`${BASE_URL}/api/users/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        target_weight_kg: 75.0,
        target_date: '2026-12-31',
        reminder_time: '07:30',
        reminder_type: 'entrenar',
      }),
    });
    const onbJson = (await onbRes.json()) as any;
    console.log('   Status:', onbRes.status, '| Onboarding completed:', onbJson.data?.onboarding_completed);

    // 6. Security Check: Normal user trying to access admin endpoint
    console.log('\n6. Testing RBAC Security: Normal user accessing /api/admin/users');
    const forbiddenRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('   Status:', forbiddenRes.status, '(Expected: 403 Forbidden)');
    if (forbiddenRes.status !== 403) throw new Error('RBAC security check failed');

    // 7. Admin listing users
    console.log('\n7. Admin listing users (GET /api/admin/users)');
    const listRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listJson = (await listRes.json()) as any;
    console.log('   Status:', listRes.status, '| Total users:', listJson.data?.pagination?.total);

    // 8. List Predefined Routines
    console.log('\n8. List Routines (GET /api/routines)');
    const routinesRes = await fetch(`${BASE_URL}/api/routines`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const routinesJson = (await routinesRes.json()) as any;
    console.log('   Status:', routinesRes.status, '| Predefined count:', routinesJson.data?.predefined?.length);
    if (!routinesJson.data?.predefined?.length) throw new Error('No predefined routines found');

    // 9. User Creates Custom Routine
    console.log('\n9. User Create Custom Routine (POST /api/routines)');
    const createRoutineRes = await fetch(`${BASE_URL}/api/routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Mi Rutina de Piernas',
        type: 'fuerza',
        exercises: [
          { exercise_name: 'Prensa 45°', sets: 4, reps: 10, rest_seconds: 90 },
          { exercise_name: 'Extensiones de Cuádriceps', sets: 3, reps: 15, rest_seconds: 60 },
        ],
      }),
    });
    const routineJson = (await createRoutineRes.json()) as any;
    console.log('   Status:', createRoutineRes.status, '| Created routine:', routineJson.data?.name);
    customRoutineId = routineJson.data.id;

    // 10. Log Workout
    console.log('\n10. Log Workout (POST /api/workouts)');
    const workoutRes = await fetch(`${BASE_URL}/api/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        routine_id: customRoutineId,
      }),
    });
    const workoutJson = (await workoutRes.json()) as any;
    console.log('   Status:', workoutRes.status, '| Logged routine:', workoutJson.data?.routine?.name);

    // 11. Weekly Weight Upsert
    console.log('\n11. Weekly Weight Logging & Upsert (POST /api/progress/weight)');
    const weightRes1 = await fetch(`${BASE_URL}/api/progress/weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ weight_kg: 84.8, notes: 'Primera medición del lunes' }),
    });
    const weightJson1 = (await weightRes1.json()) as any;
    console.log('   First entry status:', weightRes1.status, '| Weight:', weightJson1.data?.weight_kg);

    // Upsert on same week
    const weightRes2 = await fetch(`${BASE_URL}/api/progress/weight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ weight_kg: 84.2, notes: 'Ajuste fin de semana' }),
    });
    const weightJson2 = (await weightRes2.json()) as any;
    console.log('   Upsert status:', weightRes2.status, '| Updated Weight:', weightJson2.data?.weight_kg);

    // 12. Water Logging & Summary
    console.log('\n12. Water Logging (POST /api/nutrition/water & GET)');
    await fetch(`${BASE_URL}/api/nutrition/water`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ amount_ml: 500 }),
    });
    const waterSummaryRes = await fetch(`${BASE_URL}/api/nutrition/water`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const waterSummaryJson = (await waterSummaryRes.json()) as any;
    console.log('   Water status:', waterSummaryRes.status, '| Total today:', waterSummaryJson.data?.total_ml, 'ml');

    // 13. Photo Upload & Protected Access
    console.log('\n13. Progress Photo Upload & Secure Access');
    const dummyImageBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xff, 0xda, 0x00, 0x08,
      0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
    ]);
    const blob = new Blob([dummyImageBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('photo', blob, 'sample_progress.jpg');

    const uploadRes = await fetch(`${BASE_URL}/api/progress/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });
    const uploadJson = (await uploadRes.json()) as any;
    console.log('   Upload status:', uploadRes.status, '| Photo ID:', uploadJson.data?.id);
    samplePhotoId = uploadJson.data.id;

    // View photo as owner
    const viewRes = await fetch(`${BASE_URL}/api/progress/photos/${samplePhotoId}/view`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('   Owner viewing photo status:', viewRes.status, '(Expected: 200)');
    if (viewRes.status !== 200) throw new Error('Owner view photo failed');

    // View photo as admin
    const adminViewRes = await fetch(`${BASE_URL}/api/progress/photos/${samplePhotoId}/view`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   Admin viewing photo status:', adminViewRes.status, '(Expected: 200)');
    if (adminViewRes.status !== 200) throw new Error('Admin view photo failed');

    // 14. Admin User Detail
    console.log('\n14. Admin viewing full user detail (GET /api/admin/users/:id)');
    const detailRes = await fetch(`${BASE_URL}/api/admin/users/${testUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const detailJson = (await detailRes.json()) as any;
    console.log('   Detail status:', detailRes.status, '| Weight logs:', detailJson.data?.weekly_weight_logs?.length);

    // 15. Admin Coaching Feedback
    console.log('\n15. Admin sending feedback to user');
    const fbRes = await fetch(`${BASE_URL}/api/admin/users/${testUserId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        message: '¡Excelente progreso esta semana Carlos, mantén la hidratación!',
      }),
    });
    const fbJson = (await fbRes.json()) as any;
    console.log('   Feedback status:', fbRes.status, '| Message:', fbJson.data?.message);

    // 16. Delete Account (Cascade & Physical file test)
    console.log('\n16. Testing Account Cascade Deletion');
    const delRes = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('   Delete user status:', delRes.status, '(Expected: 200)');
    if (delRes.status !== 200) throw new Error('Delete account failed');

    // Verify user is gone from DB
    const checkUser = await prisma.user.findUnique({ where: { id: testUserId } });
    console.log('   User in DB:', checkUser ? 'STILL EXISTS' : 'NULL (Successfully removed)');
    if (checkUser !== null) throw new Error('User was not deleted');

    console.log('\n===========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
    console.log('===========================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runTests();
