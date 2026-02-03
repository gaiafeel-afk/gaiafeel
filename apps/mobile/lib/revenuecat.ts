import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

let isConfigured = false;

export const MONTHLY_ENTITLEMENT_ID = "somatic_monthly";

function getApiKey(): string {
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

  if (Platform.OS === "ios") {
    if (!iosKey) {
      throw new Error("Missing EXPO_PUBLIC_REVENUECAT_API_KEY_IOS");
    }

    return iosKey;
  }

  if (!androidKey) {
    throw new Error("Missing EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID");
  }

  return androidKey;
}

export async function configureRevenueCat(appUserId: string) {
  if (isConfigured) {
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.WARN);
  await Purchases.configure({
    apiKey: getApiKey(),
    appUserID: appUserId,
  });
  isConfigured = true;
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}

export async function purchaseMonthly() {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;

  if (!current?.availablePackages.length) {
    throw new Error("No purchase packages available.");
  }

  const pkg = current.availablePackages[0];
  return Purchases.purchasePackage(pkg);
}
