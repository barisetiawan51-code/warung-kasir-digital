import { cookies } from "next/headers";
import { executeQuery, initDb } from "../../../lib/db";
import { verifyJwt } from "../../../lib/auth";

// Helper to get verified user profile
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

// GET: Retrieve transaction logs (Admin Only)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
    }
    if (user.role !== "Admin") {
      return Response.json(
        { error: "Forbidden: Akses ditolak. Hanya Administrator yang dapat melihat laporan transaksi." },
        { status: 403 }
      );
    }

    const [rows]: any = await executeQuery(`
      SELECT 
        id, 
        DATE_FORMAT(timestamp, '%d %M %Y %H:%i:%s') as timestamp, 
        items_count as itemsCount, 
        subtotal, 
        total, 
        cash_paid as cashPaid, 
        change_amount as changeAmount, 
        status 
      FROM transactions 
      ORDER BY timestamp DESC
    `);

    // Fetch all items breakdown
    const [itemRows]: any = await executeQuery(`
      SELECT 
        transaction_id, 
        product_id, 
        product_name, 
        quantity, 
        price 
      FROM transaction_items
    `);
    
    const formatted = rows.map((r: any) => {
      const items = itemRows
        .filter((item: any) => item.transaction_id === r.id)
        .map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }));

      return {
        ...r,
        subtotal: Number(r.subtotal),
        total: Number(r.total),
        cashPaid: Number(r.cashPaid),
        change: Number(r.changeAmount),
        items
      };
    });

    return Response.json(formatted);
  } catch (error: any) {
    console.error("GET /api/transactions database error:", error);
    return Response.json(
      { error: "Gagal mengambil data transaksi dari MySQL.", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Log a new transaction and update product stocks (Admin & Kasir)
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized: Silakan login terlebih dahulu." }, { status: 401 });
  }

  const pool = await initDb();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const { 
      id, 
      itemsCount, 
      subtotal, 
      total, 
      cashPaid, 
      change, 
      status, 
      items 
    } = body;

    if (!id || !items || !Array.isArray(items)) {
      return Response.json(
        { error: "Payload transaksi tidak lengkap." },
        { status: 400 }
      );
    }

    // Begin database transaction
    await connection.beginTransaction();

    // 1. Insert transaction summary with creator user_id audit trail
    await connection.query(
      `INSERT INTO transactions (id, user_id, timestamp, items_count, subtotal, total, cash_paid, change_amount, status) 
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
      [id, user.id, itemsCount, subtotal, total, cashPaid, change, status || "Lunas / Success"]
    );

    // 2. Insert transaction items and update stock for each product
    for (const item of items) {
      const { product, quantity } = item;
      
      // Save item transaction link
      await connection.query(
        `INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, product.id, product.name, quantity, product.price]
      );

      // Decrement stock in products table
      await connection.query(
        `UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
        [quantity, product.id]
      );
    }

    // Commit changes
    await connection.commit();
    connection.release();

    return Response.json({ success: true, transactionId: id });
  } catch (error: any) {
    // Rollback changes on database error
    await connection.rollback();
    connection.release();

    console.error("POST /api/transactions transaction error:", error);
    return Response.json(
      { error: "Database transaction failed.", details: error.message },
      { status: 500 }
    );
  }
}
