import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { storage } from "../../../server/storage";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return storage.getUserByEmail(email);
}

export async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user) return { error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };

  const allowedEmail = process.env.ADMIN_EMAIL;
  if (!allowedEmail || user.email !== allowedEmail) {
    return {
      error: new Response(
        JSON.stringify({ message: "Access denied. Only the site owner can access this area." }),
        { status: 403 },
      ),
    };
  }

  return { user };
}
