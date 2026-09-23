import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk Frontend API URL (issuer). For separate dev/prod instances, use
      // process.env.CLERK_JWT_ISSUER_DOMAIN set on the Convex Dashboard instead.
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: "https://still-javelin-4671.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
