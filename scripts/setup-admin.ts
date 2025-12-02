import 'dotenv/config';
import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const SALT_ROUNDS = 10;
const ADMIN_EMAIL = "art9793@gmail.com";

async function setupAdmin() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("\n=== Admin Account Setup ===\n");
    console.log(`Admin email: ${ADMIN_EMAIL}`);

    const password = await rl.question("Enter a strong password for the admin account: ");
    
    if (!password || password.length < 8) {
      console.error("\nError: Password must be at least 8 characters long");
      process.exit(1);
    }

    const confirmPassword = await rl.question("Confirm password: ");
    
    if (password !== confirmPassword) {
      console.error("\nError: Passwords do not match");
      process.exit(1);
    }

    console.log("\nHashing password...");
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
      console.log("\n✓ Admin password updated successfully!");
    } else {
      console.log("Creating new admin user...");
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
      });
      console.log("\n✓ Admin account created successfully!");
    }

    console.log(`\nYou can now log in with:`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: [the password you just set]\n`);

  } catch (error) {
    console.error("\nError setting up admin account:", error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

setupAdmin();
