import {Route,Routes} from 'react-router-dom'
import {Protected} from './components/ui.jsx'
import Landing from './pages/Landing.jsx'
import {Login,Register} from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import {Discover,ProjectDetails} from './pages/Projects.jsx'
import ProjectForm from './pages/ProjectForm.jsx'
import {Applications,Teams,Notifications} from './pages/Lists.jsx'
import Profile from './pages/Profile.jsx'
export default function App(){
  return <Routes>
    <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route element={<Protected/>}>
      <Route path="/dashboard" element={<Dashboard/>}/><Route path="/discover" element={<Discover/>}/>
      <Route path="/projects/new" element={<ProjectForm/>}/><Route path="/projects/:id/edit" element={<ProjectForm/>}/>
      <Route path="/projects/:id" element={<ProjectDetails/>}/><Route path="/applications" element={<Applications/>}/>
      <Route path="/teams" element={<Teams/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/profile" element={<Profile/>}/>
    </Route></Routes>
}
