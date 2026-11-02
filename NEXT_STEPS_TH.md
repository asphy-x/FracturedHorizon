# เชื่อม Discord แบบปลอดภัย — FRACTURED HORIZON v1.2

**สำคัญ: Webhook ที่แชร์ผ่านแชตแล้วควรถูกลบ (Delete Webhook) และสร้างใหม่ก่อนใช้งาน** ผู้ที่มี URL สามารถโพสต์ข้อความไปยังห้อง Discord ได้ ห้ามใส่ URL นี้ใน HTML, JavaScript, หรือ GitHub Repository

## ขั้นตอนครั้งเดียว
1. เข้า Discord > ห้องส่วนตัว GM > Edit Channel > Integrations > Webhooks; ลบ Webhook เดิมที่เคยแชร์แล้วสร้าง Webhook ใหม่
2. เข้า Cloudflare Dashboard > Workers & Pages > Create Worker แล้วนำโค้ด `discord-worker/worker.js` ไปใช้ หรือใช้ Wrangler จากโฟลเดอร์ `discord-worker` ตามขั้นตอนด้านล่าง
3. Cloudflare Worker > Settings > Variables and Secrets > Add **Secret** ชื่อ `DISCORD_WEBHOOK_URL` แล้ววาง Webhook ใหม่ไว้ตรงนี้เท่านั้น (ห้ามแปะใน GitHub)
4. เพิ่ม **Text Variable** `ALLOWED_ORIGIN` เท่ากับ origin ที่ถูกต้องของ GitHub Pages เช่น `https://username.github.io` (ไม่ใส่ `/repo/`)
5. กด Deploy แล้วคัดลอก URL Worker ที่ลงท้ายด้วย `.workers.dev`
6. เปิด `assets/discord-config.js` เปลี่ยนค่าว่างให้เป็น Worker URL (ไม่ใช่ Discord Webhook!)
7. อัปโหลดเว็บไซต์ไป GitHub Pages แล้วลองกรอก Concept Sheet; ติ๊กยินยอมส่ง Discord และกดปุ่มบันทึก ทดสอบว่ามี Embed ปรากฏในห้อง GM

## ถ้าติดตั้ง Wrangler ผ่าน npm
```bash
cd discord-worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put DISCORD_WEBHOOK_URL
```
กรอก URL ใหม่ในคำสั่งสุดท้าย โดยอย่าใส่ secret ในคำสั่งหรือโค้ดบน GitHub ส่วน `ALLOWED_ORIGIN` ตั้งค่าผ่าน Cloudflare Dashboard

## ความปลอดภัยและข้อจำกัด
- GitHub Pages เป็นเว็บสาธารณะ จึงเก็บความลับไม่ปลอดภัย
- ระบบตรวจ Origin เป็นเพียงตัวช่วย CORS ไม่ใช่ระบบยืนยันตัวตน ต้องเพิ่มการจำกัดคำขอ/ป้องกันสแปมหากเปิดใช้งานในวงกว้าง
- ช่อง `boundaries` ไม่ถูกส่งไป Discord โดยอัตโนมัติ
- เพลงประกอบยังต้องใช้ไฟล์ของคุณเอง `assets/audio/bgm.mp3` และ `form.mp3`
- ไม่มีการเชื่อมต่อ Discord จริงจนกว่า Worker จะถูก Deploy และตั้ง Secret + Worker URL สำเร็จ
