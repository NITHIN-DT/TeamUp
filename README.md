# TeamUp frontend (React + Vite + Supabase)

## Run
1. `npm install`
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key
3. `npm run dev`

## Where the backend connects
All Supabase calls are in `src/lib/api.js`; auth session is in `src/lib/auth.jsx`.

## Tables and columns the UI expects
- profiles: id (= auth.users.id), full_name, college, department, year int, bio, github, linkedin, created_at
- skills: id, name (UNIQUE)
- user_skills: user_id, skill_id
- projects: id, owner_id, title, description, status ('open'|'closed'), max_members, created_at
- project_skills: project_id, skill_id
- project_roles: id, project_id, title, slots
- applications: id, project_id, applicant_id, role_id (nullable), message, status (default 'pending'), created_at
- teams: id, project_id, name
- team_members: team_id, user_id, role
- comments: id, project_id, user_id, body, created_at
- notifications: id, user_id, type, message, read (default false), created_at

## Backend to-dos
- Foreign keys: profiles.id, projects.owner_id, applicant_id, user_id, etc. -> profiles(id); the joins in api.js rely on them
- RLS: read for authenticated users on most tables; write only for owners
- Realtime: enable it for `notifications`
- Optional: a trigger creating a `profiles` row on signup; Edge Function `recommend` to replace `api.recommend`; move `api.decide` side effects into a trigger
