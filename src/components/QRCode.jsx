import React from "react";
import { buildPayNowPayload } from "../utils/paynow";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCode({ amount, name, phone, service, id }) {
  const payload = buildPayNowPayload({ name, phone, service, amount, id });
  const fgColor = amount > 0 ? "#000000" : "#4B5563";

  return (
    <div className="inline-block p-1 bg-white rounded-lg border border-gray-200">
      <QRCodeCanvas
        value={payload}
        size={200}
        bgColor="#ffffff"
        fgColor={fgColor}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}
