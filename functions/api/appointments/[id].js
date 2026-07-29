export async function onRequestDelete(context) {
  try {
    const id = context.params.id;

    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];

    const target = appointments.find((a) => a.id === id);
    if (!target) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = appointments.map((a) =>
      a.id === id
        ? { ...a, submitted: false, submittedAt: null, amount: 0, tags: [] }
        : a
    );

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

    // Delete from Google Sheets
    let gsOk = false;
    try {
      const gsRes = await fetch(
        "https://script.google.com/macros/s/AKfycbzGcvuD5_9JrIlizn6jALo96Iy3nTRzRDg3cT_d5jfd1KlaFnP4SpWMCqsZftKf-CRrIg/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id }),
        }
      );
      const gsText = await gsRes.text();
      const gsJson = JSON.parse(gsText);
      gsOk = gsJson.success === true;
    } catch (e) {
      console.error("GS delete failed:", e);
    }

    return new Response(JSON.stringify({ success: true, gsOk }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
