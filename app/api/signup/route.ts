import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password, stdclass } = await req.json();

    // No bcrypt hashing – directly saving plain password (not secure) to save time for now
    // In production, you should hash the password before saving it
    console.log("Received data:", { name, email, password, stdclass });

    // Connect to MongoDB directly
    const client = await clientPromise;
    const db = client.db();

    // Check if user with this email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password,
      standard: stdclass, // Map stdclass to the standard field in the database
      weaktopics: [], // Initialize with empty array
      createdAt: new Date()
    });

    return new Response(JSON.stringify({ message: "User created successfully!!!", userId: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Safely log the error
    console.error("Database Error:", err instanceof Error ? err.message : String(err));

    // Return a more descriptive error message
    const errorMessage = err instanceof Error ? err.message : "Unknown database error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
