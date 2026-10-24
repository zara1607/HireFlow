require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const { connectDB, disconnectDB } = require('../src/config/db');

const RECRUITER_EMAIL = 'recruiter@hireflow.com';
const COMPANY_NAME = 'HireFlow Demo Company';

const jobPostings = [
  {
    title: 'Senior Frontend Developer',
    category: 'Frontend',
    location: 'Remote (US)',
    salaryMin: 145000,
    salaryMax: 185000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    skills: ['React', 'TypeScript', 'Vite', 'Accessibility', 'CSS'],
    description:
      'Build and improve customer-facing experiences used by thousands of people. You will shape our React and TypeScript architecture, partner with design on accessible interfaces, and help establish frontend performance and testing standards. We are looking for at least five years of product frontend experience and a strong track record of shipping reliable web applications.',
  },
  {
    title: 'Backend Engineer',
    category: 'Backend',
    location: 'Austin, TX (Hybrid)',
    salaryMin: 125000,
    salaryMax: 165000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Redis'],
    description:
      'Design and operate dependable APIs and data services for our growing hiring platform. You will own features from schema design through production monitoring, improve query performance, and collaborate with frontend engineers on API contracts. Ideal candidates have three or more years of backend experience and practical knowledge of testing, security, and observability.',
  },
  {
    title: 'UI/UX Designer',
    category: 'UI / UX',
    location: 'New York, NY (Hybrid)',
    salaryMin: 95000,
    salaryMax: 130000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    description:
      'Create clear, inclusive experiences across our web product, from early research to polished production-ready designs. You will interview users, map workflows, prototype concepts, and work closely with product and engineering to maintain a cohesive design system. A portfolio showing shipped digital products and strong interaction design fundamentals is required.',
  },
  {
    title: 'Product Manager',
    category: 'Product',
    location: 'Remote (US)',
    salaryMin: 130000,
    salaryMax: 170000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    skills: ['Product Strategy', 'Roadmapping', 'Analytics', 'User Research', 'Agile'],
    description:
      'Own the roadmap for candidate and recruiter workflows and turn customer needs into measurable product outcomes. You will set priorities, define requirements, coordinate launches, and use qualitative and quantitative insights to assess results. We are seeking a product manager with five or more years delivering B2B SaaS products and experience working with cross-functional teams.',
  },
  {
    title: 'Data Scientist',
    category: 'Data',
    location: 'Boston, MA (Hybrid)',
    salaryMin: 135000,
    salaryMax: 180000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Experimentation'],
    description:
      'Help the team make better decisions through trustworthy analysis and practical predictive models. You will develop metrics, investigate marketplace trends, design experiments, and collaborate with engineers to bring data products into production. Candidates should have a quantitative degree or equivalent experience and at least three years applying statistics and machine learning to real business problems.',
  },
  {
    title: 'DevOps Engineer',
    category: 'Cloud / DevOps',
    location: 'Remote (US)',
    salaryMin: 125000,
    salaryMax: 165000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code'],
    description:
      'Improve the reliability and delivery speed of our cloud-hosted services. You will maintain deployment pipelines, automate infrastructure, strengthen monitoring and incident response, and partner with application teams on production readiness. We value hands-on experience with cloud operations, containerized workloads, and pragmatic security practices.',
  },
  {
    title: 'Marketing Manager',
    category: 'Marketing',
    location: 'Chicago, IL (Hybrid)',
    salaryMin: 100000,
    salaryMax: 140000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Demand Generation', 'Content Strategy', 'SEO', 'Analytics', 'Campaign Management'],
    description:
      'Plan and deliver integrated campaigns that introduce our hiring platform to growing businesses and job seekers. You will own campaign calendars, coordinate content and channel partners, measure pipeline impact, and continuously refine messaging. We are looking for four or more years in B2B marketing with strong writing and analytical skills.',
  },
  {
    title: 'Sales Executive',
    category: 'Sales',
    location: 'Denver, CO (Hybrid)',
    salaryMin: 85000,
    salaryMax: 120000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Consultative Selling', 'CRM', 'Discovery', 'Negotiation', 'SaaS'],
    description:
      'Build relationships with prospective customers and guide them through a thoughtful evaluation of our recruiting software. You will manage the sales cycle from discovery through close, maintain accurate CRM records, and partner with customer success to ensure a smooth handoff. Previous experience selling SaaS solutions to mid-market teams is preferred.',
  },
  {
    title: 'Customer Support Specialist',
    category: 'Customer Support',
    location: 'Remote (US)',
    salaryMin: 55000,
    salaryMax: 72000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    skills: ['Customer Support', 'Troubleshooting', 'Written Communication', 'CRM', 'Documentation'],
    description:
      'Help candidates and recruiting teams get the most from HireFlow through friendly, timely support. You will answer questions across email and chat, investigate product issues, document solutions, and share recurring feedback with product teams. Strong communication skills, patience, and an interest in learning SaaS tools are essential; prior support experience is a plus.',
  },
  {
    title: 'HR Specialist',
    category: 'Human Resources',
    location: 'Atlanta, GA (Hybrid)',
    salaryMin: 70000,
    salaryMax: 95000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Human Resources', 'Employee Relations', 'HRIS', 'Onboarding', 'Compliance'],
    description:
      'Support core people operations as our team grows, including onboarding, employee questions, HR records, and policy administration. You will coordinate with managers to provide a consistent employee experience and maintain accurate, confidential documentation. A bachelor’s degree or equivalent experience and two or more years in human resources are preferred.',
  },
  {
    title: 'Mobile Developer',
    category: 'Mobile',
    location: 'Remote (US)',
    salaryMin: 120000,
    salaryMax: 160000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Mobile Testing'],
    description:
      'Deliver polished mobile experiences that make it easier for candidates to discover opportunities and stay informed. You will build cross-platform features, collaborate with design on mobile-first interactions, and improve release quality through testing and monitoring. Candidates should have three or more years building and shipping production mobile applications.',
  },
  {
    title: 'QA Engineer',
    category: 'QA',
    location: 'Portland, OR (Hybrid)',
    salaryMin: 90000,
    salaryMax: 125000,
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    skills: ['Test Automation', 'Playwright', 'API Testing', 'JavaScript', 'CI/CD'],
    description:
      'Help the team release dependable features by building a balanced, maintainable quality strategy. You will create automated UI and API tests, investigate regressions, and work with engineers to improve testability throughout development. Experience with modern browser automation, API testing, and continuous integration is strongly preferred.',
  },
];

