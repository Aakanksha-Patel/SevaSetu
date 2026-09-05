// =======================================================
// SevaSetu MySQL Database Connection & Query Engine
// Uses mysql2/promise for full MySQL connectivity
// Includes environment variable configuration and
// high-fidelity mock fallback with the 8 relational tables
// =======================================================

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Environment variable database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sevasetu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isRealMysql = false;
let dbStatusMessage = 'Initializing database connection...';

// Pre-computed bcrypt hashes for seed demo credentials
const HASHED_PASSWORDS = {
  admin: bcrypt.hashSync('admin123', 10),
  ngo: bcrypt.hashSync('ngo123', 10),
  volunteer: bcrypt.hashSync('volunteer123', 10),
  user: bcrypt.hashSync('user123', 10),
};

// The 8 Core Tables per database.sql
const mockDatabase = {
  // Table 1: users (id, name, email, password, phone, location, profile_image, role, created_at)
  users: [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@sevasetu.org',
      password: HASHED_PASSWORDS.admin, // admin123
      phone: '+91 98110 00001',
      location: 'New Delhi',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'admin',
      status: 'active',
      created_at: '2026-01-01T09:00:00.000Z',
    },
    {
      id: 2,
      name: 'Aarogya Health Foundation',
      email: 'contact@aarogya.org',
      password: HASHED_PASSWORDS.ngo, // ngo123
      phone: '+91 98220 11112',
      location: 'Mumbai, Maharashtra',
      profile_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
      role: 'ngo',
      status: 'active',
      created_at: '2026-01-15T10:30:00.000Z',
    },
    {
      id: 3,
      name: 'Vidya Jyoti Educational Trust',
      email: 'info@vidyajyoti.ngo',
      password: HASHED_PASSWORDS.ngo, // ngo123
      phone: '+91 98111 88888',
      location: 'New Delhi',
      profile_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
      role: 'ngo',
      status: 'active',
      created_at: '2026-01-20T11:00:00.000Z',
    },
    {
      id: 4,
      name: 'Priya Sharma',
      email: 'priya.volunteer@gmail.com',
      password: HASHED_PASSWORDS.volunteer, // volunteer123
      phone: '+91 98330 22223',
      location: 'Bengaluru, Karnataka',
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      role: 'volunteer',
      status: 'active',
      created_at: '2026-02-01T14:15:00.000Z',
    },
    {
      id: 5,
      name: 'Rohan Mehta',
      email: 'rohan.volunteer@gmail.com',
      password: HASHED_PASSWORDS.volunteer, // volunteer123
      phone: '+91 98441 55555',
      location: 'Pune, Maharashtra',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'volunteer',
      status: 'active',
      created_at: '2026-02-05T16:00:00.000Z',
    },
    {
      id: 6,
      name: 'Rahul Verma',
      email: 'rahul.user@gmail.com',
      password: HASHED_PASSWORDS.user, // user123
      phone: '+91 98440 33334',
      location: 'Mumbai, Maharashtra',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'user',
      status: 'active',
      created_at: '2026-02-10T11:00:00.000Z',
    },
    {
      id: 7,
      name: 'Ananya Sen',
      email: 'ananya.user@gmail.com',
      password: HASHED_PASSWORDS.user, // user123
      phone: '+91 98770 99999',
      location: 'Kolkata, West Bengal',
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      role: 'user',
      status: 'active',
      created_at: '2026-02-12T15:30:00.000Z',
    },
  ],

  // Table 2: ngos (id, user_id, name, email, phone, category, description, address, logo, registration_number, verification_status, created_at)
  ngos: [
    {
      id: 1,
      user_id: 2,
      name: 'Aarogya Health Foundation',
      email: 'contact@aarogya.org',
      phone: '+91 98220 11112',
      category: 'Healthcare',
      description: 'Dedicated to offering free rural medical camps, pediatric clinics, and emergency mobile healthcare van outreach across rural India.',
      mission: 'To ensure no vulnerable citizen is denied critical healthcare and emergency medical interventions regardless of economic background.',
      address: '402 Lotus Business Park, Andheri West, Mumbai, MH 400053',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
      registration_number: 'MH/2018/009182',
      verification_status: 'verified',
      created_at: '2026-01-15T10:30:00.000Z',
    },
    {
      id: 2,
      user_id: 3,
      name: 'Vidya Jyoti Educational Trust',
      email: 'info@vidyajyoti.ngo',
      phone: '+91 98111 88888',
      category: 'Education',
      description: 'Bridging educational disparity through digital smart classrooms, rural STEM clubs, and girls scholarship initiatives.',
      mission: 'To empower underprivileged youth with transformative education, modern digital literacy, and skill certifications for lifelong dignity.',
      address: '12 Institutional Area, Lodhi Road, New Delhi 110003',
      logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
      registration_number: 'DL/2019/004321',
      verification_status: 'verified',
      created_at: '2026-01-20T11:00:00.000Z',
    },
    {
      id: 3,
      user_id: 3,
      name: 'Prakriti Green Earth Foundation',
      email: 'contact@prakritigreen.org',
      phone: '+91 98450 77712',
      category: 'Environment',
      description: 'Pioneering community afforestation, urban Miyawaki forests, wetland restoration, and zero-waste neighborhood initiatives.',
      mission: 'To revive ecologically degraded urban spaces, expand indigenous tree canopies, and foster climate resilience at the neighborhood level.',
      address: '77 Eco Heritage Park, Whitefield, Bengaluru, KA 560066',
      logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200',
      registration_number: 'KA/2020/018742',
      verification_status: 'verified',
      created_at: '2026-01-22T09:15:00.000Z',
    },
    {
      id: 4,
      user_id: 3,
      name: 'Karuna Animal Rescue & Welfare',
      email: 'help@karunarescue.org',
      phone: '+91 98200 44551',
      category: 'Animal Welfare',
      description: 'Rescuing injured strays, providing 24/7 veterinary ambulance triage, animal birth control, and loving pet adoption drives.',
      mission: 'To create a compassionate society where voiceless street animals receive immediate medical attention, humane care, and permanent homes.',
      address: '18 Sanctuary Road, Chembur East, Mumbai, MH 400071',
      logo: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=200',
      registration_number: 'MH/2021/033918',
      verification_status: 'verified',
      created_at: '2026-01-25T14:20:00.000Z',
    },
    {
      id: 5,
      user_id: 2,
      name: 'Nanhi Muskan Child Care Mission',
      email: 'care@nanhimuskan.ngo',
      phone: '+91 98710 33221',
      category: 'Child Welfare',
      description: 'Rescuing vulnerable children from malnutrition, providing early childhood learning, foster counseling, and safe shelter homes.',
      mission: 'To nurture and protect every vulnerable child, ensuring nutritious meals, safe shelter, quality healthcare, and emotional support.',
      address: '25 Shanti Kunj, Rohini Sector 14, New Delhi 110085',
      logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=200',
      registration_number: 'DL/2021/099234',
      verification_status: 'verified',
      created_at: '2026-01-28T16:00:00.000Z',
    },
    {
      id: 6,
      user_id: 2,
      name: 'Stree Shakti Women Livelihood Kendra',
      email: 'shakti@streeshakti.org',
      phone: '+91 98310 66554',
      category: 'Women Empowerment',
      description: 'Training rural women in micro-entrepreneurship, artisan handlooms, digital banking, and legal rights awareness.',
      mission: 'To build financial independence and leadership self-reliance among women through artisan enterprise and vocational empowerment.',
      address: '88 Salt Lake Sector V, Bidhannagar, Kolkata, WB 700091',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      registration_number: 'WB/2020/004812',
      verification_status: 'verified',
      created_at: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 7,
      user_id: 2,
      name: 'Annapurna Hunger Relief Society',
      email: 'info@annapurnarelief.org',
      phone: '+91 98400 99881',
      category: 'Food Distribution',
      description: 'Running community kitchens and food rescue vans that collect surplus edible food from banquets to feed hungry families daily.',
      mission: 'To eradicate hunger and malnutrition by recovering surplus edible food and serving dignified, hot meals to impoverished communities.',
      address: '15 Anna Salai, Guindy, Chennai, TN 600032',
      logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200',
      registration_number: 'TN/2019/012290',
      verification_status: 'verified',
      created_at: '2026-02-03T11:45:00.000Z',
    },
    {
      id: 8,
      user_id: 3,
      name: 'Sahayata Emergency Relief Corps',
      email: 'sos@sahayata.org',
      phone: '+91 98190 22119',
      category: 'Disaster Relief',
      description: 'Rapid response taskforce offering search and rescue, inflatable boats, clean water purification kits, and post-flood medical relief.',
      mission: 'To mobilize immediate disaster relief response within hours of calamity, delivering clean water, emergency medicine, and shelter.',
      address: '104 Gomti Nagar Extension, Lucknow, UP 226010',
      logo: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=200',
      registration_number: 'UP/2021/045129',
      verification_status: 'verified',
      created_at: '2026-02-05T08:30:00.000Z',
    },
  ],

  // Table 3: volunteers (id, user_id, skills, interests, availability, location, created_at)
  volunteers: [
    {
      id: 1,
      user_id: 4,
      skills: 'Teaching, First Aid, Content Writing, Patient Triage',
      interests: 'Child Education, Community Health, Emergency Response',
      availability: 'Weekends (Saturday & Sunday)',
      location: 'Bengaluru, Karnataka',
      created_at: '2026-02-01T14:15:00.000Z',
    },
    {
      id: 2,
      user_id: 5,
      skills: 'Graphic Design, Photography, Social Media, Event Logistics',
      interests: 'Environmental Protection, Youth Literacy, Animal Welfare',
      availability: 'Flexible Evenings & Sundays',
      location: 'Pune, Maharashtra',
      created_at: '2026-02-05T16:00:00.000Z',
    },
  ],

  // Table 4: events (id, ngo_id, title, description, category, date, time, location, image, required_volunteers, status, created_at)
  events: [
    {
      id: 1,
      ngo_id: 1,
      title: 'Emergency Rural Mobile Health Camp',
      description: 'Providing comprehensive health screenings, cataract diagnostics, vital checks, and free medicines for 300+ tribal villagers.',
      category: 'Healthcare',
      date: '2026-10-15',
      time: '09:00 AM - 04:00 PM',
      location: 'Tribal Welfare Center, Thane District, Maharashtra',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 15,
      status: 'approved',
      created_at: '2026-02-10T09:00:00.000Z',
    },
    {
      id: 2,
      ngo_id: 2,
      title: 'STEM & Robotics Workshop for Rural Girls',
      description: 'Interactive science experiments and robotics lab for 200 middle school girls to foster STEM curiosity and digital confidence.',
      category: 'Education',
      date: '2026-11-05',
      time: '10:00 AM - 02:00 PM',
      location: 'Zilla Parishad High School, Nashik, Maharashtra',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 10,
      status: 'approved',
      created_at: '2026-02-12T10:30:00.000Z',
    },
    {
      id: 3,
      ngo_id: 1,
      title: 'Warm Meals & Nutrition Ration Drive',
      description: 'Packaging and distribution of nutritious grain kits and hot lunches to homeless and migrant construction families.',
      category: 'Hunger Relief',
      date: '2026-09-28',
      time: '11:00 AM - 03:00 PM',
      location: 'Dharavi Sector 3, Mumbai, Maharashtra',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 8,
      status: 'approved',
      created_at: '2026-02-15T11:00:00.000Z',
    },
    {
      id: 4,
      ngo_id: 8,
      title: 'Clean Drinking Water & Sanitation Drive',
      description: 'Installation and testing of solar-powered reverse osmosis water filtration units in 12 rural government schools.',
      category: 'Disaster Relief',
      date: '2026-10-22',
      time: '09:30 AM - 01:30 PM',
      location: 'Sundarbans Coastal Delta, West Bengal',
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 8,
      status: 'approved',
      created_at: '2026-01-05T08:00:00.000Z',
    },
    {
      id: 5,
      ngo_id: 3,
      title: '5000 Saplings Urban Afforestation Drive',
      description: 'Community tree plantation creating a native dense biodiversity corridor to combat urban heat islands and support birds.',
      category: 'Environment',
      date: '2026-10-08',
      time: '07:30 AM - 12:00 PM',
      location: 'Sarjapur Biodiversity Park, Bengaluru, Karnataka',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 25,
      status: 'approved',
      created_at: '2026-02-18T10:00:00.000Z',
    },
    {
      id: 6,
      ngo_id: 4,
      title: 'Weekend Stray Animal Rescue & Pet Adoption Fair',
      description: 'Free rabies vaccinations, wound dressing for street dogs and cats, and fostering orientation for animal-loving families.',
      category: 'Animal Welfare',
      date: '2026-10-12',
      time: '10:00 AM - 04:00 PM',
      location: 'Shivaji Park Open Grounds, Dadar, Mumbai, Maharashtra',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 12,
      status: 'approved',
      created_at: '2026-02-20T11:00:00.000Z',
    },
    {
      id: 7,
      ngo_id: 5,
      title: 'Back-to-School Learning Kit & Toy Distribution',
      description: 'Equipping 450 underserved slum children with backpacks, notebooks, stationary kits, and educational toys.',
      category: 'Child Welfare',
      date: '2026-10-25',
      time: '09:00 AM - 01:00 PM',
      location: 'Bawana Community Center, North West Delhi',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 15,
      status: 'approved',
      created_at: '2026-02-22T08:30:00.000Z',
    },
    {
      id: 8,
      ngo_id: 6,
      title: 'Women Handloom Artisans Exhibition & Skill Lab',
      description: 'Mentoring 80 self-help women artisans in e-commerce marketing, product photography, and digital payment setup.',
      category: 'Women Empowerment',
      date: '2026-11-12',
      time: '10:30 AM - 05:00 PM',
      location: 'Academy of Fine Arts, Cathedral Road, Kolkata, West Bengal',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 10,
      status: 'approved',
      created_at: '2026-02-24T12:00:00.000Z',
    },
    {
      id: 9,
      ngo_id: 7,
      title: 'Surplus Food Rescue & Midnight Meal Run',
      description: 'Night patrol collecting hygienic surplus meals from catering events and serving 600+ night shelter dwellers and attendants.',
      category: 'Food Distribution',
      date: '2026-10-18',
      time: '08:00 PM - 11:30 PM',
      location: 'Central Railway Station & Government Hospital, Chennai, TN',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 14,
      status: 'approved',
      created_at: '2026-02-25T15:00:00.000Z',
    },
    {
      id: 10,
      ngo_id: 8,
      title: 'Monsoon Flood First-Responders Triage Drill',
      description: 'Hands-on practical training in inflatable raft handling, CPR, water purification tablets deployment, and trauma first aid.',
      category: 'Disaster Relief',
      date: '2026-11-20',
      time: '08:30 AM - 03:30 PM',
      location: 'Gomti Riverfront Promenade, Lucknow, Uttar Pradesh',
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800',
      required_volunteers: 20,
      status: 'approved',
      created_at: '2026-02-26T09:00:00.000Z',
    },
  ],

  // Table 5: volunteer_applications (id, volunteer_id, event_id, status, applied_at)
  volunteer_applications: [
    {
      id: 1,
      volunteer_id: 1,
      event_id: 1,
      status: 'accepted',
      applied_at: '2026-02-15T10:30:00.000Z',
    },
    {
      id: 2,
      volunteer_id: 1,
      event_id: 4,
      status: 'completed',
      applied_at: '2026-01-10T11:00:00.000Z',
    },
    {
      id: 3,
      volunteer_id: 2,
      event_id: 2,
      status: 'pending',
      applied_at: '2026-02-20T14:15:00.000Z',
    },
    {
      id: 4,
      volunteer_id: 2,
      event_id: 3,
      status: 'accepted',
      applied_at: '2026-02-25T09:45:00.000Z',
    },
  ],

  // Table 6: donations (id, user_id, ngo_id, amount, status, donated_at)
  donations: [
    {
      id: 1,
      user_id: 6,
      ngo_id: 1,
      amount: 2500.0,
      status: 'completed',
      donated_at: '2026-02-28T15:20:00.000Z',
    },
    {
      id: 2,
      user_id: 6,
      ngo_id: 2,
      amount: 1500.0,
      status: 'completed',
      donated_at: '2026-03-01T11:10:00.000Z',
    },
    {
      id: 3,
      user_id: 7,
      ngo_id: 1,
      amount: 5000.0,
      status: 'completed',
      donated_at: '2026-03-02T17:40:00.000Z',
    },
  ],

  // Table 7: feedback (id, user_id, ngo_id, event_id, rating, comment, created_at)
  feedback: [
    {
      id: 1,
      user_id: 6,
      ngo_id: 1,
      event_id: 1,
      rating: 5,
      comment: 'Incredible grassroots impact! The medical camp was transparently managed and helped over 180 patients.',
      created_at: '2026-02-28T16:00:00.000Z',
    },
    {
      id: 2,
      user_id: 7,
      ngo_id: 2,
      event_id: 2,
      rating: 5,
      comment: 'Watching village students build their first solar circuit was deeply inspiring. Transparent NGO!',
      created_at: '2026-03-01T12:00:00.000Z',
    },
    {
      id: 3,
      user_id: 4,
      ngo_id: 1,
      event_id: 1,
      rating: 5,
      comment: 'Extremely well-organized volunteer coordination. Clear roles, safe environment, and immense community gratitude.',
      created_at: '2026-02-16T18:30:00.000Z',
    },
  ],

  // Table 8: certificates (id, volunteer_id, event_id, certificate_number, issued_date)
  certificates: [
    {
      id: 1,
      volunteer_id: 1,
      event_id: 4,
      certificate_number: 'SEVA-2026-CERT-8841',
      issued_date: '2026-01-15T10:30:00.000Z',
    },
    {
      id: 2,
      volunteer_id: 1,
      event_id: 1,
      certificate_number: 'SEVA-2026-CERT-9124',
      issued_date: '2026-02-01T14:00:00.000Z',
    },
  ],

  // Table 9: saved_ngos (Bookmarked NGOs by citizens)
  saved_ngos: [
    {
      id: 1,
      user_id: 6,
      ngo_id: 1,
      saved_at: '2026-02-10T10:00:00.000Z',
    },
    {
      id: 2,
      user_id: 6,
      ngo_id: 2,
      saved_at: '2026-02-14T11:30:00.000Z',
    },
    {
      id: 3,
      user_id: 7,
      ngo_id: 1,
      saved_at: '2026-02-15T09:00:00.000Z',
    },
  ],
};

