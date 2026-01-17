import 'dotenv/config';
import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "art9793@gmail.com";

async function verifyAdmin() {
  try {
    console.log("\n=== Verifying Admin Account ===\n");
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL));

    if (!user) {
      console.log("❌ No user found with email:", ADMIN_EMAIL);
      console.log("   Run: npx tsx scripts/setup-admin.ts to create the account");
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   First Name: ${user.firstName}`);
    console.log(`   Last Name: ${user.lastName}`);
    console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
    
    if (user.password) {
      console.log(`   Password Hash Length: ${user.password.length}`);
      console.log(`   Password Hash Preview: ${user.password.substring(0, 20)}...`);
    }

    // Test password if provided
    const testPassword = process.argv[2];
    if (testPassword) {
      console.log("\n=== Testing Password ===\n");
      if (!user.password) {
        console.log("❌ User has no password set");
        process.exit(1);
      }
      
      const isValid = await bcrypt.compare(testPassword, user.password);
      if (isValid) {
        console.log("✅ Password is CORRECT!");
      } else {
        console.log("❌ Password is INCORRECT!");
        console.log("   Make sure you're using the exact password you set");
      }
    } else {
      console.log("\n💡 Tip: Test password verification by running:");
      console.log(`   npx tsx scripts/verify-admin.ts "your-password"`);
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyAdmin();

