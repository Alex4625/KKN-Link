// test/e2e-api.mjs — Comprehensive End-to-End API Integration Test against Live Server
const BASE_URL = 'http://127.0.0.1:8788';
let cookieHeader = '';

let total = 0;
let passed = 0;

function assert(condition, testName, detail = '') {
  total++;
  if (!condition) {
    console.error(`❌ FAILED: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${testName}`);
  passed++;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Extract cookie value for subsequent requests
    const match = setCookie.match(/kkn_session=[^;]+/);
    if (match) {
      cookieHeader = match[0];
    }
  }

  let body = null;
  try {
    body = await res.json();
  } catch {}

  return { status: res.status, headers: res.headers, body };
}

async function run() {
  console.log('🧪 Starting Full End-to-End Test against http://127.0.0.1:8788 ...\n');

  // Test 1: Unauthenticated request should fail with 401
  const unauthRes = await request('/api/categories');
  assert(unauthRes.status === 401, 'Unauthenticated request to /api/categories returns 401');

  // Test 2: Security headers on API response
  assert(unauthRes.headers.get('cache-control')?.includes('no-store'), 'Response contains Cache-Control: no-store');
  assert(unauthRes.headers.get('x-robots-tag')?.includes('noindex'), 'Response contains X-Robots-Tag: noindex');

  // Test 3: Login with wrong code
  const wrongLoginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ code: 'wrong-code-xyz' }),
  });
  assert(wrongLoginRes.status === 401, 'Login with wrong code returns 401', wrongLoginRes.body?.message);

  // Test 4: Login with correct code
  const correctLoginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ code: 'test123' }),
  });
  assert(correctLoginRes.status === 200, 'Login with correct code returns 200');
  assert(cookieHeader.startsWith('kkn_session='), 'Response sets signed kkn_session cookie');

  // Test 5: Verify session via /api/auth/me
  const meRes = await request('/api/auth/me');
  assert(meRes.status === 200 && meRes.body?.success === true, 'Session is valid via /api/auth/me');

  // Test 6: Create Category
  const catRes = await request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name: 'Dokumentasi' }),
  });
  assert(catRes.status === 201 && catRes.body?.data?.name === 'Dokumentasi', 'Create category "Dokumentasi" returns 201');
  const catId1 = catRes.body.data.id;

  const catRes2 = await request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name: 'Akun Bersama' }),
  });
  assert(catRes2.status === 201, 'Create second category "Akun Bersama" returns 201');
  const catId2 = catRes2.body.data.id;

  // Test 7: Duplicate Category name (case-insensitive) should return 409
  const dupCatRes = await request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name: 'dokumentasi' }),
  });
  assert(dupCatRes.status === 409, 'Duplicate category name returns 409');

  // Test 8: List Categories
  const listCatsRes = await request('/api/categories');
  assert(listCatsRes.status === 200 && Array.isArray(listCatsRes.body?.data), 'List categories returns array');
  assert(listCatsRes.body.data.some(c => c.id === catId1), 'List categories includes created category');

  // Test 9: Create Link Item
  const linkRes = await request('/api/items', {
    method: 'POST',
    body: JSON.stringify({
      type: 'link',
      title: 'Google Drive Dokumentasi KKN',
      url: 'https://drive.google.com/drive/folders/sample-kkn',
      description: 'Folder foto & video kegiatan desa',
      categoryId: catId1,
      isPinned: false,
    }),
  });
  assert(linkRes.status === 201, 'Create link item returns 201');
  const linkId = linkRes.body.data.id;

  // Test 10: Create Note Item
  const noteRes = await request('/api/items', {
    method: 'POST',
    body: JSON.stringify({
      type: 'note',
      title: 'Jadwal Sosialisasi Warga',
      content: 'Hari: Sabtu, 10 Oktober 2026\nTempat: Balai Desa\nPukul: 09.00 WIB',
      categoryId: catId1,
    }),
  });
  assert(noteRes.status === 201, 'Create note item returns 201');
  const noteId = noteRes.body.data.id;

  // Test 11: Create Secret Item
  const secretRes = await request('/api/items', {
    method: 'POST',
    body: JSON.stringify({
      type: 'secret',
      title: 'Akun Canva Pro Tim',
      username: 'kkn.sukamaju@canva.com',
      password: 'SuperSecretCanvaPassword2026!',
      categoryId: catId2,
    }),
  });
  assert(secretRes.status === 201, 'Create secret item returns 201');
  const secretId = secretRes.body.data.id;

  // Test 12: List Items - CRITICAL SECURITY CHECK: secret_payload must NEVER be exposed
  const listItemsRes = await request('/api/items');
  assert(listItemsRes.status === 200, 'GET /api/items returns 200');
  const returnedSecret = listItemsRes.body.data.find(i => i.id === secretId);
  assert(returnedSecret !== undefined, 'Secret item exists in item list');
  assert(returnedSecret.secretPayload === undefined || returnedSecret.secretPayload === null, 'secret_payload is strictly omitted in GET /api/items');
  assert(returnedSecret.password === undefined, 'Plaintext password is not present in GET /api/items');

  // Test 13: Reveal Secret Item
  const revealRes = await request(`/api/items/${secretId}/reveal`);
  assert(revealRes.status === 200, 'GET /api/items/:id/reveal returns 200');
  assert(revealRes.body?.data?.username === 'kkn.sukamaju@canva.com', 'Revealed username matches original');
  assert(revealRes.body?.data?.password === 'SuperSecretCanvaPassword2026!', 'Revealed password matches original decrypted password');

  // Test 14: Pin Item
  const pinRes = await request(`/api/items/${linkId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isPinned: true }),
  });
  assert(pinRes.status === 200 && pinRes.body?.data?.isPinned === 1, 'Pin item successfully updates isPinned to 1');

  // Test 15: Update Category Name
  const patchCatRes = await request(`/api/categories/${catId1}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: 'Dokumentasi & Media' }),
  });
  assert(patchCatRes.status === 200 && patchCatRes.body?.data?.name === 'Dokumentasi & Media', 'Category renamed successfully');

  // Test 16: Delete Category - items should have categoryId set to null (cascade to "Lainnya")
  const delCatRes = await request(`/api/categories/${catId1}`, {
    method: 'DELETE',
  });
  assert(delCatRes.status === 200, 'Delete category returns 200');

  const afterCatDelItemsRes = await request('/api/items');
  const movedItem = afterCatDelItemsRes.body.data.find(i => i.id === linkId);
  assert(movedItem.categoryId === null, 'Items from deleted category now have categoryId = null (moved to "Lainnya")');

  // Test 17: Delete Item
  const delItemRes = await request(`/api/items/${noteId}`, {
    method: 'DELETE',
  });
  assert(delItemRes.status === 200, 'Delete item returns 200');

  // Test 18: Logout
  const logoutRes = await request('/api/auth/logout', { method: 'POST' });
  assert(logoutRes.status === 200, 'Logout returns 200');

  // Clean local cookie and test that subsequent call is rejected with 401
  cookieHeader = '';
  const postLogoutMeRes = await request('/api/auth/me');
  assert(postLogoutMeRes.status === 401, 'Request after logout returns 401');

  console.log(`\n🎉 ALL ${passed}/${total} LIVE E2E API INTEGRATION TESTS PASSED!`);
}

run().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
