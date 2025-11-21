-- Insert test users
INSERT OR IGNORE INTO users (id, email, password_hash, name, company, role, phone) VALUES 
  (1, 'shipper@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '김철수', '대한제조', 'shipper', '010-1234-5678'),
  (2, 'forwarder@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '이영희', '글로벌포워딩', 'forwarder', '010-2345-6789'),
  (3, 'carrier@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '박민수', '태평양해운', 'carrier', '010-3456-7890');

-- Insert test vessels
INSERT OR IGNORE INTO vessels (id, vessel_name, carrier_name, vessel_type, capacity, departure_port, arrival_port, departure_date, arrival_date, available_space, price_per_teu, status) VALUES 
  (1, 'PACIFIC GLORY', 'Pacific Shipping Line', 'container', 5000, 'Busan', 'Los Angeles', '2025-11-25', '2025-12-10', 150, 1200.00, 'available'),
  (2, 'ASIA EXPRESS', 'Asia Maritime Co.', 'container', 8000, 'Busan', 'Rotterdam', '2025-11-28', '2025-12-20', 200, 1500.00, 'available'),
  (3, 'OCEAN STAR', 'Global Carriers', 'container', 6000, 'Incheon', 'Hamburg', '2025-11-30', '2025-12-22', 180, 1400.00, 'available'),
  (4, 'KOREAN PRIDE', 'Korea Shipping', 'container', 4500, 'Busan', 'Singapore', '2025-11-26', '2025-12-03', 120, 800.00, 'available'),
  (5, 'TRANS PACIFIC', 'Trans Ocean Line', 'container', 7000, 'Busan', 'New York', '2025-12-01', '2025-12-18', 250, 1600.00, 'available');

-- Insert container availability for each vessel
INSERT OR IGNORE INTO vessel_containers (vessel_id, container_type, available_quantity, price_per_unit) VALUES
  -- PACIFIC GLORY
  (1, '20GP', 80, 1200.00),
  (1, '40GP', 50, 2200.00),
  (1, '40HC', 20, 2400.00),
  -- ASIA EXPRESS
  (2, '20GP', 100, 1500.00),
  (2, '40GP', 70, 2800.00),
  (2, '40HC', 30, 3000.00),
  -- OCEAN STAR
  (3, '20GP', 90, 1400.00),
  (3, '40GP', 60, 2600.00),
  (3, '40HC', 30, 2800.00),
  (3, 'reefer', 10, 3500.00),
  -- KOREAN PRIDE
  (4, '20GP', 70, 800.00),
  (4, '40GP', 40, 1500.00),
  (4, '40HC', 10, 1700.00),
  -- TRANS PACIFIC
  (5, '20GP', 130, 1600.00),
  (5, '40GP', 90, 3000.00),
  (5, '40HC', 30, 3200.00);

-- Insert sample bookings
INSERT OR IGNORE INTO bookings (id, user_id, vessel_id, container_type, quantity, total_price, status, booking_reference, notes) VALUES
  (1, 1, 1, '40GP', 2, 4400.00, 'confirmed', 'BK-2025-001', 'Urgent shipment'),
  (2, 2, 3, '20GP', 5, 7000.00, 'confirmed', 'BK-2025-002', 'Regular customer'),
  (3, 1, 4, '40HC', 1, 1700.00, 'pending', 'BK-2025-003', 'New booking');
