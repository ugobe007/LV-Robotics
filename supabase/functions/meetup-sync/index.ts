// LV Robotics — Meetup -> Supabase calendar sync (Supabase Edge Function, Deno)
//
// Flow:
//   1. Exchange the long-lived Meetup refresh token for a short-lived access token.
//   2. Query the Meetup GraphQL API (Pro proNetwork.eventsSearch) for events.
//   3. Map each Meetup event to the site's `events` table shape.
//   4. Upsert into Supabase via the service-role key (PostgREST, on_conflict=meetup_event_id).
//
// Secrets (set with: supabase secrets set KEY=value):
//   MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN
//   MEETUP_PRONETWORK_URLNAME   (your Meetup Pro network urlname)
//   MEETUP_GROUP_URLNAME        (e.g. las-vegas-robotics-meetup — filters to one group)
//   SYNC_PAST                   ("true" to also sync past events; default upcoming only)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-injected by Supabase)
//
// Test (no DB writes): GET/POST  <function-url>?test=1

const MEETUP_TOKEN_URL = "https://secure.meetup.com/oauth2/access";
const MEETUP_GQL_URL = "https://api.meetup.com/gql-ext";

interface MeetupEventNode {
  id: string;
  title: string;
  eventUrl?: string;
  description?: string;
  dateTime?: string;
  duration?: string;
  eventType?: string;
  group?: { urlname?: string; name?: string };
  venue?: { name?: string; address?: string; city?: string; state?: string };
  featuredEventPhoto?: { id?: string; baseUrl?: string };
}

function env(key: string, required = true): string {
  const v = Deno.env.get(key) ?? "";
  if (required && !v) throw new Error(`Missing required secret: ${key}`);
  return v;
}

async function getAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: env("MEETUP_CLIENT_ID"),
    client_secret: env("MEETUP_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: env("MEETUP_REFRESH_TOKEN"),
  });
  const res = await fetch(MEETUP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Meetup token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

async function gql(token: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch(MEETUP_GQL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    throw new Error(`Meetup GraphQL error (${res.status}): ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

const EVENTS_QUERY = `
query ($urlname: ID!, $first: Int!, $status: String!) {
  proNetwork(urlname: $urlname) {
    eventsSearch(input: { first: $first, filter: { status: $status } }) {
      totalCount
      edges {
        node {
          id
          title
          eventUrl
          description
          dateTime
          duration
          eventType
          group { urlname name }
          venue { name address city state }
          featuredEventPhoto { id baseUrl }
        }
      }
    }
  }
}`;

async function fetchEvents(token: string, status: string): Promise<MeetupEventNode[]> {
  const data = await gql(token, EVENTS_QUERY, {
    urlname: env("MEETUP_PRONETWORK_URLNAME"),
    first: 50,
    status,
  });
  const edges = data?.proNetwork?.eventsSearch?.edges ?? [];
  return edges.map((e: { node: MeetupEventNode }) => e.node);
}

// Parse ISO-8601 duration (e.g. PT2H30M) into milliseconds.
function durationMs(iso?: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return ((+h || 0) * 3600 + (+min || 0) * 60 + (+s || 0)) * 1000;
}

function locationType(eventType?: string): string {
  const t = (eventType || "").toUpperCase();
  if (t.includes("ONLINE")) return "online";
  if (t.includes("HYBRID")) return "hybrid";
  return "in_person";
}

function photoUrl(p?: { id?: string; baseUrl?: string }): string | null {
  if (!p?.baseUrl || !p?.id) return null;
  return `${p.baseUrl}${p.id}/676x380.webp`;
}

function shortDesc(desc?: string): string | null {
  if (!desc) return null;
  const clean = desc.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
}

function mapEvent(n: MeetupEventNode) {
  const start = n.dateTime ? new Date(n.dateTime) : null;
  const end = start && n.duration
    ? new Date(start.getTime() + durationMs(n.duration))
    : null;
  const addr = [n.venue?.address, n.venue?.city, n.venue?.state]
    .filter(Boolean).join(", ") || null;
  return {
    meetup_event_id: n.id,
    source: "meetup",
    slug: `meetup-${n.id}`,
    title: n.title,
    short_description: shortDesc(n.description),
    description: n.description ?? null,
    image_url: photoUrl(n.featuredEventPhoto),
    category: "Meetup",
    status: "published",
    start_date: start ? start.toISOString() : null,
    end_date: end ? end.toISOString() : null,
    location_type: locationType(n.eventType),
    location_name: n.venue?.name ?? null,
    location_address: addr,
    organizer_name: n.group?.name ?? "LV Robotics",
    registration_required: true,
    registration_url: n.eventUrl ?? null,
    synced_at: new Date().toISOString(),
  };
}

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

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const isTest = new URL(req.url).searchParams.get("test") === "1";
    const groupFilter = Deno.env.get("MEETUP_GROUP_URLNAME") || "";
    const syncPast = (Deno.env.get("SYNC_PAST") || "").toLowerCase() === "true";

    const token = await getAccessToken();

    const statuses = syncPast ? ["UPCOMING", "PAST"] : ["UPCOMING"];
    let nodes: MeetupEventNode[] = [];
    for (const s of statuses) {
      nodes = nodes.concat(await fetchEvents(token, s));
    }

    // If filtering to one group within the Pro network.
    if (groupFilter) {
      nodes = nodes.filter((n) => n.group?.urlname === groupFilter);
    }

    const rows = nodes.map(mapEvent).filter((r) => r.start_date);

    if (isTest) {
      return new Response(
        JSON.stringify({ test: true, fetched: nodes.length, mappedSample: rows.slice(0, 3) }, null, 2),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const result = await upsert(rows);
    return new Response(
      JSON.stringify({ ok: true, fetched: nodes.length, ...result, at: new Date().toISOString() }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
