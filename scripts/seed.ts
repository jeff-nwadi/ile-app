/**
 * Run with: npm run db:seed
 * Populates a starter menu. Run AFTER `npm run db:push`.
 */
import "../src/lib/load-env";
import { db } from "../src/db";
import { menuCategory, menuItem } from "../src/db/schema";

async function main() {
  const [starters] = await db
    .insert(menuCategory)
    .values({ name: "Starters", sortOrder: 1 })
    .returning();
  const [mains] = await db
    .insert(menuCategory)
    .values({ name: "Mains", sortOrder: 2 })
    .returning();
  const [desserts] = await db
    .insert(menuCategory)
    .values({ name: "Dessert", sortOrder: 3 })
    .returning();

  await db.insert(menuItem).values([
    {
      categoryId: starters.id,
      name: "Suya Tartare",
      description: "Hand-cut dry-aged beef, yaji spice ash, pickled ata rodo, quail yolk",
      priceKobo: 1850000,
      sortOrder: 1,
    },
    {
      categoryId: mains.id,
      name: "Catch of Lekki",
      description: "Grilled croaker, banga sauce, charred plantain purée, palm-oil emulsion",
      priceKobo: 2400000,
      sortOrder: 1,
    },
    {
      categoryId: mains.id,
      name: "Asun-Lacquered Lamb",
      description: "Slow lamb shoulder, pepper-soup jus, fonio crumble, scent leaf oil",
      priceKobo: 2700000,
      sortOrder: 2,
    },
    {
      categoryId: desserts.id,
      name: "Chin Chin Mille-Feuille",
      description: "Layered pastry, tigernut custard, caramelised plantain, nutmeg",
      priceKobo: 1150000,
      sortOrder: 1,
    },
  ]);

  console.log("Seeded menu ✅");
}

main().then(() => process.exit(0));
