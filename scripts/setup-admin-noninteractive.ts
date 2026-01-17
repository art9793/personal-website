import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "art9793@gmail.com";

async function setupAdmin() {
  try {
    console.log("\n=== Admin Account Setup (Non-Interactive) ===\n");
    console.log(`Admin email: ${ADMIN_EMAIL}`);

    // Get password from environment variable or use a default
    const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;
    
    if (!password || password.length < 8) {
      console.error("\n❌ Error: ADMIN_PASSWORD environment variable must be set and at least 8 characters long");
      console.error("   Set it with: railway variables --set 'ADMIN_PASSWORD=your-secure-password'");
      process.exit(1);
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log("Checking for existing user...");
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL));

    if (existingUser) {
      console.log("Updating existing admin user...");
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.email, ADMIN_EMAIL));
      console.log("\n✅ Admin password updated successfully!");
    } else {
      console.log("Creating new admin user...");
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
      });
      console.log("\n✅ Admin account created successfully!");
    }

    console.log(`\nYou can now log in with:`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: [the password you set in ADMIN_PASSWORD]\n`);

  } catch (error) {
    console.error("\n❌ Error setting up admin account:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupAdmin();

