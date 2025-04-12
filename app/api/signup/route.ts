import { UserModel } from "@/lib/models/user";
// Import server initialization to ensure database is set up
import "@/lib/server-init";

export async function POST(req: Request) {
  try {
    const { name, email, password, stdclass } = await req.json();

    console.log("Received data:", { name, email, stdclass });

    // Check if user with this email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: "Email already exists"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new user with password hashing handled by the model
    const newUser = await UserModel.create({
      name,
      email,
      password,
      standard: stdclass, // Map stdclass to the standard field in the database
      weaktopics: [], // Initialize with empty array
    });

    return new Response(JSON.stringify({
      success: true,
      message: "User created successfully!!!",
      userId: newUser._id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Safely log the error
    console.error("Database Error:", err instanceof Error ? err.message : String(err));

    // Return a more descriptive error message
    const errorMessage = err instanceof Error ? err.message : "Unknown database error";
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
