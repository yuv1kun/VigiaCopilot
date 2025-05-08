-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor', 'hse_manager', 'technician', 'admin')),
  contact_info JSONB,
  assigned_zones TEXT[],
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  manufacturer TEXT,
  installation_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'under_maintenance', 'decommissioned')),
  last_inspection_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sensors table
CREATE TABLE IF NOT EXISTS sensors (
  sensor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  specifications JSONB,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'calibrating', 'faulty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sensor_Readings table (time-series data)
CREATE TABLE IF NOT EXISTS sensor_readings (
  reading_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id UUID REFERENCES sensors(sensor_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  raw_data_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Maintenance_Records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  maintenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  performed_by UUID REFERENCES users(id),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('scheduled', 'unscheduled', 'predictive')),
  description TEXT,
  date DATE NOT NULL,
  next_due_date DATE,
  outcome TEXT,
  parts_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Predictive_Analytics table
CREATE TABLE IF NOT EXISTS predictive_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  model_type TEXT NOT NULL,
  prediction_value NUMERIC,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score NUMERIC,
  recommendation TEXT,
  triggered_alert_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  related_sensor_id UUID REFERENCES sensors(sensor_id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'escalated')),
  acknowledged_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update foreign key in predictive_analytics after alerts table creation
ALTER TABLE predictive_analytics ADD CONSTRAINT fk_predictive_analytics_alert
  FOREIGN KEY (triggered_alert_id) REFERENCES alerts(alert_id) ON DELETE SET NULL;

-- 8. Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID REFERENCES users(id),
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  media_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution_action TEXT,
  closed_by UUID REFERENCES users(id),
  closure_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Compliance_Reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_by UUID REFERENCES users(id),
  report_type TEXT NOT NULL,
  date_generated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_covered JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  file_reference TEXT,
  findings TEXT,
  actions_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Zones/Areas table
CREATE TABLE IF NOT EXISTS zones (
  zone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'restricted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Joining table for zones and users (many-to-many)
CREATE TABLE IF NOT EXISTS zone_personnel (
  zone_id UUID REFERENCES zones(zone_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (zone_id, user_id)
);

-- Joining table for zones and equipment (many-to-many)
CREATE TABLE IF NOT EXISTS zone_equipment (
  zone_id UUID REFERENCES zones(zone_id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  PRIMARY KEY (zone_id, equipment_id)
);

-- 11. Training_Records table
CREATE TABLE IF NOT EXISTS training_records (
  training_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  date_completed DATE NOT NULL,
  valid_until DATE,
  score NUMERIC,
  certificate_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Audit_Trails table
CREATE TABLE IF NOT EXISTS audit_trails (
  audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  related_entity_type TEXT,
  related_entity_id UUID
);

-- 13. Companion_Interactions table
CREATE TABLE IF NOT EXISTS companion_interactions (
  interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_type TEXT NOT NULL,
  input_content TEXT,
  response_content TEXT,
  related_alert_id UUID REFERENCES alerts(alert_id) ON DELETE SET NULL,
  feedback INT CHECK (feedback BETWEEN 1 AND 5)
);

-- Add Row Level Security (RLS) policies

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow all authenticated users to view all users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile (fixed signup issue)
CREATE POLICY "Users can insert their own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile or admins to update any profile
CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin') 
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Equipment RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Only supervisors and above can modify equipment" ON equipment 
  FOR ALL USING (auth.jwt() ->> 'role' IN ('supervisor', 'hse_manager', 'admin'));

-- Apply similar RLS policies to other tables
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view sensors" ON sensors FOR SELECT USING (true);
CREATE POLICY "Only supervisors and above can modify sensors" ON sensors 
  FOR ALL USING (auth.jwt() ->> 'role' IN ('supervisor', 'hse_manager', 'admin'));

-- Time-series data needs efficient policies
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view sensor readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "System and supervisors can insert readings" ON sensor_readings 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('supervisor', 'hse_manager', 'admin') OR auth.jwt() ->> 'app' = 'system');

-- Keep the existing API keys table from previous migration
-- (already created in 20250508_setup_tables.sql)
