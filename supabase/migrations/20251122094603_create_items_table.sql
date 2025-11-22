/*
  # Create items table

  1. New Tables
    - `items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `name` (text) - Name or description of the item
      - `created_at` (timestamptz) - Timestamp when the item was created
  
  2. Security
    - Enable RLS on `items` table
    - Add policy for public read access (anyone can view items)
    - Add policy for public insert access (anyone can add items)
    - Add policy for public delete access (anyone can delete items)
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items"
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