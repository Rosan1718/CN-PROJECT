import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email =
        clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        res.status(422).json({ message: "Add an email address to your Clerk account to use chat." });
        return;
      }

      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        email.split("@")[0];

      try {
        user = await User.findOneAndUpdate(
          { clerkId: userId },
          {
            $set: { email, fullName, profilePic: clerkUser.imageUrl || "" },
            $setOnInsert: { clerkId: userId },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
        );
      } catch (error) {
        // A concurrent request may have created this profile at the same time.
        if (error.code === 11000) user = await User.findOne({ clerkId: userId });
        else throw error;
      }
    }

    if (!user) {
      res.status(500).json({ message: "Could not load your chat profile." });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
