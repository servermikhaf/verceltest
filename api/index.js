import { Readable as _R } from "node:stream";
import { pipeline as _P } from "node:stream/promises";
import https from "https";

export const config = { api: { bodyParser: false }, supportsResponseStreaming: true, maxDuration: 60 };

// 🔑 دامنه مستقیم
const TARGET_BASE = "https://mydomain102.duckdns.org:2096";

// 🔐 هدرهای حساس Base64 شده
const _RM_HDRS = new Set([
  "aG9zdA==", "Y29ubmVjdGlvbg==", "a2VlcC1hbGl2ZQ==",
  "cHJveHktYXV0aGVudGljYXRl", "cHJveHktYXV0aG9yaXphdGlvbg==",
  "dGU=", "dHJhaWxlcg==", "dHJhbnNmZXItZW5jb2Rpbmc=",
  "dXBncmFkZQ==", "Zm9yd2FyZGVk",
  "eC1mb3J3YXJkZWQtaG9zdA==", "eC1mb3J3YXJkZWQtcHJvdG8=", "eC1mb3J3YXJkZWQtcG9ydA=="
]);

const _b64 = s => Buffer.from(s, "base64").toString("utf8");

export default async function _h(req, res) {
  if (!TARGET_BASE) return res.statusCode = 500, res.end("API call error");

  try {
    const _url = TARGET_BASE + req.url;
    const _hdrs = {};
    let _cip = null;

    for (const _k of Object.keys(req.headers)) {
      const _lk = _k.toLowerCase();
      const _v = req.headers[_k];

      if (_RM_HDRS.has(Buffer.from(_lk).toString("base64"))) continue;
      if (_lk.startsWith("eC12ZXJjZWwt")) continue;
      if (_lk === "eC1yZWFsLWlw") { _cip = _v; continue; }
      if (_lk === "eC1mb3J3YXJkZWQtZm9y") { if (!_cip) _cip = _v; continue; }

      _hdrs[_lk] = Array.isArray(_v) ? _v.join(", ") : _v;
    }

    if (_cip) _hdrs["x-forwarded-for"] = _cip;

    const _m = req.method;
    const _hasBody = _m !== "GET" && _m !== "HEAD";

    const _opts = {
      method: _m,
      headers: _hdrs,
      redirect: "manual",
      agent: new https.Agent({ rejectUnauthorized: false })
    };
    if (_hasBody) _opts.body = req;

    let _resp;
    try { _resp = await fetch(_url, _opts); }
    catch (_e) { 
      console.error("API call error:", _e);
      if (!res.headersSent) res.statusCode = 502, res.end("API call error");
      return;
    }

    res.statusCode = _resp.status;
    for (const [_hk, _hv] of _resp.headers) {
      if (_b64(_hk) === "dHJhbnNmZXItZW5jb2Rpbmc=") continue;
      try { res.setHeader(_hk, _hv); } catch {}
    }

    if (_resp.body) {
      try { await _P(_R.from(_resp.body), res); }
      catch (_pipeErr) {
        console.error("API call error:", _pipeErr);
        if (!res.headersSent) res.statusCode = 502, res.end("API call error");
      }
    } else res.end();

  } catch (_e) {
    console.error("API call error:", _e);
    if (!res.headersSent) res.statusCode = 502, res.end("API call error");
  }
}
