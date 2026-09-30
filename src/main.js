import './style.css';
const workspace=document.querySelector('[data-tool]');
if(workspace) init(workspace.dataset.tool);
function init(type){
 const $=id=>document.getElementById(id);
 let files=[],busy=false,resultUrl=null,revision=0;
 const status=(message,error=false)=>{$('status').textContent=message;$('status').dataset.error=String(error);};
 function invalidate(){revision++;if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=null;$('download').hidden=true;$('download').removeAttribute('href');$('preview').replaceChildren();}
 function render(){
  $('file-list').replaceChildren();
  files.forEach((file,i)=>{
   const row=document.createElement('div');row.className='file-row';
   const info=document.createElement('div');info.className='file-info';
   const name=document.createElement('strong');name.textContent=`${i+1}. ${file.name}`;
   const size=document.createElement('small');size.textContent=`${(file.size/1024/1024).toFixed(2)} MB${type==='duplex'?(i===0?' · 앞면':' · 뒷면'):''}`;info.append(name,size);row.append(info);
   for(const [label,text,disabled,action] of [['위로 이동','↑',i===0,()=>[files[i-1],files[i]]=[files[i],files[i-1]]],['아래로 이동','↓',i===files.length-1,()=>[files[i+1],files[i]]=[files[i],files[i+1]]],['삭제','×',false,()=>files.splice(i,1)]]){
    const btn=document.createElement('button');btn.textContent=text;btn.setAttribute('aria-label',`${file.name} ${label}`);btn.disabled=busy||disabled;btn.onclick=()=>{action();invalidate();render();status('파일 목록이 변경되었습니다.');};row.append(btn);
   }
   $('file-list').append(row);
  });
  $('run').disabled=busy||!files.length||(type==='duplex'&&files.length!==2)||(type==='merge'&&files.length<2);
  $('clear').disabled=busy||!files.length;$('choose').disabled=busy;$('files').disabled=busy;
  workspace.querySelectorAll('.options input,.options select').forEach(e=>e.disabled=busy);
 }
 function add(incoming){
  if(busy)return;
  invalidate();
  const pattern=type==='images'?/\.(jpe?g|png)$/i:/\.pdf$/i;
  const list=Array.from(incoming);
  if(list.some(f=>!pattern.test(f.name))){status(type==='images'?'JPG 또는 PNG 이미지만 선택해 주세요.':'PDF 파일만 선택해 주세요.',true);return;}
  const next=[...files,...list];
  if((['extract','delete','rotate'].includes(type)&&next.length>1)||(type==='duplex'&&next.length>2)){status(type==='duplex'?'앞면과 뒷면 PDF 두 파일만 선택해 주세요.':'먼저 목록을 지운 뒤 PDF 한 파일을 선택해 주세요.',true);return;}
  // Practical memory guard, not a paid quota.
  if(next.reduce((sum,f)=>sum+f.size,0)>200*1024*1024){status('안정적인 처리를 위해 한 번에 총 200 MB 이하로 나누어 주세요.',true);return;}
  files=next;render();status(type==='merge'&&files.length===1?'병합할 PDF를 하나 더 선택해 주세요.':`${files.length}개 파일 선택됨 · 순서와 옵션을 확인하세요.`);
 }
 $('choose').onclick=()=>$('files').click();$('files').onchange=e=>{add(e.target.files);e.target.value='';};
 const zone=$('dropzone');for(const event of ['dragenter','dragover'])zone.addEventListener(event,e=>{e.preventDefault();if(!busy)zone.classList.add('dragging');});
 for(const event of ['dragleave','drop'])zone.addEventListener(event,e=>{e.preventDefault();zone.classList.remove('dragging');});
 zone.addEventListener('drop',e=>add(e.dataTransfer.files));
 window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>e.preventDefault());
 $('clear').onclick=()=>{files=[];invalidate();render();status('모든 파일과 결과를 지웠습니다.');};
 workspace.querySelectorAll('.options input,.options select').forEach(el=>el.addEventListener('input',()=>{invalidate();status('옵션이 변경되었습니다. 다시 실행해 주세요.');}));
 $('run').onclick=async()=>{
  if(busy)return;busy=true;invalidate();const token=revision;render();status('내 기기에서 처리 중입니다…');workspace.setAttribute('aria-busy','true');
  try{
   const {processFiles}=await import('./pdfTools.js');
   const result=await processFiles(type,files,{pages:$('pages')?.value||'',angle:$('angle')?.value||90,orientation:$('orientation')?.value||'auto',margin:$('margin')?.value||0,evenOrder:$('even-order')?.value||'reverse',rotateEven:$('rotate-even')?.checked||false});
   if(token!==revision)return;
   const zip=result.name.endsWith('.zip');resultUrl=URL.createObjectURL(new Blob([result.bytes],{type:zip?'application/zip':'application/pdf'}));
   $('download').href=resultUrl;$('download').download=result.name;$('download').hidden=false;
   status(zip?'완료! 변환된 PDF들을 ZIP으로 다운로드하세요.':'완료! 결과를 다운로드할 수 있습니다. 미리보기를 준비합니다…');
   if(!zip){
    try{const {renderPreview}=await import('./pdfPreview.js');const r=await renderPreview(result.bytes.slice(),$('preview'),{maxHeight:180,maxPages:6,shouldCancel:()=>token!==revision});status(`완료 · 총 ${r.totalPages}페이지${r.totalPages>6?' · 처음 6페이지 미리보기':''}. 결과를 다운로드하세요.`);}
    catch{status('파일 생성 완료. 미리보기를 표시할 수 없지만 결과를 다운로드할 수 있습니다.');}
   }
  }catch(error){status(/encrypt|password/i.test(error.message)?'암호화된 PDF는 지원하지 않습니다. 암호가 없는 원본을 선택해 주세요.':`처리하지 못했습니다. ${/페이지|파일|범위|형식/.test(error.message)?error.message:'파일 손상 또는 지원하지 않는 형식일 수 있습니다. 다른 파일로 시도해 주세요.'}`,true);}
  finally{busy=false;workspace.removeAttribute('aria-busy');render();}
 };
 window.addEventListener('pagehide',()=>{if(resultUrl)URL.revokeObjectURL(resultUrl);});render();
}
