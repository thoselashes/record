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

    const allTags = [...(tags || []), ...(customTags || [])];

    const payload = {
      id,
      submittedAt: new Date().toISOString(),
      date: formatDate(date),
      time: formatTime(timeMinutes),
      customerName,
      service,
      amount: Number(amount || 0),
      tags: allTags,
      mobileNumber,
    };

    const gsRes = await fetch(
      "https://script.google.com/macros/s/AKfycbwoOCGX-JZ6gN9bXW9ibTBZqB6m18cAbqU5pYWw-UBNc20Dg1Mli-u3ogTxM8EeC0J11A/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const gsBody = await gsRes.text();
    let gsOk = false;
    try { const j = JSON.parse(gsBody); gsOk = j.success === true; } catch {}
    if (!gsOk) {
      console.error("Google Sheets error:", gsBody);
    }

    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];
    const updated = appointments.map((a) =>
      a.id === id
        ? {
            ...a,
            submitted: true,
            submittedAt: payload.submittedAt,
            amount: payload.amount,
            tags: allTags,
          }
        : a
    );

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

    return new Response(JSON.stringify({ success: true, gsOk }), {
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
