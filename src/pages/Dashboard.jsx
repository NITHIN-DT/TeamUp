import {Link} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {api} from '../lib/api'
import {useLoad,Status,ProjectCard} from '../components/ui.jsx'
export default function Dashboard(){
  const {user}=useAuth()
  const [d,err]=useLoad(async()=>{
    const [mine,apps,teams,recs,notes]=await Promise.all([api.myProjects(user.id),api.myApps(user.id),api.teams(user.id),api.recommend(user.id),api.notifications(user.id)])
    return{mine,apps,teams,recs,notes}
  },[user.id])
  if(!d)return <Status data={d} error={err}/>
  return <>
    <div className="row"><h2>Dashboard</h2><Link className="btn" to="/projects/new">New project</Link></div>
    <div className="stats">{[['My projects',d.mine.length,'/discover'],['Applications sent',d.apps.length,'/applications'],['Teams',d.teams.length,'/teams']].map(([l,n,to])=><Link key={l} to={to} className="stat"><b>{n}</b>{l}</Link>)}</div>
    <h3>Recommended for you</h3>
    {d.recs.length?<div className="grid">{d.recs.map(p=><ProjectCard key={p.id} p={p} m={p.m}/>)}</div>:<p className="muted">Add skills to your <Link to="/profile">profile</Link> to get recommendations.</p>}
    <h3>Recent activity</h3>
    {d.notes.length?<ul className="list">{d.notes.slice(0,5).map(n=><li key={n.id}>{n.message}</li>)}</ul>:<p className="muted">Nothing yet.</p>}
  </>
}
