// Single source of truth for all environment variables.
// NEVER use process.env directly outside this file.

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

export const config = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
  firebaseAdmin: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
  },
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
  },
  cron: {
    secret: process.env.CRON_SECRET ?? "",
  },
} as const;
