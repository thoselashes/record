// CRC16-CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflection, no xor-out
// Matches the ISO/IEC 13239 checksum used by SGQR/PayNow (EMVCo field 63).
export function crc16CCITT(data) {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emv(id, value) {
  return id + String(value.length).padStart(2, "0") + value;
}

// Build the nested Merchant Account Info (EMVCo field 26) for PayNow.
// Always pays to the salon's fixed PayNow mobile number.
function buildMerchantAccountInfo(editable) {
  const sub = [
    emv("00", "SG.PAYNOW"),            // GUID
    emv("01", "0"),                    // Proxy type: 0 = mobile
    emv("02", "+6581802828"),          // Proxy value: +65 + salon's PayNow mobile
    emv("03", editable ? "1" : "0"),   // Editable: 1 = amount editable
  ];
  return emv("26", sub.join(""));
}

// Build the nested Additional Data (EMVCo field 62) with a bill number.
function buildAdditionalData(billNumber) {
  const sub = emv("01", billNumber);   // Bill number ≤25 chars
  return emv("62", sub);
}

export function buildPayNowPayload({ name, phone, service, amount }) {
  const editable = true;
  const suffix = (phone || "").slice(-4) || "xxxx";
  const billNumber = `${name}${suffix} ${service === "Eyelash Extensions" ? "Lash" : "Touchup"}`;
  const amt = amount > 0 ? Number(amount).toFixed(2) : "";

  const fields = [
    emv("00", "01"),                                    // Payload Format Indicator
    emv("01", "12"),                                    // Point of Initiation: dynamic
    buildMerchantAccountInfo(editable),                 // Merchant Account Info (26)
    emv("52", "0000"),                                  // Merchant Category Code
    emv("53", "702"),                                   // Transaction Currency (SGD)
  ];

  if (amt) fields.push(emv("54", amt));                 // Transaction Amount (optional)

  fields.push(
    emv("58", "SG"),                                    // Country Code
    emv("59", "NA"),                                    // Merchant Name
    emv("60", "Singapore"),                             // Merchant City
    buildAdditionalData(billNumber),                    // Additional Data (62)
    "6304"                                              // CRC placeholder
  );

  const payload = fields.join("");
  const checksum = crc16CCITT(new TextEncoder().encode(payload));
  return payload + checksum;
}
