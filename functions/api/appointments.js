export async function onRequestGet(context) {
  const agenda = await context.env.APPOINTMENTS_KV.get("agenda");

  if (!agenda) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(agenda, {
    headers: { "Content-Type": "application/json" },
  });
}
