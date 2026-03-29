import Link from "next/link";

export default function CTASectionV2() {
  return (
    <section className="py-20 sm:py-24" style={{ background: "linear-gradient(135deg, #1F628E 0%, #2980b9 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-white leading-[1.15] mb-5">
          Prêt à développer vos compétences ?
        </h2>
        <p className="text-base text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          Rejoignez les 25 000+ professionnels formés par C&Co. Accompagnement personnalisé, 100% finançable via OPCO.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/formations" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-[#1F628E] rounded-xl font-bold text-[15px] hover:bg-blue-50 transition-colors shadow-lg">
            Explorer nos formations
          </Link>
          <Link href="/contact" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-[15px] text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
