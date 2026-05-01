export const config = { runtime: "edge" };
//this project is for testing chatgpt api on vercel.com
//do not use for production

//api domain with port 
//default chatgpt api is 443
const API_DOMAIN = "https://mydomain102.duckdns.org:2096";
//this project is for testing chatgpt api on vercel.com
//do not use for production
const API_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "chatgpt-api-key"
]);
//this project is for testing chatgpt api on vercel.com
//do not use for production
export default async function handler(req) {
  try {
    const apiPath = req.url.indexOf("/", 8);
    const targetAPIurl =
      apiPath === -1 ? API_DOMAIN + "/" : API_DOMAIN + req.url.slice(apiPath);

    const out = new Headers();
    let userAPIipaddr = null;
    for (const [k, v] of req.headers) {
      if (API_HEADERS.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;
      if (k === "x-real-ip") {
        userAPIipaddr = v;
        continue;
      }
      if (k === "x-forwarded-for") {
        if (!userAPIipaddr) userAPIipaddr = v;
        continue;
      }
      out.set(k, v);
    }
    if (userAPIipaddr) out.set("x-forwarded-for", userAPIipaddr);

    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    return await fetch(targetAPIurl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
  } catch (err) {
    return new Response("FAILED TO CALL API, developed with (love) in germany", { status: 502 });
  }
}

//this project is for testing chatgpt api on vercel.com
//do not use for production
