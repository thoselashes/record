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

    // Fire-and-forget delete from Google Sheets
    fetch(
      "https://script.google.com/macros/s/AKfycbweses68SXveazp6yWgoEsNCYUrXZ0XN7Y22xuAJ8Bq53y56FDs9GM6VyjnH007RQ4e/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      }
    ).catch(() => {});

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
