import { formatDate, formatTime } from "../_utils.js";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { id, timeMinutes, service, customerName, mobileNumber, email, amount, tags, customTags } = body;
    console.log("[submit] received id=%s amount=%j (type=%s)", id, amount, typeof amount);

    const allTags = [...(tags || []), ...(customTags || [])];
    const fullNumber = mobileNumber && !mobileNumber.startsWith("+")
      ? "+65" + mobileNumber
      : mobileNumber || "";

    // 1. KV write — fast, responds immediately
    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];
    const submittedAt = new Date().toISOString();
    const updated = appointments.map((a) =>
      a.id === id
        ? { ...a, submitted: true, submittedAt, amount: Number(amount || 0), tags: allTags }
        : a
    );
    console.log("[submit] KV write amount=%j", Number(amount || 0));
    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

    // 2. GS sync in background — does not block response
    context.waitUntil(syncToGS({
      id, date: body.date, timeMinutes, customerName, service,
      amount, tags: allTags, mobileNumber: fullNumber,
    }));

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

async function syncToGS({ id, date, timeMinutes, customerName, service, amount, tags, mobileNumber }) {
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbx4-VkZ5eO6Z1ew8se1i7IASlbAfldQGpz5txsiTXz334L9jx3MBnqy94Lt3PLT24ZWag/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          submittedAt: new Date().toISOString(),
          date: formatDate(date),
          time: formatTime(timeMinutes),
          customerName,
          service,
          amount: Number(amount || 0),
          tags,
          mobileNumber,
        }),
      }
    );
    console.log("[submit] GAS sync sent amount=%j", Number(amount || 0));
  } catch (e) {
    // Data is safe in KV — GS sync can retry later
    console.error("GS sync failed:", e);
  }
}

