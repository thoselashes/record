export async function onRequestDelete(context) {
  try {
    const id = context.params.id;

    const agenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const appointments = agenda ? JSON.parse(agenda) : [];

    const updated = appointments.map((a) =>
      a.id === id
        ? { ...a, submitted: false, submittedAt: null, amount: 0, tags: [] }
        : a
    );

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(updated));

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
