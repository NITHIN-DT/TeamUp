import {createContext,useContext,useEffect,useState} from 'react'
import {supabase} from './supabase'
const C=createContext()
export const useAuth=()=>useContext(C)
export function AuthProvider({children}){
  const [session,setSession]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data}=supabase.auth.onAuthStateChange((_,s)=>setSession(s))
    return ()=>data.subscription.unsubscribe()
  },[])
  return <C.Provider value={{session,user:session?.user,loading}}>{children}</C.Provider>
}
