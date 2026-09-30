import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument,degrees,rgb } from 'pdf-lib';
import { unzipSync } from 'fflate';
import { processFiles,parsePages } from '../src/pdfTools.js';
async function fixture(widths=[100,200,300],angle=0){const d=await PDFDocument.create();for(const w of widths){const p=d.addPage([w,400]);p.drawRectangle({x:10,y:10,width:30,height:30,color:rgb(1,0,0)});p.setRotation(degrees(angle));}return new File([await d.save()],'sample.pdf');}
const load=async r=>PDFDocument.load(r.bytes);
test('merge preserves file and page order',async()=>{const d=await load(await processFiles('merge',[await fixture([101,102]),await fixture([103])]));assert.deepEqual(d.getPages().map(p=>p.getWidth()),[101,102,103]);});
test('extract preserves selected order including duplicates',async()=>{const d=await load(await processFiles('extract',[await fixture()],{pages:'3, 1-2, 1'}));assert.deepEqual(d.getPages().map(p=>p.getWidth()),[300,100,200,100]);});
test('delete rejects deleting every page',async()=>{const file=await fixture();assert.equal((await load(await processFiles('delete',[file],{pages:'2'}))).getPageCount(),2);await assert.rejects(()=>processFiles('delete',[file],{pages:'1-3'}),/최소/);});
test('rotation applies only selected pages and adds to existing rotation',async()=>{const d=await load(await processFiles('rotate',[await fixture([100,200],90)],{pages:'2',angle:270}));assert.deepEqual(d.getPages().map(p=>p.getRotation().angle),[90,0]);});
test('range validation rejects invalid and out of bounds selections',()=>{for(const v of ['','0','4','3-1','abc','1,,2'])assert.throws(()=>parsePages(v,3));assert.deepEqual(parsePages('1-2,3',3),[0,1,2]);});
test('A4 size handles rotated pages in every orientation',async()=>{for(const angle of [0,90,180,270]){const d=await load(await processFiles('resize',[await fixture([200],angle)],{orientation:'auto'}));const p=d.getPage(0);assert.ok(Math.abs(p.getWidth()-(angle%180?841.8898:595.2756))<.01);assert.ok(Math.abs(p.getHeight()-(angle%180?595.2756:841.8898))<.01);}});
test('batch resize returns ZIP with distinct names and valid PDFs',async()=>{const r=await processFiles('resize',[await fixture(),await fixture()]);assert.match(r.name,/\.zip$/);const entries=Object.values(unzipSync(r.bytes));assert.equal(entries.length,2);for(const bytes of entries)assert.equal((await PDFDocument.load(bytes)).getPageCount(),3);});
test('PNG images become A4 pages',async()=>{const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');const d=await load(await processFiles('images',[new File([png],'one.png'),new File([png],'two.png')]));assert.equal(d.getPageCount(),2);assert.ok(Math.abs(d.getPage(0).getWidth()-595.2756)<.01);});
test('invalid PDF rejects without creating a result',async()=>{await assert.rejects(()=>processFiles('merge',[new File(['not pdf'],'bad.pdf')]));});
test('A4 preserves blank pages',async()=>{const d=await PDFDocument.create();d.addPage([300,400]);const r=await processFiles('resize',[new File([await d.save()],'blank.pdf')]);assert.equal((await load(r)).getPageCount(),1);});
