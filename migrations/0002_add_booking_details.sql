-- Add additional booking information columns
ALTER TABLE bookings ADD COLUMN cargo_weight REAL;
ALTER TABLE bookings ADD COLUMN cargo_description TEXT;
ALTER TABLE bookings ADD COLUMN company_name TEXT;
ALTER TABLE bookings ADD COLUMN contact_person TEXT;
ALTER TABLE bookings ADD COLUMN phone TEXT;
ALTER TABLE bookings ADD COLUMN email TEXT;
