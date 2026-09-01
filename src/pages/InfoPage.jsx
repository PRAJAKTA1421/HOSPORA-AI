import Header from '../components/Header'; import Footer from '../components/Footer';
export default function InfoPage({title,children}){return <><Header/><main className="info"><span className="eyebrow">HOSPORA RESOURCE EXCHANGE</span><h1>{title}</h1><div className="info-card">{children}</div></main><Footer/></>}
