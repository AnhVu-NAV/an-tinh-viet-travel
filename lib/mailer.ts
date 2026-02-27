// lib/mailer.ts
import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

function mustEnv(name: string) {
    const v = process.env[name];
    console.log(name, v);
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function getResend() {
    const key = process.env.RESEND_API_KEY;
    console.log(key);
    if (!key) return null;
    return new Resend(key);
}


export type BookingEmailPayload = {
    language: "vi" | "en";
    toCustomer: string;
    systemEmail: string;

    bookingId: string;
    tourTitle: string;
    startDateISO: string; // schedule.startDate
    guests: number;
    totalVnd: number;
    discountCode?: string | null;
};

function formatVnd(v: number) {
    try {
        return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
    } catch {
        return `${v} ₫`;
    }
}

function formatDate(iso: string, lang: "vi" | "en") {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
    }).format(d);
}

function customerHtml(p: BookingEmailPayload) {
    const lang = p.language;
    const dateText = formatDate(p.startDateISO, lang);
    const totalText = formatVnd(p.totalVnd);

    const title = lang === "vi" ? "Xác nhận đặt tour" : "Booking Confirmation";
    const subtitle =
        lang === "vi"
            ? "Cảm ơn bạn đã lựa chọn An Tịnh Việt. Đây là thông tin đặt tour của bạn:"
            : "Thank you for choosing An Tinh Viet. Here are your booking details:";

    return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; background:#fdfbf7; padding:24px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e3d5ca;">
      <div style="padding:20px 24px; background:#3a5a40; color:#fff;">
        <div style="font-size:14px; letter-spacing:.08em; text-transform:uppercase; opacity:.9;">An Tịnh Việt</div>
        <div style="font-size:22px; font-weight:800; margin-top:6px;">${title}</div>
      </div>

      <div style="padding:24px;">
        <p style="margin:0 0 12px; color:#344e41; font-size:15px;">${subtitle}</p>

        <div style="background:#f5f2ea; border:1px solid #e3d5ca; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:10px;">
            <div style="color:#2f3e46; font-weight:700;">${
        lang === "vi" ? "Mã đặt chỗ" : "Booking ID"
    }</div>
            <div style="color:#2f3e46; font-family: ui-monospace, SFMono-Regular; font-weight:800;">${p.bookingId}</div>
          </div>

          <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:10px;">
            <div style="color:#2f3e46; font-weight:700;">${
        lang === "vi" ? "Tour" : "Tour"
    }</div>
            <div style="color:#2f3e46; font-weight:700; text-align:right;">${p.tourTitle}</div>
          </div>

          <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:10px;">
            <div style="color:#2f3e46; font-weight:700;">${
        lang === "vi" ? "Ngày khởi hành" : "Departure"
    }</div>
            <div style="color:#2f3e46; text-align:right;">${dateText}</div>
          </div>

          <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:10px;">
            <div style="color:#2f3e46; font-weight:700;">${
        lang === "vi" ? "Số khách" : "Guests"
    }</div>
            <div style="color:#2f3e46; text-align:right;">${p.guests}</div>
          </div>

          ${
        p.discountCode
            ? `<div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:10px;">
                   <div style="color:#2f3e46; font-weight:700;">${
                lang === "vi" ? "Mã giảm giá" : "Discount code"
            }</div>
                   <div style="color:#2f3e46; text-align:right;">${p.discountCode}</div>
                 </div>`
            : ""
    }

          <div style="display:flex; justify-content:space-between; gap:10px; padding-top:10px; border-top:1px solid #e3d5ca;">
            <div style="color:#2f3e46; font-weight:800;">${
        lang === "vi" ? "Tổng thanh toán" : "Total"
    }</div>
            <div style="color:#588157; font-weight:900; font-size:18px; text-align:right;">${totalText}</div>
          </div>
        </div>

        <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">
          ${
        lang === "vi"
            ? "Nếu bạn cần hỗ trợ, hãy trả lời email này hoặc liên hệ hotline của chúng tôi."
            : "If you need support, reply to this email or contact our hotline."
    }
        </p>
      </div>
    </div>
  </div>`;
}

function systemHtml(p: BookingEmailPayload) {
    const dateText = formatDate(p.startDateISO, "vi");
    return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; padding:20px;">
    <h2>New Booking</h2>
    <ul>
      <li><b>BookingID:</b> ${p.bookingId}</li>
      <li><b>Tour:</b> ${p.tourTitle}</li>
      <li><b>Departure:</b> ${dateText}</li>
      <li><b>Guests:</b> ${p.guests}</li>
      <li><b>Total:</b> ${formatVnd(p.totalVnd)}</li>
      <li><b>Customer:</b> ${p.toCustomer}</li>
      <li><b>Discount:</b> ${p.discountCode ?? "-"}</li>
    </ul>
  </div>`;
}

export async function sendBookingEmails(p: BookingEmailPayload) {
    const resend = getResend();
    if (!resend) {
        console.warn("RESEND_API_KEY missing: skip sending booking emails");
        return { ok: true, skipped: true };
    }

    const from = mustEnv("MAIL_FROM");
    const systemEmail = p.systemEmail || mustEnv("BOOKING_NOTIFY_EMAIL");

    await resend.emails.send({
        from,
        to: [p.toCustomer],
        subject:
            p.language === "vi"
                ? `Xác nhận đặt tour #${p.bookingId}`
                : `Booking confirmed #${p.bookingId}`,
        html: customerHtml(p),
    });

    await resend.emails.send({
        from,
        to: [systemEmail],
        subject: `New booking #${p.bookingId}`,
        html: systemHtml({ ...p, systemEmail }),
    });

    return { ok: true, skipped: false };
}