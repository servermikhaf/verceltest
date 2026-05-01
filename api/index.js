import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
//test api project runs on vercel 
//do not use for production , just test.
export const config = {
  api: { bodyParser: false },
  supportsResponseStreaming: true,
  maxDuration: 60,
};
//note :  this code is used for api testing with vercel.
// do not use for production
const API_DOMAIN = "https://mydomain102.duckdns.org:2096/";
//test api project runs on vercel 
const APIHEADERS = new Set([
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
]);
//note :  this code is used for api testing with vercel.
export default async function handler(req, res) {
  if (!API_DOMAIN) {
    res.statusCode = 500;
    return res.end("Misconfigured: API DOMAIN IS NOT SET. ");
  }
//note :  this code is used for api testing with vercel.
  try {
    const targetAPI = API_DOMAIN + req.url;

    const headers = {};
    let user_api_ip = null;
    for (const key of Object.keys(req.headers)) {
      const k = key.toLowerCase();
      const v = req.headers[key];
      if (APIHEADERS.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;
      if (k === "x-real-ip") { user_api_ip = v; continue; }
      if (k === "x-forwarded-for") { if (!user_api_ip) user_api_ip = v; continue; }
      headers[k] = Array.isArray(v) ? v.join(", ") : v;
    }
    if (user_api_ip) headers["x-forwarded-for"] = user_api_ip;

    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    const fetchOpts = { method, headers, redirect: "manual" };
    if (hasBody) {
      fetchOpts.body = Readable.toWeb(req);
      fetchOpts.duplex = "half";
    }

    const upstream = await fetch(targetAPI, fetchOpts);

    res.statusCode = upstream.status;
    for (const [k, v] of upstream.headers) {
      if (k.toLowerCase() === "transfer-encoding") continue;
      try { res.setHeader(k, v); } catch {}
    }
//note :  this code is used for api testing with vercel.
    if (upstream.body) {
      await pipeline(Readable.fromWeb(upstream.body), res);
    } else {
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end("Api Call Failed, Please check your api domain and key and try again.");
    }
  }
}
//note :  this code is used for api testing with vercel.
// do not use for production
//test api project runs on vercel 
