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

function buildMerchantAccountInfo(editable) {
  const sub = [
    emv("00", "SG.PAYNOW"),
    emv("01", "0"),
    emv("02", "+6581802828"),
    emv("03", editable ? "1" : "0"),
  ];
  return emv("26", sub.join(""));
}

function buildAdditionalData(billNumber) {
  const sub = emv("01", billNumber);
  return emv("62", sub);
}

export function buildPayNowPayload({ name, phone, service, amount, id }) {
  const editable = true;
  const billNumber = id || "0";

  const fields = [
    emv("00", "01"),
    emv("01", "12"),
    buildMerchantAccountInfo(editable),
    emv("52", "0000"),
    emv("53", "702"),
  ];

  if (amount > 0) fields.push(emv("54", Number(amount).toFixed(2)));

  fields.push(
    emv("58", "SG"),
    emv("59", "NA"),
    emv("60", "Singapore"),
    buildAdditionalData(billNumber),
    "6304"
  );

  const payload = fields.join("");
  const checksum = crc16CCITT(new TextEncoder().encode(payload));
  return payload + checksum;
}
