/*
  # Create GraceLog attendance system schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key) - Unique identifier for each member
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `name` (text) - Member's full name
      - `email` (text) - Member's email
      - `created_at` (timestamptz) - When member was registered
    
    - `attendance_records`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `member_id` (uuid, foreign key) - Links to members table
      - `attendance_date` (date) - Date of attendance
      - `present` (boolean) - Whether member attended
      - `created_at` (timestamptz) - When record was created
  
  2. Security
    - Enable RLS on both tables
    - Users can only view/manage their own church's data
    - Only authenticated users can access the system
*/

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  present boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own members"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own members"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own members"
  ON members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view attendance for their members"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = attendance_records.member_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attendance for their members"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attendance for their members"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = attendance_records.member_id
      AND members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = attendance_records.member_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attendance for their members"
  ON attendance_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = attendance_records.member_id
      AND members.user_id = auth.uid()
    )
  );