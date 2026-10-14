const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

function request(method, path, body = null, token = null, isMultipart = false, boundary = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const headers = {};

    if (isMultipart && boundary) {
      headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    } else if (body && typeof body === 'object' && !(body instanceof Buffer)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function buildMultipartBody(fields, fileField) {
  const boundary = '----HireFlowFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
    );
  }

  if (fileField) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.fieldName}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`
    );
    parts.push(fileField.content);
    parts.push('\r\n');
  }

  parts.push(`--${boundary}--\r\n`);

  const bodyBuffer = Buffer.concat(
    parts.map((p) => (typeof p === 'string' ? Buffer.from(p) : p))
  );

  return { boundary, body: bodyBuffer };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting HireFlow Full E2E Integration Test Suite');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('1. Health Check (GET /api/health)');
    const health = await request('GET', '/health');
    console.log(`   Status: ${health.status} | Service: ${health.data.service}`);
    if (health.status !== 200) throw new Error('Health check failed');

    const timestamp = Date.now();
    const recruiterEmail = `recruiter_${timestamp}@hireflow.dev`;
    const candidateEmail = `candidate_${timestamp}@hireflow.dev`;

    // 2. Register Recruiter
    console.log('\n2. Register Recruiter (POST /api/auth/register)');
    const regRecruiter = await request('POST', '/auth/register', {
      name: 'Elena Rostova',
      email: recruiterEmail,
      password: 'SecurePassword123!',
      role: 'RECRUITER',
      companyName: 'Apex Innovations',
    });
    console.log(`   Status: ${regRecruiter.status} | Success: ${regRecruiter.data.success}`);
    if (regRecruiter.status !== 201) throw new Error('Recruiter registration failed: ' + JSON.stringify(regRecruiter.data));
    const recruiterToken = regRecruiter.data.token;
    const recruiterId = regRecruiter.data.user._id;

    // 3. Register Candidate
    console.log('\n3. Register Job Seeker (POST /api/auth/register)');
    const regCandidate = await request('POST', '/auth/register', {
      name: 'Marcus Vance',
      email: candidateEmail,
      password: 'SecurePassword123!',
      role: 'JOB_SEEKER',
      headline: 'Senior Full-Stack Engineer | React & Node.js',
    });
    console.log(`   Status: ${regCandidate.status} | Success: ${regCandidate.data.success}`);
    if (regCandidate.status !== 201) throw new Error('Candidate registration failed: ' + JSON.stringify(regCandidate.data));
    const candidateToken = regCandidate.data.token;
    const candidateId = regCandidate.data.user._id;

    // 4. Role Authorization: Candidate attempts to create a job (should be 403 Forbidden)
    console.log('\n4. Role-Based Protection: Candidate attempts to post job (POST /api/jobs)');
    const unauthorizedJob = await request(
      'POST',
      '/jobs',
      { title: 'Fake Job', description: 'Test', company: 'Fake', location: 'Remote' },
      candidateToken
    );
    console.log(`   Status: ${unauthorizedJob.status} | Message: ${unauthorizedJob.data.message}`);
    if (unauthorizedJob.status !== 403) throw new Error('Role authorization failed: candidate was not rejected with 403');

    // 5. Recruiter posts job
    console.log('\n5. Recruiter creates job posting (POST /api/jobs)');
    const jobRes = await request(
      'POST',
      '/jobs',
      {
        title: 'Lead Full-Stack Architect',
        description: 'Lead engineering for next-generation distributed systems using React, Node.js, and MongoDB.',
        company: 'Apex Innovations',
        location: 'San Francisco, CA (Hybrid)',
        employmentType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        category: 'Full Stack',
        salaryMin: 160000,
        salaryMax: 210000,
        skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'Tailwind CSS'],
      },
      recruiterToken
    );
    console.log(`   Status: ${jobRes.status} | Job Created ID: ${jobRes.data.job?._id}`);
    if (jobRes.status !== 201) throw new Error('Job creation failed: ' + JSON.stringify(jobRes.data));
    const jobId = jobRes.data.job._id;

    console.log('\n5a. Search by category, salary, and sort order');
    const filteredJobs = await request('GET', '/jobs?category=Full%20Stack&salaryMin=150000&sort=salary_desc&page=1&limit=1');
    if (filteredJobs.status !== 200 || !filteredJobs.data.jobs.some((job) => job._id === jobId)) {
      throw new Error('Category/salary/sort filters did not return the matching job');
    }
    const categoryRes = await request('GET', '/jobs/categories');
    if (categoryRes.status !== 200 || !categoryRes.data.categories.includes('Full Stack')) {
      throw new Error('Job categories endpoint did not return the created category');
    }

    console.log('\n5b. Candidate saves a job and receives skill-based recommendations');
    const profileRes = await request('PUT', '/users/profile', { skills: ['React', 'Node.js'] }, candidateToken);
    if (profileRes.status !== 200) throw new Error('Candidate profile skill update failed');
    const savedRes = await request('PUT', `/users/saved-jobs/${jobId}`, {}, candidateToken);
    const savedJobsRes = await request('GET', '/users/saved-jobs', null, candidateToken);
    if (savedRes.status !== 200 || !savedJobsRes.data.jobs.some((job) => job._id === jobId)) {
      throw new Error('Candidate saved jobs flow failed');
    }
    const recommendationsRes = await request('GET', '/jobs/recommended', null, candidateToken);
    const recommendedJob = recommendationsRes.data.jobs.find((job) => job._id === jobId);
    if (recommendationsRes.status !== 200 || !recommendedJob || recommendedJob.matchScore < 2) {
      throw new Error('Rule-based job recommendation did not match candidate skills');
    }

    console.log('\n5c. Recruiter closes and reopens a job');
    const closeRes = await request('PUT', `/jobs/${jobId}`, { status: 'CLOSED' }, recruiterToken);
    const closedSearch = await request('GET', `/jobs?keyword=${encodeURIComponent('Lead Full-Stack Architect')}`);
    if (closeRes.status !== 200 || closedSearch.data.jobs.some((job) => job._id === jobId)) {
      throw new Error('Closed job remained visible in open job search');
    }
    const reopenRes = await request('PUT', `/jobs/${jobId}`, { status: 'OPEN' }, recruiterToken);
    if (reopenRes.status !== 200) throw new Error('Recruiter could not reopen job');

    // 6. Recruiter gets my-jobs
    console.log('\n6. Recruiter fetches postings (GET /api/jobs/recruiter/my-jobs)');
    const myJobsRes = await request('GET', '/jobs/recruiter/my-jobs', null, recruiterToken);
    console.log(`   Status: ${myJobsRes.status} | Job Count: ${myJobsRes.data.count}`);
    if (myJobsRes.status !== 200 || myJobsRes.data.count === 0) throw new Error('Recruiter jobs fetch failed');

    // 7. Public search jobs
    console.log('\n7. Candidate searches jobs with filters (GET /api/jobs?keyword=Architect)');
    const searchRes = await request('GET', '/jobs?keyword=Architect');
    console.log(`   Status: ${searchRes.status} | Matches: ${searchRes.data.count} / Total: ${searchRes.data.total}`);
    if (searchRes.status !== 200 || searchRes.data.count === 0) throw new Error('Search jobs failed');

    // 8. Candidate uploads resume and updates profile
    console.log('\n8. Candidate uploads resume file (POST /api/users/resume)');
    const dummyPdfContent = Buffer.from('%PDF-1.4 Mock resume content for Marcus Vance\n%%EOF');
    const { boundary, body: uploadBody } = buildMultipartBody(
      {},
      {
        fieldName: 'resume',
        filename: 'Marcus_Vance_Resume.pdf',
        contentType: 'application/pdf',
        content: dummyPdfContent,
      }
    );
    const resumeUploadRes = await request(
      'POST',
      '/users/resume',
      uploadBody,
      candidateToken,
      true,
      boundary
    );
    console.log(`   Status: ${resumeUploadRes.status} | Original Name: ${resumeUploadRes.data.resume?.originalName}`);
    if (resumeUploadRes.status !== 200) throw new Error('Resume upload failed: ' + JSON.stringify(resumeUploadRes.data));

    // 9. Candidate applies for the job
    console.log('\n9. Candidate applies for position (POST /api/applications)');
    const applyRes = await request(
      'POST',
      '/applications',
      {
        jobId,
        coverLetter: 'I have extensive experience leading full-stack engineering teams and architecting modern web apps.',
      },
      candidateToken
    );
    console.log(`   Status: ${applyRes.status} | Application Status: ${applyRes.data.application?.status}`);
    if (applyRes.status !== 201) throw new Error('Job application failed: ' + JSON.stringify(applyRes.data));
    const applicationId = applyRes.data.application._id;

    // 10. Duplicate Application Rejection
    console.log('\n10. Duplicate application check: Candidate applies again to same job');
    const dupRes = await request(
      'POST',
      '/applications',
      { jobId, coverLetter: 'Trying again' },
      candidateToken
    );
    console.log(`   Status: ${dupRes.status} | Message: ${dupRes.data.message}`);
    if (dupRes.status !== 400) throw new Error('Duplicate application prevention failed: expected 400');

    // 11. Recruiter views applicants for the job
    console.log(`\n11. Recruiter views applicants for job (GET /api/applications/job/${jobId})`);
    const applicantsRes = await request('GET', `/applications/job/${jobId}`, null, recruiterToken);
    console.log(`   Status: ${applicantsRes.status} | Applicants Count: ${applicantsRes.data.count}`);
    if (applicantsRes.status !== 200 || applicantsRes.data.count === 0) throw new Error('Recruiter view applicants failed');

    console.log('\n11a. Recruiter notes remain private and an interview can be scheduled');
    const notesRes = await request('PATCH', `/applications/${applicationId}/notes`, { notes: 'Strong systems design; follow up on platform ownership.' }, recruiterToken);
    if (notesRes.status !== 200) throw new Error('Recruiter private notes could not be saved');
    const interviewTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const interviewRes = await request('PUT', `/applications/${applicationId}/interview`, {
      scheduledAt: interviewTime,
      durationMinutes: 45,
      location: 'Video call',
      meetingUrl: 'https://meet.example.com/hireflow-test',
      message: 'Please prepare a short walkthrough of a recent project.',
    }, recruiterToken);
    if (interviewRes.status !== 200 || interviewRes.data.application.status !== 'INTERVIEW') {
      throw new Error('Interview scheduling did not update the application');
    }

    // 12. Recruiter transitions candidate through pipeline stages
    console.log('\n12. Recruiter pipeline stage progression:');
    const stages = ['SHORTLISTED', 'INTERVIEW', 'HIRED'];
    for (const stage of stages) {
      const stageRes = await request(
        'PATCH',
        `/applications/${applicationId}/status`,
        { status: stage },
        recruiterToken
      );
      console.log(`   Moved candidate to -> ${stageRes.data.application?.status} (Status: ${stageRes.status})`);
      if (stageRes.status !== 200 || stageRes.data.application?.status !== stage) {
        throw new Error(`Failed to advance applicant to stage: ${stage}`);
      }
    }

    // 13. Candidate checks my-applications
    console.log('\n13. Candidate verifies application status (GET /api/applications/my-applications)');
    const myAppsRes = await request('GET', '/applications/my-applications', null, candidateToken);
    console.log(`   Status: ${myAppsRes.status} | Latest Application Stage: ${myAppsRes.data.applications[0]?.status}`);
    if (myAppsRes.data.applications[0]?.status !== 'HIRED') {
      throw new Error('Candidate status did not reflect HIRED');
    }
    const candidateApplication = myAppsRes.data.applications.find((application) => application._id === applicationId);
    if (!candidateApplication?.interview?.scheduledAt || Object.hasOwn(candidateApplication, 'notes')) {
      throw new Error('Candidate could not see interview details or private notes leaked');
    }
    const recruiterApplicants = await request('GET', `/applications/job/${jobId}`, null, recruiterToken);
    if (recruiterApplicants.data.applicants[0]?.notes !== 'Strong systems design; follow up on platform ownership.') {
      throw new Error('Recruiter private notes were not retained');
    }

    // 14. Realtime Chat: Recruiter starts conversation with candidate
    console.log('\n14. Recruiter initiates conversation with candidate (POST /api/conversations)');
    const convRes = await request(
      'POST',
      '/conversations',
      { recipientId: candidateId, jobId },
      recruiterToken
    );
    console.log(`   Status: ${convRes.status} | Conversation ID: ${convRes.data.conversation?._id}`);
    if (convRes.status !== 200) throw new Error('Conversation creation failed');
    const conversationId = convRes.data.conversation._id;

    // 15. Recruiter sends message
    console.log(`\n15. Recruiter sends message in conversation (POST /api/conversations/${conversationId}/messages)`);
    const sendMsgRes = await request(
      'POST',
      `/conversations/${conversationId}/messages`,
      { text: 'Hello Marcus! We were extremely impressed with your portfolio and would like to extend an offer.' },
      recruiterToken
    );
    console.log(`   Status: ${sendMsgRes.status} | Message Text: "${sendMsgRes.data.message?.text}"`);
    if (sendMsgRes.status !== 201) throw new Error('Sending message failed');

    // 16. Candidate reads messages and replies
    console.log(`\n16. Candidate fetches conversation messages (GET /api/conversations/${conversationId}/messages)`);
    const getMsgsRes = await request('GET', `/conversations/${conversationId}/messages`, null, candidateToken);
    console.log(`   Status: ${getMsgsRes.status} | Message Count: ${getMsgsRes.data.count}`);
    if (getMsgsRes.status !== 200 || getMsgsRes.data.count === 0) throw new Error('Fetch messages failed');

    console.log('\n17. Candidate replies in chat (POST /api/conversations/:id/messages)');
    const replyRes = await request(
      'POST',
      `/conversations/${conversationId}/messages`,
      { text: 'Thank you Elena! I am thrilled to accept the offer and join the team!' },
      candidateToken
    );
    console.log(`   Status: ${replyRes.status} | Reply Text: "${replyRes.data.message?.text}"`);
    if (replyRes.status !== 201) throw new Error('Candidate reply failed');

    // 18. Notifications verification
    console.log('\n18. Candidate checks notifications (GET /api/notifications)');
    const notifsRes = await request('GET', '/notifications', null, candidateToken);
    console.log(`   Status: ${notifsRes.status} | Total Notifications: ${notifsRes.data.count}`);
    if (notifsRes.status !== 200 || notifsRes.data.count === 0) throw new Error('Notifications check failed');

    console.log('\n19. Candidate marks all notifications as read (PATCH /api/notifications/mark-all-read)');
    const markReadRes = await request('PATCH', '/notifications/mark-all-read', {}, candidateToken);
    console.log(`   Status: ${markReadRes.status} | Success: ${markReadRes.data.success}`);
    if (markReadRes.status !== 200) throw new Error('Mark all read failed');

    // 20. Secure Resume Download
    console.log(`\n20. Secure Resume Download (GET /api/applications/${applicationId}/resume)`);
    const downloadRes = await request('GET', `/applications/${applicationId}/resume`, null, recruiterToken);
    console.log(`   Status: ${downloadRes.status} | Content-Type: ${downloadRes.headers['content-type']}`);
    if (downloadRes.status !== 200) throw new Error('Resume download failed');

    console.log('\n====================================================');
    console.log('🎉 ALL 20 INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
