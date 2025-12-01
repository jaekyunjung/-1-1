/**
 * Dynamic Vessel Seed Script
 * Generates vessel data with dates starting from today to +30 days
 */

interface Vessel {
  id: number;
  vessel_name: string;
  carrier_name: string;
  vessel_type: string;
  capacity: number;
  departure_port: string;
  arrival_port: string;
  departure_offset_days: number; // Days from today
  transit_days: number; // Days to reach destination
  available_space: number;
  price_per_teu: number;
  status: string;
}

// Vessel templates with relative dates (distributed across 30 days)
const vesselTemplates: Vessel[] = [
  // Maersk vessels (3)
  { id: 1, vessel_name: 'MAERSK ESSEX', carrier_name: 'Maersk', vessel_type: 'container', capacity: 8000, 
    departure_port: '부산항', arrival_port: 'LA항', departure_offset_days: 2, transit_days: 13, 
    available_space: 250, price_per_teu: 1850.00, status: 'available' },
  { id: 2, vessel_name: 'MAERSK SEALAND', carrier_name: 'Maersk', vessel_type: 'container', capacity: 7500,
    departure_port: '인천항', arrival_port: '뉴욕항', departure_offset_days: 8, transit_days: 18,
    available_space: 180, price_per_teu: 2100.00, status: 'available' },
  { id: 3, vessel_name: 'MAERSK VIKING', carrier_name: 'Maersk', vessel_type: 'container', capacity: 9000,
    departure_port: '부산항', arrival_port: '로테르담항', departure_offset_days: 18, transit_days: 24,
    available_space: 320, price_per_teu: 1950.00, status: 'available' },
  
  // MSC vessels (3)
  { id: 4, vessel_name: 'MSC OSCAR', carrier_name: 'MSC', vessel_type: 'container', capacity: 10000,
    departure_port: '부산항', arrival_port: 'LA항', departure_offset_days: 5, transit_days: 13,
    available_space: 280, price_per_teu: 1780.00, status: 'available' },
  { id: 5, vessel_name: 'MSC ZARA', carrier_name: 'MSC', vessel_type: 'container', capacity: 8500,
    departure_port: '광양항', arrival_port: '싱가포르항', departure_offset_days: 12, transit_days: 7,
    available_space: 150, price_per_teu: 980.00, status: 'available' },
  { id: 6, vessel_name: 'MSC GULSUN', carrier_name: 'MSC', vessel_type: 'container', capacity: 11000,
    departure_port: '인천항', arrival_port: '상하이항', departure_offset_days: 22, transit_days: 3,
    available_space: 200, price_per_teu: 680.00, status: 'available' },
  
  // CMA CGM vessels (2)
  { id: 7, vessel_name: 'CMA CGM BOUGAINVILLE', carrier_name: 'CMA CGM', vessel_type: 'container', capacity: 9500,
    departure_port: '부산항', arrival_port: '로테르담항', departure_offset_days: 15, transit_days: 23,
    available_space: 290, price_per_teu: 1920.00, status: 'available' },
  { id: 8, vessel_name: 'CMA CGM ANTOINE', carrier_name: 'CMA CGM', vessel_type: 'container', capacity: 8200,
    departure_port: '평택항', arrival_port: '뉴욕항', departure_offset_days: 25, transit_days: 18,
    available_space: 220, price_per_teu: 2050.00, status: 'available' },
  
  // Hapag-Lloyd vessels (2)
  { id: 9, vessel_name: 'HAPAG EXPRESS', carrier_name: 'Hapag-Lloyd', vessel_type: 'container', capacity: 7800,
    departure_port: '부산항', arrival_port: 'LA항', departure_offset_days: 10, transit_days: 13,
    available_space: 195, price_per_teu: 1820.00, status: 'available' },
  { id: 10, vessel_name: 'HAPAG BERLIN', carrier_name: 'Hapag-Lloyd', vessel_type: 'container', capacity: 8800,
    departure_port: '인천항', arrival_port: '싱가포르항', departure_offset_days: 28, transit_days: 7,
    available_space: 240, price_per_teu: 1050.00, status: 'available' }
];

