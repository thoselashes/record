import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("./calendar.json", "utf8"));

const transformed = raw
  .filter((a) => a.status !== "cancelled")
  .map((a) => ({
    id: a.id,
    date: a.date,
    timeMinutes: a.start,
    service: a.service,
    customerName: a.name,
    mobileNumber: a.phoneNumber,
    email: a.email,
    timePaid: "",
    amount: 0,
    tags: [],
    customTags: [],
    processed: false,
  }));

writeFileSync("./seed-data.json", JSON.stringify(transformed, null, 2));
console.log(`Seeded ${transformed.length} appointments (filtered ${raw.length - transformed.length} cancelled)`);