// Connect to MySQL database using pool
async function initDb() {
  try {
    pool = mysql.createPool(DB_CONFIG);
    const connection = await pool.getConnection();
    await connection.ping();

    // Ensure saved_ngos table exists in MySQL
    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_ngos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ngo_id INT NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_ngo_unique (user_id, ngo_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
        INDEX idx_saved_ngos_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `).catch(() => {});

    connection.release();
    isRealMysql = true;
    dbStatusMessage = `Connected to MySQL database at ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`;
    console.log(`[MySQL Connection] SUCCESS: ${dbStatusMessage}`);
  } catch (err) {
    isRealMysql = false;
    dbStatusMessage = `MySQL server not reachable (${err.message}). Using SevaSetu in-memory SQL persistence store with full sevasetu schema (8 tables + saved_ngos).`;
    console.log(`[MySQL Connection] Notice: ${dbStatusMessage}`);
  }
}

initDb();

// Primary parameterized query execution function
export async function query(sql, params = []) {
  if (isRealMysql && pool) {
    try {
      return await pool.query(sql, params);
    } catch (error) {
      console.error('[MySQL Query Error]:', error);
      throw error;
    }
  }

  // Fallback in-memory query processor respecting parameterized SQL
  return executeMockSql(sql, params);
}

// SQL Mock Engine supporting all 8 tables and parameterized placeholders
function executeMockSql(sql, params = []) {
  const trimmed = sql.trim().replace(/\s+/g, ' ');
  const upper = trimmed.toUpperCase();

  // 1. SELECT queries
  if (upper.startsWith('SELECT')) {
    const fromMatch = trimmed.match(/FROM\s+([a-zA-Z_]+)/i);
    if (!fromMatch) return [[], []];
    const tableName = fromMatch[1].toLowerCase();
    const table = mockDatabase[tableName] || [];

    let results = table.map((r) => ({ ...r }));

    // WHERE clause processing
    if (upper.includes('WHERE')) {
      const wherePart = trimmed.split(/WHERE/i)[1].split(/ORDER\s+BY|LIMIT/i)[0].trim().toUpperCase();

      // Check parameter matching
      if (wherePart.includes('EMAIL = ?')) {
        results = results.filter((r) => r.email && r.email.toLowerCase() === (params[0] || '').toLowerCase());
      } else if (wherePart.includes('USER_ID = ?') && wherePart.includes('NGO_ID = ?')) {
        results = results.filter((r) => r.user_id === Number(params[0]) && r.ngo_id === Number(params[1]));
      } else if (wherePart.includes('VOLUNTEER_ID = ?') && wherePart.includes('EVENT_ID = ?')) {
        results = results.filter((r) => r.volunteer_id === Number(params[0]) && r.event_id === Number(params[1]));
      } else if (wherePart.includes('USER_ID = ?')) {
        results = results.filter((r) => r.user_id === Number(params[0]));
      } else if (wherePart.includes('NGO_ID = ?')) {
        results = results.filter((r) => r.ngo_id === Number(params[0]));
      } else if (wherePart.includes('EVENT_ID = ?')) {
        results = results.filter((r) => r.event_id === Number(params[0]));
      } else if (wherePart.includes('VOLUNTEER_ID = ?')) {
        results = results.filter((r) => r.volunteer_id === Number(params[0]));
      } else if (wherePart.includes('CERTIFICATE_NUMBER = ?')) {
        results = results.filter((r) => r.certificate_number === params[0]);
      } else if (wherePart.includes('STATUS = ?')) {
        results = results.filter((r) => r.status === params[0]);
      } else if (wherePart.includes('VERIFICATION_STATUS = ?')) {
        results = results.filter((r) => r.verification_status === params[0]);
      } else if (wherePart.includes('ROLE = ?')) {
        results = results.filter((r) => r.role === params[0]);
      } else if (wherePart.includes('ID = ?')) {
        results = results.filter((r) => r.id === Number(params[0]));
      }
    }

    // ORDER BY
    if (upper.includes('ORDER BY')) {
      if (upper.includes('DESC')) {
        results.sort((a, b) => (b.id || 0) - (a.id || 0));
      } else {
        results.sort((a, b) => (a.id || 0) - (b.id || 0));
      }
    }

    // LIMIT
    if (upper.includes('LIMIT')) {
      const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const lim = parseInt(limitMatch[1], 10);
        results = results.slice(0, lim);
      }
    }

    return [results, []];
  }

  // 2. INSERT queries
  if (upper.startsWith('INSERT INTO')) {
    const tableMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z_]+)/i);
    if (!tableMatch) return [{ insertId: 0, affectedRows: 0 }, []];
    const tableName = tableMatch[1].toLowerCase();

    if (!mockDatabase[tableName]) {
      mockDatabase[tableName] = [];
    }
    const table = mockDatabase[tableName];

    const colsMatch = trimmed.match(/\(([^)]+)\)\s+VALUES/i);
    if (colsMatch) {
      const cols = colsMatch[1].split(',').map((c) => c.trim().toLowerCase());
      const newRow = { id: (table.length ? Math.max(...table.map((r) => r.id || 0)) : 0) + 1 };
      cols.forEach((col, idx) => {
        newRow[col] = params[idx] !== undefined ? params[idx] : null;
      });

      // Populate timestamp if not provided
      if (tableName === 'volunteer_applications' && !newRow.applied_at) {
        newRow.applied_at = new Date().toISOString();
      } else if (tableName === 'donations' && !newRow.donated_at) {
        newRow.donated_at = new Date().toISOString();
      } else if (tableName === 'certificates' && !newRow.issued_date) {
        newRow.issued_date = new Date().toISOString();
      } else if (!newRow.created_at) {
        newRow.created_at = new Date().toISOString();
      }

      table.push(newRow);
      return [{ insertId: newRow.id, affectedRows: 1 }, []];
    }
    return [{ insertId: 1, affectedRows: 1 }, []];
  }

  // 3. UPDATE queries
  if (upper.startsWith('UPDATE')) {
    const tableMatch = trimmed.match(/UPDATE\s+([a-zA-Z_]+)/i);
    if (!tableMatch) return [{ affectedRows: 0 }, []];
    const tableName = tableMatch[1].toLowerCase();
    const table = mockDatabase[tableName] || [];

    // Check if updating by volunteer_id and event_id
    if (upper.includes('VOLUNTEER_ID = ?') && upper.includes('EVENT_ID = ?')) {
      const volId = Number(params[1]);
      const evId = Number(params[2]);
      const targets = table.filter((r) => r.volunteer_id === volId && r.event_id === evId);
      targets.forEach((t) => {
        if (upper.includes('STATUS = ?')) t.status = params[0];
      });
      return [{ affectedRows: targets.length }, []];
    }

    // Check if updating by user_id
    if (upper.includes('WHERE USER_ID = ?')) {
      const userIdToUpdate = Number(params[params.length - 1]);
      const target = table.find((r) => r.user_id === userIdToUpdate);
      if (target) {
        if (tableName === 'volunteers') {
          target.skills = params[0];
          target.interests = params[1];
          target.availability = params[2];
          target.location = params[3];
        }
        return [{ affectedRows: 1 }, []];
      }
      return [{ affectedRows: 0 }, []];
    }

    const idToUpdate = Number(params[params.length - 1]);
    const target = table.find((r) => r.id === idToUpdate);
    if (target) {
      if (upper.includes('VERIFICATION_STATUS = ?')) {
        target.verification_status = params[0];
      } else if (upper.includes('STATUS = ?') && params.length <= 2) {
        target.status = params[0];
      } else if (tableName === 'ngos') {
        if (upper.includes('NAME = ?')) {
          target.name = params[0] !== undefined ? params[0] : target.name;
          target.description = params[1] !== undefined ? params[1] : target.description;
          target.mission = params[2] !== undefined ? params[2] : target.mission;
          target.category = params[3] !== undefined ? params[3] : target.category;
          target.address = params[4] !== undefined ? params[4] : target.address;
          target.phone = params[5] !== undefined ? params[5] : target.phone;
          target.email = params[6] !== undefined ? params[6] : target.email;
          target.registration_number = params[7] !== undefined ? params[7] : target.registration_number;
          target.logo = params[8] !== undefined ? params[8] : target.logo;
        }
      } else if (tableName === 'events') {
        if (upper.includes('TITLE = ?')) {
          target.title = params[0] !== undefined ? params[0] : target.title;
          target.description = params[1] !== undefined ? params[1] : target.description;
          target.category = params[2] !== undefined ? params[2] : target.category;
          target.date = params[3] !== undefined ? params[3] : target.date;
          target.time = params[4] !== undefined ? params[4] : target.time;
          target.location = params[5] !== undefined ? params[5] : target.location;
          target.image = params[6] !== undefined ? params[6] : target.image;
          target.required_volunteers = params[7] !== undefined ? Number(params[7]) : target.required_volunteers;
        } else if (upper.includes('STATUS = ?')) {
          target.status = params[0];
        }
      } else if (tableName === 'users') {
        if (upper.includes('STATUS = ?')) {
          target.status = params[0];
        }
        if (upper.includes('ROLE = ?')) {
          target.role = params[0];
        }
        if (upper.includes('NAME = ?')) {
          target.name = params[0];
          target.phone = params[1];
          target.location = params[2];
          if (params.length > 4) target.profile_image = params[3];
        }
      }
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 4. DELETE queries
  if (upper.startsWith('DELETE FROM')) {
    const tableMatch = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z_]+)/i);
    if (!tableMatch) return [{ affectedRows: 0 }, []];
    const tableName = tableMatch[1].toLowerCase();

    if (tableName === 'saved_ngos' && upper.includes('USER_ID = ?') && upper.includes('NGO_ID = ?')) {
      const userId = Number(params[0]);
      const ngoId = Number(params[1]);
      if (mockDatabase[tableName]) {
        const initialLen = mockDatabase[tableName].length;
        mockDatabase[tableName] = mockDatabase[tableName].filter(
          (r) => !(r.user_id === userId && r.ngo_id === ngoId)
        );
        return [{ affectedRows: initialLen - mockDatabase[tableName].length }, []];
      }
    }

    const idToDelete = Number(params[0]);

    if (mockDatabase[tableName]) {
      const idx = mockDatabase[tableName].findIndex((r) => r.id === idToDelete);
      if (idx !== -1) {
        mockDatabase[tableName].splice(idx, 1);
        // Cascade delete volunteer applications for deleted event
        if (tableName === 'events' && mockDatabase['volunteer_applications']) {
          mockDatabase['volunteer_applications'] = mockDatabase['volunteer_applications'].filter(
            (a) => a.event_id !== idToDelete
          );
        }
        return [{ affectedRows: 1 }, []];
      }
    }
    return [{ affectedRows: 0 }, []];
  }

  return [[], []];
}

export function getDbStatus() {
  return {
    isRealMysql,
    message: dbStatusMessage,
    databaseName: DB_CONFIG.database,
    config: {
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database,
    },
    tables: [
      'users',
      'ngos',
      'volunteers',
      'events',
      'volunteer_applications',
      'donations',
      'feedback',
      'certificates',
      'saved_ngos',
    ],
  };
}

export { mockDatabase };
