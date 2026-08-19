"use strict";

const licenseApiUrl = process.env.KISHOK_LICENSE_API_URL || "";
const licensePublicKeyPem = process.env.KISHOK_LICENSE_PUBLIC_KEY_PEM || "";
const assetKeyBase64 = process.env.KISHOK_ASSET_KEY_B64 || "";

module.exports = {
  appName: "Vinayak 21 Acres",
  licenseApiUrl,
  licensePublicKeyPem,
  assetKeyBase64,
  maxLicenseClockSkewMs: 5 * 60 * 1000,
};
