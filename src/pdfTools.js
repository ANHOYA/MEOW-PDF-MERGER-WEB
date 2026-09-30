import { PDFDocument, degrees } from 'pdf-lib';
import { zipSync } from 'fflate';
import { mergePdfs } from './pdfMerger.js';
export function parsePages(value, count) {
 if (!value.trim()) throw new Error('페이지 번호를 입력해 주세요. 예: 1-3, 5');
 const result=[];
 for (const item of value.split(',')) {
  const match=item.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!match) throw new Error('페이지 형식을 확인해 주세요. 예: 1-3, 5');
  const start=Number(match[1]), end=Number(match[2]||match[1]);
  if(start<1 || end>count || start>count || end<1 || end<start) throw new Error(`페이지는 1~${count} 범위의 오름차순 구간으로 입력해 주세요.`);
  if(result.length+end-start+1>10000) throw new Error('한 번에 최대 10,000페이지를 선택할 수 있습니다.');
  for(let i=start;i<=end;i++) result.push(i-1);
 }
 if(result.length>10000) throw new Error('한 번에 최대 10,000페이지를 선택할 수 있습니다.');
 return result;
}
export async function processFiles(type, files, options={}) {
 const read = async f => new Uint8Array(await f.arrayBuffer());
 const load = async f => PDFDocument.load(await read(f));
 const output = await PDFDocument.create();
 if(type==='duplex') {
  if(files.length!==2) throw new Error('앞면 PDF와 뒷면 PDF, 두 파일이 필요합니다.');
  return {bytes:await mergePdfs(await read(files[0]),await read(files[1]),options), name:'meow-duplex.pdf'};
 }
 if(type==='resize') {
  const results=[];
  for(let f=0; f<files.length; f++) {
   const source=await load(files[f]), target=await PDFDocument.create();
   // Flatten form appearances before embedding; links and editable fields are not retained.
   source.getForm().flatten();
   for(const page of source.getPages()) {
    const crop=page.getCropBox();
    if(crop.width<=0||crop.height<=0) throw new Error('페이지 크기가 올바르지 않습니다.');
    const angle=((page.getRotation().angle%360)+360)%360;
    const sideways=angle===90||angle===270;
    const w=sideways?crop.height:crop.width, h=sideways?crop.width:crop.height;
    const landscape=options.orientation==='landscape'||(options.orientation==='auto'&&w>h);
    const [tw,th]=landscape?[841.8898,595.2756]:[595.2756,841.8898];
    const margin=Number(options.margin||0), s=Math.min((tw-2*margin)/w,(th-2*margin)/h);
    const x=(tw-w*s)/2,y=(th-h*s)/2;
    const offsets={0:[0,0],90:[0,crop.width*s],180:[crop.width*s,crop.height*s],270:[crop.height*s,0]};
    const [dx,dy]=offsets[angle]||[0,0];
    const targetPage=target.addPage([tw,th]);
    if(!page.node.Contents()) continue;
    const embedded=await target.embedPage(page,{left:crop.x,bottom:crop.y,right:crop.x+crop.width,top:crop.y+crop.height});
    targetPage.drawPage(embedded,{x:x+dx,y:y+dy,xScale:s,yScale:s,rotate:degrees(-angle)});
   }
   results.push({name:`${f+1}-${files[f].name.replace(/\.pdf$/i,'').replace(/[\\/\x00-\x1f]/g,'_')}-A4.pdf`, bytes:await target.save()});
  }
  if(results.length===1) return results[0];
  return {name:'meow-A4.zip',bytes:zipSync(Object.fromEntries(results.map(r=>[r.name,r.bytes])),{level:0})};
 }
 if(type==='images') {
  for(const file of files) {
   const bytes=await read(file);
   const img=bytes[0]===137?await output.embedPng(bytes):await output.embedJpg(bytes);
   const page=output.addPage([595.2756,841.8898]);
   const scale=Math.min(555.2756/img.width,801.8898/img.height);
   page.drawImage(img,{x:(595.2756-img.width*scale)/2,y:(841.8898-img.height*scale)/2,width:img.width*scale,height:img.height*scale});
  }
 } else if(type==='merge') {
  for(const file of files) {const doc=await load(file);(await output.copyPages(doc,doc.getPageIndices())).forEach(p=>output.addPage(p));}
 } else {
  if(files.length!==1) throw new Error('이 도구는 PDF 한 파일씩 처리합니다.');
  const doc=await load(files[0]);
  const selected=type==='rotate'&&!options.pages.trim()?doc.getPageIndices():parsePages(options.pages,doc.getPageCount());
  const indices=type==='extract'?selected:type==='delete'?doc.getPageIndices().filter(i=>!selected.includes(i)):doc.getPageIndices();
  if(!indices.length) throw new Error('최소 한 페이지는 남겨 주세요.');
  const pages=await output.copyPages(doc,indices);
  pages.forEach((page,i)=>{if(type==='rotate'&&selected.includes(i)) page.setRotation(degrees((page.getRotation().angle+Number(options.angle))%360));output.addPage(page);});
 }
 if(!output.getPageCount()) throw new Error('처리할 페이지가 없습니다.');
 return {bytes:await output.save(), name:`meow-${type}.pdf`};
}
