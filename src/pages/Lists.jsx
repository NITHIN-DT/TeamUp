import {Link} from 'react-router-dom'
import {useAuth} from '../lib/auth.jsx'
import {api} from '../lib/api'
import {useLoad,Status} from '../components/ui.jsx'
export function Applications(){
  const {user}=useAuth()
  const [inc,e1,setInc]=useLoad(()=>api.incoming(user.id),[]),[mine,e2]=useLoad(()=>api.myApps(user.id),[])
  const decide=async(a,s)=>{await api.decide(a,s);setInc(await api.incoming(user.id))}
  return <><h2>Applications</h2><h3>Received</h3><Status data={inc} error={e1} empty="No one has applied to your projects yet."/>
    <ul className="list">{(inc||[]).map(a=><li key={a.id} className="row"><span><b>{a.applicant?.full_name}</b> for <Link to={`/projects/${a.project.id}`}>{a.project.title}</Link><br/><small className="muted">{a.message}</small></span>
      {a.status==='pending'?<span className="row gap"><button className="btn" onClick={()=>decide(a,'accepted')}>Accept</button><button className="ghost" onClick={()=>decide(a,'rejected')}>Reject</button></span>:<span className={'pill '+a.status}>{a.status}</span>}</li>)}</ul>
    <h3>Sent</h3><Status data={mine} error={e2} empty="You haven't applied anywhere. Find a project in Discover."/>
    <ul className="list">{(mine||[]).map(a=><li key={a.id} className="row"><Link to={`/projects/${a.project.id}`}>{a.project.title}</Link><span className={'pill '+a.status}>{a.status}</span></li>)}</ul></>
}
export function Teams(){
  const {user}=useAuth(),[d,err]=useLoad(()=>api.teams(user.id),[])
  return <><h2>Teams</h2><Status data={d} error={err} empty="No teams yet. Your team appears once an application is accepted."/>
    <div className="grid">{(d||[]).map(({team})=><div className="card" key={team.id}><h3><Link to={`/projects/${team.project_id}`}>{team.name}</Link></h3>
      <ul className="list">{team.team_members.map(m=><li key={m.user.id} className="row"><span>{m.user.full_name}</span>
        <input className="role" defaultValue={m.role} onBlur={e=>e.target.value!==m.role&&api.setRole(team.id,m.user.id,e.target.value)}/></li>)}</ul></div>)}</div></>
}
export function Notifications(){
  const {user}=useAuth(),[d,err,setD]=useLoad(()=>api.notifications(user.id),[])
  return <><div className="row"><h2>Notifications</h2><button className="ghost" onClick={async()=>{await api.readAll(user.id);setD(await api.notifications(user.id))}}>Mark all read</button></div>
    <Status data={d} error={err} empty="You're all caught up."/><ul className="list">{(d||[]).map(n=><li key={n.id} className={n.read?'':'unread'}>{n.message}</li>)}</ul></>
}
