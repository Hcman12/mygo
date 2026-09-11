export interface JobSector {
  id: string;
  name: string;
  icon: string;
  recommendedRole: string;
  topDestinations: string[];
  description: string;
}

export const jobSectors: JobSector[] = [
  {
    id: 'construction',
    name: 'Construction & Civil Trades',
    icon: '🏗️',
    recommendedRole: 'Site Construction Specialist',
    topDestinations: ['poland', 'bulgaria', 'serbia', 'north-macedonia'],
    description: 'Carpentry, masonry, tile setting, steel fixing, heavy machinery operation, and general site building.'
  },
  {
    id: 'administration',
    name: 'Administration & Office Support',
    icon: '📂',
    recommendedRole: 'Administrative Operations Assistant',
    topDestinations: ['portugal-work', 'poland', 'czech-republic'],
    description: 'Data entry, office clerical support, logistics documentation, customer correspondence, and executive assistance.'
  },
  {
    id: 'sales',
    name: 'Sales & Retail Customer Service',
    icon: '🛍️',
    recommendedRole: 'Retail Sales Representative',
    topDestinations: ['portugal-work', 'poland', 'czech-republic', 'hungary'],
    description: 'Showroom merchandising, retail floor assistance, order processing, and customer relations.'
  },
  {
    id: 'hospitality',
    name: 'Hospitality, Hotel & Food Service',
    icon: '🏨',
    recommendedRole: 'Hospitality & Guest Services Associate',
    topDestinations: ['bulgaria', 'portugal-work', 'czech-republic', 'slovakia'],
    description: 'Hotel room attendants, front desk reception, kitchen prep assistants, waitstaff, and resort attendants.'
  },
  {
    id: 'logistics',
    name: 'Logistics, Warehousing & Forklift',
    icon: '📦',
    recommendedRole: 'Warehouse Logistics Coordinator',
    topDestinations: ['poland', 'slovakia', 'latvia', 'lithuania'],
    description: 'Order picking, barcode scanning, packing, inventory management, and forklift driving.'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Factory Assembly',
    icon: '⚙️',
    recommendedRole: 'Industrial Production Operator',
    topDestinations: ['slovakia', 'hungary', 'poland', 'czech-republic'],
    description: 'Automotive parts assembly, electronics manufacturing, packaging lines, and quality inspection.'
  },
  {
    id: 'agriculture',
    name: 'Agriculture, Farming & Food Processing',
    icon: '🌾',
    recommendedRole: 'Agricultural Production Associate',
    topDestinations: ['czech-republic', 'hungary', 'portugal-work', 'poland'],
    description: 'Greenhouse crop cultivation, fruit harvesting, meat & poultry processing, and dairy production.'
  },
  {
    id: 'driving',
    name: 'Heavy Truck Driving & Delivery (Category C/CE/B)',
    icon: '🚛',
    recommendedRole: 'Commercial Freight Driver',
    topDestinations: ['lithuania', 'latvia', 'poland', 'bulgaria'],
    description: 'International freight transport, regional delivery vans, and logistics distribution across Europe.'
  },
  {
    id: 'healthcare',
    name: 'Caregiving & Healthcare Support',
    icon: '🩺',
    recommendedRole: 'Senior Care & Resident Support Assistant',
    topDestinations: ['poland', 'slovakia', 'portugal-work'],
    description: 'Assisting elderly in residential care centers, patient companionship, and health hygiene support.'
  },
  {
    id: 'tech_support',
    name: 'IT Support & Technical Services',
    icon: '💻',
    recommendedRole: 'Technical Support Specialist',
    topDestinations: ['portugal-work', 'poland', 'lithuania'],
    description: 'Hardware maintenance, help desk troubleshooting, system installations, and digital communication.'
  }
];
