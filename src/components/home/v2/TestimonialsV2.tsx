const testimonials = [
  { tag: "Sécurité", tagColor: "#A82424", title: "Formation Incendie excellente", content: "La formation Sécurité Incendie a été excellente. Les formateurs sont de vrais professionnels du terrain. J'ai obtenu mon diplôme du premier coup.", name: "Marie Dupont", role: "Agent de sécurité" },
  { tag: "Santé", tagColor: "#507395", title: "Gestes d'Urgence validés", content: "Grâce à C&Co Formation, j'ai validé ma formation Gestes d'Urgence. L'équipe est très à l'écoute et les locaux sont modernes. Je recommande.", name: "Thomas Martin", role: "Aide-soignant" },
  { tag: "Petite Enfance", tagColor: "#2D867E", title: "Pédagogies alternatives", content: "La formation sur les pédagogies alternatives m'a permis d'enrichir ma pratique. Approche très concrète et applicable au quotidien.", name: "Sophie Bernard", role: "Auxiliaire de puériculture" },
  { tag: "Sécurité", tagColor: "#A82424", title: "SST au top", content: "Formation SST complète et bien organisée. Le formateur a su rendre le contenu vivant avec beaucoup de pratique. Je me sens prêt.", name: "Lucas Moreau", role: "Chef d'équipe BTP" },
  { tag: "Petite Enfance", tagColor: "#2D867E", title: "Éveil musical enrichissant", content: "L'atelier éveil musical m'a donné plein d'outils concrets pour animer mes séances en crèche. Formatrice passionnée et bienveillante.", name: "Camille Roux", role: "Éducatrice" },
  { tag: "Santé", tagColor: "#507395", title: "AFGSU de qualité", content: "Formation AFGSU très professionnelle. Les mises en situation sont réalistes et le rythme bien adapté. Organisme que je recommande.", name: "Antoine Leclerc", role: "Infirmier" },
];

export default function TestimonialsV2() {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-[2.5rem] font-normal tracking-tight text-[#151F2D] mb-4">
          La confiance de nos <span style={{ color: "#1F628E" }}>stagiaires</span>
        </h2>
        <p className="text-center text-base text-gray-500 max-w-xl mx-auto mb-14">
          Découvrez les retours de professionnels formés par C&Co.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <article key={t.name} className="rounded-2xl border border-gray-100 bg-[#F5F7FA] p-6 hover:shadow-md transition-shadow">
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-white mb-4" style={{ backgroundColor: t.tagColor }}>{t.tag}</span>
              <h3 className="text-base font-bold text-[#151F2D] mb-2">{t.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-5">{t.content}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-[#1F628E] flex items-center justify-center text-white font-bold text-xs">{t.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-[#151F2D] flex items-center gap-1.5">
                    {t.name}
                    <svg className="w-4 h-4 text-[#1F628E]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </p>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
