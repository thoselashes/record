export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const {
      id,
      date,
      timeMinutes,
      service,
      customerName,
      mobileNumber,
      email,
      timePaid,
      amount,
      tags,
      customTags,
    } = body;

    const accessToken = await getAccessToken(context.env);
    const values = [
      formatDate(date),
      formatTime(timeMinutes),
      service,
      customerName,
      mobileNumber,
      email,
      timePaid,
      amount,
      [...tags, ...customTags].join(", "),
    ];

    await appendRow(accessToken, values);

    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, processed: true } : a
    );

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Submit error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function getAccessToken(env) {
  const clientEmail = env.CLIENT_EMAIL;
  const privateKey = env.PRIVATE_KEY.replace(/\\n/g, "\n");

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signingInput)
  );

  const signatureB64 = base64UrlEncode(
    new Uint8Array(signature)
  );

  const assertion = `${signingInput}.${signatureB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = await res.json();
  return data.access_token;
}

async function appendRow(accessToken, values) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    }
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA");
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function base64UrlEncode(buf) {
  return Buffer.from(buf).toString("base64url");
}
