import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    profileImageUrl: session.user.image,
  });
}
