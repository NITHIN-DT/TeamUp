export const skillNames=p=>(p.project_skills||[]).map(x=>x.skill.name)
// Compatibility: % of required project skills the student has.
export function match(mine,p){
  const req=skillNames(p).map(n=>n.toLowerCase()),have=new Set(mine.map(n=>n.toLowerCase()))
  if(!req.length)return{score:0,hit:[],miss:[]}
  const hit=req.filter(n=>have.has(n))
  return{score:Math.round(hit.length/req.length*100),hit,miss:req.filter(n=>!have.has(n))}
}
