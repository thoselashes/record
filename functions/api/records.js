import { formatDate, formatTime } from "../_utils.js";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { customerName, mobileNumber, service, date, timeMinutes, amount, tags } = body;

    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const allTags = tags || [];
    const fullNumber = mobileNumber && !mobileNumber.startsWith("+")
      ? "+65" + mobileNumber
      : mobileNumber || "";

    const submittedAt = new Date().toISOString();

    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];
    appointments.push({
      id,
      date,
      timeMinutes,
      service,
      customerName,
      mobileNumber: fullNumber,
      email: "",
      submitted: true,
      submittedAt,
      amount: Number(amount || 0),
      tags: allTags,
    });
    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(appointments));

    const gsRes = await fetch(
      "https://script.google.com/macros/s/AKfycbzGcvuD5_9JrIlizn6jALo96Iy3nTRzRDg3cT_d5jfd1KlaFnP4SpWMCqsZftKf-CRrIg/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          submittedAt,
          date: formatDate(date),
          time: formatTime(timeMinutes),
          customerName,
          service,
          amount: Number(amount || 0),
          tags: allTags,
          mobileNumber: fullNumber,
        }),
      }
    );

    const gsBody = await gsRes.text();
    let gsOk = false;
    try { const j = JSON.parse(gsBody); gsOk = j.success === true; } catch {}

    return new Response(JSON.stringify({ success: true, gsOk, id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

