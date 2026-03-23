import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { config } from "@/config/unifiedConfig";

const firebaseApp = getApps().length === 0
  ? initializeApp(config.firebase)
  : getApp();

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
