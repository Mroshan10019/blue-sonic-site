
/* Blue Sonic Moving lead capture
   IMPORTANT: replace both placeholders below after creating the Supabase project.
   The public anon key is safe to use in a browser ONLY with RLS policies enabled.
*/
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const PHOTO_BUCKET = "moving-lead-photos";

const hasSupabase = () =>
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

function getLeadSource() {
  const params = new URLSearchParams(location.search);
  const current = {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    gclid: params.get("gclid") || "",
    landing_page: location.pathname,
    referrer: document.referrer || ""
  };
  if (current.utm_source || current.gclid || current.referrer) {
    localStorage.setItem("blueSonicLeadSource", JSON.stringify(current));
  }
  return JSON.parse(localStorage.getItem("blueSonicLeadSource") || JSON.stringify(current));
}

function track(name, params={}) {
  if (typeof gtag === "function") gtag("event", name, params);
}

document.querySelectorAll('a[href^="tel:"]').forEach(a => {
  a.addEventListener("click", () => track("phone_click", {
    phone_number: a.getAttribute("href").replace("tel:", ""),
    page_location: location.href
  }));
});

const form = document.getElementById("movingQuoteForm");
const msg = document.getElementById("formMessage");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-msg";
    msg.textContent = "Sending your request…";
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      if (!hasSupabase()) {
        throw new Error("The quote form backend is not connected yet. Please call 1-844-MR-SONIC.");
      }

      const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const fd = new FormData(form);
      const source = getLeadSource();
      const leadId = crypto.randomUUID();
      const files = [...(document.getElementById("photos").files || [])];

      if (files.length > 6) throw new Error("Please upload no more than 6 photos.");

      const photoPaths = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
        if (file.size > 10 * 1024 * 1024) throw new Error("Each photo must be 10 MB or smaller.");

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${leadId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabaseClient.storage
          .from(PHOTO_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        photoPaths.push(path);
      }

      const payload = {
        id: leadId,
        full_name: fd.get("full_name"),
        phone: fd.get("phone"),
        email: fd.get("email") || null,
        move_date: fd.get("move_date") || null,
        pickup_zip: fd.get("pickup_zip"),
        destination_zip: fd.get("destination_zip"),
        service_type: fd.get("service_type"),
        property_size: fd.get("property_size"),
        details: fd.get("details") || null,
        photo_paths: photoPaths,
        source,
        consent: fd.get("consent") === "on"
      };

      const { error } = await supabaseClient.from("moving_leads").insert(payload);
      if (error) throw error;

      track("generate_lead", {
        service_type: payload.service_type,
        pickup_zip: payload.pickup_zip,
        destination_zip: payload.destination_zip
      });

      msg.className = "form-msg success";
      msg.textContent = "Request received. Blue Sonic will review your move details shortly.";
      form.reset();
    } catch (err) {
      console.error(err);
      msg.className = "form-msg error";
      msg.textContent = err.message || "We couldn't send the form. Please call 1-844-MR-SONIC.";
    } finally {
      submitBtn.disabled = false;
    }
  });
}
