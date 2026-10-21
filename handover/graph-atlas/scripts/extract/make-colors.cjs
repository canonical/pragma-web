// Builds data/colors.json from data/values.json: every colour token symbol with a hex per mode.
// Run from the site's data directory: cd site/data && node ../../scripts/extract/make-colors.cjs
const v=require(require("path").resolve("values.json"));
function oklchToHex(L,C,H){const h=H*Math.PI/180;const a=C*Math.cos(h),b=C*Math.sin(h);
const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.2914855480*b;
const l=l_**3,m=m_**3,s=s_**3;
let r=4.0767416621*l-3.3077115913*m+0.2309699292*s,g=-1.2684380046*l+2.6097574011*m-0.3413193965*s,bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s;
const gam=x=>{x=Math.max(0,Math.min(1,x));return x<=0.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-0.055};
return "#"+[r,g,bb].map(x=>Math.round(gam(x)*255).toString(16).padStart(2,"0")).join("");}
const out={};
for(const x of v){ if(!/color/.test(x.type||"")) continue; let val; try{val=JSON.parse(x.value)}catch{continue} if(!val.components) continue; const hex=val.hex?val.hex.toLowerCase():oklchToHex(...val.components); const mode=x.coord?x.coord.split("coordinate.")[1]:"base"; (out[x.name] ??= {})[mode]=hex; if(val.alpha!=null&&val.alpha<1) out[x.name][mode+"Alpha"]=val.alpha; }
require("fs").writeFileSync("colors.json", JSON.stringify(out));
console.log("colour symbols with hex:", Object.keys(out).length);
