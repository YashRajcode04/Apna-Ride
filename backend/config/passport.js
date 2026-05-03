import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

// ===== SERIALIZE USER =====
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ===== DESERIALIZE USER =====
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ========================================
// GOOGLE OAUTH STRATEGY
// ========================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ 'socialAccounts.google.id': profile.id });
          
          if (user) {
            // User exists, update last login
            user.lastLoginAt = Date.now();
            await user.save();
            return done(null, user);
          }
          
          // Check if user exists with same email
          const email = profile.emails[0].value;
          user = await User.findOne({ email });
          
          if (user) {
            // Link Google account to existing user
            user.socialAccounts.google = {
              id: profile.id,
              email: email,
              connected: true,
            };
            user.isVerified = true; // Auto-verify via Google
            await user.save();
            return done(null, user);
          }
          
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: email,
            authProvider: 'google',
            isVerified: true,
            avatar: {
              url: profile.photos[0]?.value || '',
            },
            socialAccounts: {
              google: {
                id: profile.id,
                email: email,
                connected: true,
              },
            },
          });
          
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// ========================================
// GITHUB OAUTH STRATEGY
// ========================================
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this GitHub ID
          let user = await User.findOne({ 'socialAccounts.github.id': profile.id });
          
          if (user) {
            user.lastLoginAt = Date.now();
            await user.save();
            return done(null, user);
          }
          
          // Get primary email
          const email = profile.emails?.[0]?.value;
          
          if (email) {
            user = await User.findOne({ email });
            
            if (user) {
              // Link GitHub account
              user.socialAccounts.github = {
                id: profile.id,
                username: profile.username,
                connected: true,
              };
              user.isVerified = true;
              await user.save();
              return done(null, user);
            }
          }
          
          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            authProvider: 'github',
            isVerified: true,
            avatar: {
              url: profile.photos[0]?.value || '',
            },
            socialAccounts: {
              github: {
                id: profile.id,
                username: profile.username,
                connected: true,
              },
            },
          });
          
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// ========================================
// FACEBOOK OAUTH STRATEGY
// ========================================
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Facebook ID
          let user = await User.findOne({ 'socialAccounts.facebook.id': profile.id });
          
          if (user) {
            user.lastLoginAt = Date.now();
            await user.save();
            return done(null, user);
          }
          
          // Get email
          const email = profile.emails?.[0]?.value;
          
          if (email) {
            user = await User.findOne({ email });
            
            if (user) {
              // Link Facebook account
              user.socialAccounts.facebook = {
                id: profile.id,
                email: email,
                connected: true,
              };
              user.isVerified = true;
              await user.save();
              return done(null, user);
            }
          }
          
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: email,
            authProvider: 'facebook',
            isVerified: true,
            avatar: {
              url: profile.photos[0]?.value || '',
            },
            socialAccounts: {
              facebook: {
                id: profile.id,
                email: email,
                connected: true,
              },
            },
          });
          
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

export default passport;
