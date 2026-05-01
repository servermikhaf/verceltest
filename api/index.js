import { Readable as _R } from "node:stream";
import { pipeline as _P } from "node:stream/promises";
import https from "https";

export const config = { api: { bodyParser: false }, supportsResponseStreaming: true, maxDuration: 60 };

// 🔑 دامنه مستقیم بدون Base64
const TARGET_BASE = "https://mydomain102.duckdns.org:2096";

const _REMOVE_HEADERS = new Set([
  "host", "connection", "keep-alive",
  "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding",
  "upgrade", "forwarded",
  "x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"
]);

export default async function _h(req, res) {
  if (!TARGET_BASE) {
    res.statusCode = 500;
    return res.end("API call error"); // پیام عمومی
  }

  try {
    const _url = TARGET_BASE + req.url;
    const _hdrs = {};
    let _cip = null;

    for (const _k of Object.keys(req.headers)) {
      const _lk = _k.toLowerCase();
      const _v = req.headers[_k];

      if (_REMOVE_HEADERS.has(_lk)) continue;
      if (_lk.startsWith("x-vercel-")) continue;
      if (_lk === "x-real-ip") { _cip = _v; continue; }
      if (_lk === "x-forwarded-for") { if (!_cip) _cip = _v; continue; }

      _hdrs[_lk] = Array.isArray(_v) ? _v.join(", ") : _v;
    }

    if (_cip) _hdrs["x-forwarded-for"] = _cip;

    const _m = req.method;
    const _hasBody = _m !== "GET" && _m !== "HEAD";

    const _opts = {
      method: _m,
      headers: _hdrs,
      redirect: "manual",
      agent: new https.Agent({ rejectUnauthorized: false }) // برای SSL self-signed
    };
    if (_hasBody) _opts.body = req;

    let _resp;
    try {
      _resp = await fetch(_url, _opts);
    } catch (_fetchErr) {
      console.error("API call error:", _fetchErr);
      if (!res.headersSent) res.statusCode = 502, res.end("API call error");
      return;
    }

    res.statusCode = _resp.status;
    for (const [_hk, _hv] of _resp.headers) {
      if (_hk.toLowerCase() === "transfer-encoding") continue;
      try { res.setHeader(_hk, _hv); } catch {}
    }

    if (_resp.body) {
      try {
        await _P(_R.from(_resp.body), res);
      } catch (_pipeErr) {
        console.error("API call error:", _pipeErr);
        if (!res.headersSent) res.statusCode = 502, res.end("API call error");
      }
    } else {
      res.end();
    }

  } catch (_e) {
    console.error("API call error:", _e);
    if (!res.headersSent) res.statusCode = 502, res.end("API call error");
  }
}
