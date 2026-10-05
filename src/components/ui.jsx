import {useEffect,useState} from 'react'
import {Link,NavLink,Navigate,Outlet,useNavigate} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {api} from '../lib/api'
import {skillNames} from '../lib/match'

export function useLoad(fn,deps=[]){
  const [data,setData]=useState(null),[error,setError]=useState('')
  useEffect(()=>{let live=true;setData(null);fn().then(d=>live&&setData(d)).catch(e=>live&&setError(e.message));return()=>{live=false}},deps)
  return [data,error,setData]
}
export const Status=({data,error,empty})=>error?<p className="err">{error}</p>:!data?<p className="muted">Loading…</p>:Array.isArray(data)&&!data.length?<p className="muted">{empty}</p>:null

export function Protected(){
  const {user,loading}=useAuth()
  if(loading)return <p className="muted">Loading…</p>
  return user?<Layout/>:<Navigate to="/login" replace/>
}
function Layout(){
  const {user}=useAuth(),nav=useNavigate(),[n,setN]=useState(0)
  useEffect(()=>{
    const load=()=>api.unreadCount(user.id).then(setN).catch(()=>{})
    load();return api.onNotification(user.id,load)
  },[user.id])
  const links=[['dashboard','Dashboard'],['discover','Discover'],['applications','Applications'],['teams','Teams'],['notifications',`Notifications${n?` (${n})`:''}`],['profile','Profile']]
  return <>
    <header className="bar"><Link to="/dashboard" className="logo">TeamUp</Link>
      <nav>{links.map(([p,l])=><NavLink key={p} to={'/'+p}>{l}</NavLink>)}</nav>
      <button className="ghost" onClick={async()=>{await api.signOut();nav('/')}}>Log out</button></header>
    <main><Outlet/></main></>
}
export const Tags=({names,hit=[]})=><div className="tags">{names.map(n=><span key={n} className={hit.includes(n.toLowerCase())?'tag hit':'tag'}>{n}</span>)}</div>
export function ProjectCard({p,m}){
  return <Link to={`/projects/${p.id}`} className="card">
    <div className="row"><h3>{p.title}</h3>{m&&<span className={m.score>=60?'score good':'score'}>{m.score}% match</span>}</div>
    <p className="muted clamp">{p.description}</p>
    <Tags names={skillNames(p)} hit={m?.hit}/>
    <small className="muted">by {p.owner?.full_name||'Unknown'}</small></Link>
}
