import type { ServicePage } from "./types";

const IMG = "/images/portfolio/spido.jpg";

/** Wave 1 — full unique content for all 14 web-development services */
export const WEB_DEVELOPMENT_PAGES: ServicePage[] = [
  {
    slug: "creare-website-de-prezentare",
    categorySlug: "web-development",
    name: "Creare website de prezentare",
    seoTitle: "Creare website de prezentare | ZeroBug",
    seoDescription:
      "Creăm website-uri de prezentare moderne pentru firme din România: structură clară, SEO tehnic, formular de contact și livrare rapidă. Cere o ofertă.",
    h1: "Creare website de prezentare pentru afaceri din România",
    intro:
      "Un site de prezentare bine făcut explică cine ești, ce oferi și cum te contactează clientul — fără zgomot vizual. Construim pagini clare, rapide și pregătite pentru Google.",
    benefits: [
      "Structură orientată pe conversie (servicii → dovezi → contact)",
      "Design responsive pe mobil, tabletă și desktop",
      "Bază SEO: titluri, meta, viteză, sitemap",
      "Formular de contact și CTA-uri vizibile",
      "Conținut ușor de actualizat ulterior",
    ],
    includes: [
      "Wireframe + structură pagini",
      "Design UI pe brand",
      "Implementare (Next.js sau WordPress)",
      "Pagini: Acasă, Servicii, Despre, Contact",
      "Optimizare imagini și Core Web Vitals de bază",
      "Trimitere către indexare / instrucțiuni SEO",
    ],
    process: [
      {
        title: "Brief",
        body: "Înțelegem oferta, publicul și obiectivul (lead-uri, credibilitate, programări).",
      },
      {
        title: "Ofertă & structură",
        body: "Propunem sitemap, tipuri de pagini și un interval de livrare realist.",
      },
      {
        title: "Build",
        body: "Design + implementare, cu feedback pe etape.",
      },
      {
        title: "Lansare",
        body: "Go-live, verificare formulare, handoff și opțiuni de mentenanță.",
      },
    ],
    faqs: [
      {
        question: "În cât timp pot avea un website de prezentare?",
        answer:
          "Pentru un site clasic (4–6 pagini), livrarea tipică este 2–4 săptămâni după brief și materiale (texte, logo, poze).",
      },
      {
        question: "Prefer WordPress sau Next.js?",
        answer:
          "WordPress e potrivit dacă vrei CMS familiar. Next.js e ideal pentru performanță, design custom și scalare. Te ghidăm în funcție de obiectiv.",
      },
      {
        question: "Incluzi și texte SEO?",
        answer:
          "Putem porni de pe textele tale sau colaborăm pe structură de headings și meta. Copywriting detaliat se poate include în ofertă.",
      },
      {
        question: "Pot cere ofertă fără a ști exact ce vreau?",
        answer:
          "Da. Completează brief-ul din pagină — propunem noi structura potrivită firmei tale.",
      },
    ],
    relatedSlugs: [
      "website-corporate-custom",
      "landing-page-uri-pentru-google-ads",
      "website-wordpress",
      "redesign-website",
    ],
    image: IMG,
    showMaintenanceCta: true,
  },
  {
    slug: "website-corporate-custom",
    categorySlug: "web-development",
    name: "Website corporate custom",
    seoTitle: "Website corporate custom | ZeroBug",
    seoDescription:
      "Website corporate custom pentru companii: multi-pagină, brand consistent, secțiuni echipă/cariere și integrări. Ofertă personalizată ZeroBug.",
    h1: "Website corporate custom, aliniat brandului tău",
    intro:
      "Site-urile corporate au nevoie de claritate, credibilitate și o arhitectură care scalează (departamente, locații, cariere). Construim experiențe custom, nu template-uri generice.",
    benefits: [
      "Design pe sistem de brand (culori, tipografie, componente)",
      "Arhitectură multi-secțiune (companii, produse, cariere)",
      "Performanță și accesibilitate",
      "Integrări CRM / formulare / newsletter",
      "Pregătit pentru creștere (noi pagini, limbi)",
    ],
    includes: [
      "Audit scurt al materialelor de brand",
      "IA / sitemap pe obiective de business",
      "UI kit simplu (butoane, carduri, tipografie)",
      "Implementare custom",
      "Pagini cheie + șabloane reutilizabile",
      "Training scurt pentru echipa ta",
    ],
    process: [
      {
        title: "Discovery",
        body: "Stakeholderi, mesaje, constrângeri legale/brand.",
      },
      {
        title: "Arhitectură",
        body: "Sitemap, user flows și priorități de conținut.",
      },
      {
        title: "Design & build",
        body: "Componente UI + implementare pe etape.",
      },
      {
        title: "QA & lansare",
        body: "Testare cross-device, redirect-uri, analytics.",
      },
    ],
    faqs: [
      {
        question: "Poate include și portal / extranet?",
        answer:
          "Da, ca etapă următoare. Corporate site-ul poate lega un portal autentificat — discutăm scope separat ca să nu grevim lansarea.",
      },
      {
        question: "Lucrați cu agenția noastră de branding?",
        answer:
          "Da. Preluăm brand book-ul și livrăm UI consistent cu ghidul existent.",
      },
      {
        question: "Aveți experiență cu site-uri multi-țară?",
        answer:
          "Da — structură pe limbi/regiuni, cu URL-uri și meta corecte. Vezi și serviciul de website multilingv.",
      },
    ],
    relatedSlugs: [
      "creare-website-de-prezentare",
      "website-multilingv",
      "website-cu-cms-custom",
      "portal-platforma-web-custom",
    ],
    image: IMG,
  },
  {
    slug: "landing-page-uri-pentru-google-ads",
    categorySlug: "web-development",
    name: "Landing page-uri pentru Google Ads",
    seoTitle: "Landing page Google Ads | ZeroBug",
    seoDescription:
      "Landing page-uri rapide pentru campanii Google Ads: mesaj aliniat anunțului, CTA clar, tracking conversii. Crește rata de conversie cu ZeroBug.",
    h1: "Landing page-uri optimizate pentru Google Ads",
    intro:
      "O landing page bună potrivește anunțul cu oferta: un singur obiectiv, încărcare rapidă, tracking corect. Construim LP-uri care conversesc, nu doar „arată bine”.",
    benefits: [
      "Mesaj AIDA aliniat cu keyword-ul din Ads",
      "Vitează mare (Core Web Vitals)",
      "CTA unic, fără distrageri",
      "Pregătit pentru GTM / conversii",
      "Variante A/B ușor de duplicat",
    ],
    includes: [
      "Structură pe intent (search / display)",
      "Design mobil-first",
      "Implementare LP (1–N variante)",
      "Hook-uri pentru tracking (GTM)",
      "Formulare sau click-to-call",
      "Recomandări de testare A/B",
    ],
    process: [
      {
        title: "Intent & ofertă",
        body: "Ce caută userul și ce promite anunțul.",
      },
      {
        title: "Wireframe",
        body: "Ierarhie vizuală și CTA.",
      },
      {
        title: "Build + tracking",
        body: "Implementare și evenimente de conversie.",
      },
      {
        title: "Iterare",
        body: "Ajustări pe date din Ads / Analytics.",
      },
    ],
    faqs: [
      {
        question: "Puteți lega și conversion tracking?",
        answer:
          "Da — colaborăm pe GTM/GA4 sau cu echipa voastră de media. Avem și servicii dedicate de tracking.",
      },
      {
        question: "O landing page sau un site întreg?",
        answer:
          "Pentru Ads, LP dedicată bate de obicei homepage-ul. Site-ul complet poate veni după validarea ofertei.",
      },
      {
        question: "Câte variante A/B includeți?",
        answer:
          "În oferta de bază livrăm o variantă solidă; variante suplimentare se prețuiesc separat.",
      },
    ],
    relatedSlugs: [
      "creare-website-de-prezentare",
      "website-next-js-react",
      "optimizare-refactorizare-website-existent",
    ],
    image: IMG,
  },
  {
    slug: "website-next-js-react",
    categorySlug: "web-development",
    name: "Website Next.js / React",
    seoTitle: "Website Next.js / React | ZeroBug",
    seoDescription:
      "Dezvoltare website Next.js și React: performanță, SEO, UI custom și scalare. Pentru branduri care vor mai mult decât un template.",
    h1: "Website Next.js / React — rapid și scalabil",
    intro:
      "Next.js e alegerea potrivită când vrei control pe UX, viteză și integrări. Livrăm aplicații React moderne, cu SEO și deployment pe Vercel sau infrastructura ta.",
    benefits: [
      "SSR/SSG pentru SEO și viteză",
      "Componente reutilizabile",
      "Integrare ușoară cu API-uri",
      "Deploy modern (Vercel / cloud)",
      "Bază bună pentru produs digital pe termen lung",
    ],
    includes: [
      "Setup proiect Next.js (App Router)",
      "Design system minimal",
      "Pagini + layout marketing",
      "Optimizare imagini și fonturi",
      "CI/CD de bază",
      "Documentație scurtă pentru handoff",
    ],
    process: [
      { title: "Stack & scope", body: "Definire cerințe tehnice și conținut." },
      { title: "UI + arhitectură", body: "Componente și rute." },
      { title: "Implementare", body: "Features pe sprint-uri scurte." },
      { title: "Lansare", body: "Preview, producție, monitorizare." },
    ],
    faqs: [
      {
        question: "Putem migra de pe WordPress pe Next.js?",
        answer:
          "Da. Planificăm redirect-uri, conținut și SEO ca să nu pierzi trafic.",
      },
      {
        question: "Aveți nevoie de CMS?",
        answer:
          "Opțional: headless CMS sau panouri simple. Discutăm ce e suficient pentru echipa ta.",
      },
    ],
    relatedSlugs: [
      "magazin-online-next-js-react",
      "website-cu-cms-custom",
      "portal-platforma-web-custom",
      "optimizare-refactorizare-website-existent",
    ],
    image: IMG,
  },
  {
    slug: "magazin-online-next-js-react",
    categorySlug: "web-development",
    name: "Magazin online Next.js / React",
    seoTitle: "Magazin online Next.js / React | ZeroBug",
    seoDescription:
      "Magazin online pe Next.js/React: catalog, checkout, plăți și performanță. Soluție custom pentru e-commerce modern. Cere ofertă ZeroBug.",
    h1: "Magazin online Next.js / React, construit pe măsură",
    intro:
      "Când Woo/Shopify nu acoperă fluxurile tale, un storefront Next.js îți dă control total pe UX și logică. Construim catalog, coș și checkout pe nevoile reale ale business-ului.",
    benefits: [
      "UX de magazin rapid pe mobil",
      "Integrare plăți și curieri",
      "Catalog flexibile (variante, B2B)",
      "SEO pe pagini produs/categorie",
      "Scalare pe trafic de campanie",
    ],
    includes: [
      "IA magazin (categorii, PDP, checkout)",
      "Implementare storefront",
      "Integrare gateway plăți",
      "Fluxuri email de comandă (de bază)",
      "Admin / headless commerce după stack",
      "Măsurare conversii de bază",
    ],
    process: [
      { title: "Fluxuri", body: "Coș, stoc, livrare, retururi." },
      { title: "Design PDP", body: "Pagini produs orientate pe conversie." },
      { title: "Integrări", body: "Plăți, curier, ERP dacă e cazul." },
      { title: "Go-live", body: "Teste pe comenzi reale de staging." },
    ],
    faqs: [
      {
        question: "De ce nu WooCommerce?",
        answer:
          "Woo e excelent în multe cazuri. Next.js merită când ai UX/logică custom greu de forțat într-un plugin stack.",
      },
      {
        question: "Aveți și abonamente / B2B?",
        answer:
          "Da — prețuri pe rol, catalog privat, quotes. Scope-ul se definește în ofertă.",
      },
    ],
    relatedSlugs: [
      "website-next-js-react",
      "magazin-online-wordpress-woocommerce",
      "portal-platforma-web-custom",
    ],
    image: "/images/portfolio/wootrack.jpg",
  },
  {
    slug: "website-wordpress",
    categorySlug: "web-development",
    name: "Website WordPress",
    seoTitle: "Creare website WordPress | ZeroBug",
    seoDescription:
      "Creare website WordPress: temă curată, viteză, securitate de bază și SEO. Ideal pentru firme care vor să editeze singure conținutul.",
    h1: "Creare website WordPress, rapid de administrat",
    intro:
      "WordPress rămâne standardul pentru site-uri pe care le editezi ușor. Instalăm, configurăm și livrăm un site stabil, fără plugin-uri inutile.",
    benefits: [
      "Administrare familiară",
      "Cost de ownership rezonabil",
      "SEO on-page de bază",
      "Extensibil cu WooCommerce ulterior",
      "Mentenanță clară lunar",
    ],
    includes: [
      "Instalare + hardening de bază",
      "Temă / builder agreat",
      "Pagini esențiale",
      "Formulare + anti-spam",
      "Backup inițial",
      "Ghid scurt de editare",
    ],
    process: [
      { title: "Brief", body: "Pagini, brand, hosting." },
      { title: "Setup", body: "WP + temă + plugin-uri esențiale." },
      { title: "Conținut", body: "Pagini și media." },
      { title: "Lansare", body: "SSL, redirect, checklist securitate." },
    ],
    faqs: [
      {
        question: "Elementor sau temă custom?",
        answer:
          "Ambele. Elementor e rapid de lansat; custom e mai curat pe termen lung. Recomandăm în funcție de buget și frecvența editărilor.",
      },
      {
        question: "Oferiți și mentenanță?",
        answer:
          "Da — update-uri, backup, securitate. Vezi pagina de mentenanță ZeroBug.",
      },
    ],
    relatedSlugs: [
      "website-wordpress-elementor",
      "magazin-online-wordpress-woocommerce",
      "migrare-website-wordpress",
      "creare-website-de-prezentare",
    ],
    image: IMG,
    showMaintenanceCta: true,
  },
  {
    slug: "magazin-online-wordpress-woocommerce",
    categorySlug: "web-development",
    name: "Magazin online WordPress / WooCommerce",
    seoTitle: "Magazin online WooCommerce | ZeroBug",
    seoDescription:
      "Creare magazin online WooCommerce: produse, plăți, transport, optimizare. Magazin WordPress pregătit de vânzare, cu ofertă ZeroBug.",
    h1: "Magazin online WordPress / WooCommerce",
    intro:
      "WooCommerce e alegerea #1 în RO pentru magazine pe WordPress. Configurăm catalogul, plățile și livrarea ca să poți vinde fără haos tehnic.",
    benefits: [
      "Ecosistem matur de extensii",
      "Control pe produse și cupoane",
      "Integrări curier / facturare",
      "SEO pe categorii și produse",
      "Cost predictibil vs. SaaS închis",
    ],
    includes: [
      "Setup WooCommerce",
      "Tipuri de produs (simplu/variabil)",
      "Metode plată & transport",
      "Pagini shop legale de bază",
      "Email-uri de comandă",
      "Optimizare viteză de bază",
    ],
    process: [
      { title: "Catalog", body: "Structură categorii și atribute." },
      { title: "Checkout", body: "Plăți, TVA, livrare." },
      { title: "Conținut", body: "Produse pilot + media." },
      { title: "Lansare", body: "Comandă test, go-live." },
    ],
    faqs: [
      {
        question: "Migrați din Shopify?",
        answer:
          "Da — produse, clienți, redirect-uri. Vezi și serviciile de migrare din categoria e-commerce.",
      },
      {
        question: "Câte produse rezistă Woo?",
        answer:
          "Mii, cu hosting și cache corecte. Pentru cataloage foarte mari discutăm optimizări sau stack alternativ.",
      },
    ],
    relatedSlugs: [
      "website-wordpress",
      "magazin-online-next-js-react",
      "website-wordpress-elementor",
    ],
    image: "/images/portfolio/bijuteriairis.jpg",
    showMaintenanceCta: true,
  },
  {
    slug: "website-wordpress-elementor",
    categorySlug: "web-development",
    name: "Website WordPress + Elementor",
    seoTitle: "Website WordPress Elementor | ZeroBug",
    seoDescription:
      "Website WordPress cu Elementor: design flexibil, editare vizuală, lansare rapidă. Ideal pentru marketing teams. Ofertă ZeroBug.",
    h1: "Website WordPress + Elementor, ușor de editat",
    intro:
      "Elementor accelerează lansarea când echipa de marketing vrea autonomie pe layout. Configurăm corect tema, template-urile și performanța ca să nu plătești viteza pe termen lung.",
    benefits: [
      "Editare vizuală fără developer la fiecare text",
      "Template-uri reutilizabile",
      "Lansare mai rapidă decât full custom",
      "Potrivit pentru landing-uri multiple",
      "Poate crește spre WooCommerce",
    ],
    includes: [
      "Setup Elementor (Hello / temă agreată)",
      "Header/footer globale",
      "4–8 pagini",
      "Formulare",
      "Optimizare imagini",
      "Ghid de bune practici Elementor",
    ],
    process: [
      { title: "Stil", body: "Culori, tipografie, butoane." },
      { title: "Template-uri", body: "Home, inner, landing." },
      { title: "Pagini", body: "Conținut și CTA-uri." },
      { title: "Perf & lansare", body: "Cache, cleanup, go-live." },
    ],
    faqs: [
      {
        question: "Elementor încetinește site-ul?",
        answer:
          "Poate, dacă e folosit greșit. Noi limităm widget-urile grele și setăm cache/hosting corect.",
      },
    ],
    relatedSlugs: [
      "website-wordpress",
      "landing-page-uri-pentru-google-ads",
      "redesign-website",
    ],
    image: IMG,
    showMaintenanceCta: true,
  },
  {
    slug: "migrare-website-wordpress",
    categorySlug: "web-development",
    name: "Migrare website WordPress",
    seoTitle: "Migrare website WordPress | ZeroBug",
    seoDescription:
      "Migrare WordPress pe hosting nou fără downtime: fișiere, bază de date, SSL, redirect-uri și verificări post-mutare. ZeroBug.",
    h1: "Migrare website WordPress fără stres",
    intro:
      "Mutăm site-ul pe un hosting mai bun sau pe un domeniu nou, cu checklist: DNS, SSL, email, formulare și SEO (redirect-uri).",
    benefits: [
      "Downtime minim",
      "Păstrare SEO cu redirect-uri",
      "Verificare formulare și checkout",
      "Backup înainte de mutare",
      "Documentare pași DNS",
    ],
    includes: [
      "Backup complet",
      "Clone pe staging",
      "Mutare fișiere + DB",
      "Search-replace URL-uri",
      "SSL + HTTPS",
      "Checklist post-migrare",
    ],
    process: [
      { title: "Backup", body: "Copie integrală înainte de orice." },
      { title: "Staging", body: "Test pe mediul nou." },
      { title: "Cutover", body: "DNS / go-live planificat." },
      { title: "QA", body: "Link-uri, mail, viteză." },
    ],
    faqs: [
      {
        question: "Migrați și email-urile?",
        answer:
          "Putem ghida MX/DNS. Mutarea căsuțelor depinde de provider — o clarificăm în brief.",
      },
    ],
    relatedSlugs: [
      "website-wordpress",
      "optimizare-refactorizare-website-existent",
      "redesign-website",
    ],
    image: IMG,
    showMaintenanceCta: true,
  },
  {
    slug: "optimizare-refactorizare-website-existent",
    categorySlug: "web-development",
    name: "Optimizare / refactorizare website existent",
    seoTitle: "Optimizare website existent | ZeroBug",
    seoDescription:
      "Optimizare și refactorizare site: viteză, SEO tehnic, datorie tehnică, UX. Îmbunătățim ce ai, fără rebuild inutil. Ofertă ZeroBug.",
    h1: "Optimizare și refactorizare pentru site-ul tău actual",
    intro:
      "Nu orice problemă cere site nou. Audităm performanța, SEO tehnic și codul — apoi reparăm ce contează pentru trafic și conversie.",
    benefits: [
      "Core Web Vitals mai bune",
      "Mai puțină datorie tehnică",
      "SEO tehnic curățat",
      "Cost mai mic decât rebuild complet",
      "Plan clar de priorități",
    ],
    includes: [
      "Audit tehnic (viteză, erori, SEO)",
      "Listă priorități impact/efort",
      "Implementare pe sprint-uri",
      "Măsurare înainte/după",
      "Recomandări hosting/CDN",
    ],
    process: [
      { title: "Audit", body: "Măsurători Lighthouse, crawl, erori." },
      { title: "Plan", body: "Quick wins vs. refactor." },
      { title: "Execuție", body: "Fix-uri pe mediul de staging." },
      { title: "Validare", body: "Comparăm metrici post-lansare." },
    ],
    faqs: [
      {
        question: "Când e mai bine redesign?",
        answer:
          "Când UX-ul și mesajul sunt depășite, nu doar viteza. Altfel optimizarea e mai eficientă.",
      },
    ],
    relatedSlugs: [
      "redesign-website",
      "website-next-js-react",
      "migrare-website-wordpress",
    ],
    image: IMG,
    showMaintenanceCta: true,
  },
  {
    slug: "redesign-website",
    categorySlug: "web-development",
    name: "Redesign website",
    seoTitle: "Redesign website | ZeroBug",
    seoDescription:
      "Redesign website: UI nou, structură mai clară, păstrare SEO. Transformăm site-ul vechi într-o experiență modernă care convertește.",
    h1: "Redesign website — look nou, rezultate mai bune",
    intro:
      "Redesign-ul nu e doar „altă temă”. Refacem ierarhia informației, CTA-urile și UI-ul, păstrând ce funcționează la SEO și conținut.",
    benefits: [
      "Imagine de brand actualizată",
      "Conversie mai bună pe mobil",
      "Redirect-uri și SEO păstrate",
      "Componente UI consistente",
      "Bază pentru campanii",
    ],
    includes: [
      "Audit UX scurt",
      "Moodboard / direcție vizuală",
      "Design pagini cheie",
      "Implementare pe stack-ul agreat",
      "Migrare conținut + media",
      "Plan redirect 301",
    ],
    process: [
      { title: "Audit", body: "Ce păstrăm vs. ce schimbăm." },
      { title: "Design", body: "Home + template-uri inner." },
      { title: "Build", body: "Implementare și conținut." },
      { title: "Cutover", body: "Lansare cu redirect-uri." },
    ],
    faqs: [
      {
        question: "Pierzim pozițiile Google?",
        answer:
          "Minimizăm riscul cu URL mapping, redirect-uri și păstrarea conținutului valoros. Monitorizăm post-lansare.",
      },
    ],
    relatedSlugs: [
      "creare-website-de-prezentare",
      "optimizare-refactorizare-website-existent",
      "website-corporate-custom",
    ],
    image: "/images/portfolio/mercana.jpg",
  },
  {
    slug: "website-multilingv",
    categorySlug: "web-development",
    name: "Website multilingv",
    seoTitle: "Website multilingv | ZeroBug",
    seoDescription:
      "Website multilingv RO/EN (și altele): URL-uri corecte, hreflang, CMS pe limbi. Expansiune regională cu ZeroBug.",
    h1: "Website multilingv cu SEO pe fiecare limbă",
    intro:
      "Multilingv făcut greșit dublează conținutul și confundă Google. Implementăm limbi cu structură URL, hreflang și flux de traducere clar.",
    benefits: [
      "hreflang și URL-uri curate",
      "Conținut separat pe limbă",
      "Switcher de limbă UX-friendly",
      "Pregătit pentru piețe noi",
      "Indexare corectă pe țară/limbă",
    ],
    includes: [
      "Strategie URL (/ro /en sau subdomenii)",
      "Implementare i18n",
      "Template-uri pe limbă",
      "Meta + sitemap pe limbă",
      "Ghid pentru traducători",
    ],
    process: [
      { title: "Piețe", body: "Limbi și priorități." },
      { title: "Arhitectură", body: "URL + CMS." },
      { title: "Build", body: "UI + conținut pilot." },
      { title: "SEO QA", body: "hreflang, indexare." },
    ],
    faqs: [
      {
        question: "Cine face traducerile?",
        answer:
          "Tu / agenția de traduceri. Noi pregătim structura și importul tehnic.",
      },
    ],
    relatedSlugs: [
      "website-corporate-custom",
      "website-next-js-react",
      "website-cu-cms-custom",
    ],
    image: IMG,
  },
  {
    slug: "website-cu-cms-custom",
    categorySlug: "web-development",
    name: "Website cu CMS custom",
    seoTitle: "Website cu CMS custom | ZeroBug",
    seoDescription:
      "Website cu CMS custom sau headless: editori non-tehnici, preview, roluri. Control pe conținut fără haos. ZeroBug.",
    h1: "Website cu CMS custom, pe fluxul echipei tale",
    intro:
      "Când WordPress e prea greoi sau prea permisiv, un CMS (headless sau custom) dă exact câmpurile de care ai nevoie — blog, studii de caz, landing-uri.",
    benefits: [
      "Câmpuri structurate (nu „orice pe pagină”)",
      "Roluri editor / admin",
      "Preview înainte de publish",
      "API pentru frontend modern",
      "Mai puțin risc de plugin hell",
    ],
    includes: [
      "Model de conținut",
      "Setup CMS (ex. headless)",
      "Frontend Next.js",
      "Autentificare editori",
      "Training scurt",
    ],
    process: [
      { title: "Content model", body: "Tipuri de pagină și relații." },
      { title: "CMS", body: "Scheme + UI editor." },
      { title: "Frontend", body: "Randare și preview." },
      { title: "Handoff", body: "Training și documentație." },
    ],
    faqs: [
      {
        question: "Sanity, Contentful, custom?",
        answer:
          "Alegem după buget și echipă. Important e modelul de conținut, nu logo-ul CMS-ului.",
      },
    ],
    relatedSlugs: [
      "website-next-js-react",
      "portal-platforma-web-custom",
      "website-corporate-custom",
    ],
    image: IMG,
  },
  {
    slug: "portal-platforma-web-custom",
    categorySlug: "web-development",
    name: "Portal / platformă web custom",
    seoTitle: "Portal web custom | ZeroBug",
    seoDescription:
      "Portal și platformă web custom: autentificare, roluri, dashboard-uri, fluxuri interne. Produs digital pe măsură, ZeroBug.",
    h1: "Portal / platformă web custom pentru operațiuni",
    intro:
      "Portalele unesc clienți, parteneri sau echipe interne pe un singur produs: login, date, acțiuni. Construim MVP-uri clare, apoi scalăm pe usage real.",
    benefits: [
      "Autentificare și roluri",
      "Fluxuri pe măsura procesului tău",
      "Integrări cu sisteme existente",
      "Audit trail / logging unde e nevoie",
      "Roadmap pe etape (MVP → v2)",
    ],
    includes: [
      "Discovery procese",
      "UX flows autentificate",
      "Backend + frontend",
      "Integrări API",
      "Staging + producție",
      "Suport post-lansare agreat",
    ],
    process: [
      { title: "Discovery", body: "Actorii și cazurile de folosire." },
      { title: "MVP scope", body: "Ce e obligatoriu la v1." },
      { title: "Build", body: "Sprint-uri cu demo." },
      { title: "Operate", body: "Monitorizare și iterații." },
    ],
    faqs: [
      {
        question: "Cât durează un MVP?",
        answer:
          "De obicei 6–12 săptămâni pentru un prim flux util — depinde de complexitatea autentificării și a datelor.",
      },
      {
        question: "Includeți și aplicație mobilă?",
        answer:
          "Portalul web poate fi PWA; app nativă e proiect separat în categoria mobile.",
      },
    ],
    relatedSlugs: [
      "website-next-js-react",
      "website-cu-cms-custom",
      "magazin-online-next-js-react",
    ],
    image: "/images/portfolio/profit-bid.jpg",
  },
];
