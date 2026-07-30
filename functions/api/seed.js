// POST /api/seed — additively push appointments to KV.
// Body: { appointments: [...] }
// Preserves submitted/submittedAt/amount/tags/customTags for existing records by matching on id,
// and adds records that don't yet exist. Does not overwrite submitted data.

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const appointments = body.appointments;
    if (!Array.isArray(appointments)) {
      return new Response(JSON.stringify({ error: "appointments array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingAgenda = await context.env.APPOINTMENTS_KV.get("agenda");
    const existing = existingAgenda ? JSON.parse(existingAgenda) : [];
    const existingMap = new Map(existing.map((a) => [a.id, a]));

    const merged = appointments.map((appt) => {
      const prev = existingMap.get(appt.id);
      if (prev && prev.submitted) {
        return {
          ...appt,
          submitted: true,
          submittedAt: prev.submittedAt,
          amount: prev.amount,
          tags: prev.tags,
          customTags: prev.customTags || [],
        };
      }
      return { ...appt, submitted: false, submittedAt: null, amount: 0, tags: [], customTags: [] };
    });

    await context.env.APPOINTMENTS_KV.put("agenda", JSON.stringify(merged));

    return new Response(JSON.stringify({ success: true, count: merged.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
