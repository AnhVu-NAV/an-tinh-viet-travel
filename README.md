# An Tịnh Việt — Spiritual Travel (Next.js + Prisma + PostgreSQL)

Website du lịch trải nghiệm chữa lành: tours, locations, courses, booking, discount code, review.

## Tech Stack

- **Next.js (App Router)** + React
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- TailwindCSS UI
- Deployed as Next.js server (API Routes inside `/app/api`)

---

## 1) Setup & Run

### Requirements
- Node.js >= 18
- PostgreSQL >= 14

### Install
```bash
npm install
````

### Environment

Tạo file `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
```

### Prisma

```bash
npx prisma generate
npx prisma migrate dev
# optional: npx prisma db seed
```

### Run dev

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## 2) Prisma Schema Notes

Các bảng chính:

* `Tour`, `Location`, `Schedule`
* `Booking` (liên kết `Tour`, `Schedule`, optional `User`)
* `Discount` (mã giảm giá)
* `Review`
* `Course`

Booking có thể **guest** (`userId` nullable) nhưng vẫn lưu:

* `contactName`, `contactEmail`, `contactPhone`

**Quan trọng**

* `@default(cuid())` cho các `id` để tránh lỗi “Argument id is missing”.

---

## 3) Routing (App Router)

Ví dụ cấu trúc:

```
app/
  tours/
    [id]/page.tsx
  locations/
    page.tsx
    [slug]/page.tsx          # location detail (slug hoặc id)
  courses/
    page.tsx
    [id]/page.tsx
  booking/
    [tourSlug]/page.tsx
  api/
    tours/
      [id]/route.ts
    locations/
      route.ts
      [slug]/route.ts
    courses/
      route.ts
      [id]/route.ts
    discounts/
      validate/route.ts
    bookings/
      route.ts
      cancel/route.ts
      history/route.ts
```

> Bạn có thể dùng `[slug]` cho locations/tours nếu bạn lưu thêm field `slug` trong DB và set `@unique`.

---

## 4) API Endpoints

### 4.1 Tours detail (format chuẩn cho Tour Detail + Booking Page)

`GET /api/tours/[id]`

Response (format giống bạn đang dùng):

```json
{
  "tour": {
    "id": "t1",
    "title": { "vi": "...", "en": "..." },
    "description": { "vi": "...", "en": "..." },
    "introduction": { "vi": "...", "en": "..." },
    "meaning": { "vi": "...", "en": "..." },
    "price_vnd": 1250000,
    "duration_days": 2,
    "level": "light",
    "suitable_for": { "vi": "...", "en": "..." },
    "locations": ["l1","l2"],
    "images": ["..."],
    "schedule": [
      { "id": "s1", "startDate": "2026-03-01", "slots": 20, "slotsLeft": 10 }
    ]
  },
  "locations": [
    { "id": "l1", "region": "...", "type": "...", "name": { "vi": "...", "en": "..." } }
  ]
}
```

### 4.2 Validate discount

`POST /api/discounts/validate`

Body:

```json
{ "code": "SPRING10" }
```

Response:

```json
{
  "valid": true,
  "code": "SPRING10",
  "percent": 10
}
```

Nếu invalid / hết lượt / hết hạn:

```json
{ "valid": false, "message": "Code usage limit reached" }
```

### 4.3 Create booking (Transaction: create + update slotsLeft + update usedCount)

`POST /api/bookings`

Body:

```json
{
  "tourId": "t1",
  "scheduleId": "s1",
  "guests": 2,
  "currency": "VND",
  "contactName": "Nguyen Van A",
  "contactEmail": "a@gmail.com",
  "contactPhone": "0123456789",
  "discountCode": "SPRING10"
}
```

Server will:

* Check schedule exists + slotsLeft đủ
* Get tour price
* Validate discount (nếu có)
* Compute totalPrice
* **Transaction**

    * decrement `Schedule.slotsLeft`
    * increment `Discount.usedCount` (nếu có)
    * create `Booking`

Response:

```json
{ "booking": { "...": "..." } }
```

### 4.4 Cancel booking (restore slotsLeft)

`POST /api/bookings/cancel`

Body:

```json
{ "bookingId": "bk_xxx" }
```

Server will:

* Transaction:

    * update booking status -> `CANCELLED`
    * increment schedule slotsLeft (+ guests)
    * (optional) decrement discount usedCount nếu muốn “refund lượt dùng”

### 4.5 Booking history (Profile)

`GET /api/bookings/history?email=a@gmail.com`
hoặc nếu bạn có auth userId:
`GET /api/bookings/history?userId=...`

Response:

```json
{
  "bookings": [
    {
      "id": "...",
      "status": "PAID",
      "date": "...",
      "guests": 2,
      "totalPrice": 5700000,
      "tour": { "id":"t1", "titleVi":"...", "titleEn":"...", "images":["..."] },
      "schedule": { "id":"s1", "startDate":"..." }
    }
  ]
}
```

---

## 5) Frontend Data Flow

### Tour Detail page

* fetch `GET /api/tours/[id]`
* render tour + schedule list
* CTA: link tới `/booking/[tourSlugOrId]`

### Booking page

Step 1: chọn schedule + guests
Step 2:

* nhập contact info (name/email/phone)
* Apply discount:

    * call `POST /api/discounts/validate`
* Confirm booking:

    * call `POST /api/bookings`
      Step 3: success UI

> Nếu UI đang ra `NaN`, thường do:
>
> * percent undefined (API trả valid=false nhưng FE vẫn tính)
> * totalPrice string/undefined
> * discountAmount tính từ `undefined * ...`

---

## 6) Common Errors & Fix

### Prisma: `Argument id is missing`

Nguyên nhân: Model `id String @id` nhưng **không có** `@default(cuid())` và bạn không truyền `id` khi create.

Fix:

* thêm `@default(cuid())` vào schema
* `npx prisma migrate dev`

### Slug route nhưng đọc `params.id`

App Router `[slug]` thì param là `params.slug`, không phải `params.id`.

Fix:

```ts
const slug = params.slug;
```

---

## 7) Scripts

```bash
npm run dev
npm run build
npm run start
npx prisma studio
```

---

## 8) TODO / Improvements

* Add Auth (NextAuth / custom JWT)
* Payment gateway thật (VNPay/MoMo)
* Admin dashboard CRUD Tours/Locations/Schedules
* Reviews + Only allow review if booking COMPLETED
* Rate limiting for discount validation

