import { cookies } from "next/headers";
import { executeQuery } from "../../../lib/db";
import { verifyJwt } from "../../../lib/auth";
import fs from "fs";
import path from "path";

// Helper to save base64 image to public/uploads
function saveBase64Image(base64Str: string): string | null {
  try {
    // Expect format: "data:image/png;base64,iVBORw0KGgoAAAANS..."
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }
    
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filename = `prod-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error saving base64 image:", error);
    return null;
  }
}

// Helper to check credentials and get user profile
async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyJwt(token);
  } catch {
    return null;
  }
}

// Helper to generate initials from a name (e.g. "Bayam Organik" -> "BO")
function generateInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase().slice(0, 5);
  }
  return name.trim().slice(0, 2).toUpperCase();
}

// 1. GET: Fetch all products (Allowed for both Admin and Kasir)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json(
        { error: "Unauthorized: Sesi login tidak ditemukan." },
        { status: 401 }
      );
    }

    const [rows]: any = await executeQuery(
      "SELECT id, name, initials, category, image_url, purchase_price, price, stock, unit FROM products ORDER BY name ASC"
    );
    const formatted = rows.map((r: any) => ({
      ...r,
      purchase_price: Number(r.purchase_price || 0),
      price: Number(r.price),
      stock: Number(r.stock)
    }));
    return Response.json(formatted);
  } catch (error: any) {
    console.error("GET /api/products database error:", error);
    return Response.json(
      { error: "Gagal mengambil data produk.", details: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new product (Admin Only)
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
    }
    if (user.role !== "Admin") {
      return Response.json(
        { error: "Forbidden: Akses ditolak. Hanya Administrator yang dapat menambah data produk." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id: customId, name, category, image_url, image_base64, purchase_price, price, stock, unit } = body;

    if (!name || !category || price === undefined || stock === undefined || !unit) {
      return Response.json(
        { error: "Semua field (nama, kategori, harga jual, stok, satuan) wajib diisi." },
        { status: 400 }
      );
    }

    const barcodeId = customId?.trim() || `PROD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Verify barcode uniqueness
    const [existing]: any = await executeQuery("SELECT id FROM products WHERE id = ?", [barcodeId]);
    if (existing && existing.length > 0) {
      return Response.json(
        { error: `Produk dengan Barcode '${barcodeId}' sudah ada dalam sistem.` },
        { status: 400 }
      );
    }

    const initials = generateInitials(name);
    const purchasePriceNum = Number(purchase_price) || 0;

    let finalImageUrl = image_url || null;
    if (image_base64) {
      const savedPath = saveBase64Image(image_base64);
      if (savedPath) {
        finalImageUrl = savedPath;
      }
    }

    await executeQuery(
      "INSERT INTO products (id, name, initials, category, image_url, purchase_price, price, stock, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [barcodeId, name.trim(), initials, category, finalImageUrl, purchasePriceNum, Number(price), Number(stock), unit.trim().toUpperCase()]
    );

    return Response.json({
      success: true,
      product: { id: barcodeId, name, initials, category, image_url: finalImageUrl, purchase_price: purchasePriceNum, price, stock, unit }
    });
  } catch (error: any) {
    console.error("POST /api/products database error:", error);
    return Response.json(
      { error: "Gagal menambah data produk ke MySQL.", details: error.message },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing product (Admin Only)
export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
    }
    if (user.role !== "Admin") {
      return Response.json(
        { error: "Forbidden: Akses ditolak. Hanya Administrator yang dapat mengubah data produk." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, category, image_url, image_base64, purchase_price, price, stock, unit } = body;

    if (!id || !name || !category || price === undefined || stock === undefined || !unit) {
      return Response.json(
        { error: "ID dan semua field wajib diisi untuk mengubah produk." },
        { status: 400 }
      );
    }

    const initials = generateInitials(name);
    const purchasePriceNum = Number(purchase_price) || 0;

    let finalImageUrl = image_url || null;
    if (image_base64) {
      const savedPath = saveBase64Image(image_base64);
      if (savedPath) {
        finalImageUrl = savedPath;
      }
    }

    await executeQuery(
      "UPDATE products SET name = ?, initials = ?, category = ?, image_url = ?, purchase_price = ?, price = ?, stock = ?, unit = ? WHERE id = ?",
      [name.trim(), initials, category, finalImageUrl, purchasePriceNum, Number(price), Number(stock), unit.trim().toUpperCase(), id]
    );

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/products database error:", error);
    return Response.json(
      { error: "Gagal memperbarui data produk di MySQL.", details: error.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: Delete a product by ID (Admin Only)
export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
    }
    if (user.role !== "Admin") {
      return Response.json(
        { error: "Forbidden: Akses ditolak. Hanya Administrator yang dapat menghapus data produk." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "ID produk wajib disertakan." },
        { status: 400 }
      );
    }

    await executeQuery("DELETE FROM products WHERE id = ?", [id]);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products database error:", error);
    return Response.json(
      { error: "Gagal menghapus data produk dari MySQL.", details: error.message },
      { status: 500 }
    );
  }
}
