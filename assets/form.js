const form=document.getElementById('sheet'),
status=document.getElementById('status'),
key='veyra-vestige-concept-v1',
labels={
  player:'ชื่อผู้เล่น',
  name:'ชื่อตัวละครปัจจุบัน',
  pronoun:'สรรพนาม',
  look:'รูปลักษณ์',
  personality:'นิสัย',
  combat:'แนวทางต่อสู้',
  abilities:'สกิล/พลังเริ่มต้น',
  fragment:'เศษความทรงจำ',
  goal:'เป้าหมายหลังตื่นขึ้น',
  boundaries:'ขอบเขตเนื้อเรื่อง (ส่วนตัวสำหรับ GM)'
}
;
function data(){
  return Object.fromEntries([...new FormData(form).entries()])
}
try{
  const saved=JSON.parse(localStorage.getItem(key)||'{}');
  Object.entries(saved).forEach(([k,
  v])=>{
    if(form.elements[k])form.elements[k].value=v
  }
  )
}
catch(e){
}
form.addEventListener('input',
()=>{
  try{
    localStorage.setItem(key,
    JSON.stringify(data()))
  }
  catch(e){
    status.textContent='เบราว์เซอร์นี้ไม่อนุญาตให้บันทึกข้อมูลอัตโนมัติ โปรดดาวน์โหลดไฟล์แทน'
  }
}
);
form.addEventListener('reset',
()=>{
  localStorage.removeItem(key);
  status.textContent='ล้างข้อมูลแล้ว'
}
);
document.getElementById('save').onclick=()=>{
  const payload={
    project:'VEYRA',
    type:'Vestige Character Concept',
    version:'0.1',
    ...data()
  }
  ,
  blob=new Blob([JSON.stringify(payload,
  null,
  2)],
  {
    type:'application/json;charset=utf-8'
  }
  ),
  url=URL.createObjectURL(blob),
  a=document.createElement('a');
  a.href=url;
  a.download='Vestige_'+(payload.name||'Concept').replace(/[^\p{L}\p{N}_-]/gu,
  '_')+'.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),
  1000);
  status.textContent='สร้างไฟล์ JSON สำหรับส่งให้ GM แล้ว'
}
;
document.getElementById('copy').onclick=async()=>{
  const t='VEYRA — VESTIGE CONCEPT\n\n'+Object.entries(data()).map(([k,
  v])=>`${labels[k]||k}:\n${v||'ไม่ระบุ'}`).join('\n\n');
  try{
    await navigator.clipboard.writeText(t);
    status.textContent='คัดลอกข้อมูลแล้ว (รวมช่องส่วนตัวสำหรับ GM ด้วย)'
  }
  catch(e){
    const box=document.createElement('textarea');
    box.value=t;
    document.body.append(box);
    box.select();
    document.execCommand('copy');
    box.remove();
    status.textContent='คัดลอกข้อมูลแล้ว'
  }
}
;
document.getElementById('print').onclick=()=>window.print();
