require('dotenv').config();
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const { connectDB, disconnectDB } = require('../src/config/db');
const { seedDemoJobs } = require('./demoJobs');

const seedData = async ({ connect = true } = {}) => {
  try {
    if (connect) await connectDB();
    console.log('Seeding initial demo data...');

    // 1. Create or update Demo Recruiter
    let recruiter = await User.findOne({ email: 'recruiter@hireflow.dev' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Sarah Connor',
        email: 'recruiter@hireflow.dev',
        password: 'Password123!',
        role: 'RECRUITER',
        companyName: 'NovaTech Solutions',
        companyLocation: 'San Francisco, CA',
        companyWebsite: 'https://novatech.dev',
        companyDescription:
          'NovaTech is an enterprise cloud engineering powerhouse building distributed developer infrastructure and collaboration tooling.',
      });
      console.log('Created Demo Recruiter: recruiter@hireflow.dev (Password123!)');
    }

    // 2. Create or update Demo Candidate
    let candidate = await User.findOne({ email: 'candidate@hireflow.dev' });
    if (!candidate) {
      candidate = await User.create({
        name: 'Alex Rivera',
        email: 'candidate@hireflow.dev',
        password: 'Password123!',
        role: 'JOB_SEEKER',
        headline: 'Senior Full-Stack Engineer | React & Node.js',
        bio: 'Passionate software engineer with 6+ years building scalable web platforms, real-time architectures, and user-centric interfaces.',
        skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker'],
        experience: [
          {
            company: 'Starlight Labs',
            title: 'Full-Stack Developer',
            location: 'Remote',
            startDate: 'Jan 2021',
            endDate: 'Present',
            description: 'Architected high-throughput API services and responsive web dashboard.',
            current: true,
          },
        ],
        education: [
          {
            school: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startYear: '2016',
            endYear: '2020',
          },
        ],
      });
      console.log('Created Demo Candidate: candidate@hireflow.dev (Password123!)');
    }

    // 3. Create Sample Jobs if not already present
    const existingJobsCount = await Job.countDocuments({ recruiter: recruiter._id });
    if (existingJobsCount === 0) {
      const sampleJobs = [
        {
          recruiter: recruiter._id,
          title: 'Senior Full-Stack Engineer',
          company: 'NovaTech Solutions',
          location: 'San Francisco, CA / Remote',
          employmentType: 'FULL_TIME',
          experienceLevel: 'SENIOR',
          salaryMin: 140000,
          salaryMax: 185000,
          skills: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Docker'],
          description: `We are looking for an experienced Senior Full-Stack Engineer to lead development of our flagship analytics platform.

Key Responsibilities:
• Build performant, accessible UI workflows using React and Tailwind CSS.
• Design scalable RESTful and realtime APIs using Node.js, Express, and MongoDB.
• Optimize application latency, state management, and real-time socket connections.
• Collaborate with design and product stakeholders on product roadmaps.

Requirements:
• 5+ years of full-stack development experience with modern JavaScript frameworks.
• Deep understanding of asynchronous programming, database indexing, and API security.
• Experience with automated testing and containerized deployments.`,
          status: 'OPEN',
        },
        {
          recruiter: recruiter._id,
          title: 'Staff Frontend Architect',
          company: 'NovaTech Solutions',
          location: 'Remote',
          employmentType: 'FULL_TIME',
          experienceLevel: 'LEAD',
          salaryMin: 175000,
          salaryMax: 220000,
          skills: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'State Management'],
          description: `NovaTech is searching for a Staff Frontend Architect to guide frontend design systems, micro-frontends, and performance benchmarks.

Key Responsibilities:
• Define architectural standards across our web applications.
• Build reusable UI component libraries matching modern accessibility criteria.
• Coach engineers and lead design reviews.

Requirements:
• 8+ years frontend software engineering.
• Track record of architecting large-scale React platforms.`,
          status: 'OPEN',
        },
        {
          recruiter: recruiter._id,
          title: 'DevOps & Cloud Systems Engineer',
          company: 'NovaTech Solutions',
          location: 'New York, NY (Hybrid)',
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID',
          salaryMin: 120000,
          salaryMax: 155000,
          skills: ['Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD'],
          description: `Join our platform infrastructure team to manage continuous integration pipelines, infrastructure-as-code, and cloud cluster reliability.

Key Responsibilities:
• Maintain containerized build pipelines and deployment workflows.
• Monitor server uptime, error budgets, and logging metrics.
• Implement automated security scanning and vulnerability patching.`,
          status: 'OPEN',
        },
        {
          recruiter: recruiter._id,
          title: 'Backend API Engineer',
          company: 'NovaTech Solutions',
          location: 'Austin, TX / Remote',
          employmentType: 'CONTRACT',
          experienceLevel: 'MID',
          salaryMin: 95000,
          salaryMax: 130000,
          skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'REST APIs'],
          description: `Seeking a skilled Backend API Engineer for a 12-month contract with option to convert to permanent hire. Focus on database optimization, authentication flows, and data ingestion pipelines.`,
          status: 'OPEN',
        },
        {
          recruiter: recruiter._id,
          title: 'Junior Web Developer / Intern',
          company: 'NovaTech Solutions',
          location: 'San Francisco, CA',
          employmentType: 'INTERNSHIP',
          experienceLevel: 'ENTRY',
          salaryMin: 65000,
          salaryMax: 85000,
          skills: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git'],
          description: `Great opportunity for recent graduates or early-career developers looking to gain high-impact experience building real-world SaaS applications with our senior engineering team.`,
          status: 'OPEN',
        },
      ];

      await Job.insertMany(sampleJobs);
      console.log(`Seeded ${sampleJobs.length} sample job postings!`);
    } else {
      console.log(`Jobs already exist (${existingJobsCount} listings found). Skipping job seeding.`);
    }

    const addedJobs = await seedDemoJobs(recruiter._id);
    console.log(`Added ${addedJobs} curated demo jobs; ${await Job.countDocuments({ recruiter: recruiter._id })} total recruiter listings.`);

    console.log('Seeding completed successfully.');
    return { recruiter, candidate };
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
};

module.exports = { seedData };

if (require.main === module) {
  seedData()
    .then(() => disconnectDB())
    .catch(async () => {
      await disconnectDB();
      process.exitCode = 1;
    });
}
