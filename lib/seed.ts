import { seedMultilingualHomepageData } from "./seed-multilingual"

export async function seedInitialData() {
  // Seed multilingual homepage data
  const result = await seedMultilingualHomepageData()

  if (!result.success) {
    console.error("Error seeding multilingual homepage data:", result.error)
    return { success: false, error: result.error }
  }

  return { success: true, error: null }
}
