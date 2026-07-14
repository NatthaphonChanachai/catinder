/**
 * One-time setup: create admin Firebase Auth account + set role in Firestore.
 * Run with: node scripts/create-admin.mjs
 */

const API_KEY     = "AIzaSyAsI2iAszx2Idrk5j1Dj2jIgq1YR7CIsRA";
const PROJECT_ID  = "catinder-d4c54";
const EMAIL       = "admin.catinder@gmail.com";
const PASSWORD    = "admin1234";

const AUTH_BASE = "https://identitytoolkit.googleapis.com/v1/accounts";
const FS_BASE   = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw Object.assign(new Error(json.error?.message ?? "unknown"), { code: json.error?.message });
  return json;
}

async function patch(url, body, idToken) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? "Firestore write failed");
  return json;
}

// Firestore document field format
function fsDoc(fields) {
  const mapped = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === "string")  mapped[k] = { stringValue: v };
    else if (typeof v === "boolean") mapped[k] = { booleanValue: v };
    else if (typeof v === "number")  mapped[k] = { integerValue: String(v) };
    else mapped[k] = { nullValue: null };
  }
  return { fields: mapped };
}

(async () => {
  let uid, idToken;

  // 1. Try sign-up; fall back to sign-in if account already exists
  try {
    console.log("⏳ สร้าง Firebase Auth account...");
    const data = await post(`${AUTH_BASE}:signUp?key=${API_KEY}`, {
      email: EMAIL, password: PASSWORD, returnSecureToken: true,
    });
    uid      = data.localId;
    idToken  = data.idToken;
    console.log(`✅ สร้าง account สำเร็จ (uid: ${uid})`);
  } catch (err) {
    if (err.code?.includes("EMAIL_EXISTS")) {
      console.log("ℹ️  account มีอยู่แล้ว — กำลัง sign in...");
      const data = await post(`${AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
        email: EMAIL, password: PASSWORD, returnSecureToken: true,
      });
      uid     = data.localId;
      idToken = data.idToken;
      console.log(`✅ sign in สำเร็จ (uid: ${uid})`);
    } else {
      throw err;
    }
  }

  // 2. Write users/{uid} with role: admin
  console.log("⏳ เขียน Firestore users document...");
  const docUrl = `${FS_BASE}/users/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=email&updateMask.fieldPaths=displayName`;
  await patch(docUrl, fsDoc({
    email:       EMAIL,
    displayName: "Admin",
    role:        "admin",
  }), idToken);

  console.log(`✅ เสร็จแล้ว! users/${uid} ถูก set role = 'admin'`);
  console.log(`\n📧 Email:    ${EMAIL}`);
  console.log(`🔑 Password: ${PASSWORD}`);
  console.log(`🆔 UID:      ${uid}`);
})().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
