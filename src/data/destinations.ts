export interface Destination {
  id: string;
  country: string;
  category: 'schengen' | 'non-schengen' | 'education';
  categoryLabel: string;
  processingTime: string;
  feeFrom: string;
  tag?: string;
  featured?: boolean;
  accommodation: string;
  meals: string;
  description: string;
  popularJobs: string[];
  flag: string;
  currency: string;
}

export const destinations: Destination[] = [
  // Schengen Destinations
  {
    id: 'poland',
    country: 'Poland',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '4–6 months',
    feeFrom: '€975',
    tag: 'Highest Demand',
    featured: true,
    accommodation: 'Provided (Free / Subsidized Dormitory or Apartment)',
    meals: 'Daily Meal Allowance / Canteen Included',
    description: 'Established Central European destination with active placement quotas across regional logistics centers, electronics assembly, and food manufacturing plants. Offers full Schengen mobility upon permit issuance.',
    popularJobs: ['Logistics & Warehousing', 'Manufacturing & Assembly', 'Construction', 'Food Processing'],
    flag: '🇵🇱',
    currency: 'EUR / PLN'
  },
  {
    id: 'slovakia',
    country: 'Slovakia',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '3–4 months',
    feeFrom: '€2,350',
    accommodation: 'Employer-Provided Housing',
    meals: 'Meal Vouchers Provided',
    description: 'Central European industrial center featuring established automotive and electronics production facilities with employer-managed housing and shift meal vouchers.',
    popularJobs: ['Automotive Assembly', 'Warehouse Logistics', 'Machine Operators', 'General Construction'],
    flag: '🇸🇰',
    currency: 'EUR'
  },
  {
    id: 'czech-republic',
    country: 'Czech Republic',
    category: 'schengen',
    categoryLabel: 'Schengen / Seasonal',
    processingTime: '1–2 months',
    feeFrom: '€1,050',
    tag: 'Fast Processing',
    featured: true,
    accommodation: 'Provided Shared Housing',
    meals: 'Meal Allowance Included',
    description: 'High-demand labor market offering standard and seasonal employment authorizations across logistics facilities, light manufacturing, and agricultural operations.',
    popularJobs: ['Seasonal Agriculture', 'Factory Packaging', 'Warehouse Staff', 'Hotel Hospitality'],
    flag: '🇨🇿',
    currency: 'EUR / CZK'
  },
  {
    id: 'hungary',
    country: 'Hungary',
    category: 'schengen',
    categoryLabel: 'Schengen / Seasonal',
    processingTime: '1–2 months',
    feeFrom: '€2,150',
    accommodation: 'Included Housing',
    meals: 'Subsidized Meals',
    description: 'Streamlined entry route into Central Europe with placements in food production, packaging facilities, and regional distribution centers.',
    popularJobs: ['Factory Operators', 'Construction Helpers', 'Warehouse Logistics', 'Food Packaging'],
    flag: '🇭🇺',
    currency: 'EUR / HUF'
  },
  {
    id: 'bulgaria',
    country: 'Bulgaria',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '2 months',
    feeFrom: '€2,050',
    tag: 'New Schengen Member',
    accommodation: 'Provided Free Housing',
    meals: 'Meal Plan Included',
    description: 'Schengen member nation with placement opportunities in resort facilities, commercial construction, and regional transport infrastructure.',
    popularJobs: ['Construction & Carpentry', 'Hospitality & Resorts', 'Transport & Drivers', 'Manufacturing'],
    flag: '🇧🇬',
    currency: 'EUR / BGN'
  },
  {
    id: 'portugal-work',
    country: 'Portugal',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '2 months',
    feeFrom: '€2,300',
    tag: 'Warm Climate & EU Pathway',
    featured: true,
    accommodation: 'Accommodation Assistance Provided',
    meals: 'Staff Meals on Duty',
    description: 'Western European destination providing hospitality, seasonal agriculture, and customer support positions with formal sponsorship for EU residency.',
    popularJobs: ['Hospitality & Tourism', 'Agriculture & Greenhouses', 'Customer Support', 'Construction'],
    flag: '🇵🇹',
    currency: 'EUR'
  },
  {
    id: 'latvia',
    country: 'Latvia',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '2 months',
    feeFrom: '€2,050',
    accommodation: 'Dormitory or Shared Room Included',
    meals: 'Lunch / Meal Subsidies Included',
    description: 'Northern European hub offering placements in freight logistics, wood fabrication, and building trade contracts with included housing.',
    popularJobs: ['Heavy Vehicle Drivers', 'Warehouse Logistics', 'Wood & Metal Processing', 'Building Trades'],
    flag: '🇱🇻',
    currency: 'EUR'
  },
  {
    id: 'lithuania',
    country: 'Lithuania',
    category: 'schengen',
    categoryLabel: 'Schengen Zone',
    processingTime: '3–5 months',
    feeFrom: '€2,050',
    tag: 'High Demand Program',
    featured: true,
    accommodation: 'Furnished Housing Provided',
    meals: 'Daily Food Allowances',
    description: 'Consistent industrial demand for international commercial truck drivers (Category CE), certified welders, and warehouse shift supervisors.',
    popularJobs: ['International Truck Drivers (CE)', 'Welders & Fitters', 'Logistics Managers', 'Construction'],
    flag: '🇱🇹',
    currency: 'EUR'
  },

  // Non-Schengen Europe — Fast Entry
  {
    id: 'serbia',
    country: 'Serbia',
    category: 'non-schengen',
    categoryLabel: 'Non-Schengen Fast Entry',
    processingTime: '1–2 months',
    feeFrom: '€1,350',
    tag: 'Fast Track Entry',
    accommodation: 'Free Company Housing',
    meals: '3 Meals/Day or Food Allowance',
    description: 'Expedited consular processing for construction crews, light manufacturing, and warehouse logistics with employer-furnished housing and meal provisions.',
    popularJobs: ['Construction & Masonry', 'Manufacturing Plants', 'Hospitality & Dining', 'Warehousing'],
    flag: '🇷🇸',
    currency: 'EUR / RSD'
  },
  {
    id: 'ukraine',
    country: 'Ukraine',
    category: 'non-schengen',
    categoryLabel: 'Non-Schengen Fast Entry',
    processingTime: '~1 month',
    feeFrom: '€1,300',
    tag: 'Fastest 30-Day Entry',
    accommodation: 'Provided Company Housing',
    meals: 'Meal Allowances Provided',
    description: 'Expedited document processing for civil reconstruction contracts, heavy machinery operation, and regional logistics support.',
    popularJobs: ['Reconstruction & Building', 'Heavy Machinery', 'Logistics Coordinators', 'Agricultural Labor'],
    flag: '🇺🇦',
    currency: 'EUR / UAH'
  },
  {
    id: 'north-macedonia',
    country: 'North Macedonia',
    category: 'non-schengen',
    categoryLabel: 'Non-Schengen Fast Entry',
    processingTime: '2 months',
    feeFrom: '€2,350',
    tag: 'High Balkan Earning',
    accommodation: 'Furnished Company Accommodation',
    meals: 'Full Meal Support Included',
    description: 'Direct visa filing for infrastructure engineering, automotive component manufacturing, and hospitality operations.',
    popularJobs: ['Civil Infrastructure & Roads', 'Industrial Manufacturing', 'Hospitality Staff', 'Assembly Lines'],
    flag: '🇲🇰',
    currency: 'EUR / MKD'
  },

  // Education Route (Student Visa)
  {
    id: 'portugal-student',
    country: 'Portugal',
    category: 'education',
    categoryLabel: 'Education Route (Student Visa)',
    processingTime: '2–3 months',
    feeFrom: 'Consultation Required',
    tag: 'Study & Work in Europe',
    featured: true,
    accommodation: 'Student Campus Housing Guidance',
    meals: 'Subsidized University Canteen Access',
    description: 'Accredited higher education programs with legal authorizations for student employment during terms and full-time employment during breaks.',
    popularJobs: ['Part-Time Retail & Sales', 'Hotel Front Desk & Hospitality', 'Tutoring & Translation', 'Tech & Digital Support'],
    flag: '🇵🇹',
    currency: 'EUR'
  }
];
