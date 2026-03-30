const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  marketName: process.env.NEXT_PUBLIC_MARKET_NAME ?? "GroupRide",
  defaultLaunchCity: process.env.NEXT_PUBLIC_DEFAULT_LAUNCH_CITY ?? "Charlotte",
  demoMode: process.env.DEMO_MODE !== "false",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "ops@groupride.app",
  sessionCookieSecret: process.env.SESSION_COOKIE_SECRET ?? "development-only-secret"
};

export { env };
