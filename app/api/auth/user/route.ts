import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowedEmail = process.env.ADMIN_EMAIL;
  const isAdmin = !!allowedEmail && session.user.email === allowedEmail;
  if (!isAdmin) {
    return Response.json({ message: "Access denied" }, { status: 403 });
  }

  return Response.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    profileImageUrl: session.user.image,
    isAdmin: true,
  });
}
