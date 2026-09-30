import { test,expect } from '@playwright/test';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fs from 'node:fs/promises';
async function pdf(name,count=2){const d=await PDFDocument.create();for(let i=0;i<count;i++){const p=d.addPage([300,400]);p.drawText(`Page ${i+1}`,{x:20,y:330,size:25});}return {name,mimeType:'application/pdf',buffer:Buffer.from(await d.save())};}
test('merge, preview, download, clear and no outbound document requests',async({page})=>{
 const requests=[],errors=[];page.on('request',r=>requests.push({url:r.url(),method:r.method()}));page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('#files').setInputFiles([await pdf('first.pdf'),await pdf('second.pdf',1)]);await page.locator('#run').click();await expect(page.locator('#status')).toContainText('총 3페이지');await expect(page.locator('#preview canvas')).toHaveCount(3);
 const wait=page.waitForEvent('download');await page.locator('#download').click();const download=await wait;const doc=await PDFDocument.load(await fs.readFile(await download.path()));expect(doc.getPageCount()).toBe(3);
 expect(requests.filter(r=>r.method!=='GET'||!r.url.startsWith('http://127.0.0.1:4317/'))).toEqual([]);expect(errors).toEqual([]);
 await page.locator('#clear').click();await expect(page.locator('.file-row')).toHaveCount(0);await expect(page.locator('#download')).toBeHidden();
});
test('tools process and options invalidate stale results',async({page})=>{
 for(const type of ['extract','delete','rotate','resize','duplex']){
  await page.goto(`/tools/${type}/`);await page.locator('#files').setInputFiles(type==='duplex'?[await pdf('front.pdf'),await pdf('back.pdf')]:[await pdf('sample.pdf')]);
  if(['extract','delete'].includes(type))await page.locator('#pages').fill('1');
  await page.locator('#run').click();await expect(page.locator('#download')).toBeVisible();await expect(page.locator('#run')).toBeEnabled();
  if(type==='rotate'){await page.locator('#angle').selectOption('180');await expect(page.locator('#download')).toBeHidden();}
 }
});
test('mobile layout, crawlable routes, metadata and screenshot',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'docs/mobile.png',fullPage:true});
 const links=await page.locator('a[href^="/"]').evaluateAll(as=>[...new Set(as.map(a=>a.getAttribute('href').split('#')[0]).filter(Boolean))]);
 for(const link of links){const response=await page.request.get(link);expect(response.status(),link).toBe(200);}
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:'docs/desktop.png',fullPage:true});
 await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://meow-pdf-merger-web.vercel.app/');
});
test('A4 transformed page keeps all colored corners visible',async({page})=>{
 const d=await PDFDocument.create();for(const angle of [0,90,180,270]){const p=d.addPage([300,400]);p.setCropBox(20,30,260,340);p.setRotation(degrees(angle));for(const [x,y]of [[25,35],[265,35],[25,355],[265,355]])p.drawRectangle({x,y,width:10,height:10,color:rgb(1,0,0)});}
 await page.goto('/tools/resize/');await page.locator('#files').setInputFiles({name:'corners.pdf',mimeType:'application/pdf',buffer:Buffer.from(await d.save())});await page.locator('#run').click();await expect(page.locator('#status')).toContainText('총 4페이지');
 const counts=await page.locator('#preview canvas').evaluateAll(canvases=>canvases.map(c=>{const {data}=c.getContext('2d').getImageData(0,0,c.width,c.height);let n=0;for(let i=0;i<data.length;i+=4)if(data[i]>180&&data[i+1]<80&&data[i+2]<80)n++;return n;}));expect(counts).toHaveLength(4);for(const count of counts)expect(count).toBeGreaterThan(45);
});
