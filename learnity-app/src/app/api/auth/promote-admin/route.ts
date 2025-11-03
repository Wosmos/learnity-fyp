/**
 * API Route: Promote User to Admin
 * TEMPORARY DEVELOPMENT ENDPOINT - Remove in production
 * Allows promoting a user to admin role using Firebase Admin SDK
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/config/firebase-admin";
import { DatabaseService } from "@/lib/services/database.service";
import { UserRole, Permission } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    // SECURITY: In production, this should require existing admin authentication
    // For now, we'll allow it for initial setup

    const { email, secretKey } = await request.json();

    // Simple secret key check (replace with your own secret)
    const ADMIN_SETUP_SECRET =
      process.env.ADMIN_SETUP_SECRET || "change-me-in-production";

    if (secretKey !== ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      // Get user by email from Firebase Auth
      const userRecord = await adminAuth.getUserByEmail(email);

      // Set custom claims for admin role
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: UserRole.ADMIN,
        permissions: [
          Permission.VIEW_ADMIN_PANEL,
          Permission.MANAGE_USERS,
          Permission.APPROVE_TEACHERS,
          Permission.VIEW_AUDIT_LOGS,
          Permission.MANAGE_PLATFORM,
        ],
        profileComplete: true,
        emailVerified: true,
      });

      // Also create/update user profile in database
      const databaseService = new DatabaseService();

      try {
        // Check if user profile exists
        let userProfile = await databaseService.getUserProfile(userRecord.uid);

        if (!userProfile) {
          // Create new admin profile
          userProfile = await databaseService.createUserProfile(
            userRecord.uid,
            {
              firstName: "Admin",
              lastName: "User",
              email: userRecord.email || email,
              role: UserRole.ADMIN,
              emailVerified: true,
              adminProfile: {
                department: "Platform Management",
                isStatic: false,
                createdBy: "admin-setup",
              },
            }
          );
        } else {
          // Update existing profile to admin
          userProfile = await databaseService.updateUserProfile(
            userRecord.uid,
            {
              emailVerified: true,
              lastLoginAt: new Date(),
            }
          );

          // Update role in database
          await databaseService.updateUserRole(userRecord.uid, UserRole.ADMIN);
        }

        await databaseService.disconnect();
      } catch (dbError) {
        console.error("Database update failed:", dbError);
        // Continue even if database update fails
      }

      console.log(
        `✅ Admin promotion successful for: ${email} (${userRecord.uid})`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully promoted ${email} to admin role`,
        userUid: userRecord.uid,
        note: "User will need to refresh their session to see admin privileges",
      });
    } catch (firebaseError) {
      console.error("Firebase Admin SDK error:", firebaseError);

      if (
        (firebaseError as Error).message.includes("There is no user record")
      ) {
        return NextResponse.json(
          {
            error:
              "User not found. Please make sure the user has registered first.",
          },
          { status: 404 }
        );
      }

      throw firebaseError;
    }
  } catch (error) {
    console.error("Admin promotion failed:", error);

    // Check if it's a Firebase Admin SDK configuration error
    if ((error as Error).message.includes("Firebase Admin SDK")) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK not properly configured",
          details: (error as Error).message,
          instructions: [
            "1. Make sure you have set up Firebase Admin SDK credentials",
            "2. Check your environment variables: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY",
            "3. Ensure the service account has proper permissions",
            "4. For now, you can manually set custom claims in Firebase Console",
          ],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to promote user", details: (error as Error).message },
      { status: 500 }
    );
  }
}
