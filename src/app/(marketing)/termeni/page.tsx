import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.termeni);

const LAST_UPDATED = "24 septembrie 2026";

export default function TermsPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.termeni.path,
            name: `${PAGE_SEO.termeni.title} · ZeroBug`,
            description: PAGE_SEO.termeni.description,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Termeni", path: "/termeni" },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 space-y-10 text-zinc-300 leading-relaxed">
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Termeni și condiții
          </h1>
          <p className="text-sm text-zinc-500">
            Ultima actualizare: {LAST_UPDATED}
          </p>
          <p>
            Acești Termeni și condiții („Termenii”) reglementează utilizarea
            site-ului{" "}
            <a
              href="https://zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              zerobug.ro
            </a>{" "}
            și a serviciilor oferite sub brandul{" "}
            <strong className="text-white">ZeroBug</strong> de către{" "}
            <strong className="text-white">SC AXP GLOBAL RETAIL SRL</strong>{" "}
            („Prestatorul”, „noi”), cu sediul la Str. Principală nr. 1290,
            România, CUI RO48715417, Reg. Com. J2023001304021, email{" "}
            <a
              href="mailto:contact@zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              contact@zerobug.ro
            </a>
            , telefon 0773 319 554.
          </p>
          <p>
            Prin accesarea site-ului, trimiterea unui formular de contact /
            ofertă sau încheierea unui abonament de mentenanță, confirmați că
            ați citit și acceptați acești Termeni, împreună cu{" "}
            <a
              href="/politica-confidentialitate"
              className="text-white underline-offset-2 hover:underline"
            >
              Politica de confidențialitate
            </a>
            .
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            1. Definiții
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Site</strong> — platforma web
              zerobug.ro și subdomeniile / panourile asociate (inclusiv zona
              administrativă).
            </li>
            <li>
              <strong className="text-white">Servicii</strong> — dezvoltare web,
              e-commerce, API &amp; integrări, aplicații mobile, configurare
              tracking / Google Ads analytics, mentenanță website (WordPress,
              Next.js etc.) și alte livrabile descrise în ofertă.
            </li>
            <li>
              <strong className="text-white">Client</strong> — persoana fizică
              sau juridică care solicită o ofertă ori contractează Serviciile.
            </li>
            <li>
              <strong className="text-white">Abonament</strong> — pachet de
              mentenanță facturat lunar, inclusiv prin Stripe Checkout.
            </li>
            <li>
              <strong className="text-white">Cont Google conectat</strong> —
              autorizarea OAuth prin care Clientul (sau administratorul
              ZeroBug) leagă un cont Google Ads / Google Cloud de panoul
              ZeroBug, exclusiv pentru funcții de măsurare a conversiilor și
              administrare, conform Politicii de confidențialitate.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            2. Obiectul și domeniul de aplicare
          </h2>
          <p>
            ZeroBug furnizează Servicii IT pe bază de{" "}
            <strong className="text-white">ofertă scrisă</strong> (email /
            document) și / sau <strong className="text-white">contract</strong>
            . Informațiile de pe Site (descrieri, prețuri orientative, portofoliu)
            au caracter informativ și nu constituie, prin ele însele, o ofertă
            fermă în sensul Codului civil, până la acceptarea expresă a unei
            oferte personalizate.
          </p>
          <p>
            Detaliile tehnice, calendarul, livrabilele, SLA-urile, garanțiile și
            prețul final se stabilesc <strong className="text-white">per
            proiect</strong> în oferta / contractul aplicabil. În caz de conflict
            între Termeni și un contract semnat, prevalează contractul.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            3. Conturi, acces și panou administrativ
          </h2>
          <p>
            Zona <code className="text-zinc-200">/admin</code> este destinată
            exclusiv personalului autorizat ZeroBug. Accesul neautorizat,
            încercările de forțare a autentificării sau utilizarea abuzivă a
            API-urilor pot atrage blocarea IP-ului și demersuri legale.
          </p>
          <p>
            Dacă Clientul ne furnizează acces la sisteme proprii (hosting, CMS,
            Google Ads, Cloud Console, repository-uri, magazine online), acesta
            rămâne responsabil pentru drepturile de acces acordate și pentru
            revocarea lor la finalul colaborării. ZeroBug folosește aceste
            accesuri doar pentru livrarea Serviciilor contractate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            4. Integrări Google (Cloud Console, Ads, OAuth)
          </h2>
          <p>
            Unele funcții ale platformei ZeroBug (de exemplu sincronizarea
            lead-urilor ca conversii Enhanced în Google Ads prin Data Manager
            API) necesită conectarea unui cont Google prin protocolul OAuth 2.0,
            pe baza unor acreditări create în Google Cloud Console.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Conectarea este <strong className="text-white">opțională</strong>{" "}
              și se face doar din panoul administrativ, de către un utilizator
              autentificat.
            </li>
            <li>
              Solicităm doar scope-urile necesare (ex. Data Manager /
              utilizarea datelor pentru ingestia de evenimente de conversie și,
              unde e cazul, identificarea emailului contului conectat).
            </li>
            <li>
              Token-urile OAuth sunt stocate securizat și folosite exclusiv
              pentru a trimite conversii asociate lead-urilor generate pe Site,
              nu pentru a citi, modifica sau vinde date din contul Google Ads
              în alte scopuri.
            </li>
            <li>
              Puteți deconecta oricând contul din Setări ZeroBug și / sau din{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Contul Google → Securitate → Acces aplicații terțe
              </a>
              .
            </li>
            <li>
              Utilizarea datelor obținute prin API-urile Google respectă{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google API Services User Data Policy
              </a>
              , inclusiv cerințele Limited Use.
            </li>
          </ul>
          <p>
            Clientul rămâne proprietarul contului Google Ads și este
            responsabil pentru configurarea corectă a Conversion Action, a
            consimțământului pe site-ul său (dacă e cazul) și a respectării
            politicilor Google Ads.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            5. Cereri de ofertă și lead-uri
          </h2>
          <p>
            Formularele de pe Site (contact, ofertă serviciu, mentenanță) pot
            colecta nume, email, telefon, firmă, mesaj, preferințe de serviciu
            și, unde există, identificatori de click din reclame (ex. gclid).
            Trimiterea formularului constituie o{" "}
            <strong className="text-white">cerere de contact comercial</strong>,
            nu un contract automat.
          </p>
          <p>
            Ne rezervăm dreptul de a refuza proiecte incompatibile cu
            capacitatea, etica sau legalitatea (inclusiv solicitări frauduloase
            sau care încalcă drepturile terților).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            6. Abonamente de mentenanță și plăți
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Pachetele de mentenanță se facturează{" "}
              <strong className="text-white">lunar</strong>, cu TVA 21% (sau
              cota legală aplicabilă), pe baza planului ales.
            </li>
            <li>
              Plățile online pot fi procesate prin{" "}
              <strong className="text-white">Stripe</strong>. Datele cardului
              nu sunt stocate pe serverele ZeroBug; se aplică termenii Stripe.
            </li>
            <li>
              Anularea unui abonament Stripe produce efecte la{" "}
              <strong className="text-white">
                finalul perioadei de facturare curente
              </strong>
              , dacă nu se prevede altfel în ofertă.
            </li>
            <li>
              Facturile PDF sunt emise de SC AXP GLOBAL RETAIL SRL (serie /
              număr configurabile). Neplata poate duce la suspendarea
              Serviciilor după notificare.
            </li>
            <li>
              Estimările din wizard-ul de mentenanță sunt{" "}
              <strong className="text-white">orientative</strong>; prețul final
              poate fi confirmat după audit tehnic.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            7. Proprietate intelectuală
          </h2>
          <p>
            Conținutul Site-ului (texte, design, logo, cod demonstrativ) aparține
            Prestatorului sau licențiatorilor săi. Nu este permisă copierea,
            republicarea sau exploatarea comercială fără acord scris.
          </p>
          <p>
            Codul și livrabilele create pentru Client se transferă sau se
            licențiază conform contractului de proiect. Până la plata integrală,
            Prestatorul poate reține drepturile asupra livrabilelor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            8. Obligațiile Clientului
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Furnizarea de informații corecte, acces la timp și feedback pe
              livrabile.
            </li>
            <li>
              Respectarea legislației aplicabile (inclusiv GDPR, e-commerce,
              publicitate online) pe site-urile pe care le operează.
            </li>
            <li>
              Neutilizarea Serviciilor pentru spam, malware, phishing sau
              încălcarea drepturilor terților.
            </li>
            <li>
              Păstrarea confidențialității credențialelor și a token-urilor
              partajate.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            9. Limitarea răspunderii
          </h2>
          <p>
            Serviciile sunt furnizate cu diligență profesională. Prestatorul nu
            răspunde pentru: (a) întreruperi ale terților (hosting, Stripe,
            Google, Vercel, Convex, DNS); (b) pierderi indirecte, profit nerealizat
            sau daune consecutive; (c) conținutul sau legalitatea site-urilor
            Clientului; (d) rezultatele campaniilor Google Ads (ROAS / POAS
            depind de buget, creativ, piață și configurarea Clientului).
          </p>
          <p>
            Răspunderea totală a Prestatorului față de un Client, pe o perioadă
            de 12 luni, este limitată, în măsura permisă de lege, la sumele
            plătite efectiv Prestatorului pentru Serviciile respective în
            acea perioadă, cu excepția cazurilor de dol sau culpă gravă.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            10. Confidențialitate și date personale
          </h2>
          <p>
            Prelucrarea datelor personale este descrisă pe larg în{" "}
            <a
              href="/politica-confidentialitate"
              className="text-white underline-offset-2 hover:underline"
            >
              Politica de confidențialitate
            </a>
            . Prin utilizarea Site-ului acceptați și acea politică.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            11. Modificări
          </h2>
          <p>
            Putem actualiza Termenii pentru a reflecta schimbări legale,
            tehnice sau de produs. Versiunea în vigoare este cea publicată pe
            această pagină, cu data „Ultima actualizare”. Pentru modificări
            esențiale care afectează abonamente active, vom încerca să
            notificăm pe email, unde este rezonabil.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            12. Legea aplicabilă și litigii
          </h2>
          <p>
            Termenii sunt guvernați de dreptul român. Orice dispută se
            soluționează pe cale amiabilă; în caz contrar, competența aparține
            instanțelor de la sediul Prestatorului, fără a aduce atingere
            drepturilor imperative ale consumatorilor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            13. Contact
          </h2>
          <p>
            Întrebări despre Termeni:{" "}
            <a
              href="mailto:contact@zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              contact@zerobug.ro
            </a>
            . Pentru solicitări GDPR, folosiți aceleași date de contact, cu
            subiectul „GDPR”.
          </p>
        </section>
      </article>
    </main>
  );
}
