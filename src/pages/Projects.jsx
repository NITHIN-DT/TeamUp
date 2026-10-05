import {useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {api} from '../lib/api'
import {match,skillNames} from '../lib/match'
import {useLoad,Status,ProjectCard,Tags} from '../components/ui.jsx'
export function Discover(){
  const {user}=useAuth(),[q,setQ]=useState(''),[skill,setSkill]=useState(''),[go,setGo]=useState({q:'',skill:''})
  const [d,err]=useLoad(async()=>{const [ps,mine]=await Promise.all([api.projects(go),api.mySkills(user.id)]);return ps.map(p=>({...p,m:match(mine,p)}))},[go])
  return <><h2>Discover projects</h2>
    <form className="filters" onSubmit={e=>{e.preventDefault();setGo({q,skill})}}>
      <input placeholder="Search by title" value={q} onChange={e=>setQ(e.target.value)}/>
      <input placeholder="Filter by skill" value={skill} onChange={e=>setSkill(e.target.value)}/><button className="btn">Search</button></form>
    <Status data={d} error={err} empty="No open projects match. Try fewer filters."/>
    {d?.length>0&&<div className="grid">{[...d].sort((a,b)=>b.m.score-a.m.score).map(p=><ProjectCard key={p.id} p={p} m={p.m}/>)}</div>}</>
}
export function ProjectDetails(){
  const {id}=useParams(),{user}=useAuth(),nav=useNavigate(),[msg,setMsg]=useState(''),[role,setRole]=useState(''),[body,setBody]=useState(''),[info,setInfo]=useState('')
  const [d,err]=useLoad(async()=>{const [p,mine]=await Promise.all([api.project(id),api.mySkills(user.id)]);return{p,m:match(mine,p)}},[id])
  const [cs,,setCs]=useLoad(()=>api.comments(id),[id])
  if(!d)return <Status data={d} error={err}/>
  const {p,m}=d,own=p.owner_id===user.id
  const apply=async e=>{e.preventDefault();try{await api.apply(id,user.id,role,msg);setInfo('Application sent.')}catch(x){setInfo(x.message)}}
  const post=async e=>{e.preventDefault();if(!body.trim())return;await api.addComment(id,user.id,body);setBody('');setCs(await api.comments(id))}
  return <><div className="row"><h2>{p.title}</h2>{!own&&<span className={m.score>=60?'score good':'score'}>{m.score}% match</span>}</div>
    <p className="muted">by {p.owner?.full_name} · {p.status}</p><p>{p.description}</p>
    <h3>Required skills</h3><Tags names={skillNames(p)} hit={m.hit}/>
    {m.miss.length>0&&!own&&<p className="muted">Missing: {m.miss.join(', ')}</p>}
    <h3>Open roles</h3>{p.project_roles.length?<ul className="list">{p.project_roles.map(r=><li key={r.id}>{r.title}</li>)}</ul>:<p className="muted">No specific roles listed.</p>}
    {own?<div className="row gap"><Link className="btn" to={`/projects/${id}/edit`}>Edit project</Link>
      <button className="ghost danger" onClick={async()=>{if(confirm('Delete this project?')){await api.deleteProject(id);nav('/dashboard')}}}>Delete project</button></div>
    :<form className="box" onSubmit={apply}><h3>Apply to join</h3>
      {p.project_roles.length>0&&<select value={role} onChange={e=>setRole(e.target.value)}><option value="">Any role</option>{p.project_roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select>}
      <textarea placeholder="Why are you a good fit?" value={msg} onChange={e=>setMsg(e.target.value)}/><button className="btn">Send application</button>{info&&<p className="muted">{info}</p>}</form>}
    <h3>Comments</h3>
    <ul className="list">{(cs||[]).map(c=><li key={c.id}><b>{c.user?.full_name}</b> {c.body}</li>)}</ul>
    <form className="row gap" onSubmit={post}><input placeholder="Write a comment" value={body} onChange={e=>setBody(e.target.value)}/><button className="btn">Post comment</button></form></>
}
