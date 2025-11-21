-- Users table (화주, 포워더, 선사)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL CHECK(role IN ('shipper', 'forwarder', 'carrier')),
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vessels table (선박 정보)
CREATE TABLE IF NOT EXISTS vessels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vessel_name TEXT NOT NULL,
  carrier_name TEXT NOT NULL,
  vessel_type TEXT NOT NULL CHECK(vessel_type IN ('container', 'bulk', 'tanker', 'roro')),
  capacity INTEGER NOT NULL,
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  arrival_date TEXT NOT NULL,
  available_space INTEGER NOT NULL,
  price_per_teu REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('available', 'full', 'departed', 'cancelled')) DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Container types (컨테이너 타입별 가용 공간)
CREATE TABLE IF NOT EXISTS vessel_containers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vessel_id INTEGER NOT NULL,
  container_type TEXT NOT NULL CHECK(container_type IN ('20GP', '40GP', '40HC', '45HC', 'reefer')),
  available_quantity INTEGER NOT NULL,
  price_per_unit REAL NOT NULL,
  FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- Bookings table (예약 정보)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vessel_id INTEGER NOT NULL,
  container_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  booking_reference TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vessel_id) REFERENCES vessels(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vessels_departure ON vessels(departure_port, departure_date);
CREATE INDEX IF NOT EXISTS idx_vessels_arrival ON vessels(arrival_port);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessel_containers_vessel ON vessel_containers(vessel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vessel ON bookings(vessel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
