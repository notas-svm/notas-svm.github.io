let notas=[],docs=[];
const q=document.getElementById('q'),topq=document.getElementById('topq'),lista=document.getElementById('lista-notas'),nores=document.getElementById('searchEmpty'),count=document.getElementById('count');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function norm(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function section(title,html){return html?`<div class="wide"><h4>${title}</h4><p>${html}</p></div>`:''}
function render(n){
 const pills=n.categorias.map(x=>`<span class="pill">${esc(x)}</span>`).join('')+`<span class="pill warn">${esc(n.status)}</span>`;
 const resumo=n.resumo.map(x=>`<p>${esc(x)}</p>`).join('');
 const pontos=(n.pontos||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 const tags=(n.tags||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('');
 const extra=n.extraLink?`<a class="secondary" target="_blank" rel="noopener" href="${esc(n.extraLink.url)}">${esc(n.extraLink.rotulo)}</a>`:'';
 const flow=n.fluxograma?`<div class="flow"><h4>${esc(n.fluxograma.titulo)}</h4><p>${esc(n.fluxograma.texto)}</p><iframe loading="lazy" title="${esc(n.fluxograma.titulo)}" src="${esc(n.fluxograma.url)}"></iframe></div>`:'';
 return `<div class="panel doc" id="${esc(n.id)}" data-search="${esc(n.search)}">
 <div class="doc-top"><div class="doc-meta">${pills}</div><h3>${esc(n.titulo)}</h3>
 <p class="sub"><b>${esc(n.identificador)}</b> · ${esc(n.linha)}<br>${esc(n.descricao)}</p>
 <div class="doc-actions"><button class="primary summary-btn" onclick="toggleSummary('${esc(n.id)}')">Resumo da Nota</button><button class="secondary detail-btn" onclick="toggleDoc('${esc(n.id)}')">Ver cadastro completo</button><a class="secondary" target="_blank" rel="noopener" href="${esc(n.documento)}">Consultar documento oficial</a>${extra}</div></div>
 <div class="doc-summary"><h4>Resumo da Nota</h4>${resumo}</div>
 <div class="doc-detail"><div class="detail-grid">
 <div><h4>Identificação</h4><p>${n.identificacao}</p></div><div><h4>Classificação</h4><p>${n.classificacao}</p></div>
 <div><h4>Pontos principais</h4><ul>${pontos}</ul></div><div><h4>Controle de versão</h4><p>${n.versao}</p></div>
 ${section('Conteúdo e anexos',n.conteudo)}
 <div class="wide"><h4>Tags para busca</h4><div class="tags">${tags}</div></div>
 ${section('Documentos relacionados',n.relacionados)}${flow}
 ${section('Possível impacto na prática',n.impacto)}${section('Dúvidas / informações não determinadas',n.duvidas)}
 </div></div></div>`;
}
async function init(){
 try{
   const r=await fetch('dados/notas.json',{cache:'no-store'}); if(!r.ok)throw new Error('HTTP '+r.status);
   notas=await r.json();
   notas.sort((a,b)=>{
     const partes=s=>String(s||'').split('-').map(Number);
     const chave=s=>{
       const [ano=0,mes=0,dia=0]=partes(s);
       return (ano*10000)+(mes*100)+dia;
     };
     return chave(b.dataOrdenacao)-chave(a.dataOrdenacao);
   });
   lista.innerHTML=notas.map(render).join(''); docs=[...document.querySelectorAll('.doc')]; updateCount(docs.length);
 }catch(e){lista.innerHTML='<div class="panel"><b>Não foi possível carregar o acervo.</b><p>Verifique se o arquivo dados/notas.json foi publicado corretamente.</p></div>';console.error(e)}
}
function updateCount(n){count.textContent=n+(n===1?' documento cadastrado':' documentos cadastrados')}
function filterDocs(v){
 v=(v??'').trim();
 const terms=norm(v).split(/\s+/).filter(Boolean);
 let shown=0;
 docs.forEach(doc=>{
   const hay=norm(doc.dataset.search+' '+doc.textContent);
   const ok=!terms.length||terms.every(t=>hay.includes(t));
   doc.style.display=ok?'block':'none';
   if(ok)shown++;
 });
 nores.style.display=shown?'none':'block';
 updateCount(shown);
}
function runSearch(v){
 v=(v??q.value??topq.value??'').trim();
 q.value=v;
 topq.value=v;
 filterDocs(v);
 document.getElementById('biblioteca').scrollIntoView({behavior:'smooth'});
}
function toggleSummary(id){const d=document.getElementById(id);d.classList.toggle('summary-open');d.querySelector('.summary-btn').textContent=d.classList.contains('summary-open')?'Fechar resumo':'Resumo da Nota'}
function toggleDoc(id){const d=document.getElementById(id);d.classList.toggle('open');d.querySelector('.detail-btn').textContent=d.classList.contains('open')?'Fechar cadastro':'Ver cadastro completo'}
[q,topq].forEach(el=>{
  el.addEventListener('keydown',e=>{if(e.key==='Enter')runSearch(el.value)});
  el.addEventListener('input',()=>{
    const v=el.value;
    const other=el===q?topq:q;
    other.value=v;
    filterDocs(v);
  });
});
document.querySelectorAll('[data-query]').forEach(el=>el.onclick=()=>runSearch(el.dataset.query));
document.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>document.getElementById(el.dataset.go).scrollIntoView({behavior:'smooth'}));
init();