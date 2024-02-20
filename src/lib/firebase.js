import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccoutnKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const firebaseAdminConfig = {
  credential: cert(serviceAccoutnKey),
};

export function customInitApp() {
  if (getApps().length <= 0) {
    return initializeApp({
      credential: firebaseAdminConfig.credential,
    });
  } else {
    return getApps()[0];
  }
}
export const db = getFirestore();
