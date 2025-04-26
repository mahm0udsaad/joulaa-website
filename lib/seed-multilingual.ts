import { supabase } from "@/lib/supabase"

export async function seedMultilingualHomepageData() {
  try {
    console.log("Starting multilingual homepage data seeding...")

    // Execute the SQL script to update tables
    const sqlScript = `
      -- Update hero_slides table to support multilingual content
      ALTER TABLE hero_slides 
      ADD COLUMN IF NOT EXISTS title_ar TEXT,
      ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
      ADD COLUMN IF NOT EXISTS button_text_ar TEXT;

      -- Update existing hero_slides records to have Arabic content
      UPDATE hero_slides
      SET 
        title_ar = COALESCE(title_ar, title || ' (بالعربية)'),
        subtitle_ar = COALESCE(subtitle_ar, subtitle || ' (بالعربية)'),
        button_text_ar = COALESCE(button_text_ar, button_text || ' (بالعربية)')
      WHERE title_ar IS NULL OR subtitle_ar IS NULL OR button_text_ar IS NULL;

      -- Update category_showcase table to support multilingual content
      ALTER TABLE category_showcase 
      ADD COLUMN IF NOT EXISTS name_ar TEXT;

      -- Update existing category_showcase records to have Arabic content
      UPDATE category_showcase
      SET name_ar = COALESCE(name_ar, name || ' (بالعربية)')
      WHERE name_ar IS NULL;

      -- Update section_cards table to support multilingual content
      ALTER TABLE section_cards 
      ADD COLUMN IF NOT EXISTS title_ar TEXT,
      ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
      ADD COLUMN IF NOT EXISTS description_ar TEXT,
      ADD COLUMN IF NOT EXISTS button_text_ar TEXT;

      -- Update existing section_cards records to have Arabic content
      UPDATE section_cards
      SET 
        title_ar = COALESCE(title_ar, title || ' (بالعربية)'),
        subtitle_ar = COALESCE(subtitle_ar, subtitle || ' (بالعربية)'),
        description_ar = CASE 
          WHEN description IS NOT NULL THEN COALESCE(description_ar, description || ' (بالعربية)') 
          ELSE NULL 
        END,
        button_text_ar = COALESCE(button_text_ar, button_text || ' (بالعربية)')
      WHERE title_ar IS NULL OR subtitle_ar IS NULL OR button_text_ar IS NULL;

      -- Update promo_sections table to support multilingual content
      ALTER TABLE promo_sections 
      ADD COLUMN IF NOT EXISTS title_ar TEXT,
      ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
      ADD COLUMN IF NOT EXISTS description_ar TEXT,
      ADD COLUMN IF NOT EXISTS button_text_ar TEXT;

      -- Update existing promo_sections records to have Arabic content
      UPDATE promo_sections
      SET 
        title_ar = COALESCE(title_ar, title || ' (بالعربية)'),
        subtitle_ar = COALESCE(subtitle_ar, subtitle || ' (بالعربية)'),
        description_ar = CASE 
          WHEN description IS NOT NULL THEN COALESCE(description_ar, description || ' (بالعربية)') 
          ELSE NULL 
        END,
        button_text_ar = COALESCE(button_text_ar, button_text || ' (بالعربية)')
      WHERE title_ar IS NULL OR subtitle_ar IS NULL OR button_text_ar IS NULL;

      -- Update promo_modals table to support multilingual content
      ALTER TABLE promo_modals 
      ADD COLUMN IF NOT EXISTS title_ar TEXT,
      ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
      ADD COLUMN IF NOT EXISTS button_text_ar TEXT;

      -- Update existing promo_modals records to have Arabic content
      UPDATE promo_modals
      SET 
        title_ar = COALESCE(title_ar, title || ' (بالعربية)'),
        subtitle_ar = COALESCE(subtitle_ar, subtitle || ' (بالعربية)'),
        button_text_ar = COALESCE(button_text_ar, button_text || ' (بالعربية)')
      WHERE title_ar IS NULL OR subtitle_ar IS NULL OR button_text_ar IS NULL;
    `

    // Execute the SQL script using Supabase's rpc function
    const { error } = await supabase.rpc("exec_sql", { sql: sqlScript })

    if (error) {
      console.error("Error executing SQL script:", error)
      return { success: false, error: error.message }
    }

    console.log("Multilingual homepage data seeding completed successfully!")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error seeding multilingual homepage data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
