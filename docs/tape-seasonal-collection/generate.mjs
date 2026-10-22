import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {decode,encode} from '../tape-vintage-test/png-codec.mjs';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const template=decode(await fs.readFile(path.join(root,'public/assets/tape/background_color/background_color_weiss.png')));
const W=2000,H=1333;
export const designs=[
['autumn-maple','Herbst · Goldene Blätter','AutumnMapleDesign.png','maple',['#efdfba','#b66a35','#893f32','#6d7042']],
['autumn-rain','Herbst · Regentag','AutumnRainDesign.png','rain',['#ccd7d4','#607f84','#bba07b','#dc925a']],
['autumn-berries','Herbst · Waldbeeren','AutumnBerriesDesign.png','berries',['#d6c7ac','#747b51','#a95843','#523e39']],
['autumn-plaid','Herbst · Wollschal','AutumnPlaidDesign.png','plaid',['#cda76d','#905643','#575d4b','#e9dac0']],
['winter-snow','Winter · Leiser Schnee','WinterSnowDesign.png','snow',['#d7e7e9','#8aa9b6','#4d7186','#f5f7ef']],
['winter-pines','Winter · Tannenwald','WinterPinesDesign.png','pines',['#cfdbd5','#78958b','#3d645e','#244c4a']],
['winter-aurora','Winter · Polarlicht','WinterAuroraDesign.png','aurora',['#263f54','#63a79a','#8c91ae','#e6e8da']],
['winter-knit','Winter · Strickpullover','WinterKnitDesign.png','knit',['#c9b4ab','#f3e9d7','#8b5f5c','#b88e7e']],
['halloween-pumpkins','Halloween · Kürbisnacht','HalloweenPumpkinsDesign.png','pumpkins',['#413744','#c47d38','#e3ad55','#858366']],
['halloween-ghosts','Halloween · Geisterstunde','HalloweenGhostsDesign.png','ghosts',['#76768d','#eee8d4','#bbb1bd','#383b52']],
['pattern-vertical','Muster · Vertikale Streifen','PatternVerticalDesign.png','vertical',['#d5c6ad','#597c7a','#b76850','#e6ad65']],
['pattern-diagonal','Muster · Diagonale Streifen','PatternDiagonalDesign.png','diagonal',['#d9d8cc','#687e9c','#bf7f86','#d6ad63']],
['pattern-terrazzo','Muster · Terrazzo','PatternTerrazzoDesign.png','terrazzo',['#e7dfcc','#4f7774','#bd735a','#d4b36c']],
['retrowave-neon','Retrowave · Neon Sunset','RetrowaveNeonDesign.png','retro',['#3f365d','#e471aa','#789fc6','#eeb982']],
['paper-note','Papier · Notizzettel','PaperNoteDesign.png','note',['#e8ddbc','#89a9b2','#ba8072','#b3a17d']],
].map(([id,label,file,kind,palette])=>({id,label,file,kind,palette}));
function color(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
let canvas,seed=714;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function pixel(x,y,c,a=1){x=Math.floor(x);y=Math.floor(y);if(x<502||x>1495||y<536||y>815)return;let i=(y*W+x)*4;for(let k=0;k<3;k++)canvas[i+k]=Math.round(canvas[i+k]*(1-a)+c[k]*a);}
function rect(x,y,w,h,c,a=1){for(let yy=Math.floor(y);yy<y+h;yy++)for(let xx=Math.floor(x);xx<x+w;xx++)pixel(xx,yy,c,a);}
function ellipse(cx,cy,rx,ry,c,a=1){for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){let d=Math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2);let aa=Math.max(0,Math.min(1,(1-d)*Math.min(rx,ry)+.5));if(aa)pixel(x,y,c,a*aa);}}
function line(x1,y1,x2,y2,width,c,a=1){let vx=x2-x1,vy=y2-y1,len=vx*vx+vy*vy;for(let y=Math.floor(Math.min(y1,y2)-width);y<=Math.max(y1,y2)+width;y++)for(let x=Math.floor(Math.min(x1,x2)-width);x<=Math.max(x1,x2)+width;x++){let t=len?Math.max(0,Math.min(1,((x-x1)*vx+(y-y1)*vy)/len)):0;let d=Math.hypot(x-x1-t*vx,y-y1-t*vy);let aa=Math.max(0,Math.min(1,width/2+.5-d));if(aa)pixel(x,y,c,a*aa);}}
function poly(points,c,a=1){let min=Math.floor(Math.min(...points.map(p=>p[1]))),max=Math.ceil(Math.max(...points.map(p=>p[1])));for(let y=min;y<=max;y++){let xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){let p=points[i],q=points[j];if((p[1]>y)!==(q[1]>y))xs.push(p[0]+(y-p[1])*(q[0]-p[0])/(q[1]-p[1]));}xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i+=2)for(let x=Math.ceil(xs[i]);x<xs[i+1];x++)pixel(x,y,c,a);}}
function leaf(cx,cy,s,angle,c,maple=false){let pts=maple?[[0,-1],[.25,-.45],[.7,-.65],[.56,-.13],[1,-.12],[.55,.3],[.65,.6],[.15,.56],[0,1],[-.15,.56],[-.65,.6],[-.55,.3],[-1,-.12],[-.56,-.13],[-.7,-.65],[-.25,-.45]]:[[0,-1],[.5,-.7],[.7,-.1],[.4,.6],[0,1],[-.45,.6],[-.65,-.1],[-.4,-.7]];let co=Math.cos(angle),si=Math.sin(angle),tr=(x,y)=>[cx+s*(x*co-y*si),cy+s*(x*si+y*co)];poly(pts.map(p=>tr(...p)),c);let p=tr(0,-.7),q=tr(0,1.3);line(...p,...q,1.3,c.map(v=>v*.65),.7);for(let a of [-1,1])for(let t of [-.25,.15,.5]){let p=tr(0,t),q=tr(a*.35,t-.28);line(...p,...q,.8,c.map(v=>v*.7),.6);}}
function snow(cx,cy,r,c){for(let a=0;a<3;a++){let t=a*Math.PI/3;line(cx-Math.cos(t)*r,cy-Math.sin(t)*r,cx+Math.cos(t)*r,cy+Math.sin(t)*r,1.4,c,.9);}}
function pine(x,y,s,c){line(x,y-s,x,y,Math.max(2,s*.04),c);for(let k=0;k<5;k++){let yy=y-s+k*s*.16,spread=s*(.15+k*.055);poly([[x,yy-s*.2],[x-spread,yy+s*.16],[x+spread,yy+s*.16]],c);}}
function bat(cx,cy,s,c){poly([[cx,cy-2*s],[cx-3*s,cy-4*s],[cx-8*s,cy-3*s],[cx-5*s,cy],[cx-3*s,cy-1*s],[cx,cy+2*s],[cx+3*s,cy-s],[cx+5*s,cy],[cx+8*s,cy-3*s],[cx+3*s,cy-4*s]],c);}
function ghost(x,y,s,c,ink){ellipse(x,y-s*.25,s*.6,s*.8,c);poly([[x-s*.6,y-s*.15],[x-s*.64,y+s*.7],[x-s*.33,y+s*.48],[x,y+s*.73],[x+s*.33,y+s*.48],[x+s*.64,y+s*.7],[x+s*.6,y-s*.15]],c);ellipse(x-s*.2,y-s*.22,s*.07,s*.11,ink);ellipse(x+s*.2,y-s*.22,s*.07,s*.11,ink);ellipse(x,y+s*.05,s*.08,s*.11,ink);}
function pumpkin(x,y,s,c,ink){ellipse(x-s*.28,y,s*.6,s*.65,c.map(v=>v*.86));ellipse(x+s*.28,y,s*.6,s*.65,c.map(v=>v*.93));ellipse(x,y,s*.48,s*.7,c);poly([[x-3,y-s*.6],[x+2,y-s],[x+8,y-s*.96],[x+5,y-s*.56]],ink);poly([[x-s*.43,y-s*.15],[x-s*.22,y-s*.35],[x-s*.12,y-s*.08]],ink);poly([[x+s*.43,y-s*.15],[x+s*.22,y-s*.35],[x+s*.12,y-s*.08]],ink);poly([[x-s*.37,y+s*.15],[x-s*.1,y+s*.28],[x+s*.32,y+s*.12],[x+s*.2,y+s*.4],[x-s*.18,y+s*.42]],ink);}
function allowed(x,y){return y>=536&&!(x>=535&&x<=748&&y>=725&&y<=795)&&!(x>=1243&&x<=1465&&y>=725&&y<=795);}
for(let index=0;index<designs.length;index++){
let d=designs[index],p=d.palette.map(color);seed=714+index*39;canvas=Buffer.alloc(W*H*4);
for(let y=536;y<=815;y++)for(let x=502;x<=1495;x++){let i=(y*W+x)*4;let n=(((Math.imul(x,374761393)+Math.imul(y,668265263))>>>0)%101)/100-.5;for(let k=0;k<3;k++)canvas[i+k]=Math.max(0,Math.min(255,Math.round(p[0][k]+n*3.5-(y-536)*.002)));}
if(d.kind==='maple'){for(let i=0;i<82;i++)leaf(502+rand()*994,535+rand()*280,10+rand()*16,rand()*6.28,p[1+Math.floor(rand()*3)],true);}
if(d.kind==='rain'){for(let i=0;i<95;i++){let x=502+rand()*994,y=536+rand()*280;line(x,y,x-4,y+13,1.6,p[1],.35);}for(let i=0;i<22;i++)leaf(502+rand()*994,630+rand()*200,10+rand()*8,rand()*6.28,p[i%2?2:3]);}
if(d.kind==='berries'){for(let i=0;i<16;i++){let x=510+rand()*965,y=570+rand()*220;line(x,y,x+23,y-57,1.5,p[3],.8);for(let k=0;k<4;k++){leaf(x+6+k*4,y-6-k*12,9+k,(-1)**k*.8,p[1]);ellipse(x+19+k*3,y-k*11,4.5,4.5,p[2]);ellipse(x+18+k*3,y-1-k*11,1,1,p[0],.7);}}}
if(d.kind==='plaid'){for(let x=488;x<1520;x+=86){rect(x,536,25,280,p[1],.5);rect(x+31,536,5,280,p[2],.8);}for(let y=538;y<816;y+=64){rect(502,y,994,18,p[2],.32);rect(502,y+24,994,3,p[3],.9);}for(let y=536;y<816;y+=4)line(502,y,1495,y,1,p[3],.12);}
if(d.kind==='snow'){poly([[502,734],[660,674],[840,727],[1020,671],[1220,720],[1495,663],[1495,815],[502,815]],p[1]);poly([[502,787],[700,731],[930,790],[1160,729],[1495,769],[1495,815],[502,815]],p[3]);for(let i=0;i<65;i++){let x=502+rand()*994,y=536+rand()*279;if(i%5===0)snow(x,y,5+rand()*6,p[3]);else ellipse(x,y,1.3,1.3,p[3],.8);}}
if(d.kind==='pines'){poly([[502,733],[760,642],[1020,716],[1280,626],[1495,703],[1495,815],[502,815]],p[1]);for(let i=0;i<25;i++)pine(510+i*43,830-(i%3)*15,70+rand()*75,p[2+i%2]);for(let i=0;i<75;i++)ellipse(502+rand()*994,536+rand()*278,1.5,1.5,[246,245,231],.9);}
if(d.kind==='aurora'){for(let y=536;y<=815;y++)for(let x=502;x<=1495;x++){let i=(y*W+x)*4,t=(y-536)/279,w=Math.exp(-(((t-.3-.14*Math.sin(x*.012))/.11)**2));for(let k=0;k<3;k++)canvas[i+k]=Math.round(p[0][k]*(1-w*.8)+p[1][k]*w*.8);}for(let i=0;i<80;i++)ellipse(502+rand()*994,536+rand()*230,1,1,p[3],.8);for(let i=0;i<18;i++)pine(504+i*60,830,45+rand()*43,[31,51,61]);}
if(d.kind==='knit'){for(let y=550;y<820;y+=30)for(let x=510;x<1510;x+=25){line(x-7,y-7,x,y+6,2.5,p[(Math.floor(y/30)%5===0)?2:1],.85);line(x+7,y-7,x,y+6,2.5,p[(Math.floor(y/30)%5===0)?2:1],.85);}for(let x=525;x<1490;x+=110)snow(x,638,15,p[1]);}
if(d.kind==='pumpkins'){for(let i=0;i<16;i++)pumpkin(525+rand()*945,565+rand()*240,14+rand()*15,p[i%2?1:2],p[0]);for(let i=0;i<15;i++)bat(515+rand()*970,545+rand()*250,1.5+rand()*1.7,p[3]);for(let i=0;i<35;i++)ellipse(505+rand()*985,538+rand()*274,1.3,1.3,p[2],.7);}
if(d.kind==='ghosts'){for(let i=0;i<20;i++)ghost(517+rand()*965,557+rand()*233,12+rand()*13,p[1],p[3]);for(let i=0;i<38;i++){let x=505+rand()*985,y=540+rand()*271;line(x-3,y,x+3,y,1,p[2]);line(x,y-3,x,y+3,1,p[2]);}}
if(d.kind==='vertical'){for(let x=502;x<1496;x+=60){rect(x,536,18,280,p[1]);rect(x+23,536,8,280,p[2]);rect(x+36,536,3,280,p[3]);}}
if(d.kind==='diagonal'){for(let x=150;x<1700;x+=68){poly([[x,536],[x+25,536],[x+305,816],[x+280,816]],p[1]);poly([[x+31,536],[x+42,536],[x+322,816],[x+311,816]],p[2]);line(x+51,536,x+331,816,2,p[3]);}}
if(d.kind==='terrazzo'){for(let i=0;i<190;i++){let x=502+rand()*994,y=536+rand()*279,s=3+rand()*12;poly([[x-s,y],[x-s*.3,y-s],[x+s*.85,y-s*.4],[x+s,y+s*.5],[x,y+s]],p[1+i%3],.85);}}
if(d.kind==='retro'){for(let y=536;y<=815;y++)for(let x=502;x<=1495;x++){let i=(y*W+x)*4,t=(y-536)/279;for(let k=0;k<3;k++)canvas[i+k]=Math.round(p[0][k]*(1-t*.45)+p[1][k]*t*.45);}ellipse(1390,590,61,61,p[3]);for(let y=581;y<655;y+=13)rect(1326,y,130,5,p[0]);for(let x=190;x<=1820;x+=78)line(1000+(x-1000)*.15,650,x,815,1.3,p[2],.65);for(let y=670,dy=5;y<816;y+=dy,dy*=1.35)line(502,y,1495,y,1.3,p[1],.8);poly([[502,701],[532,660],[550,681],[587,620],[622,668],[650,637],[688,692],[715,668],[760,714],[502,725]],p[0]);for(let i=0;i<40;i++)ellipse(505+rand()*985,538+rand()*100,1,1,[241,220,207],.8);}
if(d.kind==='note'){for(let y=554;y<816;y+=25)line(502,y,1495,y,1.5,p[1],.55);line(540,536,540,815,2,p[2],.75);for(let y=570;y<815;y+=66){ellipse(519,y,5,5,p[3],.55);ellipse(519,y-1,3,3,[249,241,218],.8);}poly([[1443,815],[1495,761],[1495,815]],p[3],.4);poly([[1443,814],[1494,761],[1464,775]],p[0].map(v=>Math.min(255,v+12)));}
for(let y=536;y<=815;y++)for(let x=502;x<=1495;x++){let i=(y*W+x)*4;canvas[i+3]=allowed(x,y)?template.data[i+3]:0;if(!canvas[i+3])canvas[i]=canvas[i+1]=canvas[i+2]=0;}
await fs.writeFile(path.join(out,d.file),encode({w:W,h:H,data:canvas}),{flag:'wx'});
}
await fs.writeFile(path.join(out,'designs.json'),JSON.stringify(designs,null,2));
console.log('Generated '+designs.length+' designs');
