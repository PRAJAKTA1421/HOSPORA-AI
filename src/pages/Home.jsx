import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const benefits = [['⌕','Discover','Find the right resources quickly and easily.'],['◇','Share','List your resources and earn from unused assets.'],['↔','Connect','Connect with verified hospitality businesses.'],['✓','Trade Securely','Negotiate, book, and manage transactions securely.']];
const users = [['▥','Hotels'],['♜','Restaurants'],['⌒','Caterers'],['▰','Banquet Halls'],['☂','Resorts'],['▣','Event Organizers'],['•••','And More']];
export default function Home(){return <><Header/><main>
  <section className="hero"><div className="hero-copy"><span className="eyebrow">B2B MARKETPLACE FOR HOSPITALITY</span><h1>Share Resources.<br/>Reduce Costs.<br/><em>Grow Together.</em></h1><p>Hospora connects hospitality businesses to discover, share, and request resources they need. List what you have or find what you need — all in one place.</p><div className="hero-actions"><Link className="primary" to="/register">Get Started <b>→</b></Link><Link className="secondary" to="/how-it-works">▷ &nbsp; How It Works</Link></div></div><div className="hero-image"><div className="resource-card audio">♬ <span>Audio Equipment<small>● Available</small></span></div><div className="resource-card banquet">▥ <span>Banquet Hall<small>● Available</small></span></div><div className="resource-card chairs">♙ <span>Chairs<small>● 200 Available</small></span></div><div className="resource-card kitchen">▦ <span>Kitchen Equipment<small>● Available</small></span></div></div></section>
  <section className="smarter"><h2>A Smarter Way to Exchange <em>Hospitality Resources</em></h2><div className="underbar"></div><div className="benefits">{benefits.map(([icon,title,text])=><article key={title}><i>{icon}</i><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
  <section className="who"><h2>Who Can Use <em>Hospora?</em></h2><div className="user-types">{users.map(([icon,label])=><div key={label}><i>{icon}</i><span>{label}</span></div>)}</div></section>
</main><Footer/></>}
