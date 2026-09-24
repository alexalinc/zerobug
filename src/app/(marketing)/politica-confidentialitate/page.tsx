import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.privacy);

const LAST_UPDATED = "24 septembrie 2026";

export default function PrivacyPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.privacy.path,
            name: `${PAGE_SEO.privacy.title} · ZeroBug`,
            description: PAGE_SEO.privacy.description,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            {
              name: "Politica de confidențialitate",
              path: "/politica-confidentialitate",
            },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 py-16 space-y-10 text-zinc-300 leading-relaxed">
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Politica de confidențialitate
          </h1>
          <p className="text-sm text-zinc-500">
            Ultima actualizare: {LAST_UPDATED}
          </p>
          <p>
            Această Politică explică modul în care{" "}
            <strong className="text-white">SC AXP GLOBAL RETAIL SRL</strong>{" "}
            („ZeroBug”, „noi”, „operatorul”) prelucrează datele cu caracter
            personal în legătură cu site-ul{" "}
            <a
              href="https://zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              https://zerobug.ro
            </a>
            , formularele de contact / ofertă, abonamentele de mentenanță și
            integrările opționale cu Google (Cloud Console / Google Ads).
          </p>
          <p>
            Prelucrăm datele în conformitate cu Regulamentul (UE) 2016/679
            (GDPR), Legea nr. 190/2018 și legislația română aplicabilă. Documentul
            este redactat și pentru a îndeplini cerințele de transparență ale
            Google privind aplicațiile care folosesc OAuth / API-uri Google
            (inclusiv Google API Services User Data Policy — Limited Use).
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            1. Operatorul de date
          </h2>
          <ul className="list-none space-y-1 pl-0">
            <li>
              <strong className="text-white">Denumire:</strong> SC AXP GLOBAL
              RETAIL SRL
            </li>
            <li>
              <strong className="text-white">CUI:</strong> RO48715417
            </li>
            <li>
              <strong className="text-white">Reg. Com.:</strong> J2023001304021
            </li>
            <li>
              <strong className="text-white">Adresă:</strong> Str. Principală nr.
              1290, România
            </li>
            <li>
              <strong className="text-white">Email:</strong>{" "}
              <a
                href="mailto:contact@zerobug.ro"
                className="text-white underline-offset-2 hover:underline"
              >
                contact@zerobug.ro
              </a>
            </li>
            <li>
              <strong className="text-white">Telefon:</strong> 0773 319 554
            </li>
            <li>
              <strong className="text-white">Brand:</strong> ZeroBug
            </li>
          </ul>
          <p>
            Pentru solicitări privind datele personale, scrieți la{" "}
            <a
              href="mailto:contact@zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              contact@zerobug.ro
            </a>{" "}
            cu subiectul „GDPR” / „Date personale”. Răspundem, de regulă, în
            cel mult 30 de zile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            2. Ce date prelucrăm
          </h2>
          <h3 className="text-lg font-medium text-white">
            2.1. Date furnizate de dvs. (formulare)
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Nume și prenume</li>
            <li>Adresă de email</li>
            <li>Număr de telefon (opțional)</li>
            <li>Denumire firmă (opțional)</li>
            <li>
              Mesaj, detalii proiect, tip serviciu, buget orientativ, răspunsuri
              din wizard-ul de mentenanță
            </li>
          </ul>

          <h3 className="text-lg font-medium text-white">
            2.2. Date tehnice și de măsurare
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Identificatori de click din Google Ads, dacă ajungeți pe site din
              reclame: <code className="text-zinc-200">gclid</code>,{" "}
              <code className="text-zinc-200">gbraid</code>,{" "}
              <code className="text-zinc-200">wbraid</code> (stocați local în
              cookie first-party pe ~90 zile)
            </li>
            <li>
              Adresă IP, user-agent și jurnale de securitate pe servere / CDN
              (Vercel), pe durate limitate, pentru protecție împotriva abuzului
            </li>
            <li>
              Cookie-uri de sesiune pentru autentificarea administratorilor
              ZeroBug (panou /admin)
            </li>
          </ul>

          <h3 className="text-lg font-medium text-white">
            2.3. Date de facturare și abonament
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Date de firmă / contact pentru factură (denumire, CUI, adresă,
              email)
            </li>
            <li>
              Status abonament, istoric facturi PDF; datele cardului sunt
              procesate exclusiv de Stripe (nu le stocăm pe serverele noastre)
            </li>
          </ul>

          <h3 className="text-lg font-medium text-white">
            2.4. Date din Google OAuth (doar dacă conectați Google Ads)
          </h3>
          <p>
            Când un administrator autorizat conectează un cont Google din panoul
            ZeroBug, putem primi și stoca:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Adresa de email a contului Google conectat (pentru afișare
              „conectat ca…”)
            </li>
            <li>
              Token-uri OAuth (access token, refresh token) necesare pentru
              apeluri API
            </li>
            <li>
              Identificatori configurați de dvs.: Customer ID Google Ads,
              Conversion Action ID, eventual Login Customer ID (MCC)
            </li>
          </ul>
          <p>
            <strong className="text-white">Nu</strong> solicităm acces la Gmail,
            Drive, Calendar, contacte sau alte date Google care nu sunt necesare
            funcției de upload conversii. Scope-urile tipice: Data Manager
            (ingest evenimente) și, unde e cazul, email de profil pentru
            identificare.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            3. Scopuri și temeiuri legale (GDPR art. 6)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-left text-zinc-400">
                  <th className="py-2 pr-3 font-medium">Scop</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 font-medium">Temei</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-3">
                    Răspuns la cereri de ofertă / contact
                  </td>
                  <td className="py-3 pr-3">Formulare lead</td>
                  <td className="py-3">
                    Art. 6(1)(b) — pași precontractuali; art. 6(1)(f) — interes
                    legitim comercial
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-3">
                    Executare contract, facturare, abonamente
                  </td>
                  <td className="py-3 pr-3">Date firmă, email, Stripe IDs</td>
                  <td className="py-3">
                    Art. 6(1)(b) și (c) — contract + obligații fiscale
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-3">
                    Măsurare conversii Google Ads (upload lead)
                  </td>
                  <td className="py-3 pr-3">
                    gclid / email&amp;telefon hash, token OAuth
                  </td>
                  <td className="py-3">
                    Art. 6(1)(f) interes legitim; art. 6(1)(a) unde e necesar
                    consimțământul pentru marketing / cookies non-esențiale
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-3">Securitate, prevenirea abuzului</td>
                  <td className="py-3 pr-3">IP, jurnale, sesiune admin</td>
                  <td className="py-3">Art. 6(1)(f) — interes legitim</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3">
                    Comunicări operaționale (confirmări, facturi)
                  </td>
                  <td className="py-3 pr-3">Email</td>
                  <td className="py-3">Art. 6(1)(b) / (c)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            4. Cum folosim datele Google (Limited Use / Cloud Console)
          </h2>
          <p>
            Declarație de utilizare limitată (conform politicilor Google pentru
            aplicații care accesează datele utilizatorilor prin API-uri Google):
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Folosim datele Google{" "}
              <strong className="text-white">
                exclusiv pentru a furniza și îmbunătăți funcțiile vizibile ale
                aplicației ZeroBug
              </strong>{" "}
              pe care le-ați activat: conectarea contului Google Ads și
              trimiterea evenimentelor de conversie (lead-uri) către Conversion
              Action-ul configurat de dvs., via Data Manager API (
              <code className="text-zinc-200">events:ingest</code>).
            </li>
            <li>
              <strong className="text-white">Nu</strong> vindem datele Google
              către terți.
            </li>
            <li>
              <strong className="text-white">Nu</strong> folosim datele Google
              pentru publicitate personalizată independentă de Google Ads, pentru
              credit scoring, pentru supraveghere sau pentru antrenarea de modele
              AI generice pe datele dvs. din Google.
            </li>
            <li>
              <strong className="text-white">Nu</strong> transferăm datele Google
              către alți dezvoltatori de aplicații, cu excepția procesatorilor
              tehnici necesari (ex. infrastructură Convex / hosting) care
              acționează pe instrucțiunile noastre și sub contracte de
              prelucrare.
            </li>
            <li>
              Accesul uman la token-uri / date este limitat la personalul
              ZeroBug care are nevoie de ele pentru suport, securitate sau
              depanare, și doar când este rezonabil necesar.
            </li>
            <li>
              Puteți revoca accesul oricând din Setări ZeroBug („Deconectează”)
              și din{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                myaccount.google.com/permissions
              </a>
              . La deconectare, ștergem token-urile OAuth stocate.
            </li>
          </ul>
          <p>
            Pentru lead-urile trimise ca conversii, putem transmite către Google
            Ads: identificatori de click (dacă există) și / sau{" "}
            <strong className="text-white">
              hash-uri SHA-256 (HEX)
            </strong>{" "}
            ale emailului și telefonului (Enhanced Conversions for Leads),
            împreună cu un ID de tranzacție (ID-ul lead-ului) și marca temporală.
            Valorile în clar ale emailului / telefonului nu sunt re-trimise ca
            text necriptat în payload-ul de conversie.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            5. Cookie-uri și tehnologii similare
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Esențiale:</strong> sesiune
              administratori (<code className="text-zinc-200">zb_admin_session</code>
              ) — autentificare panou.
            </li>
            <li>
              <strong className="text-white">Măsurare Ads (first-party):</strong>{" "}
              <code className="text-zinc-200">zb_gads</code> — memorează gclid /
              gbraid / wbraid din URL, ~90 zile, pentru atribuirea conversiilor.
            </li>
          </ul>
          <p>
            Nu operăm pe Site, în prezent, un banner complex de cookie-uri
            terțe tip ad-network proprietar ZeroBug. Dacă integrați tag-uri
            Google pe site-urile dvs. (gtag / GTM), consimțământul vizitatorilor
            pe acele site-uri rămâne responsabilitatea dvs., conform legii
            ePrivacy / GDPR.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            6. Destinatari și procesatori
          </h2>
          <p>
            Putem partaja date cu următorii furnizori, strict pentru scopurile de
            mai sus:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Convex</strong> — bază de date /
              backend (lead-uri, setări, facturi metadata)
            </li>
            <li>
              <strong className="text-white">Vercel</strong> — hosting și
              edge / CDN
            </li>
            <li>
              <strong className="text-white">Resend</strong> — trimitere email
              (notificări lead, facturi)
            </li>
            <li>
              <strong className="text-white">Stripe</strong> — plăți și
              abonamente
            </li>
            <li>
              <strong className="text-white">Google LLC / Google Ireland
              Limited</strong>{" "}
              — OAuth, Data Manager API, Google Ads (când sync-ul e activ)
            </li>
            <li>
              Contabilitate / consultanți fiscali (ex. email BCC facturi), pe
              bază de confidențialitate
            </li>
            <li>
              Autorități publice, când legea o impune
            </li>
          </ul>
          <p>
            Nu vindem liste de lead-uri. Nu transferăm date în scopuri de
            brokeraj de date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            7. Transferuri în afara SEE
          </h2>
          <p>
            Unii procesatori (ex. Google, Stripe, Vercel, Convex) pot prelucra
            date pe servere din afara Spațiului Economic European. În aceste
            cazuri ne bazăm pe mecanisme GDPR adecvate: clauze contractuale
            standard (SCC), decizii de adecvare unde există, și setări de
            securitate (TLS, control acces).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            8. Durata stocării
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Lead-uri:</strong> pe durata
              relației comerciale și încă până la 36 de luni după ultimul
              contact relevant (sau mai puțin, la cerere, dacă nu există
              obligație legală de păstrare).
            </li>
            <li>
              <strong className="text-white">Facturi / date fiscale:</strong>{" "}
              conform termenelor legale din România (de regulă minimum 5–10
              ani, după caz).
            </li>
            <li>
              <strong className="text-white">Cookie gclid:</strong> ~90 zile.
            </li>
            <li>
              <strong className="text-white">Token-uri Google OAuth:</strong>{" "}
              până la deconectare sau până când refresh token-ul expiră /
              este revocat.
            </li>
            <li>
              <strong className="text-white">Jurnale de securitate:</strong>{" "}
              perioade scurte, tipic până la 90 de zile, dacă nu e nevoie de
              investigație.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            9. Securitate
          </h2>
          <p>
            Aplicăm măsuri tehnice și organizatorice rezonabile: HTTPS, sesiuni
            admin semnate (JWT), rate-limiting la login, acces restrâns la panou,
            stocare token-uri pe backend, hash pentru datele de conversie
            Enhanced. Nicio transmisie pe internet nu este 100% sigură; vă
            încurajăm să folosiți parole puternice și să nu partajați
            credențialele.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            10. Drepturile dvs. (GDPR)
          </h2>
          <p>Aveți dreptul la:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Informare și acces la date</li>
            <li>Rectificare</li>
            <li>Ștergere („dreptul de a fi uitat”), în condițiile legii</li>
            <li>Restricționarea prelucrării</li>
            <li>Portabilitate, unde este aplicabil</li>
            <li>Opoziție la prelucrări bazate pe interes legitim</li>
            <li>
              Retragerea consimțământului, unde prelucrarea se bazează pe
              consimțământ (fără a afecta legalitatea anterioară)
            </li>
            <li>
              Plângere la{" "}
              <strong className="text-white">
                Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
                Caracter Personal (ANSPDCP)
              </strong>{" "}
              —{" "}
              <a
                href="https://www.dataprotection.ro"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.dataprotection.ro
              </a>
            </li>
          </ul>
          <p>
            Pentru exercitarea drepturilor:{" "}
            <a
              href="mailto:contact@zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              contact@zerobug.ro
            </a>
            . Putem solicita verificarea identității înainte de a răspunde.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            11. Minori
          </h2>
          <p>
            Serviciile ZeroBug se adresează profesioniștilor și firmelor. Nu
            colectăm în mod intenționat date de la copii sub 16 ani. Dacă
            aflați că un minor ne-a trimis date, contactați-ne pentru ștergere.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            12. Linkuri către terți
          </h2>
          <p>
            Site-ul poate conține linkuri către terți (Stripe, Google, proiecte
            din portofoliu). Politicile lor de confidențialitate se aplică
            separat; nu controlăm acele site-uri.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            13. Modificări ale politicii
          </h2>
          <p>
            Putem actualiza această Politică. Versiunea curentă este publicată
            pe această pagină, cu data „Ultima actualizare”. Continuarea
            utilizării Site-ului după publicare constituie luarea la cunoștință
            a modificărilor, în măsura permisă de lege.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            14. Documente conexe
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <a
                href="/termeni"
                className="text-white underline-offset-2 hover:underline"
              >
                Termeni și condiții
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google API Services User Data Policy
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/privacy"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Politica de confidențialitate Google
              </a>
            </li>
            <li>
              <a
                href="https://stripe.com/privacy"
                className="text-white underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Politica de confidențialitate Stripe
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">
            15. Contact
          </h2>
          <p>
            SC AXP GLOBAL RETAIL SRL — ZeroBug
            <br />
            Email:{" "}
            <a
              href="mailto:contact@zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              contact@zerobug.ro
            </a>
            <br />
            Telefon: 0773 319 554
            <br />
            Web:{" "}
            <a
              href="https://zerobug.ro"
              className="text-white underline-offset-2 hover:underline"
            >
              https://zerobug.ro
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
