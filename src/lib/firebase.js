import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccoutnKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const firebaseAdminConfig = {
  credential: cert(serviceAccoutnKey),
};

let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export const db = getFirestore(firebase_app);
