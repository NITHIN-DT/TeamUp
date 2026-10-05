import {useEffect,useState} from 'react'
import {useNavigate,useParams} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {api} from '../lib/api'
import {skillNames} from '../lib/match'
export default function ProjectForm(){
  const {id}=useParams(),{user}=useAuth(),nav=useNavigate(),[f,setF]=useState({title:'',description:'',status:'open',max_members:4,skills:'',roles:''}),[err,setErr]=useState('')
  useEffect(()=>{if(id)api.project(id).then(p=>setF({title:p.title,description:p.description||'',status:p.status,max_members:p.max_members||4,skills:skillNames(p).join(', '),roles:p.project_roles.map(r=>r.title).join(', ')}))},[id])
  const set=k=>e=>setF({...f,[k]:e.target.value})
  const save=async e=>{e.preventDefault();try{
    const {skills,roles,...p}=f
    const row=await api.saveProject({...p,max_members:+p.max_members,owner_id:user.id,...(id?{id}:{})},skills,roles);nav(`/projects/${row.id}`)}catch(x){setErr(x.message)}}
  return <form className="auth wide" onSubmit={save}><h2>{id?'Edit project':'New project'}</h2>
    <input required placeholder="Project title" value={f.title} onChange={set('title')}/>
    <textarea required placeholder="What are you building?" value={f.description} onChange={set('description')}/>
    <input placeholder="Required skills, comma separated (React, Figma)" value={f.skills} onChange={set('skills')}/>
    <input placeholder="Open roles, comma separated (Frontend dev, Designer)" value={f.roles} onChange={set('roles')}/>
    <div className="row gap"><input type="number" min="2" value={f.max_members} onChange={set('max_members')}/>
      <select value={f.status} onChange={set('status')}><option value="open">Open</option><option value="closed">Closed</option></select></div>
    {err&&<p className="err">{err}</p>}<button className="btn">Save project</button></form>
}
