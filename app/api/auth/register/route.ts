import bcrypt from "bcryptjs";
import { executeQuery } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // 1. Basic validation
    if (!name || !email || !password || !role) {
      return Response.json(
        { error: "Nama, email, password, dan peran (role) wajib diisi." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password minimal harus memiliki panjang 6 karakter." },
        { status: 400 }
      );
    }

    if (role !== "Admin" && role !== "Kasir") {
      return Response.json(
        { error: "Role tidak valid. Harus memilih Admin atau Kasir." },
        { status: 400 }
      );
    }

    // 2. Check if email is already registered
    const [existing]: any = await executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (existing && existing.length > 0) {
      return Response.json(
        { error: "Email sudah terdaftar dalam sistem. Gunakan email lain." },
        { status: 400 }
      );
    }

    // 3. Hash password using bcryptjs
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Generate user ID
    const userId = `USR-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Insert new user into database
    await executeQuery(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [userId, name.trim(), email.trim().toLowerCase(), passwordHash, role]
    );

    return Response.json({
      success: true,
      message: "Registrasi berhasil! Silakan masuk menggunakan akun baru Anda.",
      user: { id: userId, name, email, role }
    });
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server saat registrasi.", details: error.message },
      { status: 500 }
    );
  }
}
