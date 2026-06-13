// LV Robotics — Meetup -> Supabase calendar sync (Supabase Edge Function, Deno)
//
// Uses Meetup's PUBLIC iCal feed — no OAuth, no API key, no Meetup app approval.
//   https://www.meetup.com/<group-urlname>/events/ical/
//
// Flow:
//   1. Fetch the group's public .ics feed.
//   2. Parse VEVENT blocks (handles line folding, TZID, escaped text).
//   3. Map each event to the site's `events` table shape.
//   4. Upsert into Supabase via the service-role key (on_conflict=meetup_event_id).
//
// Config (optional secrets; sensible defaults built in):
//   MEETUP_GROUP_URLNAME   default "las-vegas-robotics-meetup"
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (auto-injected by Supabase)
//
// Note: Meetup's iCal feed only lists UPCOMING events. Past events stay in the
// table untouched (we only upsert, never delete), so history is preserved.
//
// Test (no DB writes): GET/POST  <function-url>?test=1

const DEFAULT_GROUP = "las-vegas-robotics-meetup";

function env(key: string, required = true): string {
  const v = Deno.env.get(key) ?? "";
  if (required && !v) throw new Error(`Missing required secret: ${key}`);
  return v;
}

interface IcsEvent {
  uid: string;
  summary?: string;
  description?: string;
  location?: string;
  url?: string;
  start?: Date | null;
  end?: Date | null;
}

// ---- iCal parsing ----------------------------------------------------------

// Unfold RFC 5545 folded lines (CRLF/LF followed by a space or tab).
function unfold(ics: string): string {
  return ics.replace(/\r?\n[ \t]/g, "");
}

function unescapeText(v: string): string {
  return v
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

// Offset (ms) between a named time zone and UTC at the given instant.
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +(parts.second ?? "0"),
  );
  return asUTC - date.getTime();
}

function zonedToUTC(
  y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string,
): Date {
  const utcGuess = Date.UTC(y, mo - 1, d, h, mi, s);
  const offset = tzOffsetMs(tz, new Date(utcGuess));
  return new Date(utcGuess - offset);
}

function parseIcsDate(value: string, params: Record<string, string>): Date | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00", z] = m;
  if (z === "Z") return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  if (params.TZID) return zonedToUTC(+y, +mo, +d, +h, +mi, +s, params.TZID);
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
}

function parseIcs(ics: string): IcsEvent[] {
  const lines = unfold(ics).split(/\r?\n/);
  const events: IcsEvent[] = [];
  let cur: IcsEvent | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = { uid: "" };
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur && cur.uid) events.push(cur);
      cur = null;
      continue;
    }
    if (!cur) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const left = line.slice(0, idx);
    const rawValue = line.slice(idx + 1);
    const [name, ...paramParts] = left.split(";");
    const params: Record<string, string> = {};
    for (const p of paramParts) {
      const eq = p.indexOf("=");
      if (eq !== -1) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
    }

    switch (name.toUpperCase()) {
      case "UID": cur.uid = rawValue.trim(); break;
      case "SUMMARY": cur.summary = unescapeText(rawValue); break;
      case "DESCRIPTION": cur.description = unescapeText(rawValue); break;
      case "LOCATION": cur.location = unescapeText(rawValue); break;
      case "URL": cur.url = rawValue.trim(); break;
      case "DTSTART": cur.start = parseIcsDate(rawValue.trim(), params); break;
      case "DTEND": cur.end = parseIcsDate(rawValue.trim(), params); break;
    }
  }
  return events;
}

// ---- Mapping ---------------------------------------------------------------

function eventIdFromUid(uid: string): string {
  // Meetup UIDs look like "event_xxxxxxx@meetup.com" or "xxxxxxx@meetup.com".
  const local = uid.split("@")[0];
  return local.replace(/^event[_-]?/i, "") || uid;
}

function shortDesc(desc?: string): string | null {
  if (!desc) return null;
  const clean = desc.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
}

function locationType(loc?: string): string {
  const t = (loc || "").toLowerCase();
  if (t.includes("online") || t.includes("link visible")) return "online";
  return "in_person";
}

function mapEvent(e: IcsEvent) {
  const id = eventIdFromUid(e.uid);
  return {
    meetup_event_id: id,
    source: "meetup",
    slug: `meetup-${id}`,
    title: e.summary ?? "Untitled Meetup Event",
    short_description: shortDesc(e.description),
    description: e.description ?? null,
    image_url: null,
    category: "Meetup",
    status: "published",
    start_date: e.start ? e.start.toISOString() : null,
    end_date: e.end ? e.end.toISOString() : null,
    location_type: locationType(e.location),
    location_name: e.location ?? null,
    location_address: e.location ?? null,
    organizer_name: "Las Vegas Robotics Meetup",
    registration_required: true,
    registration_url: e.url ?? null,
    synced_at: new Date().toISOString(),
  };
}

// ---- Supabase upsert -------------------------------------------------------

async function upsert(rows: Record<string, unknown>[]) {
  if (!rows.length) return { upserted: 0 };
  const url = `${env("SUPABASE_URL")}/rest/v1/events?on_conflict=meetup_event_id`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": env("SUPABASE_SERVICE_ROLE_KEY"),
      "Authorization": `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase upsert failed (${res.status}): ${txt}`);
  }
  return { upserted: rows.length };
}

// ---- Handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const params = new URL(req.url).searchParams;
    const isTest = params.get("test") === "1";
    // ?group= override is honored only in test mode (parser validation).
    const group = (isTest && params.get("group")) ||
      Deno.env.get("MEETUP_GROUP_URLNAME") || DEFAULT_GROUP;
    const icalUrl = `https://www.meetup.com/${group}/events/ical/`;

    const res = await fetch(icalUrl, {
      headers: { "User-Agent": "LV-Robotics-Sync/1.0 (+https://lv-robotics.fly.dev)" },
    });
    if (!res.ok) {
      throw new Error(`Meetup iCal fetch failed (${res.status}) for ${icalUrl}`);
    }
    const ics = await res.text();
    const parsed = parseIcs(ics);
    const rows = parsed.map(mapEvent).filter((r) => r.start_date);

    if (isTest) {
      return new Response(
        JSON.stringify(
          { test: true, group, fetched: parsed.length, mappable: rows.length, sample: rows.slice(0, 3) },
          null,
          2,
        ),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const result = await upsert(rows);
    return new Response(
      JSON.stringify({ ok: true, group, fetched: parsed.length, ...result, at: new Date().toISOString() }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
