import { Company, Student, Room, Branch, PriorityTier } from '../types';

export interface GeneratedDataset {
  companies: Company[];
  students: Student[];
  rooms: Room[];
}

export class DatasetGenerator {
  private static branches: Branch[] = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  /**
   * Generates a realistic dataset for placement week:
   * - 35 Companies (Day-1 Mass Recruiters, Tier 1 Elite Product, Tier 2 Regular)
   * - 800 Students with realistic CGPA distribution & overlapping shortlists
   * - 20 Interview Rooms across campus
   */
  public static generate(seed: number = 42): GeneratedDataset {
    const random = this.createPseudoRandom(seed);

    // 1. Generate 20 Rooms
    const rooms: Room[] = [];
    const blocks = ['A', 'B', 'C'];
    for (let i = 1; i <= 20; i++) {
      const block = blocks[(i - 1) % 3];
      const roomNum = 100 + i;
      rooms.push({
        id: `ROOM-${i}`,
        building: `Block-${block}`,
        roomNumber: `${block}-${roomNum}`,
        capacity: 1,
        panelsAvailable: (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1,
        isAvailable: true
      });
    }

    // 2. Generate 35 Companies
    const companies: Company[] = [];

    // Day-1 Mass Recruiters (5 companies)
    const massRecruiters = [
      'TCS Digital & Ninja',
      'Infosys Specialist Programmer',
      'Wipro Turbo',
      'Accenture Advanced Tech',
      'Cognizant GenC Next'
    ];
    massRecruiters.forEach((name, idx) => {
      companies.push({
        id: `COMP-DAY1-${idx + 1}`,
        name,
        priorityTier: 'DAY_1_MASS',
        cgpaCutoff: 6.0 + (idx * 0.1),
        interviewDurationMinutes: 30,
        panelsCount: 8 + (idx % 3),
        targetBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']
      });
    });

    // Tier-1 Elite Product Companies (10 companies)
    const tier1Names = [
      'Google Software Engineering',
      'Microsoft IDC',
      'Amazon SDE-1',
      'Goldman Sachs Engineering',
      'Atlassian Systems',
      'Uber Tech',
      'Arcesium Software',
      'Qualcomm Hardware & Software',
      'Texas Instruments Embedded',
      'Adobe Computer Scientist'
    ];
    tier1Names.forEach((name, idx) => {
      const isHW = name.includes('Qualcomm') || name.includes('Texas');
      companies.push({
        id: `COMP-T1-${idx + 1}`,
        name,
        priorityTier: 'TIER_1_PRODUCT',
        cgpaCutoff: 8.2 + (idx * 0.05),
        interviewDurationMinutes: 60,
        panelsCount: 3 + (idx % 3),
        targetBranches: isHW ? ['ECE', 'EEE', 'CSE'] : ['CSE', 'ECE']
      });
    });

    // Tier-2 Regular & Core Companies (20 companies)
    const tier2Names = [
      'L&T Technology Services', 'Bosch Global Software', 'Schneider Electric',
      'Siemens Technology', 'Mercedes-Benz R&D', 'Deloitte USI Tech',
      'PwC Acceleration Center', 'EY GDS Tech', 'KPMG Global',
      'Oracle Cloud Infra', 'SAP Labs India', 'Salesforce Dev',
      'Cisco Systems', 'Juniper Networks', 'Nvidia GPU Software',
      'AMD India', 'Micron Memory Tech', 'Hero MotoCorp R&D',
      'Tata Motors Electric', 'Reliance Industries Tech'
    ];
    tier2Names.forEach((name, idx) => {
      companies.push({
        id: `COMP-T2-${idx + 1}`,
        name,
        priorityTier: 'TIER_2_REGULAR',
        cgpaCutoff: 7.0 + ((idx % 5) * 0.2),
        interviewDurationMinutes: 45,
        panelsCount: 2 + (idx % 3),
        targetBranches: idx >= 17 ? ['MECH', 'EEE', 'CIVIL'] : ['CSE', 'ECE', 'EEE', 'MECH']
      });
    });

    // 3. Generate 800 Students
    const students: Student[] = [];
    const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Aditya', 'Sneha', 'Rahul', 'Kavya', 'Siddharth', 'Divya', 'Karan', 'Meera', 'Varun', 'Ishaan', 'Tanvi', 'Amit', 'Pooja', 'Rishi'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Rao', 'Nair', 'Iyer', 'Kumar', 'Singh', 'Reddy', 'Joshi', 'Deshmukh', 'Chobre', 'Anand', 'Banerjee', 'Chatterjee', 'Kulkarni', 'Bhat', 'Shetty', 'Pillai'];

    for (let i = 1; i <= 800; i++) {
      const fn = firstNames[Math.floor(random() * firstNames.length)];
      const ln = lastNames[Math.floor(random() * lastNames.length)];
      const branchRoll = random();
      let branch: Branch = 'CSE';
      if (branchRoll < 0.30) branch = 'CSE';
      else if (branchRoll < 0.55) branch = 'ECE';
      else if (branchRoll < 0.75) branch = 'EEE';
      else if (branchRoll < 0.90) branch = 'MECH';
      else branch = 'CIVIL';

      // Gaussian CGPA approximation (Mean 7.8, StdDev 1.0)
      const u1 = random();
      const u2 = random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      let cgpa = Math.round((7.8 + z * 1.0) * 100) / 100;
      cgpa = Math.max(6.0, Math.min(10.0, cgpa));

      students.push({
        id: `STU-${1000 + i}`,
        name: `${fn} ${ln}`,
        branch,
        cgpa,
        shortlistedCompanyIds: []
      });
    }

    // 4. Generate Shortlists (Realistic Overlapping Demand)
    students.forEach((student) => {
      // Day 1 mass recruiters shortlist ~65% of all eligible students
      companies.filter(c => c.priorityTier === 'DAY_1_MASS').forEach(c => {
        if (student.cgpa >= c.cgpaCutoff && c.targetBranches.includes(student.branch)) {
          if (random() < 0.65) {
            student.shortlistedCompanyIds.push(c.id);
          }
        }
      });

      // Tier 1 Elite companies shortlist top CGPA students heavily
      companies.filter(c => c.priorityTier === 'TIER_1_PRODUCT').forEach(c => {
        if (student.cgpa >= c.cgpaCutoff && c.targetBranches.includes(student.branch)) {
          // Probability increases dramatically with higher CGPA
          const prob = (student.cgpa - c.cgpaCutoff) / (10.0 - c.cgpaCutoff);
          if (random() < Math.max(0.2, prob * 0.85)) {
            student.shortlistedCompanyIds.push(c.id);
          }
        }
      });

      // Tier 2 regular companies shortlist based on branch & CGPA
      companies.filter(c => c.priorityTier === 'TIER_2_REGULAR').forEach(c => {
        if (student.cgpa >= c.cgpaCutoff && c.targetBranches.includes(student.branch)) {
          if (random() < 0.35) {
            student.shortlistedCompanyIds.push(c.id);
          }
        }
      });

      // Ensure every student has at least 1 shortlisted company if eligible
      if (student.shortlistedCompanyIds.length === 0) {
        const eligible = companies.filter(c => student.cgpa >= c.cgpaCutoff && c.targetBranches.includes(student.branch));
        if (eligible.length > 0) {
          const pick = eligible[Math.floor(random() * eligible.length)];
          student.shortlistedCompanyIds.push(pick.id);
        }
      }
    });

    // Populate shortlist counts on companies
    companies.forEach(c => {
      c.shortlistCount = students.filter(s => s.shortlistedCompanyIds.includes(c.id)).length;
    });

    return { companies, students, rooms };
  }

  private static createPseudoRandom(seed: number) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
}
