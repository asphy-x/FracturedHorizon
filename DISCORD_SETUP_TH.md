# ตั้งค่าส่ง Character Concept เข้า Discord (GM เท่านั้น)

## การทำงาน
- ผู้เล่นกดปุ่ม **ดาวน์โหลด JSON**, **คัดลอกข้อความ**, หรือ **พิมพ์/บันทึก PDF**
- หากติ๊กยินยอม ระบบจะส่งข้อมูล Concept Sheet เข้า Discord เพิ่มเติมโดยอัตโนมัติ
- ข้อมูล `boundaries` **จะไม่ถูกส่ง** เข้า Discord; แต่จะอยู่ในไฟล์ JSON/ข้อความ/PDF ของผู้เล่นตามเดิม
- ฟังก์ชันส่ง Discord ต้องใช้เว็บไซต์ที่โฮสต์จริง เช่น GitHub Pages; การเปิดจาก `file://` ไม่มี Origin ที่ได้รับอนุญาต
- หากไม่ยินยอมหรือยังไม่ตั้งค่า Worker ปุ่มทั้งสามยังทำงานแบบเดิม

## ตั้งค่า Cloudflare Worker (ครั้งเดียว)
1. สร้าง **Private Text Channel** บน Discord ให้มีเฉพาะ GM หรือคนที่ได้รับอนุญาตเข้าได้
2. ใน Discord: **Edit Channel > Integrations > Webhooks > New Webhook** แล้วคัดลอก URL
3. สร้าง Cloudflare Worker แล้วใช้ไฟล์ `discord-worker/worker.js` (หรือ deploy ผ่าน Wrangler ในโฟลเดอร์ `discord-worker`)
4. ตั้งค่า Worker **Secrets**: `DISCORD_WEBHOOK_URL` = Discord Webhook URL (อย่าใส่ใน GitHub)
5. ตั้งค่า Worker **Variables**: `ALLOWED_ORIGIN` = Origin ของเว็บคุณ เช่น `https://username.github.io` (ไม่ใส่ path `/repo`)
6. Deploy Worker แล้วนำ URL Worker เช่น `https://fractured-horizon-vestige-submissions.<account>.workers.dev` ใส่ใน `assets/discord-config.js`
7. อัปโหลดเว็บไซต์ขึ้น GitHub Pages แล้วทดสอบติ๊กยินยอม + ดาวน์โหลด JSON ตรวจว่ามีข้อความใน Discord

> **สำคัญ:** Cloudflare Worker endpoint เป็นสาธารณะ ถึงตรวจ `Origin` ก็ไม่ใช่ระบบยืนยันตัวตนและยังมีโอกาสถูกสแปมได้ หากแชร์วงกว้างควรเพิ่ม Cloudflare WAF Rate Limiting และ Turnstile ตรวจสอบ bot ก่อนใช้จริง

**ห้าม** ใส่ Webhook URL โดยตรงใน HTML/JS/GitHub Pages หรือส่งข้อมูลความลับของผู้เล่นลงห้องสาธารณะ

## ต้องแก้ตรงไหนบ้าง
- `assets/discord-config.js` — ใส่ URL ของ Worker เท่านั้น
- `discord-worker/worker.js` — โค้ดเซิร์ฟเวอร์ตัวกลาง
- `assets/form.js` — ฟังก์ชันส่ง Discord และระบบบันทึกสามปุ่ม
- `character-form.html` — กล่องขอความยินยอม

## สถานะ
ยัง **ไม่สามารถส่ง Discord จริงได้** จนกว่า GM จะตั้งค่า Worker URL และ Secret เอง
