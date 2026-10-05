// Every Supabase call lives here. Table/column names follow README.md.
import {supabase as s} from './supabase'
import {match} from './match'
const ok=({data,error})=>{if(error)throw error;return data}
const PROJ='*, owner:profiles(id,full_name), project_skills(skill:skills(id,name)), project_roles(id,title,slots)'
export const splitList=t=>[...new Set(t.split(',').map(x=>x.trim()).filter(Boolean))]
export const api={
  signUp:(email,password,full_name)=>s.auth.signUp({email,password,options:{data:{full_name}}}).then(ok),
  signIn:(email,password)=>s.auth.signInWithPassword({email,password}).then(ok),
  signOut:()=>s.auth.signOut(),

  profile:async id=>ok(await s.from('profiles').select('*').eq('id',id).maybeSingle()),
  saveProfile:async p=>ok(await s.from('profiles').upsert(p)),
  mySkills:async uid=>ok(await s.from('user_skills').select('skill:skills(name)').eq('user_id',uid)).map(r=>r.skill.name),
  skillIds:async names=>{
    if(!names.length)return[]
    return ok(await s.from('skills').upsert(names.map(name=>({name})),{onConflict:'name'}).select('id')).map(r=>r.id)
  },
  setSkills:async(uid,names)=>{
    const ids=await api.skillIds(names)
    ok(await s.from('user_skills').delete().eq('user_id',uid))
    if(ids.length)ok(await s.from('user_skills').insert(ids.map(skill_id=>({user_id:uid,skill_id}))))
  },

  projects:async({q='',skill=''}={})=>{
    let r=s.from('projects').select(PROJ).eq('status','open').order('created_at',{ascending:false})
    if(q)r=r.ilike('title',`%${q}%`)
    let d=ok(await r)
    if(skill)d=d.filter(p=>p.project_skills.some(x=>x.skill.name.toLowerCase()===skill.toLowerCase()))
    return d
  },
  project:async id=>ok(await s.from('projects').select(PROJ).eq('id',id).single()),
  myProjects:async uid=>ok(await s.from('projects').select(PROJ).eq('owner_id',uid).order('created_at',{ascending:false})),
  saveProject:async(p,skills,roles)=>{
    const row=ok(await s.from('projects').upsert(p).select().single())
    const ids=await api.skillIds(splitList(skills))
    ok(await s.from('project_skills').delete().eq('project_id',row.id))
    if(ids.length)ok(await s.from('project_skills').insert(ids.map(skill_id=>({project_id:row.id,skill_id}))))
    ok(await s.from('project_roles').delete().eq('project_id',row.id))
    const rs=splitList(roles)
    if(rs.length)ok(await s.from('project_roles').insert(rs.map(title=>({project_id:row.id,title,slots:1}))))
    return row
  },
  deleteProject:async id=>ok(await s.from('projects').delete().eq('id',id)),
  // Swap for s.functions.invoke('recommend') once the Edge Function exists.
  recommend:async uid=>{
    const [mine,all]=await Promise.all([api.mySkills(uid),api.projects()])
    return all.filter(p=>p.owner_id!==uid).map(p=>({...p,m:match(mine,p)})).sort((a,b)=>b.m.score-a.m.score).slice(0,4)
  },

  apply:async(project_id,applicant_id,role_id,message)=>ok(await s.from('applications').insert({project_id,applicant_id,role_id:role_id||null,message})),
  myApps:async uid=>ok(await s.from('applications').select('*,project:projects(id,title)').eq('applicant_id',uid).order('created_at',{ascending:false})),
  incoming:async uid=>ok(await s.from('applications').select('*,project:projects!inner(id,title,owner_id),applicant:profiles(id,full_name,bio)').eq('project.owner_id',uid).order('created_at',{ascending:false})),
  // Ideally a DB trigger / Edge Function; client-side so the flow works from day one.
  decide:async(a,status)=>{
    ok(await s.from('applications').update({status}).eq('id',a.id))
    if(status==='accepted'){
      let t=ok(await s.from('teams').select('id').eq('project_id',a.project.id).maybeSingle())
      if(!t)t=ok(await s.from('teams').insert({project_id:a.project.id,name:a.project.title}).select('id').single())
      ok(await s.from('team_members').insert({team_id:t.id,user_id:a.applicant_id,role:'member'}))
    }
    ok(await s.from('notifications').insert({user_id:a.applicant_id,type:'application',message:`Your application to ${a.project.title} was ${status}`}))
  },
  teams:async uid=>ok(await s.from('team_members').select('role,team:teams(id,name,project_id,team_members(role,user:profiles(id,full_name)))').eq('user_id',uid)),
  setRole:async(team_id,user_id,role)=>ok(await s.from('team_members').update({role}).eq('team_id',team_id).eq('user_id',user_id)),

  comments:async pid=>ok(await s.from('comments').select('*,user:profiles(full_name)').eq('project_id',pid).order('created_at')),
  addComment:async(project_id,user_id,body)=>ok(await s.from('comments').insert({project_id,user_id,body})),

  notifications:async uid=>ok(await s.from('notifications').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(50)),
  readAll:async uid=>ok(await s.from('notifications').update({read:true}).eq('user_id',uid).eq('read',false)),
  unreadCount:async uid=>(await s.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',uid).eq('read',false)).count||0,
  onNotification:(uid,cb)=>{
    const ch=s.channel('notif-'+uid).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${uid}`},cb).subscribe()
    return ()=>s.removeChannel(ch)
  },
}
