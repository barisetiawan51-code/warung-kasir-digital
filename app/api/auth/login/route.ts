import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { executeQuery } from "../../../../lib/db";
import { signJwt } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Fetch user from database
    const [rows]: any = await executeQuery(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (!rows || rows.length === 0) {
      return Response.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 2. Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return Response.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 3. Generate signed JWT token
    const token = signJwt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 4. Store in secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 1 day in seconds
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auth/login error:", error);
    return Response.json(
      { error: "Terjadi kesalahan internal pada server.", details: error.message },
      { status: 500 }
    );
  }
}
