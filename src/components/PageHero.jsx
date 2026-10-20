export default function PageHero({ eyebrow, title, lede, children }) {
  return (
    <section className="shell hero">
      {eyebrow && <span className="eyebrow eyebrow--red">{eyebrow}</span>}
      <h1 className="display hero__title">{title}</h1>
      {lede && <p className="lede hero__lede">{lede}</p>}
      {children}
    </section>
  );
}
