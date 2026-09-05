import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("Google account does not have an email")
          );
        }

        const name =
          profile.displayName ||
          profile.name?.givenName ||
          "SpendWise User";

        // Check existing user
        let user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (user) {
          // Existing account
          user = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              authProvider: "GOOGLE",
              isEmailVerified: true,
              lastLoginAt: new Date(),
            },
          });
        } else {
          // Create new Google user
          user = await prisma.user.create({
            data: {
              name,
              email,
              password: null,
              authProvider: "GOOGLE",
              isEmailVerified: true,
              isActive: true,
              lastLoginAt: new Date(),
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;