// api/verify-license.js
// Vercel Serverless Function (Node runtime)

export default async function handler(req, res) {
  // CORS (safe for your own frontend domain; "*" is fine for MVP)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { licenseKey, increment } = req.body || {};

    if (!licenseKey || typeof licenseKey !== "string") {
      return res.status(400).json({ ok: false, error: "Missing licenseKey" });
    }

    const productId = process.env.GUMROAD_PRODUCT_ID;
    if (!productId) {
      return res
        .status(500)
        .json({ ok: false, error: "Missing GUMROAD_PRODUCT_ID on server" });
    }

    const body = new URLSearchParams();
    body.append("product_id", productId);
    body.append("license_key", licenseKey.trim());
    body.append("increment_uses_count", String(!!increment));

    const resp = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      body,
    });

    const data = await resp.json();

    if (!data?.success) {
      return res.status(401).json({
        ok: false,
        error: data?.message || "Invalid license key",
      });
    }

    return res.status(200).json({
      ok: true,
      uses: data?.uses ?? null,
    });
  } catch (err) {
    console.error("verify-license error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
