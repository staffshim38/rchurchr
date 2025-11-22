/*
  # Create items table

  1. New Tables
    - `items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `name` (text, not null) - Name or description of the item
      - `created_at` (timestamptz) - Timestamp when item was created
  
  2. Security
    - Enable RLS on `items` table
    - Add policy for anyone to read items (public read access)
    - Add policy for anyone to insert items (public write access)
    - Add policy for anyone to delete items (public delete access)
  
  3. Notes
    - This is a simple demo table for testing Supabase connectivity
    - Public access policies allow testing without authentication
    - In production, these policies should be more restrictive
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items"
  ON items
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert items"
  ON items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete items"
  ON items
  FOR DELETE
  USING (true);
