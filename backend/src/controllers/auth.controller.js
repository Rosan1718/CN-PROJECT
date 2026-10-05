import { clerkClient } from "@clerk/express";
import { isAllowedFrontendOrigin } from "../lib/cors.js";

export async function checkAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json(req.user);
}

export async function sendInvitation(req, res) {
  const emailAddress = String(req.body.emailAddress || "").trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailAddress.length > 254 || !emailPattern.test(emailAddress)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (emailAddress === req.user.email?.toLowerCase()) {
    return res.status(400).json({ message: "You are already using this account." });
  }

  try {
    const requestOrigin = req.get("origin");
    const configuredUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
    const appUrl =
      requestOrigin && isAllowedFrontendOrigin(requestOrigin)
        ? requestOrigin.replace(/\/+$/, "")
        : configuredUrl;
    await clerkClient.invitations.createInvitation({
      emailAddress,
      ignoreExisting: true,
      ...(appUrl ? { redirectUrl: `${appUrl}/accept-invitation` } : {}),
    });
    return res.status(201).json({ message: "Invitation sent." });
  } catch (error) {
    const clerkError = error.errors?.[0];
    const clerkCode = clerkError?.code;
    const clerkMessage = clerkError?.longMessage || clerkError?.message || "";

    if (clerkCode === "form_identifier_exists") {
      return res.status(409).json({
        message: "This email already has a MultiChat account. Ask them to sign in instead.",
      });
    }

    if (clerkCode === "invitation_already_accepted") {
      return res.status(409).json({
        message: "This invitation was already accepted. Ask them to sign in instead.",
      });
    }

    console.error("Error sending Clerk invitation:", clerkCode || error.message, clerkMessage);
    return res.status(502).json({
      message:
        clerkMessage || "Clerk could not send the invitation. Check your Clerk invitation settings.",
    });
  }
}
