import t from "axios";
import a from "./token";
import e from "./api";
let handleSessionExpiration = (t) => {
    if (
      t.response &&
      t.response.data &&
      401 === t.response.data.response &&
      !1 === t.response.data.status &&
      "Session expired. Please log in again." === t.response.data.message
    )
      return (
        console.error(t.response.data.message),
        setTimeout(() => {
          localStorage.removeItem("admin"), window.location.reload();
        }, 2e3),
        { sessionExpired: !0, message: "Session expired. Please log-in again." }
      );
    throw t;
  },
  GET = async (o, n) => {
    var i = {
      method: "get",
      maxBodyLength: 1 / 0,
      url: `${e}/${n}`,
      headers: { Authorization: a(o) },
    };
    try {
      let s = await t(i);
      return s.data;
    } catch (d) {
      console.log(d)
    }
  },
  ADD = async (r, o, n) => {
    var i = {
      method: "post",
      maxBodyLength: 1 / 0,
      url: `${e}/${o}`,
      headers: { Authorization: a(r), "Content-Type": "multipart/form-data" },
      data: n,
    };
    try {
      let s = await t(i);
      return s.data;
    } catch (d) {
      return handleSessionExpiration(d);
    }
  },
  ADDMulti = async (e, r, o) => {
    var n = {
      method: "post",
      maxBodyLength: 1 / 0,
      url: r,
      headers: { Authorization: a(e), "Content-Type": "multipart/form-data" },
      data: o,
    };
    try {
      let i = await t(n);
      return i.data;
    } catch (s) {
      return handleSessionExpiration(s);
    }
  },
  UPDATE = async (r, o, n) => {
    var i = {
      method: "post",
      maxBodyLength: 1 / 0,
      url: `${e}/${o}`,
      headers: { Authorization: a(r), "Content-Type": "multipart/form-data" },
      data: n,
    };
    try {
      let s = await t(i);
      return s.data;
    } catch (d) {
      return handleSessionExpiration(d);
    }
  },
  DELETE = async (r, o, n) => {
    var i = {
      method: "post",
      maxBodyLength: 1 / 0,
      url: `${e}/${o}`,
      headers: { Authorization: a(r), "Content-Type": "application/json" },
      data: n,
    };
    try {
      let s = await t(i);
      return s.data;
    } catch (d) {
      return handleSessionExpiration(d);
    }
  },
  UPLOAD = async (e, r, o) => {
    var n = {
      method: "post",
      maxBodyLength: 1 / 0,
      url: r,
      headers: { Authorization: a(e), "Content-Type": "multipart/form-data" },
      data: o,
    };
    try {
      let i = await t(n);
      return i.data;
    } catch (s) {
      return handleSessionExpiration(s);
    }
  };
export { GET, ADD, DELETE, UPDATE, UPLOAD, ADDMulti };
