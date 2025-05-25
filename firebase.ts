import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// In production, you would use environment variables for these credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID || "freelanceflow-ai",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "mock-key-id",
  "private_key": (process.env.FIREBASE_PRIVATE_KEY || "mock-key").replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@freelanceflow-ai.iam.gserviceaccount.com",
  "client_id": process.env.FIREBASE_CLIENT_ID || "mock-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL || "mock-cert-url"
};

// For development purposes, we'll use a mock configuration if no credentials are provided
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://freelanceflow-ai.firebaseio.com"
});

// Initialize Firestore
const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
