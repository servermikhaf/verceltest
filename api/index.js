import { Readable as _0x1, pipeline as _0x2 } from "node:stream";
const _0x3 = { api: { bodyParser: !1 }, supportsResponseStreaming: !0, maxDuration: 60 };

export const config = _0x3;

// تابع رمزگشایی رشته‌ها
const _0x4 = (s) => Buffer.from(s, "base64").toString("utf8");

// رشته‌های حساس رمزگذاری شده
const _0x5 = (_0x6 = process.env[_0x4("VEJDVEFSX0RPTUFJTg==")] || "").replace(/\/$/, "");
const _0x7 = new Set([
  _0x4("aG9zdA=="), _0x4("Y29ubmVjdGlvbg=="), _0x4("a2VlcC1hbGl2ZQ=="),
  _0x4("cHJveHktYXV0aGVudGljYXRl"), _0x4("cHJveHktYXV0aG9yaXphdGlvbg=="),
  _0x4("dGU="), _0x4("dHJhaWxlcg=="), _0x4("dHJhbnNmZXItZW5jb2Rpbmc="),
  _0x4("dXBncmFkZQ=="), _0x4("Zm9yd2FyZGVk"),
  _0x4("eC1mb3J3YXJkZWQtaG9zdA=="), _0x4("eC1mb3J3YXJkZWQtcHJvdG8="),
  _0x4("eC1mb3J3YXJkZWQtcG9ydA==")
]);

export default async function _0x8(_0x9, _0xa){
    if(!_0x5) return _0xa.statusCode=500, _0xa.end(_0x4("TWlzY29uZmlndXJlZDogQ09ORElUSU9OX0RPTUFJTg=="));
    try{
        const _0xb = _0x5 + _0x9.url, _0xc = {}, _0xd = null;
        let _0xe = null;

        for(const _0xf of Object.keys(_0x9.headers)){
            const _0x10 = _0xf.toLowerCase(), _0x11 = _0x9.headers[_0xf];
            if(_0x7.has(_0x10)) continue;
            if(_0x10.startsWith(_0x4("eC12ZXJjZWwt"))) continue;
            if(_0x10===_0x4("eC1yZWFsLWlw")){_0xe=_0x11; continue;}
            if(_0x10===_0x4("eC1mb3J3YXJkZWQtZm9y")){if(!_0xe)_0xe=_0x11; continue;}
            _0xc[_0x10] = Array.isArray(_0x11)?_0x11.join(", "):_0x11;
        }
        if(_0xe) _0xc[_0x4("eC1mb3J3YXJkZWQtZm9y")] = _0xe;

        const _0x12 = _0x9.method, _0x13 = _0x12!=="GET" && _0x12!=="HEAD";
        const _0x14 = { method:_0x12, headers:_0xc, redirect:"manual" };
        if(_0x13) _0x14.body = _0x1.toWeb(_0x9), _0x14.duplex="half";

        const _0x15 = await fetch(_0xb, _0x14);
        _0xa.statusCode = _0x15.status;
        for(const [_0xf,_0x11] of _0x15.headers)
            if(_0xf.toLowerCase()!==_0x4("dHJhbnNmZXItZW5jb2Rpbmc=")) try{_0xa.setHeader(_0xf,_0x11)}catch{}
        _0x15.body ? await _0x2(_0x1.fromWeb(_0x15.body), _0xa) : _0xa.end();

    }catch(_0x16){
        console.error(_0x4("cmVsYXkgZXJyb3I6"), _0x16);
        if(!_0xa.headersSent) _0xa.statusCode = 502, _0xa.end(_0x4("QmFkIEdhdGV3YXk6IFR1bm5lbCBGYWlsZWQ="));
    }
}
