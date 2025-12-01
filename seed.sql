-- Insert test users (password: password123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, company, role, phone) VALUES 
  (1, 'shipper@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '김철수', '대한제조', 'shipper', '010-1234-5678'),
  (2, 'forwarder@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '이영희', '글로벌포워딩', 'forwarder', '010-2345-6789'),
  (3, 'carrier@example.com', '75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=', '박민수', '태평양해운', 'carrier', '010-3456-7890');

-- Insert test vessels with major shipping lines
DELETE FROM vessels;
DELETE FROM vessel_containers;

INSERT INTO vessels (id, vessel_name, carrier_name, vessel_type, capacity, departure_port, arrival_port, departure_date, arrival_date, available_space, price_per_teu, status) VALUES 
  -- Maersk vessels (3)
  (1, 'MAERSK ESSEX', 'Maersk', 'container', 8000, '부산항', 'LA항', '2025-12-05', '2025-12-18', 250, 1850.00, 'available'),
  (2, 'MAERSK SEALAND', 'Maersk', 'container', 7500, '인천항', '뉴욕항', '2025-12-07', '2025-12-25', 180, 2100.00, 'available'),
  (3, 'MAERSK VIKING', 'Maersk', 'container', 9000, '부산항', '로테르담항', '2025-12-10', '2026-01-03', 320, 1950.00, 'available'),
  
  -- MSC vessels (3)
  (4, 'MSC OSCAR', 'MSC', 'container', 10000, '부산항', 'LA항', '2025-12-06', '2025-12-19', 280, 1780.00, 'available'),
  (5, 'MSC ZARA', 'MSC', 'container', 8500, '광양항', '싱가포르항', '2025-12-08', '2025-12-15', 150, 980.00, 'available'),
  (6, 'MSC GULSUN', 'MSC', 'container', 11000, '인천항', '상하이항', '2025-12-09', '2025-12-12', 200, 680.00, 'available'),
  
  -- CMA CGM vessels (2)
  (7, 'CMA CGM BOUGAINVILLE', 'CMA CGM', 'container', 9500, '부산항', '로테르담항', '2025-12-12', '2026-01-04', 290, 1920.00, 'available'),
  (8, 'CMA CGM ANTOINE', 'CMA CGM', 'container', 8200, '평택항', '뉴욕항', '2025-12-15', '2026-01-02', 220, 2050.00, 'available'),
  
  -- Hapag-Lloyd vessels (2)
  (9, 'HAPAG EXPRESS', 'Hapag-Lloyd', 'container', 7800, '부산항', 'LA항', '2025-12-04', '2025-12-17', 195, 1820.00, 'available'),
  (10, 'HAPAG BERLIN', 'Hapag-Lloyd', 'container', 8800, '인천항', '싱가포르항', '2025-12-13', '2025-12-20', 240, 1050.00, 'available');

-- Insert container availability for each vessel
INSERT INTO vessel_containers (vessel_id, container_type, available_quantity, price_per_unit) VALUES
  -- MAERSK ESSEX (1)
  (1, '20GP', 120, 1850.00),
  (1, '40GP', 90, 3400.00),
  (1, '40HC', 40, 3700.00),
  
  -- MAERSK SEALAND (2)
  (2, '20GP', 80, 2100.00),
  (2, '40GP', 70, 3900.00),
  (2, '40HC', 30, 4200.00),
  (2, 'reefer', 15, 5500.00),
  
  -- MAERSK VIKING (3)
  (3, '20GP', 150, 1950.00),
  (3, '40GP', 120, 3600.00),
  (3, '40HC', 50, 3900.00),
  
  -- MSC OSCAR (4)
  (4, '20GP', 130, 1780.00),
  (4, '40GP', 100, 3300.00),
  (4, '40HC', 50, 3600.00),
  
  -- MSC ZARA (5)
  (5, '20GP', 70, 980.00),
  (5, '40GP', 60, 1800.00),
  (5, '40HC', 20, 2000.00),
  
  -- MSC GULSUN (6)
  (6, '20GP', 90, 680.00),
  (6, '40GP', 80, 1200.00),
  (6, '40HC', 30, 1400.00),
  
  -- CMA CGM BOUGAINVILLE (7)
  (7, '20GP', 140, 1920.00),
  (7, '40GP', 110, 3550.00),
  (7, '40HC', 40, 3850.00),
  (7, 'reefer', 20, 5200.00),
  
  -- CMA CGM ANTOINE (8)
  (8, '20GP', 100, 2050.00),
  (8, '40GP', 85, 3800.00),
  (8, '40HC', 35, 4100.00),
  
  -- HAPAG EXPRESS (9)
  (9, '20GP', 90, 1820.00),
  (9, '40GP', 75, 3350.00),
  (9, '40HC', 30, 3650.00),
  
  -- HAPAG BERLIN (10)
  (10, '20GP', 110, 1050.00),
  (10, '40GP', 95, 1950.00),
  (10, '40HC', 35, 2150.00);

-- Insert sample bookings
INSERT OR IGNORE INTO bookings (id, user_id, vessel_id, container_type, quantity, total_price, status, booking_reference, notes) VALUES
  (1, 1, 1, '40GP', 2, 6800.00, 'confirmed', 'BK-2025-001', 'Urgent shipment'),
  (2, 2, 4, '20GP', 5, 8900.00, 'confirmed', 'BK-2025-002', 'Regular customer'),
  (3, 1, 5, '40HC', 1, 2000.00, 'pending', 'BK-2025-003', 'New booking');
