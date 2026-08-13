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

    // Clear the submission, not the appointment: reset to unsubmitted and
    // wipe the record fields, keeping the appointment itself.
    const updated = appointments.map((a) =>
      a.id === id
        ? { ...a, submitted: false, submittedAt: null, amount: 0, tags: [] }
        : a
    );

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

    // Remove the record row from Google Sheets (undo the submission)
    let gsOk = false;
    try {
      const gsRes = await fetch(
        "https://script.google.com/macros/s/AKfycbx4-VkZ5eO6Z1ew8se1i7IASlbAfldQGpz5txsiTXz334L9jx3MBnqy94Lt3PLT24ZWag/exec",
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
