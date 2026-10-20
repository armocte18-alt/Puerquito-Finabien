var e=document.getElementById(`app`)?.dataset.api??`/api`,t=class extends Error{constructor(e,t){super(e),this.estado=t}};async function n(n,r,i){let a;try{a=await fetch(`${e}/${r}`,{method:n,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:i?JSON.stringify(i):void 0})}catch{throw new t(`No hay conexión con el servidor. Revisa la red del stand.`,0)}let o=await a.json().catch(()=>({}));if(a.ok)return o;throw a.status===422&&o.errors?new t(Object.values(o.errors)[0][0],422):a.status===429?new t(`Demasiados intentos seguidos. Espera un minuto y vuelve a intentarlo.`,429):a.status===404?new t(`No encontramos lo que buscabas. Intenta de nuevo.`,404):new t(`Algo falló en el servidor. Intenta de nuevo o avisa al personal del stand.`,a.status)}var r={configuracion:()=>n(`GET`,`configuracion`),ranking:()=>n(`GET`,`ranking`),registrar:e=>n(`POST`,`jugadores`,e),jugador:e=>n(`GET`,`jugadores/${encodeURIComponent(e)}`),iniciar:(e,t)=>n(`POST`,`jugadores/${encodeURIComponent(e)}/partidas`,{juego:t}),responder:(e,t)=>n(`POST`,`partidas/${e}/respuestas`,t),terminar:(e,t={})=>n(`POST`,`partidas/${e}/terminar`,t),canjear:(e,t)=>n(`POST`,`jugadores/${encodeURIComponent(e)}/canjes`,{premio:t})},i=null,a=!0;try{a=localStorage.getItem(`reto-sonido`)!==`no`}catch{}function o(e,t=.12,n=`triangle`,r=.18){if(a)try{i??=new(window.AudioContext||window.webkitAudioContext),i.state===`suspended`&&i.resume();let a=i.currentTime;for(let o of e){let e=i.createOscillator(),s=i.createGain();e.type=n,e.frequency.value=o,s.gain.setValueAtTime(r,a),s.gain.exponentialRampToValueAtTime(.001,a+t),e.connect(s).connect(i.destination),e.start(a),e.stop(a+t),a+=t*.8}}catch{}}var s={get activo(){return a},alternar(){a=!a;try{localStorage.setItem(`reto-sonido`,a?`si`:`no`)}catch{}return a},toque:()=>o([660],.05,`sine`,.08),bien:()=>o([660,880],.12),mal:()=>o([300,220],.16,`sawtooth`,.08),voltea:()=>o([520],.06,`sine`,.07),premio:()=>o([523,659,784,1047],.14),fin:()=>o([784,659,880,1047],.16)},c={cerdito:`🐷`,buho:`🦉`,abeja:`🐝`,zorro:`🦊`,tortuga:`🐢`,rana:`🐸`,leon:`🦁`,pulpo:`🐙`},l={ninos:`g-ninos`,jovenes:`g-jovenes`,adultos:`g-adultos`};function u(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function d(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}var f=e=>Number(e||0).toLocaleString(`es-MX`),p=(e,t=``)=>`<span class="puntos ${t}"><span class="moneda" aria-hidden="true"></span>${f(e)}<span class="sr">&nbsp;pts</span></span>`;function m(e,t){let n=t?.getBoundingClientRect?.()??{left:innerWidth/2,top:innerHeight/2,width:0},r=document.createElement(`div`);r.className=`flota`,r.textContent=e,r.style.left=`${n.left+n.width/2-30}px`,r.style.top=`${n.top}px`,document.body.append(r),setTimeout(()=>r.remove(),950)}var h=e=>new Promise(t=>setTimeout(t,e)),g=e=>`$${f(Math.round(e))}`;async function _(e,t=()=>!0){let n=document.createElement(`div`);n.className=`cuenta-regresiva`,n.setAttribute(`aria-live`,`assertive`),e.append(n);for(let e of[`3`,`2`,`1`,`¡Ya!`]){if(!t())break;n.textContent=e,n.classList.remove(`late`),n.offsetWidth,n.classList.add(`late`),await h(e===`¡Ya!`?450:700)}return n.remove(),t()}function v(e,t=``){return e?`
        <div class="cierre-finabien ${e.imagen?`con-imagen`:``}">
            ${e.imagen?`<img class="tarjeta-img" src="${t}/img/${u(e.imagen)}" alt="Tarjeta FINABIEN" onerror="this.hidden=true">`:``}
            <p class="etiqueta">Así te ayuda FINABIEN</p>
            <h3>${u(e.titulo)}</h3>
            <ul>${e.puntos.map(e=>`<li>${u(e)}</li>`).join(``)}</ul>
            ${e.nota?`<small>${u(e.nota)}</small>`:``}
        </div>`:``}var y=[`QWERTYUIOP`,`ASDFGHJKLÑ`,`ZXCVBNM`],b=[`23456789`,`ABCDEFGHJK`,`MNPQRSTUVW`,`XYZ`];function x({modo:e=`letras`}={}){return`<div class="teclado" role="group" aria-label="Teclado">${(e===`codigo`?b:y).map(e=>`<div class="fila">${[...e].map(e=>`<button type="button" class="tecla" data-tecla="${u(e)}">${u(e)}</button>`).join(``)}</div>`).join(``)}${e===`codigo`?`<div class="fila"><button type="button" class="tecla borrar" data-tecla="borrar">⌫ Borrar</button></div>`:`<div class="fila"><button type="button" class="tecla ancha" data-tecla=" ">Espacio</button><button type="button" class="tecla borrar" data-tecla="borrar">⌫ Borrar</button></div>`}</div>`}function S(e,t,{max:n=20,alCambiar:r}={}){e.querySelector(`.teclado`)?.addEventListener(`click`,e=>{let i=e.target.closest(`[data-tecla]`);if(!i)return;s.toque();let a=i.dataset.tecla,o=t.value;if(a===`borrar`)o=o.slice(0,-1);else if(o.length<n){let e=o.length===0||o.endsWith(` `);o+=t.dataset.modo===`codigo`||e?a:a.toLowerCase()}t.value=o.replace(/\s{2,}/g,` `).replace(/^\s/,``),r?.(t.value)}),t.addEventListener(`input`,()=>r?.(t.value))}function C(e){let{datos:t,raiz:n}=e,i=t.items,a=t.segundos*1e3,o=[],c=[],l=0,d=0,f=0,p=0,h=!1,g=!1;function _(){let t=i[l];n.innerHTML=`
            ${e.cabecera(d)}
            <div class="trivia">
                <div class="barra">
                    <div class="progreso-dots" aria-hidden="true">${i.map((e,t)=>`<span class="${o[t]??(t===l?`actual`:``)}"></span>`).join(``)}</div>
                    <span class="empuja etiqueta">Pregunta ${l+1} de ${i.length}</span>
                </div>
                <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
                <p class="pregunta">${u(t.enunciado)}</p>
                <div class="opciones ${t.opciones.length===3?`tres`:``}">
                    ${t.opciones.map((e,t)=>`<button class="opcion" data-op="${t}"><span class="letra">${`ABCD`[t]}</span><span>${u(e)}</span></button>`).join(``)}
                </div>
                <div class="retro-slot" aria-live="polite"></div>
            </div>`,n.querySelector(`.opciones`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-op]`);t&&v(Number(t.dataset.op),t)}),g=!1,f=performance.now();let r=n.querySelector(`.tiempo`),s=r.firstElementChild,c=e=>{if(h||g)return;let t=Math.max(0,1-(e-f)/a);s.style.transform=`scaleX(${t})`,r.classList.toggle(`urgente`,t<.25),t<=0?v(null,null):p=requestAnimationFrame(c)};p=requestAnimationFrame(c)}async function v(a,_){if(g||h)return;g=!0,cancelAnimationFrame(p);let v=Math.round(performance.now()-f),b=i[l],x=n.querySelector(`.opciones`);x.classList.add(`bloqueadas`),_?.classList.add(`apagada`);let S;try{S=await r.responder(t.partida,{item:b.id,respuesta:a,ms:v})}catch(t){e.aviso(t.message),S={acierto:!1,correcta:null,puntos_item:0,puntos:d,explicacion:null}}if(h)return;let C=[...x.querySelectorAll(`.opcion`)];C.forEach((e,t)=>{e.classList.remove(`apagada`),t===S.correcta?e.classList.add(`correcta`):t===a?e.classList.add(`incorrecta`):e.classList.add(`apagada`)}),d=S.puntos,e.marcador(d),o[l]=S.acierto?`ok`:`no`,S.acierto?(s.bien(),m(`+${S.puntos_item}`,C[S.correcta])):(s.mal(),c.push({titulo:b.enunciado,texto:S.correcta==null?``:`Respuesta: ${b.opciones[S.correcta]}`}));let w=l===i.length-1,T=S.acierto?`¡Correcto!`:a===null?`¡Se acabó el tiempo!`:`Casi…`;n.querySelector(`.retro-slot`).innerHTML=`
            <div class="panel retro ${S.acierto?``:`mal`}">
                <div class="titulo">${T}</div>
                ${S.explicacion?`<p>${u(S.explicacion)}</p>`:`<p></p>`}
                <button class="btn btn-xl" data-sig>${w?`Ver mi resultado`:`Siguiente`}</button>
            </div>`;let E=n.querySelector(`[data-sig]`);E.focus(),E.addEventListener(`click`,y,{once:!0})}async function y(){if(l<i.length-1)l++,_();else{h=!0;try{let n=await r.terminar(t.partida);e.alTerminar(n,c)}catch(t){e.aviso(t.message),e.salir()}}}return _(),()=>{h=!0,cancelAnimationFrame(p)}}function w(e){let{datos:t,raiz:n}=e,{a:i,b:a}=t.etiquetas,o=t.segundos*1e3,c=[...t.items],l=[],d=0,f=!1,p=!1,g=0;n.innerHTML=`
        ${e.cabecera(d)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="clasifica">
            <button class="cubeta a" data-cat="a">← ${u(i)}<small>Toca aquí o usa la flecha izquierda</small></button>
            <div class="tarjeta-central" aria-live="polite"></div>
            <button class="cubeta b" data-cat="b">${u(a)} →<small>Toca aquí o usa la flecha derecha</small></button>
        </div>
        <p class="pista-teclas"><span data-restan></span></p>`;let _=n.querySelector(`.tarjeta-central`),v=n.querySelector(`[data-restan]`);function y(){let e=c[0];_.className=`tarjeta-central llega`,_.innerHTML=`<span class="emoji" aria-hidden="true">${u(e.icono??``)}</span><span class="texto">${u(e.texto)}</span>`,v.textContent=`${c.length} ${c.length===1?`tarjeta restante`:`tarjetas restantes`}`}async function b(o){if(f||p||!c.length)return;f=!0;let u=c[0],g=n.querySelector(`.cubeta.${o}`);g.classList.add(`pulso`),setTimeout(()=>g.classList.remove(`pulso`),180);let v;try{v=await r.responder(t.partida,{item:u.id,respuesta:o})}catch(t){if(t.estado===422)return x();e.aviso(t.message),f=!1;return}p||(d=v.puntos,e.marcador(d),_.insertAdjacentHTML(`beforeend`,`<span class="sello ${v.acierto?`ok`:`no`}">${v.acierto?`¡Bien!`:`Ups`}</span>`),v.acierto?(s.bien(),m(`+${v.puntos_item}`,_)):(s.mal(),l.push({titulo:u.texto,texto:`Era: ${v.correcta===`a`?i:a}${v.explicacion?`. ${v.explicacion}`:``}`})),await h(v.acierto?250:650),_.classList.add(o===`a`?`va-a`:`va-b`),await h(240),c.shift(),f=!1,c.length?y():x())}async function x(){if(!p){p=!0,cancelAnimationFrame(g),removeEventListener(`keydown`,S);try{let n=await r.terminar(t.partida);e.alTerminar(n,l)}catch(t){e.aviso(t.message),e.salir()}}}function S(e){e.key===`ArrowLeft`&&b(`a`),e.key===`ArrowRight`&&b(`b`)}n.querySelector(`.clasifica`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-cat]`);t&&b(t.dataset.cat)}),addEventListener(`keydown`,S);let C=n.querySelector(`.tiempo`),w=C.firstElementChild,T=performance.now(),E=e=>{if(p)return;let t=Math.max(0,1-(e-T)/o);w.style.transform=`scaleX(${t})`,C.classList.toggle(`urgente`,t<.2),t<=0?x():g=requestAnimationFrame(E)};return g=requestAnimationFrame(E),y(),()=>{p=!0,cancelAnimationFrame(g),removeEventListener(`keydown`,S)}}function T(e){let{datos:t,raiz:n}=e,i=t.items.every(e=>e.termino===e.definicion),a=d(t.items.flatMap(e=>[{par:e.id,tipo:`t`,p:e},{par:e.id,tipo:`d`,p:e}])),o=[],c=0,l=0,f=!1,p=!1,m=Date.now(),g=0,_=({tipo:e,p:t})=>e===`t`||i?`<div class="cara frente"><span class="emoji" aria-hidden="true">${u(t.icono??``)}</span><span class="t">${u(t.termino)}</span></div>`:`<div class="cara frente def"><span class="d">${u(t.definicion)}</span></div>`;n.innerHTML=`
        ${e.cabecera(null,`<span data-mov>0 movimientos</span> · <span data-seg>0:00</span>`)}
        <p class="pista-teclas">${i?`Encuentra los pares de dibujos iguales.`:`Une cada palabra con su significado.`}</p>
        <div class="memorama">
            ${a.map((e,t)=>`<button class="carta" data-k="${t}" aria-label="Carta ${t+1}"><div class="cara dorso"></div>${_(e)}</button>`).join(``)}
        </div>`;let v=n.querySelector(`[data-mov]`),y=n.querySelector(`[data-seg]`);g=setInterval(()=>{let e=Math.floor((Date.now()-m)/1e3);y.textContent=`${Math.floor(e/60)}:${String(e%60).padStart(2,`0`)}`},500),n.querySelector(`.memorama`).addEventListener(`click`,async e=>{let n=e.target.closest(`.carta`);if(!n||f||p||n.classList.contains(`volteada`)||(s.voltea(),n.classList.add(`volteada`),o.push(n),o.length<2))return;c++,v.textContent=`${c} ${c===1?`movimiento`:`movimientos`}`;let[r,i]=o;o=[],a[r.dataset.k].par===a[i.dataset.k].par?(r.classList.add(`hecha`),i.classList.add(`hecha`),s.bien(),l++,l===t.items.length&&b()):(f=!0,await h(500),r.classList.add(`sacude`),i.classList.add(`sacude`),await h(650),r.classList.remove(`volteada`,`sacude`),i.classList.remove(`volteada`,`sacude`),f=!1)});async function b(){p=!0,clearInterval(g),s.fin();let n=Date.now()-m;n<9e3&&await h(9e3-n),await h(700);try{let n=await r.terminar(t.partida,{movimientos:c,segundos:Math.round((Date.now()-m)/1e3)});e.alTerminar(n,[])}catch(t){e.aviso(t.message),e.salir()}}return()=>{p=!0,clearInterval(g)}}var E=.13,D=.055;function O(e){let{datos:t,raiz:n}=e,{piezas:i}=t,a=t.segundos*1e3,o=[...t.items].sort((e,t)=>e.t-t.t),c=[],l=[],d=[],f=1,p=t.dolares,h=!1,g=0,v=0;n.innerHTML=`
        ${e.cabecera(null,`<span data-dolares></span>`)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="ruta" aria-hidden="true">
            <span>🏙️ Estados Unidos</span>
            <div class="ruta-linea"><i data-avance></i></div>
            <span>México 🏡</span>
        </div>
        <div class="remesa" aria-label="Camino de la remesa: toca un carril o usa las flechas arriba y abajo">
            <div class="carril"></div><div class="carril"></div><div class="carril"></div>
            <div class="tarjeta-fb" data-tarjeta><img src="${t.tarjeta}" alt="Tarjeta FINABIEN"></div>
        </div>
        <p class="evento-linea" data-evento aria-live="polite">Junta lo que suma y esquiva lo que le quita valor a tu envío.</p>`;let y=n.querySelector(`.remesa`),b=n.querySelector(`[data-tarjeta]`),x=n.querySelector(`[data-dolares]`),S=n.querySelector(`[data-evento]`),C=n.querySelector(`[data-avance]`),w=n.querySelector(`.tiempo`),T=w.firstElementChild,O=e=>`${e*33.333+16.666}%`,k=()=>{x.textContent=`$${p} USD en camino`};function A(e){h||(f=Math.max(0,Math.min(2,e)),b.style.top=O(f))}function j(e){let t=i[e.tipo],n=document.createElement(`div`);n.className=`pieza ${t.bueno?`buena`:`mala`}`,n.style.top=O(e.carril),n.innerHTML=`<span class="emoji" aria-hidden="true">${u(t.icono)}</span><span class="corto">${u(t.corto)}</span>`,y.append(n),c.push({item:e,el:n,hecho:!1})}function M(e){e.hecho=!0;let t=i[e.item.tipo];t.bueno?(l.push(e.item.id),p+=t.valor,s.bien(),e.el.classList.add(`recogida`),m(t.corto,b),S.textContent=`${t.icono} ${t.texto}: +$${t.valor}`):(d.push(e.item.id),p=Math.max(0,p-t.valor),s.mal(),e.el.classList.add(`golpe`),b.classList.remove(`sacudida`),b.offsetWidth,b.classList.add(`sacudida`),S.textContent=`${t.icono} ${t.texto}: −$${t.valor}`),S.classList.toggle(`mal`,!t.bueno),k()}function N(e){if(h)return;let n=e-v;for(;o.length&&o[0].t<=n;)j(o.shift());for(let e=c.length-1;e>=0;e--){let r=c[e],i=1-(n-r.item.t)/t.viaje_ms*.87;r.el.style.left=`${i*100}%`,!r.hecho&&r.item.carril===f&&Math.abs(i-E)<D&&M(r),i<-.08&&(r.el.remove(),c.splice(e,1))}let r=Math.min(1,n/a);C.style.width=`${r*100}%`,T.style.transform=`scaleX(${1-r})`,w.classList.toggle(`urgente`,r>.8),r>=1?P():g=requestAnimationFrame(N)}async function P(){if(!h){h=!0,cancelAnimationFrame(g),removeEventListener(`keydown`,F),b.classList.add(`llega`);try{let n=await r.terminar(t.partida,{recogidos:l,golpes:d}),i=n.detalle;e.alTerminar(n,[],{titulo:`¡Tu remesa llegó a México!`,html:`
                    <div class="cifras">
                        <div><small>Enviaste</small><b>$${i.enviados} USD</b></div>
                        <div class="${i.llegaron>=i.enviados?`bien`:`mal`}"><small>Llegaron a tu familia</small><b>$${i.llegaron} USD</b></div>
                    </div>
                    <p>${n.aciertos} beneficios recogidos · ${n.errores} cobros que te alcanzaron</p>`,cierre:t.cierre})}catch(t){e.aviso(t.message),e.salir()}}}function F(e){(e.key===`ArrowUp`||e.key===`w`)&&(e.preventDefault(),A(f-1)),(e.key===`ArrowDown`||e.key===`s`)&&(e.preventDefault(),A(f+1))}return y.addEventListener(`pointerdown`,e=>{let t=y.getBoundingClientRect();A(Math.floor((e.clientY-t.top)/t.height*3))}),addEventListener(`keydown`,F),k(),A(1),_(y,()=>!h).then(e=>{e&&(v=performance.now(),g=requestAnimationFrame(N))}),()=>{h=!0,cancelAnimationFrame(g),removeEventListener(`keydown`,F)}}var k=[`colchon`,`antojo`,`ahorro`],A=[`🌱`,`🌿`,`🪴`,`🌳`];function j(e){let{datos:t,raiz:n}=e,i=t.segundos*1e3,a=t.segundos/t.segundos_por_anio,o=[...t.items].sort((e,t)=>e.t-t.t),c=t.items.reduce((e,t)=>e+(t.valor??0),0)||1,l={},d=[],f=0,p=0,h=null,v=0,y=!1,b=0,x=0;n.innerHTML=`
        ${e.cabecera(null,`Año <b data-anio>1</b> de `+a)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="cosecha">
            <div class="ingreso-zona" data-zona aria-live="polite">
                <p class="pista-teclas">Cada vez que te llegue dinero, elige a dónde va.</p>
            </div>
            <div class="macetas">
                ${k.map((e,n)=>{let r=t.destinos[e];return`
                    <button class="maceta m-${e}" data-d="${e}">
                        <span class="emoji" aria-hidden="true" ${e===`ahorro`?`data-planta`:``}>${u(r.icono)}</span>
                        <b>${u(r.nombre)}</b>
                        <small>${u(r.ayuda)}</small>
                        <span class="monto" data-m="${e}">$0</span>
                        <kbd aria-hidden="true">${n+1}</kbd>
                    </button>`}).join(``)}
            </div>
        </div>`;let S=n.querySelector(`[data-zona]`),C=n.querySelector(`[data-anio]`),w=n.querySelector(`[data-planta]`),T=e=>n.querySelector(`[data-m="${e}"]`),E=e=>n.querySelector(`.maceta[data-d="${e}"]`),D=n.querySelector(`.tiempo`),O=D.firstElementChild,j=e=>d.reduce((n,r)=>n+r.valor*(1+t.tasa_anual)**((e-r.t)/1e3/t.segundos_por_anio),0);function M(e,n){h=e,v=n+t.vida_ms,S.innerHTML=`
            <div class="ingreso" style="--vida:${t.vida_ms}ms">
                <span class="moneda" aria-hidden="true"></span>
                <b>+${g(e.valor)}</b>
                <span>${u(e.texto)}</span>
                <i class="vida" aria-hidden="true"></i>
            </div>`}function N(){let n=f*t.perdida_colchon;f-=n,T(`colchon`).textContent=g(f),n>0&&(s.mal(),E(`colchon`).classList.add(`sacude`),setTimeout(()=>E(`colchon`).classList.remove(`sacude`),500)),e.aviso(`${t.aviso_perdida}${n>0?` (−${g(n)})`:``}`)}function P(e){if(!h||y)return;let t=h;h=null,l[t.id]=e;let n=E(e);n.classList.add(`pulso`),setTimeout(()=>n.classList.remove(`pulso`),180),e===`ahorro`?(d.push({valor:t.valor,t:t.t}),s.bien()):e===`colchon`?(f+=t.valor,T(`colchon`).textContent=g(f),s.toque()):(p+=t.valor,T(`antojo`).textContent=g(p),s.voltea()),m(`+${g(t.valor)}`,n),S.querySelector(`.ingreso`)?.classList.add(`va-${e}`)}function F(e){if(y)return;let n=e-x;for(h&&n>=v&&(h=null,S.innerHTML=`<p class="se-fue">🐜 Se fue en gastos hormiga</p>`);o.length&&o[0].t<=n;){let e=o.shift();e.tipo===`perdida`?N():M(e,n)}let r=j(Math.min(n,i));T(`ahorro`).textContent=g(r),w.textContent=A[Math.min(A.length-1,Math.floor(r/c*A.length))],C.textContent=Math.min(a,Math.floor(n/1e3/t.segundos_por_anio)+1);let s=Math.max(0,1-n/i);O.style.transform=`scaleX(${s})`,D.classList.toggle(`urgente`,s<.2),s<=0?I():b=requestAnimationFrame(F)}async function I(){if(!y){y=!0,cancelAnimationFrame(b),removeEventListener(`keydown`,L);try{let n=await r.terminar(t.partida,{decisiones:l}),i=n.detalle,o=(e,t,n,r=``)=>`
                <div class="fila-comp ${e}">
                    <span>${t}</span>
                    <div class="barra-progreso"><span style="width:${i.maximo?Math.min(100,n/i.maximo*100):0}%"></span></div>
                    <b>${g(n)}</b>${r?`<small>${r}</small>`:``}
                </div>`;e.alTerminar(n,[],{titulo:i.ahorro>=i.maximo*.8?`¡Cosecha abundante!`:i.ahorro>0?`¡Tu ahorro creció!`:`Tu dinero no creció`,html:`
                    <div class="comparativa">
                        ${o(`c-ahorro`,`🌱 Ahorro formal`,i.ahorro)}
                        ${o(`c-colchon`,`🛏️ Bajo el colchón`,i.colchon,i.perdido?`se perdieron ${g(i.perdido)}`:``)}
                        ${o(`c-antojo`,`🍭 Antojos`,i.antojo,i.antojo?`ya se gastó`:``)}
                    </div>
                    <p>Si todo hubiera ido al ahorro formal, tendrías <strong>${g(i.maximo)}</strong> después de ${a} años.</p>`,cierre:t.cierre})}catch(t){e.aviso(t.message),e.salir()}}}function L(e){let t={1:`colchon`,2:`antojo`,3:`ahorro`,ArrowLeft:`colchon`,ArrowDown:`antojo`,ArrowRight:`ahorro`}[e.key];t&&(e.preventDefault(),P(t))}return n.querySelector(`.macetas`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-d]`);t&&P(t.dataset.d)}),addEventListener(`keydown`,L),_(n.querySelector(`.cosecha`),()=>!y).then(e=>{e&&(x=performance.now(),b=requestAnimationFrame(F))}),()=>{y=!0,cancelAnimationFrame(b),removeEventListener(`keydown`,L)}}function M(e){let{datos:t,raiz:n}=e,{negocio:i}=t,a=t.items,o=[],c=[],l={bienestar:t.inicio_barras,negocio:t.inicio_barras},d=0,f=0,p=!1,h=!1,g=(e,t,n)=>`
        <div class="medidor m-${e}">
            <span class="nombre"><span class="emoji" aria-hidden="true">${t}</span> ${u(n)}</span>
            <div class="barra-progreso" role="meter" aria-label="${u(n)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${l[e]}">
                <span style="width:${l[e]}%"></span>
            </div>
            <b data-valor="${e}">${l[e]}</b>
            <span class="delta" data-delta="${e}"></span>
        </div>`;function _(){let t=a[d];n.innerHTML=`
            ${e.cabecera(f,`${u(i.icono)} ${u(i.nombre)}`)}
            <div class="emprende">
                <div class="medidores">
                    ${g(`bienestar`,`💰`,i.barras[0])}
                    ${g(`negocio`,i.icono,i.barras[1])}
                </div>
                <div class="barra">
                    <div class="progreso-dots" aria-hidden="true">${a.map((e,t)=>`<span class="${o[t]??(t===d?`actual`:``)}"></span>`).join(``)}</div>
                    <span class="empuja etiqueta">Mes ${d+1} de ${a.length}</span>
                </div>
                <div class="dilema">
                    <span class="emoji" aria-hidden="true">${u(t.icono)}</span>
                    <p class="pregunta">${u(t.situacion)}</p>
                </div>
                <div class="opciones">
                    ${t.opciones.map((e,t)=>`<button class="opcion" data-op="${t}"><span class="letra">${`AB`[t]}</span><span>${u(e)}</span></button>`).join(``)}
                </div>
                <div class="retro-slot" aria-live="polite"></div>
            </div>`,n.querySelector(`.opciones`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-op]`);t&&y(Number(t.dataset.op))}),h=!1}function v(e,t,r){l[e]=t;let i=n.querySelector(`.m-${e}`);i.querySelector(`.barra-progreso > span`).style.width=`${t}%`,i.querySelector(`.barra-progreso`).setAttribute(`aria-valuenow`,t),i.querySelector(`[data-valor="${e}"]`).textContent=t;let a=i.querySelector(`[data-delta="${e}"]`);a.textContent=r>0?`+${r}`:r<0?`−${Math.abs(r)}`:`=`,a.className=`delta ${r>0?`sube`:r<0?`baja`:``}`}async function y(i){if(h||p)return;h=!0;let l=a[d],g=n.querySelector(`.opciones`);g.classList.add(`bloqueadas`);let _;try{_=await r.responder(t.partida,{item:l.id,respuesta:i})}catch(t){e.aviso(t.message),g.classList.remove(`bloqueadas`),h=!1;return}if(p)return;let y=[...g.querySelectorAll(`.opcion`)];y.forEach((e,t)=>e.classList.add(t===i?_.acierto?`correcta`:`incorrecta`:t===_.correcta?`correcta`:`apagada`)),v(`bienestar`,_.barras.bienestar,_.delta.bienestar),v(`negocio`,_.barras.negocio,_.delta.negocio),f=_.puntos,e.marcador(f),o[d]=_.acierto?`ok`:`no`,_.acierto?(s.bien(),_.puntos_item&&m(`+${_.puntos_item}`,y[i])):(s.mal(),c.push({titulo:l.situacion,texto:`Mejor opción: ${l.opciones[_.correcta]}. ${_.explicacion}`}));let x=d===a.length-1;n.querySelector(`.retro-slot`).innerHTML=`
            <div class="panel retro ${_.acierto?``:`mal`}">
                <div class="titulo">${_.acierto?`¡Buena decisión!`:`Hay una opción mejor`}</div>
                <p>${u(_.explicacion)}</p>
                <button class="btn btn-xl" data-sig>${x?`Ver cómo terminó tu negocio`:`Siguiente mes`}</button>
            </div>`;let S=n.querySelector(`[data-sig]`);S.focus(),S.addEventListener(`click`,b,{once:!0})}async function b(){if(d<a.length-1){d++,_();return}p=!0;let n=(l.bienestar+l.negocio)/2,o=n>=75?`¡Tu negocio prospera!`:n>=50?`Tu negocio va estable`:`Tu negocio está en riesgo`;try{let n=await r.terminar(t.partida);e.alTerminar(n,c,{titulo:o,html:`
                    <div class="cifras">
                        <div><small>💰 ${u(i.barras[0])}</small><b>${l.bienestar}</b></div>
                        <div><small>${u(i.icono)} ${u(i.barras[1])}</small><b>${l.negocio}</b></div>
                    </div>
                    <p>${n.aciertos} de ${n.total_items} mejores decisiones</p>`,cierre:t.cierre})}catch(t){e.aviso(t.message),e.salir()}}return _(),()=>{p=!0}}var N=280,P=14;function F(e){let{datos:t,raiz:n}=e,i=t.segundos*1e3,a=[...t.items].sort((e,t)=>e.t-t.t),o=new Map,c=[],l=0,d=!1,f=0,p=0,h=0;n.innerHTML=`
        ${e.cabecera(null,`<span data-cuenta>0 pagos</span>`)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="maraton">
            <div class="cielo" data-cielo></div>
            <div class="ventanilla" data-ventanilla>
                <span class="emoji" aria-hidden="true">🏦</span>
                <b>Ventanilla FINABIEN</b>
                <small>Arrastra o toca un recibo para pagarlo · Espacio paga el más urgente</small>
            </div>
        </div>
        <p class="evento-linea" data-evento aria-live="polite">¡Ojo! Si un recibo te pide pagar para recibir un premio, es fraude: déjalo caer.</p>`;let v=n.querySelector(`[data-cielo]`),y=n.querySelector(`[data-ventanilla]`),b=n.querySelector(`[data-cuenta]`),x=n.querySelector(`[data-evento]`),S=n.querySelector(`.tiempo`),C=S.firstElementChild,w=e=>(e.fraude?t.tipos.fraudes:t.tipos.recibos)[e.tipo];function T(e,t=!1){x.textContent=e,x.classList.toggle(`mal`,t)}function E(e){let t=w(e),n=document.createElement(`button`);n.className=`recibo`,n.style.left=`${e.x}%`,n.dataset.id=e.id,n.innerHTML=`
            <span class="emoji" aria-hidden="true">${u(t.icono)}</span>
            <span class="concepto">${u(t.texto)}</span>
            <b>${g(e.monto)}</b>`,n.setAttribute(`aria-label`,`${t.texto}, ${g(e.monto)}`),v.append(n),o.set(e.id,{item:e,el:n,y:-.12,arrastre:null})}function D(e){o.delete(e.item.id),setTimeout(()=>e.el.remove(),420)}function O(e){if(d||!o.has(e.item.id))return;c.push(e.item.id);let t=w(e.item);e.el.classList.add(e.item.fraude?`fraude-pagado`:`pagado`),m(e.item.fraude?`¡Fraude!`:`✓`,y),e.item.fraude?(s.mal(),y.classList.add(`alerta`),setTimeout(()=>y.classList.remove(`alerta`),500),T(`${t.icono} Pagaste un cobro falso: "${t.texto}". Nunca pagues para recibir un premio o un préstamo.`,!0)):(s.bien(),l++,b.textContent=`${l} ${l===1?`pago`:`pagos`}`,T(`${t.icono} ${t.texto} pagado: ${g(e.item.monto)}`)),D(e)}function k(e){e.el.classList.add(e.item.fraude?`evitado`:`vencido`);let t=w(e.item);e.item.fraude?T(`🛡️ ¡Bien! No pagaste "${t.texto}".`):T(`${t.icono} Se venció tu recibo de ${t.texto.toLowerCase()}: pagar tarde genera recargos.`,!0),D(e)}function A(e,t){let n=y.getBoundingClientRect();return e>=n.left&&e<=n.right&&t>=n.top-20&&t<=n.bottom}v.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`.recibo`),n=t&&o.get(Number(t.dataset.id));if(!n||d)return;e.preventDefault(),t.setPointerCapture(e.pointerId);let r=v.getBoundingClientRect();n.arrastre={id:e.pointerId,x0:e.clientX,y0:e.clientY,t0:performance.now(),r},t.classList.add(`arrastrando`)}),v.addEventListener(`pointermove`,e=>{let t=e.target.closest(`.recibo`),n=t&&o.get(Number(t.dataset.id));if(!n?.arrastre||n.arrastre.id!==e.pointerId)return;let{r}=n.arrastre;n.el.style.left=`${(e.clientX-r.left)/r.width*100}%`,n.y=(e.clientY-r.top)/r.height,y.classList.toggle(`lista`,A(e.clientX,e.clientY))});let j=e=>{let t=e.target.closest(`.recibo`),n=t&&o.get(Number(t.dataset.id));if(!n?.arrastre||n.arrastre.id!==e.pointerId)return;let{x0:r,y0:i,t0:a}=n.arrastre,s=performance.now()-a<N&&Math.hypot(e.clientX-r,e.clientY-i)<P;n.arrastre=null,t.classList.remove(`arrastrando`),y.classList.remove(`lista`),(s||A(e.clientX,e.clientY))&&O(n)};v.addEventListener(`pointerup`,j),v.addEventListener(`pointercancel`,j);function M(e){if(d)return;let n=e-p,r=e-h;for(h=e;a.length&&a[0].t<=n;)E(a.shift());for(let e of o.values())e.arrastre||(e.y+=r/t.caida_ms,e.el.style.top=`${e.y*100}%`,e.y>=1&&k(e));let s=Math.max(0,1-n/i);C.style.transform=`scaleX(${s})`,S.classList.toggle(`urgente`,s<.2),s<=0?F():f=requestAnimationFrame(M)}async function F(){if(!d){d=!0,cancelAnimationFrame(f),removeEventListener(`keydown`,I);try{let n=await r.terminar(t.partida,{pagados:c}),i=n.detalle;e.alTerminar(n,[],{titulo:i.fraudes_pagados?`¡Cuidado con los fraudes!`:i.pagados>=i.recibos*.8?`¡Todo al corriente!`:`¡Buen maratón!`,html:`
                    <div class="cifras">
                        <div class="bien"><small>Recibos pagados</small><b>${i.pagados} de ${i.recibos}</b></div>
                        <div><small>Total pagado</small><b>${g(i.pesos)}</b></div>
                        <div class="${i.fraudes_pagados?`mal`:`bien`}"><small>Fraudes evitados</small><b>${i.fraudes_evitados}</b></div>
                    </div>`,cierre:t.cierre})}catch(t){e.aviso(t.message),e.salir()}}}function I(e){if(e.key!==` `&&e.key!==`Enter`||document.activeElement?.closest?.(`[data-abandonar]`))return;e.preventDefault();let t=[...o.values()].filter(e=>!e.arrastre).sort((e,t)=>t.y-e.y)[0];t&&O(t)}return addEventListener(`keydown`,I),_(n.querySelector(`.maraton`),()=>!d).then(e=>{e&&(p=h=performance.now(),f=requestAnimationFrame(M))}),()=>{d=!0,cancelAnimationFrame(f),removeEventListener(`keydown`,I)}}var I=(()=>{let e={b20:{fondo:`#5aa9d6`,oscuro:`#1f5f86`,claro:`#cfe9f7`},b50:{fondo:`#d0588f`,oscuro:`#7d1f4d`,claro:`#f6d3e3`},b100:{fondo:`#d4574a`,oscuro:`#7f2219`,claro:`#f7d5cf`},b200:{fondo:`#5aa865`,oscuro:`#215f2c`,claro:`#d3eed6`},b500:{fondo:`#4b7fc4`,oscuro:`#1c3f78`,claro:`#d2e0f5`},falso:{fondo:`#a3a8a1`,oscuro:`#5d625b`,claro:`#e3e5e1`}};function t(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.arcTo(t+r,n,t+r,n+i,a),e.arcTo(t+r,n+i,t,n+i,a),e.arcTo(t,n+i,t,n,a),e.arcTo(t,n,t+r,n,a),e.closePath()}function n(e,t,n,r,i,a,o){e.font=`${o||800} ${i}px "Lilita One", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillStyle=a,e.fillText(t,n,r)}function r(e,t,r,i){let a=t*.46,o=r===`$10`,s=o?[`#ffe27a`,`#d19a1c`,`#9c6a06`]:[`#f4f6f7`,`#b8bec3`,`#7d858b`],c=o?[`#f7f9fa`,`#c3c9cd`,`#8a9297`]:[`#ffe58a`,`#e0a92a`,`#a87410`];e.save(),e.scale(Math.max(.18,Math.abs(Math.cos(i||0))),1),e.fillStyle=s[2],e.beginPath(),e.arc(0,t*.03,a,0,Math.PI*2),e.fill();let l=e.createRadialGradient(-a*.4,-a*.4,a*.1,0,0,a);l.addColorStop(0,s[0]),l.addColorStop(1,s[1]),e.fillStyle=l,e.beginPath(),e.arc(0,0,a,0,Math.PI*2),e.fill(),l=e.createRadialGradient(-a*.25,-a*.25,a*.05,0,0,a*.66),l.addColorStop(0,c[0]),l.addColorStop(1,c[1]),e.fillStyle=l,e.beginPath(),e.arc(0,0,a*.66,0,Math.PI*2),e.fill(),e.strokeStyle=c[2],e.lineWidth=t*.025,e.stroke(),n(e,r,0,t*.02,t*(r.length>2?.3:.36),c[2]),e.globalAlpha=.55,e.fillStyle=`#fff`,e.beginPath(),e.ellipse(-a*.45,-a*.5,a*.18,a*.08,-.7,0,Math.PI*2),e.fill(),e.restore()}function i(r,i,a,o){let s=e[a],c=i*.98,l=i*.52;r.save(),r.shadowColor=`rgba(0,0,0,.25)`,r.shadowBlur=i*.06,r.shadowOffsetY=i*.03;let u=r.createLinearGradient(-c/2,-l/2,c/2,l/2);u.addColorStop(0,s.claro),u.addColorStop(.45,s.fondo),u.addColorStop(1,s.oscuro),r.fillStyle=u,t(r,-c/2,-l/2,c,l,i*.05),r.fill(),r.restore(),r.strokeStyle=`rgba(255,255,255,.75)`,r.lineWidth=i*.018,t(r,-c/2+i*.045,-l/2+i*.045,c-i*.09,l-i*.09,i*.03),r.stroke(),r.fillStyle=`rgba(255,255,255,.55)`,r.beginPath(),r.ellipse(-c*.24,0,l*.27,l*.32,0,0,Math.PI*2),r.fill(),r.fillStyle=s.oscuro,r.globalAlpha=.6,r.beginPath(),r.arc(-c*.24,-l*.08,l*.11,0,Math.PI*2),r.fill(),r.beginPath(),r.ellipse(-c*.24,l*.17,l*.17,l*.1,0,Math.PI,0),r.fill(),r.globalAlpha=1,n(r,o,c*.17,l*.03,i*.27,`#fff`),r.lineWidth=i*.012,r.strokeStyle=s.oscuro,r.strokeText(o,c*.17,l*.03),a===`falso`&&(r.save(),r.rotate(-.28),r.globalAlpha=.85,r.strokeStyle=`#c62828`,r.lineWidth=i*.025,t(r,-c*.36,-l*.17,c*.72,l*.34,i*.03),r.stroke(),n(r,`FALSO`,0,i*.01,i*.17,`#c62828`),r.restore())}function a(e,t,n){e.strokeStyle=`#f3e7d3`,e.lineWidth=t*.07,e.lineCap=`round`,e.beginPath(),e.moveTo(0,t*.05),e.lineTo(0,t*.47),e.stroke();let r=t*.3;e.save(),e.translate(0,-t*.12),e.fillStyle=`#ff5fa2`,e.beginPath(),e.arc(0,0,r,0,Math.PI*2),e.fill(),e.rotate((n||0)*2),e.strokeStyle=`#fff`,e.lineWidth=t*.05,e.beginPath();for(let t=0;t<Math.PI*6;t+=.15){let n=t/(Math.PI*6)*r*.92;e.lineTo(Math.cos(t)*n,Math.sin(t)*n)}e.stroke(),e.restore()}function o(e,t,r){let i=Math.sin((r||0)*14)*.25;e.strokeStyle=`#2b1a12`,e.lineWidth=t*.035,e.lineCap=`round`;for(let n=-1;n<=1;n++){let r=n*t*.12,a=(n%2==0?i:-i)*t*.2;e.beginPath(),e.moveTo(r,0),e.lineTo(r-t*.08+a,t*.26),e.moveTo(r,0),e.lineTo(r+t*.08-a,-t*.26),e.stroke()}e.beginPath(),e.moveTo(t*.3,-t*.06),e.quadraticCurveTo(t*.42,-t*.3,t*.48,-t*.26),e.moveTo(t*.3,-t*.06),e.quadraticCurveTo(t*.36,-t*.34,t*.4,-t*.36),e.stroke();let a=[[-t*.24,t*.16,`#5a2e1b`],[0,t*.1,`#6b3a22`],[t*.26,t*.12,`#5a2e1b`]];for(let[t,n,r]of a)e.fillStyle=r,e.beginPath(),e.ellipse(t,0,n,n*.85,0,0,Math.PI*2),e.fill();e.fillStyle=`#fff`,e.beginPath(),e.arc(t*.31,-t*.03,t*.04,0,Math.PI*2),e.fill(),e.fillStyle=`#000`,e.beginPath(),e.arc(t*.32,-t*.03,t*.02,0,Math.PI*2),e.fill(),e.save(),e.translate(-t*.02,-t*.22),e.fillStyle=`#e0a92a`,e.strokeStyle=`#a87410`,e.lineWidth=t*.02,e.beginPath(),e.arc(0,0,t*.12,0,Math.PI*2),e.fill(),e.stroke(),n(e,`$`,0,t*.01,t*.14,`#7a5208`),e.restore()}function s(e,r){let i=r*.86,a=r*.56;e.save(),e.rotate(-.12);let o=e.createLinearGradient(-i/2,-a/2,i/2,a/2);o.addColorStop(0,`#3a3f4b`),o.addColorStop(1,`#14161b`),e.fillStyle=o,t(e,-i/2,-a/2,i,a,r*.06),e.fill(),e.fillStyle=`#d9b44a`,t(e,-i*.38,-a*.2,i*.18,a*.24,r*.02),e.fill(),e.fillStyle=`rgba(255,255,255,.8)`;for(let n=0;n<4;n++)t(e,-i*.38+n*i*.2,a*.16,i*.15,a*.08,r*.01),e.fill();n(e,`DEUDA`,i*.14,-a*.12,r*.14,`#ff6b6b`),e.restore(),e.strokeStyle=`#8b939b`,e.lineWidth=r*.04;for(let t=0;t<3;t++)e.beginPath(),e.ellipse(r*.3+t*r*.02,r*.2+t*r*.08,r*.05,r*.035,.9,0,Math.PI*2),e.stroke();e.fillStyle=`#e04a3b`,t(e,r*.24,r*.36,r*.18,r*.14,r*.03),e.fill(),e.strokeStyle=`#e04a3b`,e.lineWidth=r*.03,e.beginPath(),e.arc(r*.33,r*.36,r*.06,Math.PI,0),e.stroke()}function c(e,r,i){e.strokeStyle=`rgba(255,255,255,.7)`,e.lineWidth=r*.015,e.beginPath(),e.moveTo(0,-r*.5),e.lineTo(0,-r*.2),e.stroke(),e.strokeStyle=`#9aa3ab`,e.lineWidth=r*.05,e.lineCap=`round`,e.beginPath(),e.moveTo(0,-r*.22),e.lineTo(0,r*.18),e.arc(-r*.12,r*.18,r*.12,0,Math.PI,!1),e.lineTo(-r*.24,r*.08),e.stroke(),e.fillStyle=`#9aa3ab`,e.beginPath(),e.moveTo(-r*.24,r*.02),e.lineTo(-r*.3,r*.12),e.lineTo(-r*.18,r*.1),e.fill();let a=Math.sin((i||0)*5)*.12;e.save(),e.translate(r*.2,-r*.02),e.rotate(a);let o=r*.4,s=r*.28;e.fillStyle=`#fff6d6`,t(e,-o/2,-s/2,o,s,r*.03),e.fill(),e.strokeStyle=`#e04a3b`,e.lineWidth=r*.025,e.stroke(),e.beginPath(),e.moveTo(-o/2,-s/2),e.lineTo(0,s*.1),e.lineTo(o/2,-s/2),e.stroke(),e.fillStyle=`#e04a3b`,e.beginPath(),e.arc(o/2,-s/2,r*.08,0,Math.PI*2),e.fill(),n(e,`!`,o/2,-s/2+r*.005,r*.13,`#fff`),e.restore()}function l(e,t,r){let i=t*.46;e.save(),e.rotate(Math.sin((r||0)*3)*.25),e.shadowColor=`#ffd84d`,e.shadowBlur=t*.25;let a=e.createRadialGradient(0,0,i*.1,0,0,i);a.addColorStop(0,`#fff6b3`),a.addColorStop(1,`#f5b400`),e.fillStyle=a,e.beginPath();for(let t=0;t<10;t++){let n=t%2==0?i:i*.45,r=t/10*Math.PI*2-Math.PI/2;e.lineTo(Math.cos(r)*n,Math.sin(r)*n)}e.closePath(),e.fill(),e.shadowBlur=0,n(e,`×2`,0,t*.04,t*.24,`#8a5a00`),e.restore()}function u(e,t){e.save(),e.rotate(Math.PI),e.lineWidth=t*.2,e.strokeStyle=`#e0443a`,e.beginPath(),e.arc(0,-t*.02,t*.24,0,Math.PI),e.stroke(),e.lineCap=`butt`,e.beginPath(),e.moveTo(-t*.24,-t*.02),e.lineTo(-t*.24,-t*.2),e.moveTo(t*.24,-t*.02),e.lineTo(t*.24,-t*.2),e.stroke(),e.strokeStyle=`#d7dde2`,e.beginPath(),e.moveTo(-t*.24,-t*.2),e.lineTo(-t*.24,-t*.34),e.moveTo(t*.24,-t*.2),e.lineTo(t*.24,-t*.34),e.stroke(),e.restore(),e.strokeStyle=`#ffe066`,e.lineWidth=t*.025;for(let n=0;n<3;n++)e.beginPath(),e.arc(0,-t*.42,t*(.06+n*.05),Math.PI*.15,Math.PI*.85),e.stroke()}function d(e,t,n){let r=1+Math.sin((n||0)*8)*.06;e.save(),e.scale(r,r),e.shadowColor=`#ff5a7a`,e.shadowBlur=t*.2;let i=e.createLinearGradient(0,-t*.4,0,t*.4);i.addColorStop(0,`#ff8aa0`),i.addColorStop(1,`#e0244a`),e.fillStyle=i,e.beginPath(),e.moveTo(0,t*.4),e.bezierCurveTo(-t*.6,-t*.02,-t*.32,-t*.5,0,-t*.18),e.bezierCurveTo(t*.32,-t*.5,t*.6,-t*.02,0,t*.4),e.fill(),e.shadowBlur=0,e.fillStyle=`rgba(255,255,255,.6)`,e.beginPath(),e.ellipse(-t*.18,-t*.15,t*.07,t*.04,-.6,0,Math.PI*2),e.fill(),e.restore()}function f(t,n,f,p){let m={m1:`$1`,m2:`$2`,m5:`$5`,m10:`$10`,b20:`$20`,b50:`$50`,b100:`$100`,b200:`$200`,b500:`$500`,falso:`$500`}[n];t.save(),n.startsWith(`m`)?r(t,f,m,(p||0)*3):e[n]?i(t,f,n,m):n===`antojo`?a(t,f,p):n===`hormiga`?o(t,f,p):n===`tarjeta`?s(t,f):n===`anzuelo`?c(t,f,p):n===`estrella`?l(t,f,p):n===`iman`?u(t,f):n===`corazon`&&d(t,f,p),t.restore()}return{objeto:f,redondeado:t}})(),L=.93,ee=.2,te=789/921;function R(e){let{datos:t,raiz:n}=e,i=t.segundos*1e3,a=[...t.items].sort((e,t)=>e.t-t.t),o=[],c=[],l=[],u=[],d=new Set,p={estrella:0,iman:0},m=!1,h=matchMedia(`(prefers-reduced-motion: reduce)`).matches,v={izq:!1,der:!1,punteroX:null,ultimo:`puntero`},y=0,b=0,x=!1,S=0,C=0,w=0,T=0;n.innerHTML=`
        ${e.cabecera(null,`<span data-ahorro></span>`)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="puerquito" aria-label="Mueve la alcancía con el dedo, el mouse o las flechas para atrapar el dinero">
            <canvas></canvas>
        </div>
        <div class="fibi-juego">
            <img class="fibi-mini" src="${t.fibi}" alt="FIBI" onerror="this.hidden=true">
            <p class="evento-linea" data-evento aria-live="polite">Atrapa monedas y billetes. Esquiva las trampas que le quitan a tu alcancía.</p>
        </div>`;let E=n.querySelector(`.puerquito`),D=E.querySelector(`canvas`),O=D.getContext(`2d`),k=n.querySelector(`[data-ahorro]`),A=n.querySelector(`[data-evento]`),j=n.querySelector(`.tiempo`),M=j.firstElementChild,N=new Image;N.src=t.sprite;let P=new Image;P.src=t.tarjeta;let F={W:1,H:1,dpr:1},R={x:.5,inclina:0,aplasta:0,sacude:0};function z(){let e=E.getBoundingClientRect();F.W=Math.max(1,e.width),F.H=Math.max(1,e.height),F.dpr=Math.min(devicePixelRatio||1,2),D.width=Math.round(F.W*F.dpr),D.height=Math.round(F.H*F.dpr),!S&&!x&&J(0)}let B=new ResizeObserver(z),ne=()=>{let e=t.racha;return Math.min(e.maximo,1+Math.floor(b/e.cada)*e.incremento)},V=()=>Math.min(F.W*ee,F.H*.42/te),re=e=>F.H*t.escala*(e.startsWith(`b`)||e===`falso`||e===`tarjetafb`?.2:e.startsWith(`m`)?.12:.14);function H(){let e=ne();k.textContent=`${g(y)} ahorrados${e>1?` · Racha ×${String(e).replace(`.`,`,`)}`:``}`}function U(e,t=!1){A.textContent=e,A.classList.toggle(`mal`,t)}function W(e,t,n,r){for(let e of l)e.vida>.5&&Math.abs(e.x-t)<F.W*.2&&Math.abs(e.y-n)<F.H*.06&&(n=e.y-F.H*.07);l.push({texto:e,x:t,y:n,color:r,vida:1.1})}function G(e,t,n,r){for(let i=0;i<(h?Math.ceil(r/3):r);i++){let r=Math.random()*Math.PI*2,a=(.3+Math.random())*F.H*.5;u.push({x:e,y:t,vx:Math.cos(r)*a,vy:Math.sin(r)*a-F.H*.3,vida:.5+Math.random()*.5,color:n[i%n.length]})}}function ie(e,n){c.push(e.item.id);let r=e.item.tipo,i=e.x,a=F.H*L-V()*te*.9;if(t.dinero[r]){let e=t.dinero[r];b++,y+=e.valor,R.aplasta=1,s.bien(),G(i,a,r.startsWith(`m`)?[`#ffd84d`,`#fff3b0`,`#e0a92a`]:[`#7fe0a0`,`#ffffff`,`#ffd84d`],r.startsWith(`m`)?12:20),W(`+${e.texto}`,i,a-F.H*.04,`#f5b83d`),b%t.racha.cada===0&&1+b/t.racha.cada*t.racha.incremento<=t.racha.maximo&&W(`¡Racha ×${String(ne()).replace(`.`,`,`)}!`,R.x*F.W,a-F.H*.14,`#56d6c9`)}else if(t.trampas[r]&&m)m=!1,s.bien(),G(i,a,[`#8ecbff`,`#ffffff`,`#5fd982`],16),W(`¡Protegido!`,R.x*F.W,a-F.H*.12,`#8ecbff`),U(`💳 Tu Tarjeta FINABIEN te protegió de: ${t.trampas[r].texto}`);else if(t.trampas[r]){let e=t.trampas[r];b=0,R.sacude=1,T=+!h,s.mal(),G(i,a,[`#ff6b5b`,`#5a2e1b`,`#999999`],14),W(e.texto,R.x*F.W,a-F.H*.12,`#ff6b5b`),U(d.has(r)?`${e.texto} Cuidado: le quitó a tu alcancía.`:`${e.texto} ${e.leccion}`,!0),d.add(r)}else r===`tarjetafb`?(m=!0,s.premio(),G(i,a,[`#8ecbff`,`#ffffff`,`#5fd982`,`#ffd84d`],22),W(t.poderes.tarjetafb.texto,R.x*F.W,a-F.H*.12,`#8ecbff`),U(`💳 ${t.poderes.tarjetafb.leccion}`)):(p[r]=n+(r===`estrella`?t.estrella_seg:t.iman_seg)*1e3,s.premio(),G(i,a,[`#ffd84d`,`#ff8aa0`,`#7fe0a0`,`#8ecbff`],22),W(t.poderes[r].texto,R.x*F.W,a-F.H*.12,`#c7b6ff`),U(r===`estrella`?`⭐ Durante ${t.estrella_seg} segundos tus monedas valen el doble.`:`🧲 Durante ${t.iman_seg} segundos el dinero viene hacia tu alcancía.`));H()}function K(e){let t=R.x,n=V()/2/F.W,r=1.1;v.ultimo===`teclado`&&(v.izq||v.der)?R.x+=(+!!v.der-!!v.izq)*r*e:v.ultimo===`control`&&v.eje?R.x+=v.eje*r*e:v.ultimo===`puntero`&&v.punteroX!==null&&(R.x+=(v.punteroX-R.x)*Math.min(1,e*16)),R.x=Math.min(1-n,Math.max(n,R.x));let i=Math.max(-1,Math.min(1,(R.x-t)/Math.max(e,.001)/r))*.12;R.inclina+=(i-R.inclina)*Math.min(1,e*10),R.aplasta=Math.max(0,R.aplasta-e*4),R.sacude=Math.max(0,R.sacude-e*2.5)}function ae(){let e=[...navigator.getGamepads?.()??[]].find(Boolean);if(!e)return;let t=t=>e.buttons[t]?.pressed;v.eje=t(14)?-1:t(15)?1:Math.abs(e.axes[0])>.2?e.axes[0]:0,v.eje&&(v.ultimo=`control`)}function q(e){if(x)return;let n=e-C,r=Math.min(.05,(e-w)/1e3);for(w=e,ae(),K(r);a.length&&a[0].t<=n;){let e=a.shift();o.push({item:e,x:e.x/100*F.W,dx:0,y:0,fase:e.id*1.7})}let s=V(),c=s*te,d=s*.62*t.margen_atrape,f=R.x*F.W,m=F.H*L-c*.98,h=p.iman>n;for(let e=o.length-1;e>=0;e--){let i=o[e],a=re(i.item.tipo),s=(n-i.item.t)/i.item.caida;i.y=-a/2+s*(F.H*L+a/2),h&&t.dinero[i.item.tipo]&&i.y>m-F.H*.6&&(i.dx+=(f-(i.x+i.dx))*Math.min(1,r*5));let l=i.item.zig?Math.sin((n-i.item.t)/1e3*3+i.fase)*(i.item.zig/100)*F.W:0;i.xActual=Math.min(F.W-a*.4,Math.max(a*.4,i.x+i.dx+l)),i.y+a*.3>=m&&i.y-a*.3<=m+c*.45&&Math.abs(i.xActual-f)<=d/2?(i.x=i.xActual,ie(i,n),o.splice(e,1)):s>=1.1&&o.splice(e,1)}for(let e=u.length-1;e>=0;e--){let t=u[e];t.vida-=r,t.x+=t.vx*r,t.y+=t.vy*r,t.vy+=F.H*1.4*r,t.vida<=0&&u.splice(e,1)}for(let e=l.length-1;e>=0;e--)l[e].vida-=r,l[e].y-=F.H*.11*r,l[e].vida<=0&&l.splice(e,1);T=Math.max(0,T-r*2.2),J(n);let g=Math.max(0,1-n/i);M.style.transform=`scaleX(${g})`,j.classList.toggle(`urgente`,g<.2),g<=0?ce():S=requestAnimationFrame(q)}function J(e){let{W:n,H:r,dpr:i}=F;O.setTransform(i,0,0,i,0,0),O.clearRect(0,0,n,r),T>0&&O.translate((Math.random()-.5)*16*T,(Math.random()-.5)*10*T),O.fillStyle=`rgb(0 0 0 / .18)`,O.fillRect(0,r*L,n,r*.06999999999999995);for(let e of o){let t=Math.max(0,Math.min(1,e.y/(r*L)));O.fillStyle=`rgb(0 0 0 / ${.2*t})`,O.beginPath(),O.ellipse(e.xActual??e.x,r*L+6,re(e.item.tipo)*.35*t,6*t,0,0,Math.PI*2),O.fill()}se(e);for(let n of o){let r=n.item.tipo,i=re(r);O.save(),O.translate(n.xActual??n.x,n.y),(r.startsWith(`b`)||r===`falso`||r===`tarjetafb`)&&O.rotate(Math.sin((e-n.item.t)/250+n.fase)*.3),t.trampas[r]&&t.resaltar_trampas&&r!==`falso`&&(O.strokeStyle=`rgb(255 107 91 / ${.55+Math.sin(e/125)*.2})`,O.lineWidth=5,O.setLineDash([12,9]),O.beginPath(),O.arc(0,0,i*.58,0,Math.PI*2),O.stroke(),O.setLineDash([])),r===`tarjetafb`?oe(i,e):I.objeto(O,r,i,(e-n.item.t)/1e3+n.fase),O.restore()}for(let e of u)O.globalAlpha=Math.max(0,e.vida),O.fillStyle=e.color,O.beginPath(),O.arc(e.x,e.y,r*.008*(.5+e.vida),0,Math.PI*2),O.fill();O.globalAlpha=1,O.textAlign=`center`,O.textBaseline=`middle`,O.lineJoin=`round`,O.font=`${Math.round(r*.065)}px "Lilita One", "Arial Rounded MT Bold", sans-serif`;for(let e of l){let t=Math.min(Math.max(e.x,n*.15),n*.85);O.globalAlpha=Math.min(1,e.vida/.4),O.lineWidth=r*.012,O.strokeStyle=`rgb(0 0 0 / .55)`,O.strokeText(e.texto,t,e.y),O.fillStyle=e.color,O.fillText(e.texto,t,e.y)}O.globalAlpha=1}function oe(e,t){let n=e*.98,r=169/283*n;O.shadowColor=`#8ecbff`,O.shadowBlur=e*(.18+Math.sin(t/150)*.06),P.complete&&P.naturalWidth?O.drawImage(P,-n/2,-r/2,n,r):(O.fillStyle=`#f4f7f2`,I.redondeado(O,-n/2,-r/2,n,r,e*.06),O.fill()),O.shadowBlur=0}function se(e){let{H:t,W:n}=F,r=V(),i=r*te,a=R.x*n,o=t*L;if(O.fillStyle=`rgb(0 0 0 / .3)`,O.beginPath(),O.ellipse(a,o+4,r*.42,t*.018,0,0,Math.PI*2),O.fill(),p.estrella>e||p.iman>e||m){let t=p.estrella>e?`255 216 77`:p.iman>e?`255 112 150`:`142 203 255`,n=O.createRadialGradient(a,o-i/2,10,a,o-i/2,r*.8);n.addColorStop(0,`rgb(${t} / .4)`),n.addColorStop(1,`rgb(${t} / 0)`),O.fillStyle=n,O.fillRect(a-r,o-i*1.4,r*2,i*1.5)}let s=h?0:Math.sin(e/160)*t*.003,c=R.sacude>0?Math.sin(R.sacude*30)*.08*R.sacude:0;O.save(),O.translate(a,o+s),O.rotate(c+R.inclina),O.scale(1+R.aplasta*.08,1-R.aplasta*.08),N.complete&&N.naturalWidth?O.drawImage(N,-r/2,-i,r,i):(O.fillStyle=`#9bd49b`,O.beginPath(),O.ellipse(0,-i/2,r/2,i/2,0,0,Math.PI*2),O.fill()),O.restore()}async function ce(){if(!x){x=!0,cancelAnimationFrame(S),ue();try{let n=await r.terminar(t.partida,{atrapados:c}),i=n.detalle;e.alTerminar(n,[],{titulo:i.trampas===0&&i.ahorro>0?`¡Alcancía sin trampas!`:i.ahorro>=i.disponible*.6?`¡Gran ahorro!`:`¡Buen intento!`,html:`
                    <div class="cifras">
                        <div class="bien con-marranito"><img src="${t.sprite}" alt="" onerror="this.hidden=true"><small>Tu alcancía juntó</small><b>${g(i.ahorro)}</b></div>
                        <div><small>Monedas y billetes</small><b>${f(i.monedas+i.billetes)}</b></div>
                        <div class="${i.trampas?`mal`:`bien`}"><small>Trampas atrapadas</small><b>${f(i.trampas)}</b></div>
                    </div>
                    <p>Mejor racha: ${f(i.mejor_racha)} seguidas · Cayeron ${g(i.disponible)} en total${i.protegidas?` · Tu Tarjeta FINABIEN te protegió ${i.protegidas===1?`de 1 trampa`:`de ${i.protegidas} trampas`}`:``}</p>`,cierre:t.cierre})}catch(t){e.aviso(t.message),e.salir()}}}let Y=e=>{let t=E.getBoundingClientRect();v.punteroX=(e.clientX-t.left)/t.width,v.ultimo=`puntero`},le=e=>{e.preventDefault(),E.setPointerCapture?.(e.pointerId),Y(e)},X=(e,t)=>{if([`ArrowLeft`,`a`,`A`].includes(e.key))v.izq=t;else if([`ArrowRight`,`d`,`D`].includes(e.key))v.der=t;else return;e.preventDefault(),v.ultimo=`teclado`},Z=e=>X(e,!0),Q=e=>X(e,!1);E.addEventListener(`pointerdown`,le),E.addEventListener(`pointermove`,Y),addEventListener(`keydown`,Z),addEventListener(`keyup`,Q);function ue(){removeEventListener(`keydown`,Z),removeEventListener(`keyup`,Q),B.disconnect()}return H(),B.observe(E),z(),_(E,()=>!x).then(e=>{e&&(C=w=performance.now(),S=requestAnimationFrame(q))}),()=>{x=!0,cancelAnimationFrame(S),ue()}}var z=document.getElementById(`app`),B=(z.dataset.api??`/api`).replace(/\/api$/,``),ne=`${B}/staff`,V=`${B}/img/fibi.png`;document.documentElement.style.setProperty(`--foto-sucursal`,`url("${B}/img/sucursal.jpg")`);var re=[`inicio`,`registro`,`codigo`,`codigo-nuevo`],H=(e,t=`FIBI, imagen institucional de FINABIEN`)=>`<img class="${e}" src="${V}" alt="${t}" onerror="this.hidden=true">`,U=`${B}/img/alcancia-sprite.png`,W=(e,t=``)=>`<img class="${e}" src="${U}" alt="${t}" onerror="this.hidden=true">`,G=`${B}/img/tarjeta-finabien.png`,ie=(e=!0)=>`<img class="tarjeta-img" src="${G}" alt="Tarjeta FINABIEN" ${e?``:`hidden`} onerror="this.remove()" data-tarjeta-fb>`,K=e=>/tarjeta finabien/i.test(e),ae=(e,t=`ilustra`)=>e.imagen===`marranito`?W(`${t} ilustra-img`):`<span class="${t}" aria-hidden="true">${e.icono}</span>`,q={config:null,jugador:null,pantalla:`inicio`,reg:{paso:1,nombre:``,edad:null,avatar:null},rankingGrupo:`ninos`,intervalos:[],limpiarJuego:null,ultimaActividad:Date.now()},J=[`FINABIEN significa Financiera para el Bienestar y tiene sucursales en todo México.`,`Con la Tarjeta Finabien, quienes viven en Estados Unidos pueden enviar dinero a sus familias en México.`,`La Tarjeta Finabien se tramita sin costo en los consulados de México en Estados Unidos o en línea.`,`Ahorrar $50 cada semana suma $2,600 en un año.`,`Nadie de un banco o financiera te pedirá tu NIP por teléfono o por mensaje.`,`Antes de pedir un crédito compara el CAT: entre más bajo, más barato te sale.`,`Un fondo de emergencia te protege de imprevistos sin tener que endeudarte.`,`Antes de comprar, pregúntate: ¿lo necesito o lo quiero?`],oe={trivia:{icono:`🧠`,nombre:`Trivia Bienestar`,modulo:C,desc:{ninos:`Contesta preguntas sobre el dinero y el ahorro.`,otro:`Responde rápido: entre más pronto aciertes, más puntos ganas.`},intro:e=>e===`ninos`?`Lee la pregunta y toca la respuesta correcta. ¡Tienes tiempo para pensar!`:`Elige la respuesta correcta antes de que se acabe la barra. Contestar rápido te da puntos extra.`},clasifica:{icono:`⚡`,nombre:`Decide rápido`,modulo:w,desc:{ninos:`Separa lo que necesitas de lo que quieres.`,otro:`Clasifica cada situación antes de que se acabe el tiempo.`},intro:e=>e===`adultos`?`Aparecerán situaciones de dinero. Mándalas a "Buena decisión" o a "Riesgo" lo más rápido que puedas.`:`Aparecerán cosas que podrías comprar. Mándalas al lado correcto lo más rápido que puedas.`},memorama:{icono:`🃏`,nombre:`Memorama`,modulo:T,desc:{ninos:`Encuentra las parejas de dibujos iguales.`,otro:`Une cada concepto con su significado.`},intro:e=>e===`ninos`?`Voltea dos cartas a la vez y encuentra las parejas. ¡Entre menos intentos, más puntos!`:`Voltea dos cartas y une cada palabra con su significado. Entre menos movimientos, más puntos.`},puerquito:{icono:`🐷`,imagen:`marranito`,nombre:`Puerquito Ahorrador`,modulo:R,desc:{ninos:`Mueve tu alcancía y atrapa las monedas que caen.`,otro:`Atrapa monedas y billetes y esquiva antojos, deudas y fraudes.`},intro:e=>e===`ninos`?`Mueve la alcancía con el dedo o el mouse y atrapa las monedas y billetes. ¡Las cosas con círculo rojo son trampas!`:`Mueve la alcancía con el dedo, el mouse o las flechas. Atrapa el dinero seguido para hacer racha; las trampas restan y la cortan.`},remesa:{icono:`💸`,nombre:`El viaje de la remesa`,modulo:O,desc:{ninos:`Lleva el dinero de tu familia de Estados Unidos a México.`,otro:`Guía tu Tarjeta FINABIEN y esquiva los cobros que le quitan valor a tu envío.`},intro:e=>e===`ninos`?`Toca arriba, en medio o abajo para mover tu tarjeta. Junta monedas y esquiva lo que le quita dinero a tu familia.`:`Toca un carril o usa las flechas ↑ ↓. Junta beneficios y esquiva impuestos, cargos fantasma y fraudes.`},cosecha:{icono:`🌱`,nombre:`Cosecha tu ahorro`,modulo:j,desc:{ninos:`Decide dónde guardar tu dinero y mira cómo crece.`,otro:`Colchón, antojos o ahorro formal: decide rápido y mira crecer tu dinero.`},intro:e=>e===`ninos`?`Te irá llegando dinero. Tócalo rápido y elige: ¿lo guardas bajo el colchón, te lo gastas o lo ahorras para que crezca?`:`Cada ingreso dura unos segundos. Mándalo al colchón, a los antojos o al ahorro formal (teclas 1, 2 y 3). Cada 5 segundos pasa un año.`},emprendedor:{icono:`🏪`,nombre:`Simulador del emprendedor`,modulo:M,desc:{ninos:`Atiende tu puesto de aguas frescas y toma buenas decisiones.`,otro:`Dirige un negocio: cada decisión mueve tu bienestar financiero y la salud del negocio.`},intro:e=>e===`ninos`?`Cada mes pasa algo en tu puesto. Elige qué hacer y mira cómo cambian tu dinero y tu puesto.`:`Vivirás varios meses de tu negocio. En cada dilema elige una opción: tus barras de bienestar y de negocio subirán o bajarán.`},maraton:{icono:`🧾`,nombre:`Maratón de pagos`,modulo:F,desc:{ninos:`Paga los recibos de la casa antes de que se venzan.`,otro:`Paga tus servicios en la ventanilla FINABIEN y no caigas en cobros falsos.`},intro:e=>e===`ninos`?`Van a caer recibos. Arrástralos o tócalos para pagarlos en la ventanilla. ¡Si te piden pagar para darte un premio, es trampa!`:`Arrastra o toca cada recibo para pagarlo antes de que llegue al piso. Los cobros falsos restan puntos: déjalos caer.`}},se=[{titulo:`Retos de educación financiera`,juegos:[`trivia`,`clasifica`,`memorama`,`puerquito`]},{titulo:`Conoce los servicios FINABIEN`,juegos:[`remesa`,`cosecha`,`emprendedor`,`maraton`]}];function ce(){q.intervalos.forEach(clearInterval),q.intervalos=[],q.limpiarJuego?.(),q.limpiarJuego=null,document.querySelectorAll(`.capa`).forEach(e=>e.remove())}function Y(e,t){return ce(),q.pantalla=e,document.body.classList.toggle(`con-sucursal`,re.includes(e)),z.innerHTML=`<div class="pantalla">${t}</div>`,scrollTo(0,0),z.firstElementChild}function le(e){document.querySelector(`.aviso-toast`)?.remove();let t=document.createElement(`div`);t.className=`aviso-toast`,t.setAttribute(`role`,`status`),t.textContent=e,document.body.append(t),setTimeout(()=>t.remove(),4200)}function X(e){let t=document.createElement(`div`);return t.className=`capa`,t.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${e}</div>`,document.body.append(t),t.querySelector(`button`)?.focus(),t}var Z=e=>q.config.grupos[e.grupo],Q=(e,t)=>`<span class="avatar ${l[t]??``}" aria-hidden="true"><span class="emoji">${c[e]??`🙂`}</span></span>`;function ue(){q.jugador=null;let e=q.config,t=Object.entries(e.grupos),n=Y(`inicio`,`
        <div class="inicio-grid">
            <div class="logo-inst">
                <img src="${B}/img/logo-hacienda-finabien.png" alt="Secretaría de Hacienda y Crédito Público · Financiera para el Bienestar">
            </div>
            <section class="hero">
                <p class="etiqueta">${u(e.evento?.nombre??`Educación financiera`)}${e.evento?.sede?` · ${u(e.evento.sede)}`:``}</p>
                <div class="titulo-marranito">
                    <h1>Reto <span>Finabien</span></h1>
                    ${W(`marranito-hero`,`Alcancía de Financiera para el Bienestar`)}
                </div>
                <p class="lema">Juega, aprende a cuidar tu dinero y junta puntos para ganar premios.</p>
                <div class="acciones">
                    <button class="btn btn-xl" data-ir="registro">¡Quiero jugar!</button>
                    <button class="btn btn-xl btn-fantasma" data-ir="codigo">Ya tengo código</button>
                </div>
                <div class="grupos-mini">
                    ${t.map(([e,t])=>`<span class="pildora grupo ${l[e]}">${u(t.nombre)} · ${u(t.rango)}</span>`).join(``)}
                </div>
                <div class="fibi-dice">
                    ${H(`fibi-foto`)}
                    <div class="globo" aria-live="polite">
                        <p class="etiqueta">FIBI te cuenta</p>
                        <p data-dato>${u(J[0])}</p>
                        ${ie(K(J[0]))}
                    </div>
                </div>
            </section>
            <aside class="lado">
                <section class="panel ranking">
                    <div class="barra">
                        <h2 style="font-size:1.8rem">Mejores puntajes</h2>
                        <div class="tabs" role="tablist">
                            ${t.map(([e,t])=>`<button class="tab ${l[e]}" role="tab" data-grupo="${e}" aria-selected="${e===q.rankingGrupo}">${u(t.nombre)}</button>`).join(``)}
                        </div>
                    </div>
                    <div data-ranking></div>
                </section>
                <section class="panel">
                    <h2 style="font-size:1.8rem">Premios</h2>
                    <div class="tira-premios">
                        ${e.premios.map(e=>`<div class="${e.agotado?`agotado`:``}"><span class="emoji" aria-hidden="true">${u(e.icono)}</span>${u(e.nombre)}<small>${e.agotado?`Agotado`:`${f(e.costo)} pts`}</small></div>`).join(``)||`<p class="vacio">Pronto anunciaremos los premios.</p>`}
                    </div>
                </section>
            </aside>
        </div>
        <footer class="pie">
            <span>Información de FINABIEN: gob.mx/finabien · finabien.gob.mx</span>
            <span class="empuja">
                <button class="btn btn-chico btn-fantasma" data-sonido>${s.activo?`Sonido: sí`:`Sonido: no`}</button>
                <button class="btn btn-chico btn-fantasma" data-pantalla-completa>Pantalla completa</button>
                <a class="btn btn-chico btn-fantasma" href="${ne}">Staff</a>
            </span>
        </footer>`);de(n);let i=0;q.intervalos.push(setInterval(()=>{i=(i+1)%J.length,n.querySelector(`[data-dato]`).textContent=J[i];let e=n.querySelector(`[data-tarjeta-fb]`);e&&(e.hidden=!K(J[i]))},8e3));let a=t.map(([e])=>e);q.intervalos.push(setInterval(()=>{q.rankingGrupo=a[(a.indexOf(q.rankingGrupo)+1)%a.length],de(n)},7e3)),q.intervalos.push(setInterval(async()=>{try{q.config=await r.configuracion(),q.pantalla===`inicio`&&de(n)}catch{}},3e4))}function de(e){let t=q.config.ranking[q.rankingGrupo]??[];e.querySelectorAll(`.tab`).forEach(e=>e.setAttribute(`aria-selected`,String(e.dataset.grupo===q.rankingGrupo))),e.querySelector(`[data-ranking]`).innerHTML=t.length?`<ol>${t.map((e,t)=>`<li><span class="pos">${t+1}</span>${Q(e.avatar,q.rankingGrupo)}<span class="nom">${u(e.nombre)}</span>${p(e.puntos)}</li>`).join(``)}</ol>`:`<p class="vacio">Nadie ha jugado todavía en este grupo. ¡Sé la primera persona en el ranking!</p>`}function fe(){let e=q.reg,t=`<div class="pasos" aria-label="Paso ${e.paso} de 3">${[1,2,3].map(t=>`<span class="${t<=e.paso?`hecho`:``}"></span>`).join(``)}</div>`,n=`<div class="barra"><button class="btn btn-chico btn-fantasma" data-atras>← ${e.paso===1?`Inicio`:`Atrás`}</button>${t}</div>`;if(e.paso===1){let t=Y(`registro`,`${n}
            <div class="registro">
                <h2>¿Cómo te llamas?</h2>
                <p class="ayuda">Escribe tu nombre o un apodo. Así aparecerás en el ranking.</p>
                <input id="nombre" class="campo-grande" maxlength="20" autocomplete="off" inputmode="none" value="${u(e.nombre)}" aria-label="Tu nombre o apodo">
                <p class="error" data-error></p>
                ${x()}
                <button class="btn btn-xl" data-continuar ${e.nombre.trim().length>=2?``:`disabled`}>Continuar</button>
            </div>`),r=t.querySelector(`#nombre`),i=t.querySelector(`[data-continuar]`);S(t,r,{max:20,alCambiar:t=>{e.nombre=t,i.disabled=t.trim().length<2}}),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&!i.disabled&&i.click()}),i.addEventListener(`click`,()=>{e.paso=2,fe()}),r.focus();return}if(e.paso===2){let t=[{v:5,t:`5`,s:`o menos`},...Array.from({length:12},(e,t)=>({v:t+6,t:String(t+6)})),{v:18,t:`18`,s:`a 29`},{v:30,t:`30`,s:`a 59`},{v:60,t:`60`,s:`o más`}];Y(`registro`,`${n}
            <div class="registro">
                <h2>¿Cuántos años tienes, ${u(e.nombre.trim())}?</h2>
                <p class="ayuda">Así te tocan preguntas hechas para tu edad.</p>
                <div class="edades">
                    ${t.map(t=>`<button class="edad" data-edad="${t.v}" aria-pressed="${e.edad===t.v}">${t.t}${t.s?`<small>${t.s}</small>`:``}</button>`).join(``)}
                </div>
            </div>`).querySelector(`.edades`).addEventListener(`click`,t=>{let n=t.target.closest(`[data-edad]`);n&&(s.toque(),e.edad=Number(n.dataset.edad),e.paso=3,fe())});return}let i=Y(`registro`,`${n}
        <div class="registro">
            <h2>Elige tu personaje</h2>
            <div class="avatares">
                ${Object.entries(c).map(([t,n])=>`<button class="avatar-opcion" data-avatar="${t}" aria-pressed="${e.avatar===t}" aria-label="${t}">${n}</button>`).join(``)}
            </div>
            <p class="error" data-error></p>
            <button class="btn btn-xl" data-registrar ${e.avatar?``:`disabled`}>¡A jugar!</button>
        </div>`),a=i.querySelector(`[data-registrar]`);i.querySelector(`.avatares`).addEventListener(`click`,t=>{let n=t.target.closest(`[data-avatar]`);n&&(s.toque(),e.avatar=n.dataset.avatar,i.querySelectorAll(`.avatar-opcion`).forEach(e=>e.setAttribute(`aria-pressed`,String(e===n))),a.disabled=!1)}),a.addEventListener(`click`,async()=>{a.disabled=!0;try{q.jugador=await r.registrar({nombre:e.nombre.trim(),edad:e.edad,avatar:e.avatar}),q.reg={paso:1,nombre:``,edad:null,avatar:null},s.premio(),pe()}catch(e){i.querySelector(`[data-error]`).textContent=e.message,a.disabled=!1}})}function pe(){let e=q.jugador,t=Z(e);Y(`codigo-nuevo`,`
        <div class="resultado"><div class="caja">
            ${Q(e.avatar,e.grupo).replace(`class="avatar`,`style="width:6rem;height:6rem;font-size:3.6rem" class="avatar`)}
            <h2>¡Hola, ${u(e.nombre)}!</h2>
            <span class="pildora grupo ${l[e.grupo]}">Grupo ${u(t.nombre)} · ${u(t.rango)}</span>
            <div class="fibi-linea">
                ${H(`fibi-mini`)}
                <p>Soy FIBI. Este es tu código: tómale foto o anótalo para seguir juntando puntos en cualquier pantalla del stand.</p>
            </div>
            <div class="codigo-grande" aria-label="Tu código">${u(e.codigo)}</div>
            <button class="btn btn-xl" data-continuar>Ver los juegos</button>
        </div></div>`).querySelector(`[data-continuar]`).addEventListener(`click`,$)}function me(){let e=Y(`codigo`,`
        <div class="barra"><button class="btn btn-chico btn-fantasma" data-atras>← Inicio</button></div>
        <div class="registro">
            <h2>Escribe tu código</h2>
            <p class="ayuda">Son 5 letras y números. Lo recibiste al registrarte.</p>
            <input id="codigo" data-modo="codigo" class="campo-grande campo-codigo" maxlength="5" autocomplete="off" inputmode="none" aria-label="Tu código">
            <p class="error" data-error></p>
            ${x({modo:`codigo`})}
            <button class="btn btn-xl" data-entrar disabled>Entrar</button>
        </div>`),t=e.querySelector(`#codigo`),n=e.querySelector(`[data-entrar]`),i=e.querySelector(`[data-error]`);S(e,t,{max:5,alCambiar:e=>{t.value=e.toUpperCase().replace(/[^A-Z0-9]/g,``).slice(0,5),n.disabled=t.value.length<5,i.textContent=``}});let a=async()=>{n.disabled=!0;try{q.jugador=await r.jugador(t.value),s.bien(),$()}catch(e){i.textContent=e.message,s.mal(),n.disabled=!1}};t.addEventListener(`keydown`,e=>{e.key===`Enter`&&!n.disabled&&a()}),n.addEventListener(`click`,a),t.focus()}function he(e){let t=Z(e);return`
        <header class="barra jugador-barra ${l[e.grupo]}">
            ${Q(e.avatar,e.grupo)}
            <div>
                <div class="nombre">${u(e.nombre)}</div>
                <div class="codigo">Código <strong>${u(e.codigo)}</strong> · ${u(t.nombre)}</div>
            </div>
            <div class="empuja barra">
                ${p(e.puntos)}
                <button class="btn btn-chico btn-fantasma" data-salir>Terminar</button>
            </div>
        </header>`}function ge(e){let t=q.config.premios.filter(e=>!e.agotado);return{alcanzables:t.filter(t=>t.costo<=e.puntos),proximo:t.find(t=>t.costo>e.puntos)}}function $(){let e=q.jugador,t=q.config.jugadas_con_puntos,{alcanzables:n,proximo:r}=ge(e),i=Z(e).titulo_clasifica,a=n=>{let r=oe[n],a=e.jugadas[n]??0,o=a<t?`<span class="estado-juego">Suma puntos · partida ${a+1} de ${t}</span>`:`<span class="estado-juego practica">Modo práctica · ya sumaste tus puntos aquí</span>`;return`
            <button class="juego-card jc-${n}" data-juego="${n}">
                ${ae(r)}
                <h3>${u(n===`clasifica`?i:r.nombre)}</h3>
                <p>${u(r.desc[e.grupo]??r.desc.otro)}</p>
                ${o}
            </button>`},o=r?`<p class="etiqueta">Tu siguiente premio</p>
           <h3><span class="emoji">${u(r.icono)}</span> ${u(r.nombre)}</h3>
           <div class="barra-progreso"><span style="width:${Math.min(100,e.puntos/r.costo*100)}%"></span></div>
           <p class="falta">Te faltan ${f(r.costo-e.puntos)} puntos.</p>`:`<p class="etiqueta">Premios</p><h3>¡Tienes puntos para el premio mayor!</h3>`,c=J[Math.floor(Math.random()*J.length)],l=Y(`hub`,`
        ${he(e)}
        <div class="hub">
            <div class="juegos">
                ${se.map(e=>`
                    <section class="juegos-fila" aria-label="${u(e.titulo)}">
                        <h2 class="etiqueta">${u(e.titulo)}</h2>
                        <div class="juegos-grid n${e.juegos.length}">${e.juegos.map(a).join(``)}</div>
                    </section>`).join(``)}
            </div>
            <aside class="panel meta-premio">
                ${o}
                <button class="btn ${n.length?`btn-rosa`:`btn-fantasma`}" style="width:100%" data-premios>
                    ${n.length?`¡Canjear premio! (${n.length})`:`Ver premios`}
                </button>
                <div class="fibi-linea fibi-consejo">
                    ${H(`fibi-mini`)}
                    <p><span class="etiqueta">FIBI te recomienda</span><br>${u(c)}${K(c)?`<br>${ie()}`:``}</p>
                </div>
                ${e.canjes.length?`<p class="etiqueta" style="margin-top:1.2rem">Mis premios</p>
                    <ul class="mis-premios">${e.canjes.map(e=>`<li><span>${u(e.icono??``)} ${u(e.premio)}</span><span>${e.entregado?`Entregado`:u(e.folio)}</span></li>`).join(``)}</ul>`:``}
            </aside>
        </div>`);l.querySelector(`.juegos`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-juego]`);t&&(s.toque(),_e(t.dataset.juego))}),l.querySelector(`[data-premios]`).addEventListener(`click`,be)}function _e(e){let t=q.jugador,n=oe[e],i=q.config.jugadas_con_puntos,a=(t.jugadas[e]??0)<i,o=e===`clasifica`?Z(t).titulo_clasifica:n.nombre,s=Y(`intro`,`
        <div class="barra"><button class="btn btn-chico btn-fantasma" data-volver>← Juegos</button><span class="empuja">${p(t.puntos)}</span></div>
        <div class="intro"><div class="caja">
            ${ae(n)}
            <h2>${u(o)}</h2>
            <div class="fibi-linea">
                ${H(`fibi-mini`)}
                <p>${u(n.intro(t.grupo))}</p>
            </div>
            <p class="aviso">${a?`Esta partida suma puntos.`:`Ya sumaste puntos en este juego: esta partida es de práctica.`}</p>
            <p class="error" data-error></p>
            <button class="btn btn-xl" data-empezar>¡Empezar!</button>
        </div></div>`);s.querySelector(`[data-volver]`).addEventListener(`click`,$);let c=s.querySelector(`[data-empezar]`);c.addEventListener(`click`,async()=>{c.disabled=!0;try{ve(e,await r.iniciar(t.codigo,e),o)}catch(e){s.querySelector(`[data-error]`).textContent=e.message,c.disabled=!1}})}function ve(e,t,n){let r=Y(`juego`,``),i={raiz:r,datos:t,aviso:le,cabecera:(e,t=``)=>`
            <div class="juego-top">
                <button class="btn btn-chico btn-fantasma" data-abandonar>✕ Salir</button>
                <h2>${u(n)}</h2>
                ${t?`<span class="empuja pildora" style="font-size:1.1rem">${t}</span>`:``}
                ${e===null?``:`<span class="marcador">${p(e)}</span>`}
            </div>`,marcador:e=>{let t=r.querySelector(`.marcador`);t&&(t.innerHTML=p(e))},alTerminar:(e,t,n)=>ye(e,t,n),salir:$};q.limpiarJuego=oe[e].modulo(i),r.addEventListener(`click`,e=>{if(!e.target.closest(`[data-abandonar]`))return;let t=X(`
            <h2>¿Salir del juego?</h2>
            <p>Si sales ahora, esta partida no suma puntos.</p>
            <div class="acciones">
                <button class="btn" data-seguir>Seguir jugando</button>
                <button class="btn btn-fantasma" data-confirmar>Salir</button>
            </div>`);t.querySelector(`[data-seguir]`).addEventListener(`click`,()=>t.remove()),t.querySelector(`[data-confirmar]`).addEventListener(`click`,()=>{t.remove(),$()})})}function ye(e,t=[],n=null){q.jugador=e.jugador;let r=e,i=n?.titulo??(r.juego===`memorama`?`¡Encontraste todas las parejas!`:r.aciertos===r.total_items?`¡Perfecto!`:r.aciertos>=r.total_items/2?`¡Muy bien!`:`¡Buen intento!`),a=n?.html??(r.juego===`memorama`?``:`<p>${r.aciertos} de ${r.total_items} correctas</p>`),o=r.cuenta_puntos?`<p>Sumaste <strong>${f(r.puntos)}</strong> puntos. Ahora tienes ${f(r.jugador.puntos)}.</p>`:`<p>Fue una partida de práctica: no suma puntos. Prueba otro juego.</p>`;s.fin();let c=Y(`resultado`,`
        <div class="resultado ${n?`con-cierre`:``}"><div class="caja">
            ${H(`fibi-mini fibi-festeja`)}
            <h2>${i}</h2>
            <div class="grande"><span class="moneda" aria-hidden="true"></span>${r.cuenta_puntos?`+`:``}${f(r.puntos)}</div>
            ${a}
            ${o}
            ${v(n?.cierre,B)}
            ${t.length?`<div class="repaso"><p class="etiqueta">Para repasar</p>${t.slice(0,3).map(e=>`<div><strong>${u(e.titulo)}</strong><span>${u(e.texto)}</span></div>`).join(``)}</div>`:``}
            <div class="acciones">
                <button class="btn btn-xl" data-otro>Jugar otro juego</button>
                <button class="btn btn-xl btn-rosa" data-premios>Ver premios</button>
            </div>
        </div></div>`);c.querySelector(`[data-otro]`).addEventListener(`click`,$),c.querySelector(`[data-premios]`).addEventListener(`click`,be)}function be(){let e=q.jugador,t=Y(`premios`,`
        ${he(e)}
        <div class="barra"><button class="btn btn-chico btn-fantasma" data-volver>← Juegos</button><h2 style="font-size:2.4rem">Premios</h2></div>
        <div class="premios-grid">
            ${q.config.premios.map(t=>{let n=e.puntos>=t.costo;return`
                <div class="panel premio ${t.agotado?`agotado`:``}">
                    <span class="emoji" aria-hidden="true">${u(t.icono)}</span>
                    <h3>${u(t.nombre)}</h3>
                    ${t.descripcion?`<p>${u(t.descripcion)}</p>`:``}
                    <span class="costo">${p(t.costo)}</span>
                    ${t.agotado?`<p>Agotado</p>`:n?`<button class="btn btn-rosa" data-canjear="${t.id}">Canjear</button>`:`<div class="barra-progreso"><span style="width:${Math.min(100,e.puntos/t.costo*100)}%"></span></div><p>Te faltan ${f(t.costo-e.puntos)}</p>`}
                </div>`}).join(``)}
        </div>`);t.querySelector(`[data-volver]`).addEventListener(`click`,$),t.querySelector(`.premios-grid`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-canjear]`);t&&xe(q.config.premios.find(e=>e.id===Number(t.dataset.canjear)))})}function xe(e){let t=X(`
        <span class="emoji" style="font-size:4rem" aria-hidden="true">${u(e.icono)}</span>
        <h2>¿Canjear ${u(e.nombre)}?</h2>
        <p>Se descontarán ${f(e.costo)} puntos. Te quedarán ${f(q.jugador.puntos-e.costo)}.</p>
        <p class="error" data-error></p>
        <div class="acciones">
            <button class="btn btn-rosa" data-si>Sí, canjear</button>
            <button class="btn btn-fantasma" data-no>Mejor sigo jugando</button>
        </div>`);t.querySelector(`[data-no]`).addEventListener(`click`,()=>t.remove());let n=t.querySelector(`[data-si]`);n.addEventListener(`click`,async()=>{n.disabled=!0;try{let n=await r.canjear(q.jugador.codigo,e.id);q.jugador=n.jugador,q.config.premios=n.premios,t.remove(),s.premio(),be();let i=X(`
                <h2>¡Premio canjeado!</h2>
                <p>Muestra este comprobante en el stand para recibir tu premio.</p>
                <div class="boleto">
                    <img src="${B}/img/logo-finabien.png" alt="Financiera para el Bienestar">
                    <span class="etiqueta">Folio de canje</span>
                    <strong class="folio">${u(n.folio)}</strong>
                    <span>${u(e.icono??``)} ${u(e.nombre)} · ${u(q.jugador.nombre)} · ${u(q.jugador.codigo)}</span>
                </div>
                <button class="btn btn-xl" data-ok>Listo</button>`);i.querySelector(`[data-ok]`).addEventListener(`click`,()=>i.remove())}catch(e){t.querySelector(`[data-error]`).textContent=e.message,n.disabled=!1}})}function Se(){q.reg={paso:1,nombre:``,edad:null,avatar:null},ue()}function Ce(){let e=()=>{q.ultimaActividad=Date.now()};[`pointerdown`,`keydown`].forEach(t=>addEventListener(t,e,{passive:!0}));let t=null,n=0;setInterval(()=>{if(t&&!t.isConnected&&(clearInterval(n),t=null,q.ultimaActividad=Date.now()),q.pantalla===`inicio`||t)return;let e=(q.config?.inactividad_seg??90)*1e3;if(Date.now()-q.ultimaActividad<e)return;let r=10;t=X(`
            <h2>¿Sigues ahí?</h2>
            <p>Volveremos al inicio en <strong data-resta>${r}</strong> segundos.${q.jugador?` Tus puntos quedan guardados con el código <strong>${u(q.jugador.codigo)}</strong>.`:``}</p>
            <button class="btn btn-xl" data-sigo>Sigo aquí</button>`),n=setInterval(()=>{r--;let e=t?.querySelector(`[data-resta]`);e&&(e.textContent=r),r<=0&&(clearInterval(n),t?.remove(),t=null,Se())},1e3),t.querySelector(`[data-sigo]`).addEventListener(`click`,()=>{clearInterval(n),t.remove(),t=null,q.ultimaActividad=Date.now()})},1e3)}async function we(){try{await navigator.wakeLock?.request(`screen`)}catch{}}z.addEventListener(`click`,e=>{let t=e.target;if(t.closest(`[data-ir="registro"]`))s.toque(),q.reg={paso:1,nombre:``,edad:null,avatar:null},fe();else if(t.closest(`[data-ir="codigo"]`))s.toque(),me();else if(t.closest(`[data-atras]`))q.pantalla===`registro`&&q.reg.paso>1?(q.reg.paso--,fe()):Se();else if(t.closest(`[data-salir]`)){let e=X(`
            <h2>¿Terminar por hoy?</h2>
            <p>Tus puntos quedan guardados. Vuelve cuando quieras con tu código:</p>
            <div class="codigo-grande" style="font-size:3.2rem;justify-self:center">${u(q.jugador?.codigo??``)}</div>
            <div class="acciones"><button class="btn" data-quedar>Seguir jugando</button><button class="btn btn-fantasma" data-fin>Terminar</button></div>`);e.querySelector(`[data-quedar]`).addEventListener(`click`,()=>e.remove()),e.querySelector(`[data-fin]`).addEventListener(`click`,Se)}else t.closest(`[data-grupo]`)&&q.pantalla===`inicio`?(q.rankingGrupo=t.closest(`[data-grupo]`).dataset.grupo,de(z.firstElementChild)):t.closest(`[data-sonido]`)?t.closest(`[data-sonido]`).textContent=s.alternar()?`Sonido: sí`:`Sonido: no`:t.closest(`[data-pantalla-completa]`)&&(document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.().catch(()=>le(`Este navegador no permite pantalla completa. Usa F11.`)))}),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&we()}),addEventListener(`pointerdown`,we,{once:!0});async function Te(){try{q.config=await r.configuracion()}catch(e){Y(`error`,`<div class="cargando" style="text-align:center">${u(e.message)}<br><small>Reintentando en 5 segundos…</small></div>`),setTimeout(Te,5e3);return}q.rankingGrupo=Object.keys(q.config.grupos)[0],ue(),Ce()}Te();