const seedJobs = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  let recruiter = await User.findOne({ email: RECRUITER_EMAIL });
  if (!recruiter) {
    recruiter = await User.create({
      name: 'HireFlow Demo Recruiter',
      email: RECRUITER_EMAIL,
      password: 'password123',
      role: 'RECRUITER',
      companyName: COMPANY_NAME,
      companyDescription: 'A sample company profile used for HireFlow demonstration job listings.',
      companyLocation: 'United States',
      companyWebsite: 'https://hireflow.com',
    });
    console.log(`Created recruiter account: ${RECRUITER_EMAIL}`);
  } else if (recruiter.role !== 'RECRUITER') {
    throw new Error(`${RECRUITER_EMAIL} already exists but is not a recruiter account.`);
  } else if (
    recruiter.companyName !== COMPANY_NAME ||
    !recruiter.companyDescription ||
    !recruiter.companyLocation ||
    !recruiter.companyWebsite
  ) {
    recruiter.companyName = COMPANY_NAME;
    recruiter.companyDescription =
      recruiter.companyDescription ||
      'A sample company profile used for HireFlow demonstration job listings.';
    recruiter.companyLocation = recruiter.companyLocation || 'United States';
    recruiter.companyWebsite = recruiter.companyWebsite || 'https://hireflow.com';
    await recruiter.save();
  }

  const operations = jobPostings.map((job) => ({
    updateOne: {
      filter: {
        recruiter: recruiter._id,
        title: job.title,
        company: COMPANY_NAME,
      },
      update: {
        $set: {
          ...job,
          recruiter: recruiter._id,
          company: COMPANY_NAME,
          status: 'OPEN',
        },
      },
      upsert: true,
    },
  }));

  const result = await Job.bulkWrite(operations);
  console.log(
    `Seeded ${jobPostings.length} open jobs for ${COMPANY_NAME} ` +
      `(${result.upsertedCount} inserted, ${result.modifiedCount} updated).`
  );
  console.log(`Recruiter login: ${RECRUITER_EMAIL} / password123`);
};

if (require.main === module) {
  seedJobs()
    .catch((error) => {
      console.error('Job seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectDB();
    });
}

module.exports = { jobPostings, seedJobs };