interface ContainerTemplate {
  vessel_id: number;
  container_type: string;
  available_quantity: number;
  price_per_unit: number;
}

const containerTemplates: ContainerTemplate[] = [
  // MAERSK ESSEX (1)
  { vessel_id: 1, container_type: '20GP', available_quantity: 120, price_per_unit: 1850.00 },
  { vessel_id: 1, container_type: '40GP', available_quantity: 90, price_per_unit: 3400.00 },
  { vessel_id: 1, container_type: '40HC', available_quantity: 40, price_per_unit: 3700.00 },
  
  // MAERSK SEALAND (2)
  { vessel_id: 2, container_type: '20GP', available_quantity: 80, price_per_unit: 2100.00 },
  { vessel_id: 2, container_type: '40GP', available_quantity: 70, price_per_unit: 3900.00 },
  { vessel_id: 2, container_type: '40HC', available_quantity: 30, price_per_unit: 4200.00 },
  { vessel_id: 2, container_type: 'reefer', available_quantity: 15, price_per_unit: 5500.00 },
  
  // MAERSK VIKING (3)
  { vessel_id: 3, container_type: '20GP', available_quantity: 150, price_per_unit: 1950.00 },
  { vessel_id: 3, container_type: '40GP', available_quantity: 120, price_per_unit: 3600.00 },
  { vessel_id: 3, container_type: '40HC', available_quantity: 50, price_per_unit: 3900.00 },
  
  // MSC OSCAR (4)
  { vessel_id: 4, container_type: '20GP', available_quantity: 130, price_per_unit: 1780.00 },
  { vessel_id: 4, container_type: '40GP', available_quantity: 100, price_per_unit: 3300.00 },
  { vessel_id: 4, container_type: '40HC', available_quantity: 50, price_per_unit: 3600.00 },
  
  // MSC ZARA (5)
  { vessel_id: 5, container_type: '20GP', available_quantity: 70, price_per_unit: 980.00 },
  { vessel_id: 5, container_type: '40GP', available_quantity: 60, price_per_unit: 1800.00 },
  { vessel_id: 5, container_type: '40HC', available_quantity: 20, price_per_unit: 2000.00 },
  
  // MSC GULSUN (6)
  { vessel_id: 6, container_type: '20GP', available_quantity: 90, price_per_unit: 680.00 },
  { vessel_id: 6, container_type: '40GP', available_quantity: 80, price_per_unit: 1200.00 },
  { vessel_id: 6, container_type: '40HC', available_quantity: 30, price_per_unit: 1400.00 },
  
  // CMA CGM BOUGAINVILLE (7)
  { vessel_id: 7, container_type: '20GP', available_quantity: 140, price_per_unit: 1920.00 },
  { vessel_id: 7, container_type: '40GP', available_quantity: 110, price_per_unit: 3550.00 },
  { vessel_id: 7, container_type: '40HC', available_quantity: 40, price_per_unit: 3850.00 },
  { vessel_id: 7, container_type: 'reefer', available_quantity: 20, price_per_unit: 5200.00 },
  
  // CMA CGM ANTOINE (8)
  { vessel_id: 8, container_type: '20GP', available_quantity: 100, price_per_unit: 2050.00 },
  { vessel_id: 8, container_type: '40GP', available_quantity: 85, price_per_unit: 3800.00 },
  { vessel_id: 8, container_type: '40HC', available_quantity: 35, price_per_unit: 4100.00 },
  
  // HAPAG EXPRESS (9)
  { vessel_id: 9, container_type: '20GP', available_quantity: 90, price_per_unit: 1820.00 },
  { vessel_id: 9, container_type: '40GP', available_quantity: 75, price_per_unit: 3350.00 },
  { vessel_id: 9, container_type: '40HC', available_quantity: 30, price_per_unit: 3650.00 },
  
  // HAPAG BERLIN (10)
  { vessel_id: 10, container_type: '20GP', available_quantity: 110, price_per_unit: 1050.00 },
  { vessel_id: 10, container_type: '40GP', available_quantity: 95, price_per_unit: 1950.00 },
  { vessel_id: 10, container_type: '40HC', available_quantity: 35, price_per_unit: 2150.00 }
];

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate SQL for vessels with dynamic dates
function generateVesselSQL(): string {
  const today = new Date();
  const sqlLines: string[] = [];
  
  sqlLines.push('-- Insert test users (password: password123)');
  sqlLines.push('INSERT OR IGNORE INTO users (id, email, password_hash, name, company, role, phone) VALUES');
  sqlLines.push("  (1, 'shipper@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '김철수', '대한제조', 'shipper', '010-1234-5678'),");
  sqlLines.push("  (2, 'forwarder@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '이영희', '글로벌포워딩', 'forwarder', '010-2345-6789'),");
  sqlLines.push("  (3, 'carrier@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '박민수', '태평양해운', 'carrier', '010-3456-7890');");
  sqlLines.push('');
  sqlLines.push('-- Insert test vessels with dynamic dates (generated from today)');
  sqlLines.push('DELETE FROM vessels;');
  sqlLines.push('DELETE FROM vessel_containers;');
  sqlLines.push('');
  sqlLines.push('INSERT INTO vessels (id, vessel_name, carrier_name, vessel_type, capacity, departure_port, arrival_port, departure_date, arrival_date, available_space, price_per_teu, status) VALUES');
  
  const vesselValues = vesselTemplates.map((vessel, index) => {
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + vessel.departure_offset_days);
    
    const arrivalDate = new Date(departureDate);
    arrivalDate.setDate(arrivalDate.getDate() + vessel.transit_days);
    
    const departureDateStr = formatDate(departureDate);
    const arrivalDateStr = formatDate(arrivalDate);
    
    const line = `  (${vessel.id}, '${vessel.vessel_name}', '${vessel.carrier_name}', '${vessel.vessel_type}', ${vessel.capacity}, '${vessel.departure_port}', '${vessel.arrival_port}', '${departureDateStr}', '${arrivalDateStr}', ${vessel.available_space}, ${vessel.price_per_teu}, '${vessel.status}')`;
    
    return index < vesselTemplates.length - 1 ? line + ',' : line + ';';
  });
  
  sqlLines.push(...vesselValues);
  sqlLines.push('');
  sqlLines.push('-- Insert container availability for each vessel');
  sqlLines.push('INSERT INTO vessel_containers (vessel_id, container_type, available_quantity, price_per_unit) VALUES');
  
  const containerValues = containerTemplates.map((container, index) => {
    const line = `  (${container.vessel_id}, '${container.container_type}', ${container.available_quantity}, ${container.price_per_unit})`;
    return index < containerTemplates.length - 1 ? line + ',' : line + ';';
  });
  
  sqlLines.push(...containerValues);
  sqlLines.push('');
  sqlLines.push('-- Insert sample bookings');
  sqlLines.push('INSERT OR IGNORE INTO bookings (id, user_id, vessel_id, container_type, quantity, total_price, status, booking_reference, notes) VALUES');
  sqlLines.push("  (1, 1, 1, '40GP', 2, 6800.00, 'confirmed', 'BK-2025-001', 'Urgent shipment'),");
  sqlLines.push("  (2, 2, 4, '20GP', 5, 8900.00, 'confirmed', 'BK-2025-002', 'Regular customer'),");
  sqlLines.push("  (3, 1, 5, '40HC', 1, 2000.00, 'pending', 'BK-2025-003', 'New booking');");
  
  return sqlLines.join('\n');
}

// Main execution
const sql = generateVesselSQL();
console.log(sql);
