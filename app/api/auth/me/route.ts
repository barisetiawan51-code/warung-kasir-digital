import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        { authenticated: false, error: "Token tidak ditemukan." },
        { status: 401 }
      );
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return Response.json(
        { authenticated: false, error: "Sesi tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    return Response.json({
      authenticated: true,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return Response.json(
      { authenticated: false, error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
