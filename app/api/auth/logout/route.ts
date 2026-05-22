import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the token cookie
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // expire immediately
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/auth/logout error:", error);
    return Response.json(
      { error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
