import {useEffect,useState} from 'react'
import {useAuth} from '../lib/auth.jsx'
import {api,splitList} from '../lib/api'
const F=[['full_name','Full name'],['college','College'],['department','Department'],['year','Year of study'],['github','GitHub URL'],['linkedin','LinkedIn URL']]
export default function Profile(){
  const {user}=useAuth(),[f,setF]=useState({full_name:'',college:'',department:'',year:'',bio:'',github:'',linkedin:''}),[skills,setSkills]=useState(''),[msg,setMsg]=useState('')
  useEffect(()=>{api.profile(user.id).then(p=>p&&setF(x=>({...x,...p})));api.mySkills(user.id).then(s=>setSkills(s.join(', ')))},[])
  const save=async e=>{e.preventDefault();try{
    const {created_at,...rest}=f
    await api.saveProfile({...rest,id:user.id,year:f.year===''||f.year==null?null:+f.year});await api.setSkills(user.id,splitList(skills));setMsg('Profile saved.')}catch(x){setMsg(x.message)}}
  return <form className="auth wide" onSubmit={save}><h2>Your profile</h2>
    {F.map(([k,l])=><input key={k} placeholder={l} value={f[k]??''} onChange={e=>setF({...f,[k]:e.target.value})}/>)}
    <textarea placeholder="Short bio" value={f.bio??''} onChange={e=>setF({...f,bio:e.target.value})}/>
    <input placeholder="Your skills, comma separated (React, Python, UI design)" value={skills} onChange={e=>setSkills(e.target.value)}/>
    <button className="btn">Save profile</button>{msg&&<p className="muted">{msg}</p>}</form>
}
