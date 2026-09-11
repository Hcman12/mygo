export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'leadership' | 'legal_advisory' | 'candidate_care' | 'employer_relations';
  image: string;
  experience: string;
  specialization: string;
  languages: string[];
  bio: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'marcus-sterling',
    name: 'Marcus Sterling',
    role: 'Founder & Managing Director',
    category: 'leadership',
    image: '/headshot/team-1.jpg',
    experience: '12+ Years in International Relocation',
    specialization: 'European Labor Corridors & Bilateral Treaties',
    languages: ['English', 'German', 'French'],
    bio: 'Oversees MyGo Travel’s strategic European employer partnerships and bilateral recruitment agreements across 8 Schengen and non-Schengen destinations.'
  },
  {
    id: 'leonid-honchar',
    name: 'Leonid Honchar',
    role: 'Head of Legal & Advisory Service',
    category: 'leadership',
    image: '/headshot/team-2.jpg',
    experience: '10+ Years in Immigration Law',
    specialization: 'Schengen Consular Filings & Work Permit Appeals',
    languages: ['English', 'Ukrainian', 'Polish'],
    bio: 'Directs our consular legal team, ensuring 100% compliance with EU labor directives, ministry quotas, and embassy appointment scheduling.'
  },
  {
    id: 'kateryna-pakhomova',
    name: 'Kateryna Pakhomova',
    role: 'Head of European Admissions',
    category: 'leadership',
    image: '/headshot/team-3.jpg',
    experience: '8+ Years in Candidate Assessment',
    specialization: 'Candidate Intake & Quota Allocation',
    languages: ['English', 'Slovak', 'Czech'],
    bio: 'Leads candidate evaluations and matches applicants to guaranteed employer contracts in hospitality, logistics, manufacturing, and tech.'
  },
  {
    id: 'guseyn-manafov',
    name: 'Guseyn Manafov',
    role: 'Head of Customer Satisfaction',
    category: 'candidate_care',
    image: '/headshot/team-4.jpg',
    experience: '9+ Years in Candidate Support',
    specialization: 'Post-Arrival Integration & Welfare',
    languages: ['English', 'Turkish', 'Russian'],
    bio: 'Dedicated to candidate satisfaction from departure through on-site settlement, guaranteeing furnished housing and meal stipends.'
  },
  {
    id: 'yelizaveta-kostiuk',
    name: 'Yelizaveta Kostiuk',
    role: 'Senior Immigration Advisor',
    category: 'legal_advisory',
    image: '/headshot/team-5.jpg',
    experience: '7+ Years in Consular Services',
    specialization: 'Poland & Slovakia Relocation Dossiers',
    languages: ['English', 'Polish', 'Russian'],
    bio: 'Specializes in central European residence permits, documentation apostille verification, and embassy interview coaching.'
  },
  {
    id: 'hesham-gamal',
    name: 'Hesham Gamal',
    role: 'Consular Visa Specialist',
    category: 'legal_advisory',
    image: '/headshot/team-6.jpg',
    experience: '6+ Years in Visa Issuance',
    specialization: 'MENA & Gulf Region Corridors',
    languages: ['English', 'Arabic'],
    bio: 'Guides candidates through background verification, police clearances, and fast-track consular bookings for European entry visas.'
  },
  {
    id: 'yehor-brovko',
    name: 'Yehor Brovko',
    role: 'Work Permit & Embassy Specialist',
    category: 'legal_advisory',
    image: '/headshot/team-7.jpg',
    experience: '5+ Years in Labor Certifications',
    specialization: 'Lithuania & Czech Republic Work Permits',
    languages: ['English', 'Ukrainian', 'Lithuanian'],
    bio: 'Coordinates directly with European regional labor offices to secure expedited vocational work permits and biometric approvals.'
  },
  {
    id: 'anna-bilohur',
    name: 'Anna Bilohur',
    role: 'Candidate Evaluation Officer',
    category: 'legal_advisory',
    image: '/headshot/team-8.jpg',
    experience: '5+ Years in Vocational Vetting',
    specialization: 'Skill Assessment & Career Matching',
    languages: ['English', 'Ukrainian', 'German'],
    bio: 'Reviews candidate qualification dossiers, skill certifications, and trade credentials to ensure instant employer acceptance.'
  },
  {
    id: 'evgenii-gorianoy',
    name: 'Evgenii Gorianoy',
    role: 'Employer Relations Lead',
    category: 'employer_relations',
    image: '/headshot/team-9.jpg',
    experience: '8+ Years in Corporate Partnerships',
    specialization: 'Vetted Host Employers & Job Contracts',
    languages: ['English', 'Czech', 'German'],
    bio: 'Manages relationships with European enterprise employers, securing guaranteed contracts with covered accommodation and food allowances.'
  },
  {
    id: 'solomiia-piliak',
    name: 'Solomiia Piliak',
    role: 'Accommodation & Welfare Lead',
    category: 'candidate_care',
    image: '/headshot/team-10.jpg',
    experience: '6+ Years in Candidate Housing',
    specialization: 'Housing Inspections & Relocation Logistics',
    languages: ['English', 'Polish', 'Ukrainian'],
    bio: 'Verifies quality of employer-provided furnished apartments, utilities, and daily meal plans before candidate arrival in Europe.'
  },
  {
    id: 'arthur-vance',
    name: 'Arthur Vance',
    role: 'Schengen Compliance Director',
    category: 'leadership',
    image: '/headshot/team-11.jpg',
    experience: '14+ Years in EU Regulatory Affairs',
    specialization: 'Labor Directive 2014/36/EU & Cross-Border Migration',
    languages: ['English', 'French', 'Dutch'],
    bio: 'Ensures full compliance with European Union immigration frameworks, protecting candidate workers’ legal rights and labor protections.'
  },
  {
    id: 'valentina-lytvynenko',
    name: 'Valentina Lytvynenko',
    role: 'Senior Relocation Counselor',
    category: 'candidate_care',
    image: '/headshot/team-12.jpg',
    experience: '7+ Years in Expatriate Settlement',
    specialization: 'Pre-Departure Briefings & Travel Health Insurance',
    languages: ['English', 'Slovak', 'Hungarian'],
    bio: 'Provides comprehensive relocation guidance, itinerary planning, currency orientation, and cultural onboarding for newly arrived workers.'
  },
  {
    id: 'thomas-wagner',
    name: 'Thomas Wagner',
    role: 'Central European Operations Lead',
    category: 'employer_relations',
    image: '/headshot/team-13.jpg',
    experience: '11+ Years in EU Logistics Management',
    specialization: 'Germany, Austria & Czech Corridors',
    languages: ['English', 'German', 'Czech'],
    bio: 'Supervises regional ground operations, transit corridors, and corporate host agreements across Central European industrial hubs.'
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    role: 'International Talent Coordinator',
    category: 'employer_relations',
    image: '/headshot/team-14.jpg',
    experience: '6+ Years in Global Mobility',
    specialization: 'Multinational Technical & Hospitality Recruitment',
    languages: ['English', 'Mandarin', 'Spanish'],
    bio: 'Connects skilled tradespeople, culinary chefs, and heavy equipment operators to European enterprise vacancies.'
  },
  {
    id: 'daria-myronenko',
    name: 'Daria Myronenko',
    role: 'Arrivals & Logistics Specialist',
    category: 'candidate_care',
    image: '/headshot/team-15.avif',
    experience: '5+ Years in Airport Reception & Transit',
    specialization: 'Airport Greeters & Local SIM/Banking Setup',
    languages: ['English', 'Ukrainian', 'French'],
    bio: 'Coordinates airport welcoming services, SIM card distribution, local bank account setup, and transport directly to worker residences.'
  }
];
