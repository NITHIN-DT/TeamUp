import {Link} from 'react-router-dom'
export default function Landing(){
  return <div>
    <header className="bar"><span className="logo">TeamUp</span><nav/><Link to="/login">Log in</Link><Link className="btn" to="/register">Sign up</Link></header>
    <section className="hero">
      <div className="hero-copy"><h1>Build with people who <span>complement your skills.</span></h1>
        <p className="hero-motto">Discover <span>Â·</span> Connect <span>Â·</span> Collaborate</p>
        <Link className="btn big" to="/register">Create your profile</Link></div>
      <div className="hero-side">
        <section className="journey-card" aria-labelledby="journey-title">
          <p className="journey-kicker">HOW TEAMUP WORKS</p>
          <h2 id="journey-title">FROM IDEA<br/>TO <span>TEAM</span></h2>
          <ol className="journey-steps">
            <li><span className="journey-number">01</span><div><h3>Share your idea</h3><p>Tell others what you're building.</p></div></li>
            <li><span className="journey-number">02</span><div><h3>Define your skills</h3><p>Choose what your project needs.</p></div></li>
            <li><span className="journey-number">03</span><div><h3>Find your people</h3><p>Connect with students who fit.</p></div></li>
          </ol>
          <div className="journey-flow" aria-label="Ideas lead to skills, people, and teams">
            <span>IDEAS</span><i>→</i><span>SKILLS</span><i>→</i><span>PEOPLE</span><i>→</i><span>TEAMS</span>
          </div>
        </section>
      </div>
    </section>
  </div>
}

