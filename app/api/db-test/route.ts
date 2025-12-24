import { NextResponse } from "next/server";
import { db, users, type NewUser } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * Database Test API Route
 *
 * This endpoint tests that the database connection and CRUD operations work.
 * Access it at: http://localhost:3000/api/db-test
 *
 * What it does:
 * 1. Creates a test user
 * 2. Reads the user back
 * 3. Updates the user
 * 4. Deletes the user
 * 5. Returns the results
 *
 * DELETE THIS FILE before going to production!
 */

export async function GET() {
  try {
    // Generate a unique test ID using timestamp
    const testId = `test-${Date.now()}`;

    // Step 1: CREATE - Insert a test user
    const newUser: NewUser = {
      id: testId,
      name: "Test User",
      email: `test-${testId}@example.com`,
      emailVerified: false,
    };

    await db.insert(users).values(newUser);

    // Step 2: READ - Fetch the user we just created
    const fetchedUser = await db.query.users.findFirst({
      where: eq(users.id, testId),
    });

    // Step 3: UPDATE - Modify the user's data
    await db
      .update(users)
      .set({ name: "Updated Test User", emailVerified: true })
      .where(eq(users.id, testId));

    // Read the updated user
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, testId),
    });

    // Step 4: DELETE - Clean up the test data
    await db.delete(users).where(eq(users.id, testId));

    // Verify the deletion worked
    const deletedUser = await db.query.users.findFirst({
      where: eq(users.id, testId),
    });

    // Return success response with all operation results
    return NextResponse.json({
      success: true,
      message: "Database connection and CRUD operations working!",
      operations: {
        created: fetchedUser,
        updated: updatedUser,
        deleted: deletedUser === undefined,
      },
    });
  } catch (error) {
    // Log the full error for debugging
    console.error("Database test failed:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Make sure Docker is running and you've run 'npm run db:push'",
      },
      { status: 500 }
    );
  }
}
