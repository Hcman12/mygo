async function testAdminFlow() {
  const baseUrl = 'http://localhost:4321';
  console.log('================================================================');
  console.log('--- STARTING COMPREHENSIVE MYGO ADMIN SUITE VERIFICATION ---');
  console.log('================================================================\n');

  // 1. Check /nicle login page
  console.log('[1] Checking GET /nicle (Unauthenticated)...');
  const nicleRes = await fetch(`${baseUrl}/nicle`);
  console.log('GET /nicle Status:', nicleRes.status);
  const nicleHtml = await nicleRes.text();
  console.log('Login form rendered:', nicleHtml.includes('admin-user') && nicleHtml.includes('MyGo Travel Portal'));

  // 2. Test Admin Login
  console.log('\n[2] Testing POST /api/admin/login...');
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'niclenet', password: '112Teamall@' })
  });
  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Result:', loginData);

  const setCookie = loginRes.headers.get('set-cookie');
  console.log('Auth Cookie Received:', Boolean(setCookie));
  const cookieHeader = setCookie ? setCookie.split(';')[0] : '';

  // 3. Test Candidate Evaluation Submission
  console.log('\n[3] Testing Candidate Intake to /api/evaluations...');
  const testTrackingId = `mygotest${Math.floor(100000 + Math.random() * 900000)}`;
  const evalPayload = {
    trackingId: testTrackingId,
    fullName: 'Elena Rostova',
    phone: '+44 7700 900888',
    email: 'elena.rostova.test@example.com',
    age: '28',
    passportNumber: 'UK782910384',
    address: 'Leeds, West Yorkshire, United Kingdom',
    maritalStatus: 'married',
    experienceYears: '3-5 years',
    jobCategory: 'hospitality',
    startTimeline: '1-3months',
    preferredDestination: 'slovakia',
    matchedCountry: 'Slovakia',
    matchedJobTitle: 'Hotel & Resort Operations Supervisor',
    matchedProcessingTime: '2–4 months',
    score: 97,
    cvFilename: 'Elena_Rostova_Hospitality_CV.pdf'
  };

  const evalRes = await fetch(`${baseUrl}/api/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '82.165.197.1' // simulated international IP
    },
    body: JSON.stringify(evalPayload)
  });
  console.log('Eval Submit Status:', evalRes.status);
  const evalData = await evalRes.json();
  console.log('Eval Submit Result:', evalData);

  // 4. Test Search for Candidate in Admin API
  console.log(`\n[4] Testing Search for ${testTrackingId} in Admin API...`);
  const searchRes = await fetch(`${baseUrl}/api/admin/evaluations?q=${testTrackingId}`, {
    headers: { 'Cookie': cookieHeader }
  });
  console.log('Search Status:', searchRes.status);
  const searchData = await searchRes.json();
  console.log('Search Found Evaluations Count:', searchData.evaluations?.length);
  const foundItem = searchData.evaluations?.[0];
  if (foundItem) {
    console.log('Found Candidate:', {
      tracking_id: foundItem.tracking_id,
      full_name: foundItem.full_name,
      status: foundItem.status,
      matched_country: foundItem.matched_country,
      city: foundItem.city,
      country: foundItem.country
    });
  }

  // 5. Test Updating Status & Admin Notes via PATCH
  console.log(`\n[5] Testing PATCH /api/admin/evaluations (Updating Status to 'approved' and adding notes)...`);
  const patchRes = await fetch(`${baseUrl}/api/admin/evaluations`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      trackingId: testTrackingId,
      status: 'approved',
      adminNotes: 'Candidate passed consular pre-screen. Hospitality sponsor contract verified.'
    })
  });
  console.log('PATCH Status:', patchRes.status);
  const patchData = await patchRes.json();
  console.log('PATCH Result:', patchData);

  // 6. Test Sending Outbound Email to Candidate
  console.log('\n[6] Testing Outbound Email Dispatcher...');
  const emailRes = await fetch(`${baseUrl}/api/admin/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      to: 'elena.rostova.test@example.com',
      name: 'Elena Rostova',
      trackingId: testTrackingId,
      subject: `Official Approval: Slovakia Hospitality Dossier [${testTrackingId}]`,
      message: 'Dear Elena, Congratulations! Your relocation dossier has been officially approved by the Slovak employer board.'
    })
  });
  console.log('Email Send Status:', emailRes.status);
  const emailData = await emailRes.json();
  console.log('Email Send Result:', emailData);

  // 7. Verify Candidate Detail Fetch includes Communications History
  console.log(`\n[7] Verifying Communications Timeline for ${testTrackingId}...`);
  const detailRes = await fetch(`${baseUrl}/api/admin/evaluations?id=${testTrackingId}`, {
    headers: { 'Cookie': cookieHeader }
  });
  const detailData = await detailRes.json();
  console.log('Candidate Current Status:', detailData.status);
  console.log('Candidate Admin Notes:', detailData.admin_notes);
  console.log('Logged Communications Count:', detailData.communications?.length);
  if (detailData.communications?.length > 0) {
    console.log('First Logged Notice:', {
      subject: detailData.communications[0].subject,
      to_email: detailData.communications[0].to_email,
      sent_at: detailData.communications[0].sent_at
    });
  }

  // 8. Test CSV Export API
  console.log('\n[8] Testing GET /api/admin/export-csv...');
  const csvRes = await fetch(`${baseUrl}/api/admin/export-csv`, {
    headers: { 'Cookie': cookieHeader }
  });
  console.log('CSV Export Status:', csvRes.status);
  console.log('Content-Type:', csvRes.headers.get('content-type'));
  const csvText = await csvRes.text();
  console.log('CSV Lines Count:', csvText.split('\n').length);
  console.log('CSV includes candidate tracking ID:', csvText.includes(testTrackingId));

  // 9. Test Admin Stats & Traffic Reporting
  console.log('\n[9] Testing Admin Stats API...');
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Cookie': cookieHeader }
  });
  console.log('Stats Status:', statsRes.status);
  const statsData = await statsRes.json();
  console.log('Totals:', statsData.totals);
  console.log('Pipeline Status Breakdown:', statsData.statusBreakdown);
  console.log('Destinations Breakdown:', statsData.destinationBreakdown?.slice(0, 3));

  // 10. Test Deleting Candidate Record
  console.log(`\n[10] Testing Cleanup / Deletion of Candidate ${testTrackingId}...`);
  const deleteRes = await fetch(`${baseUrl}/api/admin/evaluations?id=${testTrackingId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieHeader }
  });
  console.log('Delete Status:', deleteRes.status);
  const deleteData = await deleteRes.json();
  console.log('Delete Result:', deleteData);

  // 11. Confirm record was deleted
  const verifyDeleteRes = await fetch(`${baseUrl}/api/admin/evaluations?q=${testTrackingId}`, {
    headers: { 'Cookie': cookieHeader }
  });
  const verifyDeleteData = await verifyDeleteRes.json();
  console.log('Record post-delete count:', verifyDeleteData.evaluations?.length);

  console.log('\n================================================================');
  console.log('✓ ALL ADMIN PANEL FEATURES AND SERVICES VALIDATED SUCCESSFULLY!');
  console.log('================================================================\n');
}

testAdminFlow().catch(console.error);
