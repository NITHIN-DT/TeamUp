import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {api} from '../lib/api'
function AuthForm({mode}){
  const reg=mode==='register',nav=useNavigate(),[f,setF]=useState({name:'',email:'',password:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
  const set=k=>e=>setF({...f,[k]:e.target.value})
  const submit=async e=>{e.preventDefault();setBusy(true);setErr('')
    try{
      if(reg){const d=await api.signUp(f.email,f.password,f.name);if(!d.session){setErr('Check your email to confirm your account, then log in.');return}nav('/profile')}
      else{await api.signIn(f.email,f.password);nav('/dashboard')}
    }catch(x){setErr(x.message)}finally{setBusy(false)}}
  return <form className="auth" onSubmit={submit}><h2>{reg?'Create your account':'Welcome back'}</h2>
    {reg&&<input required placeholder="Full name" value={f.name} onChange={set('name')}/>}
    <input required type="email" placeholder="Email" value={f.email} onChange={set('email')}/>
    <input required type="password" minLength={6} placeholder="Password" value={f.password} onChange={set('password')}/>
    {err&&<p className="err">{err}</p>}
    <button className="btn" disabled={busy}>{reg?'Sign up':'Log in'}</button>
    <p className="muted">{reg?<>Have an account? <Link to="/login">Log in</Link></>:<>New here? <Link to="/register">Sign up</Link></>}</p></form>
}
export const Login=()=><AuthForm mode="login"/>
export const Register=()=><AuthForm mode="register"/>
