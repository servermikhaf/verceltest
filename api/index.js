import { Readable as _R } from "node:stream";
import { pipeline as _P } from "node:stream/promises";
import https from "https";

export const config = { api: { bodyParser: false }, supportsResponseStreaming: true, maxDuration: 60 };

// تابع decode Base64
const _b64 = (s) => Buffer.from(s, "base64").toString("utf8");

// 🔑 دامنه مقصد Base64 شده
const _TARGET = _b64("aHR0cHM6Ly9teWRvbWFpbjEwMi5kdWNraWRucy5vcmc6MjA5Ng=="); // https://mydomain102.duckdns.org:2096

const _REMOVE_HEADERS = new Set([
  _b64("aG9zdA=="), _b64("Y29ubmVjdGlvbg=="), _b64("a2VlcC1hbGl2ZQ=="),
  _b64("cHJveHktYXV0aGVudGljYXRl"), _b64("cHJveHktYXV0aG9yaXphdGlvbg=="),
  _b64("dGU="), _b64("dHJhaWxlcg=="), _b64("dHJhbnNmZXItZW5jb2Rpbmc="),
  _b64("dXBncmFkZQ=="), _b64("Zm9yd2FyZGVk"),
  _b64("eC1mb3J3YXJkZWQtaG9zdA=="), _b64("eC1mb3J3YXJkZWQtcHJvdG8="),
  _b64("eC1mb3J3YXJkZWQtcG9ydA==")
]);

export default async function _h(req, res) {
  if (!_TARGET) return res.statusCode = 500, res.end(_b64("Q29uZmlndXJhdGlvbiBlcnJvcg==")); // Config error

  try {
    const _url = _TARGET + req.url;
    const _hdrs = {};
    let _cip = null;

    for (const _k of Object.keys(req.headers)) {
      const _lk = _k.toLowerCase();
      const _v = req.headers[_k];

      if (_REMOVE_HEADERS.has(_lk)) continue;
      if (_lk.startsWith(_b64("eC12ZXJjZWwt"))) continue;
      if (_lk === _b64("eC1yZWFsLWlw")) { _cip = _v; continue; }
      if (_lk === _b64("eC1mb3J3YXJkZWQtZm9y")) { if (!_cip) _cip = _v; continue; }

      _hdrs[_lk] = Array.isArray(_v) ? _v.join(", ") : _v;
    }

    if (_cip) _hdrs[_b64("eC1mb3J3YXJkZWQtZm9y")] = _cip;

    const _m = req.method;
    const _hasBody = _m !== "GET" && _m !== "HEAD";

    const _opts = {
      method: _m,
      headers: _hdrs,
      redirect: "manual",
      agent: new https.Agent({ rejectUnauthorized: false }) // ⚡ bypass SSL errors
    };
    if (_hasBody) _opts.body = req;

    let _resp;
    try {
      _resp = await fetch(_url, _opts);
    } catch (_fetchErr) {
      console.error(_b64("YXBpIGNhbGwgZXJyb3I6"), _fetchErr);
      if (!res.headersSent) res.statusCode = 502, res.end(_b64("QVBJIGNhbGwgZXJyb3I="));
      return;
    }

    res.statusCode = _resp.status;
    for (const [_hk, _hv] of _resp.headers) {
      if (_hk.toLowerCase() === _b64("dHJhbnNmZXItZW5jb2Rpbmc=")) continue;
      try { res.setHeader(_hk, _hv); } catch {}
    }

    if (_resp.body) {
      try {
        await _P(_R.from(_resp.body), res);
      } catch (_pipeErr) {
        console.error(_b64("YXBpIGNhbGwgZXJyb3I="), _pipeErr);
        if (!res.headersSent) res.statusCode = 502, res.end(_b64("QVBJIGNhbGwgZXJyb3I="));
      }
    } else {
      res.end();
    }

  } catch (_e) {
    console.error(_b64("YXBpIGNhbGwgZXJyb3I="), _e);
    if (!res.headersSent) res.statusCode = 502, res.end(_b64("QVBJIGNhbGwgZXJyb3I="));
  }
}
