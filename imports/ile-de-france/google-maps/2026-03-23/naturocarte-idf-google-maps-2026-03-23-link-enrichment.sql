UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.aemn.org/' ELSE website END
WHERE slug = 'academie-europeenne-des-medecines-naturelles-neuville-sur-oise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nidoiseau.fr/' ELSE website END
WHERE slug = 'accompagnement-tdah-suresnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.evidemmentsoi.com/' ELSE website END
WHERE slug = 'adeline-gattefosse-milly-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://afiyaesencial-naturopathe.fr/' ELSE website END
WHERE slug = 'afiya-esencial-le-blanc-mesnil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://agathe-naturopathe.fr/' ELSE website END
WHERE slug = 'agathe-descamps-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.agnesloison-naturo.fr/' ELSE website END
WHERE slug = 'agnes-loison-igny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.agnesloison-naturo.fr/' ELSE website END
WHERE slug = 'agnes-loison-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturosources.net/' ELSE website END
WHERE slug = 'agnes-natur-o-sources-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://rdv.bioresonance-therapie.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://rdv.bioresonance-therapie.com/' ELSE booking_url END
WHERE slug = 'akli-nait-chabane-enghien-les-bains'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://monreflexnature.com/' ELSE website END
WHERE slug = 'alexandra-auvray-franconville-franconville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.monreflexnature.com/' ELSE website END
WHERE slug = 'alexandra-auvray-mon-reflex-nature-jouy-le-moutier'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.lessencedhygie.fr/' ELSE website END
WHERE slug = 'alexandra-bourgeois-blandy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.therapiejoyeuse.com/' ELSE website END
WHERE slug = 'alexandra-kouklevsky-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://alexandrametayer-naturopathe.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'alexandra-metayer-chelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathie-rambouillet.fr/' ELSE website END
WHERE slug = 'alexandra-renard-rambouillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://alexandrastoffaes5.wixsite.com/yoga' ELSE website END
WHERE slug = 'alexandra-stoffaes-fontenay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sorellanzanaturopathe.com/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=4037940853156476192' ELSE website END
WHERE slug = 'alexandra-texier-saint-leu-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.feminitenaturelle.com/' ELSE website END
WHERE slug = 'alice-gabrillargues-mitry-mory'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://alice-marie-naturopathe.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'alice-marie-gagny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.alina-onesim.com/' ELSE website END
WHERE slug = 'alina-onesim-saint-remy-les-chevreuse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.alizeenaturopathe.com/' ELSE website END
WHERE slug = 'alizee-ribeiro-athis-mons'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://linktr.ee/Allison_Soin_BienEtre' ELSE website END
WHERE slug = 'allison-potino-mitry-mory'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.alphasante.net/' ELSE website END
WHERE slug = 'alpha-sante-malakoff'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://altheia.fr/' ELSE website END
WHERE slug = 'altheia-reflexologie-corbeil-essonnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://amalia-naturosophro.com/' ELSE website END
WHERE slug = 'amalia-alimi-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.amandinebaudin.com/' ELSE website END
WHERE slug = 'amandine-baudin-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lesnourriciers.fr/nos-offres/#offre3' ELSE website END
WHERE slug = 'amandine-chanceau-dieteticienne-nutritionniste-drainage-lymphatique-renata-franca-enghien-les-bains'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ab-naturopathe-animalier.com/' ELSE website END
WHERE slug = 'anais-broutin-saint-remy-l-honore'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://anaisesnardnaturopathe.fr/' ELSE website END
WHERE slug = 'anais-esnard-montigny-lencoup'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://harmonie-au-naturel.com/' ELSE website END
WHERE slug = 'anais-louvet-houilles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathe-chaville.fr/' ELSE website END
WHERE slug = 'andrea-budillon-chaville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://myneuronutrition.fr/' ELSE website END
WHERE slug = 'angelique-bigot-nemours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://santenaturailes.com/' ELSE website END
WHERE slug = 'angelique-sebille-sophrologue-sante-naturailes-fontenay-tresigny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://animaauraenaturopa.wixsite.com/anima-aurae-naturopa' ELSE website END
WHERE slug = 'anima-aurae-meaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.ani-k.fr/' ELSE website END
WHERE slug = 'anissa-kacem-ormesson-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.halsanatura.com/' ELSE website END
WHERE slug = 'annabelle-lewandowski-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.anneciniernaturopathe.fr/' ELSE website END
WHERE slug = 'anne-cinier-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.anne-dauvilliers.fr/' ELSE website END
WHERE slug = 'anne-dauvilliers-montrouge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://annedemangeon.fr/' ELSE website END
WHERE slug = 'anne-demangeon-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/anne-goubau/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/anne-goubau/' ELSE booking_url END
WHERE slug = 'anne-goubau-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.ovoia.com/al-weiss' ELSE website END
WHERE slug = 'anne-laurence-weiss-wissous'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.annelisepanot-naturopathe.fr/' ELSE website END
WHERE slug = 'anne-lise-panot-ollainville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.annemartel-naturopathe.fr/' ELSE website END
WHERE slug = 'anne-martel-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.annemartel-naturopathe.fr/adistance' ELSE website END
WHERE slug = 'anne-martel-lieusaint'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://anneponcelet.fr/' ELSE website END
WHERE slug = 'anne-poncelet-savigny-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.anneroquette.com/?utm_source=gmb' ELSE website END
WHERE slug = 'anne-roquette-voisins-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.annesophiecamurat.com/' ELSE website END
WHERE slug = 'anne-sophie-camurat-bois-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://anne-thevenon.fr/' ELSE website END
WHERE slug = 'anne-thevenon-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://annette-st-john.fr/' ELSE website END
WHERE slug = 'annette-st-john-montesson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://annie-chevalier.fr/' ELSE website END
WHERE slug = 'annie-chevalier-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.antonellazarri.com/' ELSE website END
WHERE slug = 'antonella-zarri-joinville-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.armelle-naturopathe.com/' ELSE website END
WHERE slug = 'armelle-huet-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.arom-anel.fr/' ELSE website END
WHERE slug = 'arom-anel-la-beaute-simple-bourg-la-reine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolib.fr/therapeute/sophrologue/domont/95330/20606-assan_agchariou' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.crenolib.fr/therapeute/sophrologue/domont/95330/20606-assan_agchariou' ELSE booking_url END
WHERE slug = 'assan-agchariou-domont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.minciraunaturel.fr/' ELSE website END
WHERE slug = 'astrid-heratchian-breuillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.mincir91.fr/' ELSE website END
WHERE slug = 'astrid-heratchian-dourdan'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://ateliersdojo.com/contact-me/' ELSE website END
WHERE slug = 'ateliers-dojo-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.fresha.com/fr/a/aura-therapeutique-porcheville-55-grande-rue-z78vrou0?pId=2714628#gallery-section' ELSE website END
WHERE slug = 'aura-therapeutique-porcheville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.aromatelier.fr/' ELSE website END
WHERE slug = 'aurelia-richard-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.mantranaturo.com/' ELSE website END
WHERE slug = 'aurelie-belin-richecoeur-etampes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://divinoe.wordpress.com/' ELSE website END
WHERE slug = 'aurelie-gaulard-carrieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturoreflexobyorely.fr/' ELSE website END
WHERE slug = 'aurelie-gavela-saint-illiers-la-ville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.aurelieguyot.fr/' ELSE website END
WHERE slug = 'aurelie-guyot-nmh-maule'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.aurelieheld.com/' ELSE website END
WHERE slug = 'aurelie-held-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/101848-aurora-araujo-naturopathe-bezons' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/101848-aurora-araujo-naturopathe-bezons' ELSE booking_url END
WHERE slug = 'aurora-araujo-bezons'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://aurorealvarez.fr/' ELSE website END
WHERE slug = 'aurore-alvarez-villennes-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.aurore-magnetisme.com/' ELSE website END
WHERE slug = 'aurore-sertillange-bailly-romainvilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.ayurbyflo.fr/' ELSE website END
WHERE slug = 'ayur-by-flo-bures-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.barialaalej.com/' ELSE website END
WHERE slug = 'baria-laalej-villejuif'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doazen.fr/' ELSE website END
WHERE slug = 'basak-noel-elancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://linktr.ee/Beatachainay' ELSE website END
WHERE slug = 'beata-chainay-sophrologue-neuville-sur-oise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.beatricenaturopathe.fr/' ELSE website END
WHERE slug = 'beatrice-jacob-eragny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://santeeclairee.com/' ELSE website END
WHERE slug = 'beatrice-toutain-milly-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://santeeclairee.com/' ELSE website END
WHERE slug = 'beatrice-toutain-sainte-genevieve-des-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://bettina-abraham.fr/' ELSE website END
WHERE slug = 'bettina-abraham-etampes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://jalimentelavie.com/' ELSE website END
WHERE slug = 'betty-sautron-fontainebleau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturophyto.com/' ELSE website END
WHERE slug = 'blanche-rautenstrauch-nogent-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.beholi.fr/' ELSE website END
WHERE slug = 'blandine-paploray-aubervilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.bodysolara.fr/' ELSE website END
WHERE slug = 'body-solara-carrieres-sous-poissy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://christine-vous-guide.webnode.fr/' ELSE website END
WHERE slug = 'boukhalil-christine-la-courneuve'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturaubepine.com/' ELSE website END
WHERE slug = 'brigitte-gaboriau-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.gorendezvous.com/brunomairet' ELSE website END
WHERE slug = 'bruno-mairet-avon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.stephane-horta.fr/' ELSE website END
WHERE slug = 'bye-bye-allergies-meaux-meaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.camille-daures.com/' ELSE website END
WHERE slug = 'camille-daures-ei-gentilly'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.votredieteticiennenaturopathe.fr/' ELSE website END
WHERE slug = 'camille-farcigny-eaubonne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://camillefischer.fr/' ELSE website END
WHERE slug = 'camille-fischer-montmorency'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.goliath-naturopathe.com/' ELSE website END
WHERE slug = 'camille-hannon-elancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.goliath-naturopathe.com/' ELSE website END
WHERE slug = 'camille-hannon-plaisir'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://camillehpnaturopathe.com/' ELSE website END
WHERE slug = 'camille-hardy-prevost-milly-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://camilleroffi-naturopathe.com/' ELSE website END
WHERE slug = 'camille-roffi-issy-les-moulineaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/62601-candice-stoffels-naturopathe-nanterre' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/62601-candice-stoffels-naturopathe-nanterre' ELSE booking_url END
WHERE slug = 'candice-stoffels-nanterre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/62601-candice-stoffels-naturopathe-nanterre' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/62601-candice-stoffels-naturopathe-nanterre' ELSE booking_url END
WHERE slug = 'candice-stoffels-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://carineamandnaturopathe.fr/' ELSE website END
WHERE slug = 'carine-amand-saint-sauveur-sur-ecole'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.carinesybillin-naturopathe.fr/' ELSE website END
WHERE slug = 'carine-sybillin-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.carldelepine.com/' ELSE website END
WHERE slug = 'carl-de-l-epine-fontainebleau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://carlotrevil-bienetre.com/' ELSE website END
WHERE slug = 'carlo-trevil-pontault-combault'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cpsyche.fr/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/62647-carminda-benigno-sophrologue-linas?rwg_token=AFd1xnGeBJI92WQMqhQSuNIvGfro5rnzMbYWW3Upfhp-Q9bV3MTHfiDj0FRgByHhqnks2kbuvr4zQy9d6c6o2wYbV7RkbHbxUQ%3D%3D' ELSE booking_url END
WHERE slug = 'carminda-benigno-linas'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendly.com/carole-berritz/seance-75mn' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/carole-berritz/seance-75mn' ELSE booking_url END
WHERE slug = 'carole-berritz-dammarie-les-lys'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://linktr.ee/caronaturo91' ELSE website END
WHERE slug = 'caroline-abou-el-elah-saint-michel-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/orsay/caroline-bottlaender/1994?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/orsay/caroline-bottlaender/1994?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'caroline-bottlaender-orsay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.carolinebrondel.fr/' ELSE website END
WHERE slug = 'caroline-brondel-brie-comte-robert'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.restez-zen-et-bio.fr/' ELSE website END
WHERE slug = 'caroline-buffa-modelage-bien-etre-saint-michel-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://caroline-hantat.com/' ELSE website END
WHERE slug = 'caroline-hantat-bougival'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.revinescence.com/' ELSE website END
WHERE slug = 'caroline-kol-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.caroline-naturopathie.com/' ELSE website END
WHERE slug = 'caroline-lepreux-sandrez-herblay-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mamelliburns-naturopathe.com/' ELSE website END
WHERE slug = 'caroline-mamelli-burns-suresnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.caroline-pietralunga.fr/' ELSE website END
WHERE slug = 'caroline-pietralunga-massy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://catherinecrapoulet.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.crenolib.fr/prendre-rdv/79622_naturopathe-reflexologue' ELSE booking_url END
WHERE slug = 'catherine-crapoulet-saint-remy-les-chevreuse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://catherine-jamet-chatou.fr/' ELSE website END
WHERE slug = 'catherine-jamet-chatou'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.ckowal-naturopathe.com/' ELSE website END
WHERE slug = 'catherine-kowal-le-plessis-robinson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.optionnaturo.fr/' ELSE website END
WHERE slug = 'catherine-lagiere-limours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/catherine-larnac/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/catherine-larnac/' ELSE booking_url END
WHERE slug = 'catherine-larnac-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.cabinet-naturopathe.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'catherine-michaux-garches'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://bioetnaturo.com/' ELSE website END
WHERE slug = 'catherine-petitdidier-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturosqy.fr/' ELSE website END
WHERE slug = 'catherine-pomies-maurepas'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.marieodilecayeux-naturo.com/?utm_source=gmb' ELSE website END
WHERE slug = 'cayeux-poirrier-marie-odile-villennes-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.cecile-chausson-naturopathe.fr/' ELSE website END
WHERE slug = 'cecile-chausson-ballancourt-sur-essonne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://institut-rafael.fr/' ELSE website END
WHERE slug = 'cecile-petureau-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.cecilerose.space/' ELSE website END
WHERE slug = 'cecile-rose-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.sonaturoandco.com/' ELSE website END
WHERE slug = 'celia-bourgeois-gagny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/naturopathe/paris/celine-duarte-e160aebd-f5ff-400f-aef1-0a6924acc4d2?utm_campaign=google-maps&utm_content=paris&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/naturopathe/paris/celine-duarte-e160aebd-f5ff-400f-aef1-0a6924acc4d2?utm_campaign=google-maps&utm_content=paris&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'celine-duarte-drancy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.oralibra.com/' ELSE website END
WHERE slug = 'celine-heripel-oralibra-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathe.net/laine-celine' ELSE website END
WHERE slug = 'celine-laine-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.cheminvital.fr/' ELSE website END
WHERE slug = 'celine-ramos-chemin-vital-sainte-genevieve-des-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/112495-celine-segaillat-naturopathe-aulnay-sous-bois' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/112495-celine-segaillat-naturopathe-aulnay-sous-bois' ELSE booking_url END
WHERE slug = 'celine-segaillat-aulnay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendly.com/celinecoachnaturo/premiere-consultation-naturopathie' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/celinecoachnaturo/premiere-consultation-naturopathie' ELSE booking_url END
WHERE slug = 'celine-sion-la-garenne-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathe-courbevoie.com/' ELSE website END
WHERE slug = 'celine-touati-courbevoie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.charlottefillet-naturoreflexo.com/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=2729530597193920125' ELSE website END
WHERE slug = 'charlotte-fillet-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendly.com/despetitspasverssoi' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/despetitspasverssoi' ELSE booking_url END
WHERE slug = 'charlotte-willot-schneider-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.chedotalharoldnaturopathe.fr/' ELSE website END
WHERE slug = 'chedotal-harold-moret-loing-et-orvanne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.chloeberger.fr/' ELSE website END
WHERE slug = 'chloe-berger-poissy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.moncoconnaturo.fr/' ELSE website END
WHERE slug = 'christelle-barreau-saint-augustin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturo-bioenergie.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'christelle-becker-osny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe91.com/' ELSE website END
WHERE slug = 'christelle-deloges-villemoisson-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://booster-son-energie-vitale.com/' ELSE website END
WHERE slug = 'christelle-jouvel-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturo91.fr/' ELSE website END
WHERE slug = 'christelle-le-foulon-montgeron'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.lunaracoaching.fr/' ELSE website END
WHERE slug = 'christelle-volpez-houilles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturellementchoisi.fr/?utm_source=google&utm_medium=gmb&utm_campaign=referral' ELSE website END
WHERE slug = 'christine-cadoux-thiais'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://christine-maquart.fr/' ELSE website END
WHERE slug = 'christine-maquart-montmorency'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://bienaunaturel.com/' ELSE website END
WHERE slug = 'christine-sevestre-bretigny-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/paris/christophe-etienne-naturopathe-troubles-digestifs/62' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/paris/christophe-etienne-naturopathe-troubles-digestifs/62' ELSE booking_url END
WHERE slug = 'christophe-etienne-la-celle-saint-cloud'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.clesdesante.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'christophe-etienne-montfermeil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturoyang.com/' ELSE website END
WHERE slug = 'christophe-natarianni-charny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.chrissthnaturopathe.com/' ELSE website END
WHERE slug = 'christopher-saint-honore-soisy-sur-ecole'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://chrystelrija.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'chrystel-rija-saint-denis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://chrysoliteb354.wixsite.com/reiki' ELSE website END
WHERE slug = 'chrystelle-berger-eragny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.chrystellekandjiaubault.com/' ELSE website END
WHERE slug = 'chrystelle-kandji-aubault-mareil-marly'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://caveo.me/' ELSE website END
WHERE slug = 'cindy-busseau-tournan-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.cindydelisle.fr/' ELSE website END
WHERE slug = 'cindy-delisle-frepillon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://cindyfaro.com/' ELSE website END
WHERE slug = 'cindy-faro-lagny-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.ckfl.fr/' ELSE website END
WHERE slug = 'ckfl-couriol-korbendau-francelise-fontenay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.clairebasire.fr/' ELSE website END
WHERE slug = 'claire-basire-neauphle-le-chateau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.fontenaygymnastiqs.com/' ELSE website END
WHERE slug = 'claire-mazerand-fontenay-le-fleury'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.claireorseau.com/' ELSE website END
WHERE slug = 'claire-orseau-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mon-conseil-naturo.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'claire-torre-lesigny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mon-conseil-naturo.fr/' ELSE website END
WHERE slug = 'claire-torre-ozoir-la-ferriere'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://clarablicq.fr/' ELSE website END
WHERE slug = 'clara-blicq-rambouillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.claracornaert.com/' ELSE website END
WHERE slug = 'clara-cornaert-pantin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.a-chacun-sa-nature.com/' ELSE website END
WHERE slug = 'claudia-bonello-kaiser-fontainebleau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.facebook.com/profile.php?id=61550666361561' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.facebook.com/profile.php?id=61550666361561' ELSE booking_url END
WHERE slug = 'claudine-chaibelaine-chilly-mazarin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.lesmauxdesfemmes.com/' ELSE website END
WHERE slug = 'clemence-enou-noisy-le-grand'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/clemence_naturopathe/?hl=fr' ELSE website END
WHERE slug = 'clemence-henon-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://clementinecourtecu.wixsite.com/clementine-la-naturo' ELSE website END
WHERE slug = 'clementine-courtecuisse-maisons-alfort'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/clementine-drach/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/clementine-drach/' ELSE booking_url END
WHERE slug = 'clementine-drach-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.dietnaturo.fr/' ELSE website END
WHERE slug = 'coline-legeard-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.dietnaturo.fr/' ELSE website END
WHERE slug = 'coline-legeard-montevrain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/78595_hypnotherapeute-a-saint-maur-des-fosses-la-varenne' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.crenolib.fr/prendre-rdv/78595_hypnotherapeute-a-saint-maurice-pres-de-creteil' ELSE booking_url END
WHERE slug = 'combres-sylvie-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturezvous78.fr/' ELSE website END
WHERE slug = 'constance-buis-de-boussac-feucherolles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.coraliecagnon-naturopathe.fr/' ELSE website END
WHERE slug = 'coralie-cagnon-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/111991_rousseaux-ei' ELSE website END
WHERE slug = 'coralie-rousseaux-boutigny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturotherhappy.wordpress.com/' ELSE website END
WHERE slug = 'corine-ledoux-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://corinne-allemoz.fr/' ELSE website END
WHERE slug = 'corinne-allemoz-villeparisis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://corinnegoldfarbe.fr/' ELSE website END
WHERE slug = 'corinne-allioux-goldfarbe-saint-mande'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.corinneballery-naturo.com/' ELSE website END
WHERE slug = 'corinne-ballery-juvisy-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.corinne-brossier-magnetiseur-guerisseur.fr/' ELSE website END
WHERE slug = 'corinne-brossier-accompagnements-energetiques-magnetiseur-guidance-l-isle-adam'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://corinnedlp.fr/' ELSE website END
WHERE slug = 'corinne-de-la-pastelliere-les-ulis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://corinneduverger.com/' ELSE website END
WHERE slug = 'corinne-duverger-longperrier'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopathe-reflexologue-melun.fr/' ELSE website END
WHERE slug = 'corinne-juge-lesigny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.corinne-provost.fr/' ELSE website END
WHERE slug = 'corinne-provost-bailly-romainvilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://corinne-regnault.com/' ELSE website END
WHERE slug = 'corinne-regnault-bagneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/95512-rouguy-coulibaly-hypnotherapeute-conflans-sainte-honorine' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/95512-rouguy-coulibaly-hypnotherapeute-conflans-sainte-honorine?rwg_token=AFd1xnFS3ReU4moYLA2ffw8dkW6Uh51rkTv0hbcmaTh7vVLGDR07Tzc9mNFoDkjvhBOwYtLO-zBcPTBkc1jCh_5u5WzN4LYFog%3D%3D' ELSE booking_url END
WHERE slug = 'coulibaly-rouguy-conflans-sainte-honorine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cybeleguichard.com/' ELSE website END
WHERE slug = 'cybele-guichard-parmain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sens-et-naturopathie.com/' ELSE website END
WHERE slug = 'cynthia-bennour-massy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sophrologue-naturopathe-vincennes.fr/' ELSE website END
WHERE slug = 'cynthia-porras-sophrologue-vincennes-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cyrilhamoudanaturopathe.com/cyril-hamouda-naturopathe#accueil' ELSE website END
WHERE slug = 'cyril-hamouda-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/64891-daniele-lima-laine-naturopathe-serris' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/64891-daniele-lima-laine-naturopathe-serris' ELSE booking_url END
WHERE slug = 'daniele-laine-serris'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.sophrologue-estrade.fr/prendre-rendez-vous-sophrologue-nogent-sur-marne' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://www.sophrologue-estrade.fr/prendre-rendez-vous-sophrologue-nogent-sur-marne' ELSE booking_url END
WHERE slug = 'danielle-estrade-nogent-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lepleindessens.fr/' ELSE website END
WHERE slug = 'daphne-brakha-dampmart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.dauphineripelle-naturopathe-sophrologue.com/' ELSE website END
WHERE slug = 'dauphine-ripelle-gazeran'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://davidnaturopathe.wixsite.com/website' ELSE website END
WHERE slug = 'david-navarrete-brunoy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://resurescence.fr/' ELSE website END
WHERE slug = 'david-rubigny-limay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathe-quantique.com/' ELSE website END
WHERE slug = 'deborah-abisdid-pierrelaye'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe-essonne91.fr/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=17202562447073100587' ELSE website END
WHERE slug = 'deborah-tardif-breuillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.berangeredelhorme.fr/?utm_source=gmb' ELSE website END
WHERE slug = 'delhorme-berangere-villemoisson-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.deliacauchoix.com/' ELSE website END
WHERE slug = 'delia-cauchoix-ville-d-avray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://delphinebarrios.wixsite.com/dbarrios-naturo' ELSE website END
WHERE slug = 'delphine-barrios-marly-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.delphinecharvolin.com/' ELSE website END
WHERE slug = 'delphine-charvolin-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://natur-ange-98.webselfsite.net/' ELSE website END
WHERE slug = 'delphine-dubois-ivry-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe-marnelavallee.fr/' ELSE website END
WHERE slug = 'delphine-dupont-chessy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://djlongueville.wixsite.com/naturo-versailles' ELSE website END
WHERE slug = 'delphine-jalleau-longueville-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.delphinelaustriat.com/' ELSE website END
WHERE slug = 'delphine-laustriat-lecomte-mennecy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.delphineperceau.com/' ELSE website END
WHERE slug = 'delphine-perceau-courbevoie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.delphineroques.com/' ELSE website END
WHERE slug = 'delphine-roques-nemours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://delphinewephre-naturopathie.fr/' ELSE website END
WHERE slug = 'delphine-wephre-longjumeau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://demeure.site-solocal.com/' ELSE website END
WHERE slug = 'demeure-bruno-grez-sur-loing'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://johanna-dermi.com/' ELSE website END
WHERE slug = 'dermi-johanna-brunoy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/diane-lacroix/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/diane-lacroix/' ELSE booking_url END
WHERE slug = 'diane-lacroix-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://didier-lasserre-naturopathe-33.webself.net/' ELSE website END
WHERE slug = 'didier-lasserre-conflans-sainte-honorine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.aromatherapie-energie-quantique.fr/' ELSE website END
WHERE slug = 'dominique-chamoumi-maisons-laffitte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://dominiquelecat.com/' ELSE website END
WHERE slug = 'dominique-lecat-montevrain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.dominiquelefebvre.fr/' ELSE website END
WHERE slug = 'dominique-lefebvre-accompagnement-l-etang-la-ville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doris-kirschner.fr/' ELSE website END
WHERE slug = 'doris-kirschner-sophrologue-fontainebleau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://sophrologue-psychologue-psychotherapeute-essonne-91.webnode.fr/' ELSE website END
WHERE slug = 'dr-anahita-oliaei-psychologue-psychotherapeute-evry-courcouronnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.imene-naturopathe.com/' ELSE website END
WHERE slug = 'drainage-lymphatique-manuel-vodder-a-sceaux-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://holibodywellness.fr/' ELSE website END
WHERE slug = 'drainage-lymphatique-renata-franca-bodycontouring-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://eclosioninterieure.com/' ELSE website END
WHERE slug = 'eclosion-interieure-marcoussis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://eleana-naturopathe.com/' ELSE website END
WHERE slug = 'eleana-mahtallah-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.eleonorechouquet.fr/' ELSE website END
WHERE slug = 'eleonore-chouquet-ozoir-la-ferriere'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/123524-elhem-el-khammassi-naturopathe-la-ferte-sous-jouarre' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/123524-elhem-el-khammassi-naturopathe-la-ferte-sous-jouarre' ELSE booking_url END
WHERE slug = 'elhem-el-khammassi-la-ferte-sous-jouarre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/limeil-brevannes/eliaz-malanda/3210?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/limeil-brevannes/eliaz-malanda/3210?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'eliaz-malanda-limeil-brevannes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/74630-elisabeth-musart-naturopathe-l-etang-la-ville#newrdvmodal' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/74630-elisabeth-musart-naturopathe-l-etang-la-ville#newrdvmodal' ELSE booking_url END
WHERE slug = 'elisabeth-musart-l-etang-la-ville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.elisehnaturopathe.com/' ELSE website END
WHERE slug = 'elise-hattab-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.glownaturo.com/' ELSE website END
WHERE slug = 'elisenda-philippe-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturohypnose.fr/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/61302-elodie-demard-hypnotherapeute-taverny?rwg_token=AFd1xnHyGjhG3pDsF_9s1SUjqLRW65Z0hlmQYP2m8qpuDHGGOZB7wUAOwXgqAwQshpCrIEgHv8HKR_LrvpU55WkLw3dsKINv6Q%3D%3D' ELSE booking_url END
WHERE slug = 'elodie-demard-taverny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://elodie-farjaud-naturopathe.com/' ELSE website END
WHERE slug = 'elodie-farjaud-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/ballancourt-sur-essonne/eloise-bouche/15405' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/ballancourt-sur-essonne/eloise-bouche/15405' ELSE booking_url END
WHERE slug = 'eloise-bouche-ballancourt-sur-essonne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.eloise-naturopathe.fr/' ELSE website END
WHERE slug = 'eloise-dubois-gache-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.elpidatherapeia.com/' ELSE website END
WHERE slug = 'elpida-therapeia-sevres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://elsapoullain-naturo.com/' ELSE website END
WHERE slug = 'elsa-poullain-buchelay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://ollin-equilibre.com/' ELSE website END
WHERE slug = 'emilie-boutin-alfortville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://ollin-equilibre.com/' ELSE website END
WHERE slug = 'emilie-boutin-neuilly-plaisance'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://healthyandyou.fr/mes-accompagnements-individuels/' ELSE website END
WHERE slug = 'emilie-garcia-cormeilles-en-parisis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lesclesdelanature.com/' ELSE website END
WHERE slug = 'emilie-routhier-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lesclesdelanature.com/' ELSE website END
WHERE slug = 'emilie-routhier-crecy-la-chapelle'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/76020-emilie-sahli-naturopathe-chelles#newrdvmodal' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/76020-emilie-sahli-naturopathe-chelles#newrdvmodal' ELSE booking_url END
WHERE slug = 'emilie-sahli-chelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://emilieschneider55.wixsite.com/smile' ELSE website END
WHERE slug = 'emilie-schneider-le-plessis-bouchard'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.emilievanginkel.com/' ELSE website END
WHERE slug = 'emilie-van-ginkel-ville-d-avray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/issy-les-moulineaux/emma-meston/2930?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/issy-les-moulineaux/emma-meston/2930?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'emma-meston-meudon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.emmasalah.fr/' ELSE website END
WHERE slug = 'emma-salah-epinay-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.emmanueljoubert.fr/' ELSE website END
WHERE slug = 'emmanuel-joubert-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturocreative.com/' ELSE website END
WHERE slug = 'emmanuelle-dominici-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://emmanaturopathe.fr/' ELSE website END
WHERE slug = 'emmanuelle-durand-osny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe-emmanuelle-lerbret.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'emmanuelle-lerbret-suresnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://emmanuelle-naturopathe.com/' ELSE website END
WHERE slug = 'emmanuelle-perrin-milly-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.equilibre-acupuncture.com/' ELSE website END
WHERE slug = 'equilibre-acupuncture-mantes-la-jolie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.catherinesuchel.com/' ELSE website END
WHERE slug = 'equilibre-hormonal-feminin-le-mesnil-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.erikagalliero.fr/' ELSE website END
WHERE slug = 'erika-galliero-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sebekeneya.com/' ELSE website END
WHERE slug = 'espace-sebe-keneya-garges-les-gonesse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://essentiellesunna.fr/' ELSE website END
WHERE slug = 'essentielle-sunna-aulnay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.vitalitedurable.com/' ELSE website END
WHERE slug = 'estelle-becuwe-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ecatelnaturopathe.com/' ELSE website END
WHERE slug = 'estelle-catel-corbeil-essonnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.estellepautret.fr/' ELSE website END
WHERE slug = 'estelle-pautret-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.estellepautret.fr/' ELSE website END
WHERE slug = 'estelle-pautret-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.natergypro.com/' ELSE website END
WHERE slug = 'eugenie-cazor-spaargaren-chambourcy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.natergypro.com/' ELSE website END
WHERE slug = 'eugenie-cazor-spaargaren-saint-germain-en-laye'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.eugeniehoudement.fr/' ELSE website END
WHERE slug = 'eugenie-houdement-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://eulalienaturopathe.com/' ELSE website END
WHERE slug = 'eulalie-courtheoux-chanel-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/96940-eva-ganem-naturopathe-enghein-les-bains' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/96940-eva-ganem-naturopathe-enghein-les-bains' ELSE booking_url END
WHERE slug = 'eva-ganem-enghien-les-bains'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathie-animale-paris.fr/' ELSE website END
WHERE slug = 'eve-brzyski-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://eospoissy.com/' ELSE website END
WHERE slug = 'eveil-o-sens-poissy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://evenaturopathe.com/' ELSE website END
WHERE slug = 'evgeniya-diard-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.fabiennebonnaud.fr/' ELSE website END
WHERE slug = 'fabienne-bonnaud-psychanalyste-cachan'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/fabienne-mayoute/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/fabienne-mayoute/' ELSE booking_url END
WHERE slug = 'fabienne-mayoute-noisiel'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://fabienne.merle.fr/' ELSE website END
WHERE slug = 'fabienne-merle-nangis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.faridacoachnaturo.com/' ELSE website END
WHERE slug = 'farida-ait-kheddache-joinville-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopourtous.fr/' ELSE website END
WHERE slug = 'farida-boudjema-berkane-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ben-holiste.com/' ELSE website END
WHERE slug = 'fatima-ez-zahra-ben-yessef-aulnay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://simplementnaturo.fr/' ELSE website END
WHERE slug = 'fatima-khalloufi-sevres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/sophrologue/puteaux/feriel-benali?utm_campaign=google-maps&utm_content=puteaux&utm_medium=organic&utm_source=google&utm_term=sophrologue' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/sophrologue/puteaux/feriel-benali?utm_campaign=google-maps&utm_content=puteaux&utm_medium=organic&utm_source=google&utm_term=sophrologue' ELSE booking_url END
WHERE slug = 'feriel-benali-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.fiorinaturelle.fr/' ELSE website END
WHERE slug = 'fiori-gaiducov-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://grainesdesante.com/' ELSE website END
WHERE slug = 'flore-merbouh-bures-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/saint-mande/flore-nicolas/771' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/saint-mande/flore-nicolas/771' ELSE booking_url END
WHERE slug = 'flore-nicolas-saint-mande'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.facebook.com/florence.p.chollet' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.facebook.com/florence.p.chollet' ELSE booking_url END
WHERE slug = 'florence-chollet-montfort-l-amaury'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathe-reiki-saint-maur.com/' ELSE website END
WHERE slug = 'florence-darche-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://natureetflo.fr/' ELSE website END
WHERE slug = 'florence-deside-brie-comte-robert'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.harmony-actuelle.com/' ELSE website END
WHERE slug = 'florence-dolhen-magny-en-vexin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://resalib.fr/p/114975' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://resalib.fr/p/114975' ELSE booking_url END
WHERE slug = 'florence-jarrie-peguilhan-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://flolanaturo.fr/' ELSE website END
WHERE slug = 'florence-linden-flo-la-parmain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.pharmacien-naturopathe.fr/' ELSE website END
WHERE slug = 'florence-raynaud-delaval-croissy-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://florence-scuotto.fr/' ELSE website END
WHERE slug = 'florence-scuotto-sucy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://fr-naturopathe.fr/' ELSE website END
WHERE slug = 'floryan-reyne-fontenay-aux-roses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://bayeneosteopathe.fr/' ELSE website END
WHERE slug = 'foufa-bayene-corbeil-essonnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://francknaturo9.wixsite.com/website' ELSE website END
WHERE slug = 'franck-mangin-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/rueil-malmaison/franck-tcherneian/2211?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/rueil-malmaison/franck-tcherneian/2211?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'franck-tcherneian-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.envie-de-naturel.com/' ELSE website END
WHERE slug = 'francoise-avril-montesson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.cabinet-commeuneplume.fr/' ELSE website END
WHERE slug = 'francoise-valery-verneuil-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.equilibredescorps.com/' ELSE website END
WHERE slug = 'frederique-favier-faremoutiers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.gemme-nature.fr/' ELSE website END
WHERE slug = 'frederique-lisbet-sucy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.bee-naturopathie.com/' ELSE website END
WHERE slug = 'frederique-quessada-rambouillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://gaby-naturelle.fr/' ELSE website END
WHERE slug = 'gaby-naturelle-saint-mande'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturo-digest.fr/' ELSE website END
WHERE slug = 'gaell-delporte-mery-sur-oise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.lamaisondanslarbre.com/' ELSE website END
WHERE slug = 'gaetane-declety-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://genevievemarques.wixsite.com/naturopathe' ELSE website END
WHERE slug = 'genevieve-marques-savigny-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/osteopathe/le-blanc-mesnil/geoffrey-lardenois' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/osteopathe/le-blanc-mesnil/geoffrey-lardenois' ELSE booking_url END
WHERE slug = 'geoffrey-lardenois-le-blanc-mesnil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/geraldine-chaleil/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/geraldine-chaleil/' ELSE booking_url END
WHERE slug = 'geraldine-chaleil-bois-d-arcy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://valerieleger.fr/' ELSE website END
WHERE slug = 'gif-sur-yvette-gif-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/82311_gomes-rodrigues-naturopathe-certifiee' ELSE website END
WHERE slug = 'gomes-rodrigues-felicie-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopathe-78-15.webself.net/' ELSE website END
WHERE slug = 'gout-josephine-le-mesnil-saint-denis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/therapeute/naturopathe/argenteuil/95100/20440-rabia_guemmouri' ELSE website END
WHERE slug = 'guemmouri-rabia-argenteuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.guyberlin-aroma.fr/' ELSE website END
WHERE slug = 'guy-berlin-gif-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/osteopathe/montmorency/gwenaelle-fournier' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/osteopathe/montmorency/gwenaelle-fournier' ELSE booking_url END
WHERE slug = 'gwenaelle-fournier-montmorency'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.gwendolineleber.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'gwendoline-le-ber-montfermeil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://gwladysmontredon.com/' ELSE website END
WHERE slug = 'gwladys-montredon-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.puerinaturo.com/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=1368918512641332922' ELSE website END
WHERE slug = 'haja-benglia-athis-mons'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.hellonaturo.fr/' ELSE website END
WHERE slug = 'hanane-larbi-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://helena-naturopathe.fr/' ELSE website END
WHERE slug = 'helena-dominguez-corbeil-essonnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://perfactive.fr/naturopathe/pontault-combault/helene-champs' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://perfactive.fr/naturopathe/pontault-combault/helene-champs' ELSE booking_url END
WHERE slug = 'helene-champs-pontault-combault'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.holisticglowparis.com/' ELSE website END
WHERE slug = 'helene-guerin-chatou'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://helena-manaturo.fr/' ELSE website END
WHERE slug = 'helene-himmelbauer-guermantes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lanaturedhelene.fr/' ELSE website END
WHERE slug = 'helene-millot-serris'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.helenepassedouet.fr/' ELSE website END
WHERE slug = 'helene-passedouet-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://hbnaturo.fr/' ELSE website END
WHERE slug = 'heloise-boidron-bailly'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.atelierhenriettehoche.fr/' ELSE website END
WHERE slug = 'henriette-hoche-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturo-solutions.com/' ELSE website END
WHERE slug = 'hoppley-pinchot-chantal-gretz-armainvilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendly.com/douceurdelamee/30min' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/douceurdelamee/30min' ELSE booking_url END
WHERE slug = 'hourya-m-lieusaint'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.vincent-adamdevilliers.fr/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/bouc-bel-air/vincent-adam-de-villiers/5752?utm_source=bouton-rdv&utm_medium=pack-com&utm_campaign=vincent-adam-de-villiers' ELSE booking_url END
WHERE slug = 'hypnose-humaniste-ericksonienne-vincent-adam-de-villiers-enghien-les-bains-val-d-oise-hypnotherapeute-enghien-les-bains'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://imanenaturo.fr/' ELSE website END
WHERE slug = 'imane-benhaddou-houilles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://imaneharmonie.com/' ELSE website END
WHERE slug = 'imane-harmonie-serris'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.impulsion-de-vie.fr/' ELSE website END
WHERE slug = 'impulsion-de-vie-bougival'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.inesnaturopathe.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'ines-anciaes-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.inesnaturopathe.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'ines-anciaes-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturovegetale.fr/' ELSE website END
WHERE slug = 'ingrid-bonin-quincy-voisins'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.ingrid-ghesquiere.com/' ELSE website END
WHERE slug = 'ingrid-ghesquiere-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://institutjeruzen.com/' ELSE website END
WHERE slug = 'institut-jeruzen-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.isabellecarre-naturopathe.fr/' ELSE website END
WHERE slug = 'isabelle-carre-creteil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://isabelledauge-naturopathe.fr/' ELSE website END
WHERE slug = 'isabelle-dauge-sevres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.isabelle-dos-santos.fr/' ELSE website END
WHERE slug = 'isabelle-dos-santos-sucy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.isabelledoumenc-naturopathe.fr/' ELSE website END
WHERE slug = 'isabelle-doumenc-issy-les-moulineaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.isabellefelisaz.fr/' ELSE website END
WHERE slug = 'isabelle-felisaz-jouars-pontchartrain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://lenergienaturo.fr/' ELSE website END
WHERE slug = 'isabelle-felisaz-neauphle-le-vieux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.isabelle-gayet.fr/' ELSE website END
WHERE slug = 'isabelle-gayet-ferrieres-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://preventionsante-fontainebleau.fr/isabelle-guinhut/' ELSE website END
WHERE slug = 'isabelle-guinhut-fontainebleau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.isabelle-infantes.fr/' ELSE website END
WHERE slug = 'isabelle-infantes-saint-pierre-du-perray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.isabelle-infantes.fr/' ELSE website END
WHERE slug = 'isabelle-infantes-soisy-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.isabellejour.fr/' ELSE website END
WHERE slug = 'isabelle-jour-massy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://isamedici78.wixsite.com/naturopathie' ELSE website END
WHERE slug = 'isabelle-medici-mantes-la-jolie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.isabellemeunier.fr/' ELSE website END
WHERE slug = 'isabelle-meunier-montrouge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://isabellemorin-therapeute.com/' ELSE website END
WHERE slug = 'isabelle-morin-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.rivet-naturopathe.fr/' ELSE website END
WHERE slug = 'isabelle-rivet-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.isabelle-vitalis.fr/' ELSE website END
WHERE slug = 'isabelle-vitalis-bagneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/lesateliersdivy?igsh=cjBrczQ3aDEwYm0=' ELSE website END
WHERE slug = 'ivy-herbaliste-le-plessis-robinson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://aujana.fr/' ELSE website END
WHERE slug = 'jammes-audrey-gif-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturojeanne.wixsite.com/my-site-6' ELSE website END
WHERE slug = 'jeanne-camus-bry-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.maviebienetre.fr/' ELSE website END
WHERE slug = 'jennifer-biddau-saint-pathus'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://jb-naturopathe.com/' ELSE website END
WHERE slug = 'jessica-brail-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.acteurdevotresante.fr/' ELSE website END
WHERE slug = 'jessica-martinez-draveil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cabinetparamedicalputeaux.fr/#Naturopathie' ELSE website END
WHERE slug = 'jessica-piquer-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathe92.org/' ELSE website END
WHERE slug = 'joelle-chevrin-sevres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://johannafiliol.com/' ELSE website END
WHERE slug = 'johanna-filiol-garches'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.johanna-naturopathie.fr/' ELSE website END
WHERE slug = 'johanna-lieure-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.judithguesdon.com/' ELSE website END
WHERE slug = 'judith-guesdon-saint-germain-en-laye'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.juliabourayne.com/' ELSE website END
WHERE slug = 'julia-bourayne-conflans-sainte-honorine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.juliabourayne.com/' ELSE website END
WHERE slug = 'julia-bourayne-marly-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/naturopathe/vaires-sur-marne/761598?utm_campaign=google-maps&utm_content=vaires-sur-marne&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/naturopathe/vaires-sur-marne/761598?utm_campaign=google-maps&utm_content=vaires-sur-marne&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'julie-beaufils-vaires-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://juliebluysen.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'julie-bluysen-cormeilles-en-parisis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://juliebluysen.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'julie-bluysen-saint-cloud'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.julieclavilier-naturopathe-reflexologue.com/' ELSE website END
WHERE slug = 'julie-clavilier-buchelay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.juliedelplancq.com/' ELSE website END
WHERE slug = 'julie-delplancq-croissy-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.julie-naturopathe77.fr/' ELSE website END
WHERE slug = 'julie-derouet-gretz-armainvilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://maboussolenaturo.fr/' ELSE website END
WHERE slug = 'julie-jerolon-champigny-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://juliemarchandnaturopathe.fr/' ELSE website END
WHERE slug = 'julie-marchand-etampes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/presles-95/julie-plantefeve/1135' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/presles-95/julie-plantefeve/1135' ELSE booking_url END
WHERE slug = 'julie-plantefeve-beauchamp'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturofildesages.com/' ELSE website END
WHERE slug = 'julie-plantefeve-presles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://juliettedelbreuve.fr/' ELSE website END
WHERE slug = 'juliette-delbreuve-saint-ouen-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.juliettejouannet.fr/' ELSE website END
WHERE slug = 'juliette-jouannet-issy-les-moulineaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.justineprudhon.fr/' ELSE website END
WHERE slug = 'justine-prud-hon-le-perreux-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.chihsiakao.com/' ELSE website END
WHERE slug = 'kao-chi-hsia-ezanville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.karendente.fr/' ELSE website END
WHERE slug = 'karen-dente-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.votresantenaturellement.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'karen-recchi-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.votresantenaturellement.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'karen-recchi-thiais'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://karineb-naturopathie.com/' ELSE website END
WHERE slug = 'karine-bensimon-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.emofit.fr/' ELSE website END
WHERE slug = 'karine-richet-magnetiseur-physionutrition-energeticienne-breuillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.karolinadantin.fr/' ELSE website END
WHERE slug = 'karolina-dantin-champs-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.karolinadantin.fr/' ELSE website END
WHERE slug = 'karolina-dantin-evry-courcouronnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.wellengo.com/pro/Kateryna-FROLOV' ELSE website END
WHERE slug = 'kateryna-frolov-epinay-sous-senart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.katherine-naturopathe.fr/' ELSE website END
WHERE slug = 'katherine-vorojtsova-montgeron'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.kevin-desert.fr/prendre-rendez-vous-naturopathe-versailles' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.kevin-desert.fr/prendre-rendez-vous-naturopathe-versailles' ELSE booking_url END
WHERE slug = 'kevin-desert-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/42010-khedidja-kadri-naturopathe-carrieres-sur-seine' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/42010-khedidja-kadri-naturopathe-carrieres-sur-seine' ELSE booking_url END
WHERE slug = 'khedidja-kadri-carrieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.latelieranimal.fr/' ELSE website END
WHERE slug = 'l-atelier-du-bien-etre-animal-villepreux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.eau-vive.com/magasin/magasin-bio-bonneuil-sur-marne' ELSE website END
WHERE slug = 'l-eau-vive-bonneuil-sur-marne-bonneuil-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.espacedesanteaunaturel.com/' ELSE website END
WHERE slug = 'l-titia-jeanne-saint-vrain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.laetitia-beaucourt-naturopathe.fr/' ELSE website END
WHERE slug = 'laetitia-beaucourt-herblay-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/97098-laetitia-beverini-naturopathe-naturopathe-montreuil' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/97098-laetitia-beverini-naturopathe-naturopathe-montreuil' ELSE booking_url END
WHERE slug = 'laetitia-beverini-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturebylaeti.fr/?utm_source=gmb' ELSE website END
WHERE slug = 'laetitia-payet-herblay-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://perfactive.fr/naturopathe/nogent-sur-marne/laetitia-vinel' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://perfactive.fr/naturopathe/nogent-sur-marne/laetitia-vinel' ELSE booking_url END
WHERE slug = 'laetitia-vinel-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sumupbookings.com/laila-merzouki' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.sumupbookings.com/laila-merzouki' ELSE booking_url END
WHERE slug = 'laila-merzouki-coupvray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lakenlima.com/' ELSE website END
WHERE slug = 'laken-lima-saint-ouen-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://profdebonheur.com/' ELSE website END
WHERE slug = 'laureline-afchain-villiers-saint-frederic'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.retrouvezvotrevitalite.com/' ELSE website END
WHERE slug = 'laurence-fournet-maisons-laffitte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe-kowalski.com/' ELSE website END
WHERE slug = 'laurence-kowalski-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.laurence-rolleri.com/' ELSE website END
WHERE slug = 'laurence-rolleri-chennevieres-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.facebook.com/profile.php?id=100057412781871' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.facebook.com/profile.php?id=100057412781871' ELSE booking_url END
WHERE slug = 'laurent-beatrice-energeticienne-parmain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.dietadomicile.fr/' ELSE website END
WHERE slug = 'laurent-goncalves-charenton-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://dietadomicile.fr/topic/index.html' ELSE website END
WHERE slug = 'laurent-goncalves-fontenay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.dietadomicile.fr/' ELSE website END
WHERE slug = 'laurent-goncalves-villepinte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.layina-bafdile.com/' ELSE website END
WHERE slug = 'layina-bafdile-courbevoie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.leammadeclaire.fr/' ELSE website END
WHERE slug = 'le-amma-de-claire-vitry-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://resalib.fr/p/20711' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://resalib.fr/p/20711' ELSE booking_url END
WHERE slug = 'le-bien-etre-au-naturel-ollainville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://lelow-care.fr/services' ELSE website END
WHERE slug = 'lea-garcia-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lknaturopathie.wixsite.com/lknaturopathie' ELSE website END
WHERE slug = 'lea-kern-chatenay-malabry'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://leilagroum.com/' ELSE website END
WHERE slug = 'leila-groum-le-pecq'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sante-globale-preservee.com/index.php/me-contacter' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.sante-globale-preservee.com/index.php/me-contacter' ELSE booking_url END
WHERE slug = 'lemaire-michelle-fontenay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.harmonipro.fr/fr/practitioners/80-les-chemins-de-la-vitalite' ELSE website END
WHERE slug = 'les-chemins-de-la-vitalite-goussainville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://lessencieldemeg.com/' ELSE website END
WHERE slug = 'les-sens-ciel-de-meg-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://soinssorella.fr/' ELSE website END
WHERE slug = 'les-soins-sorella-chambourcy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/154461_duval-lidwina' ELSE website END
WHERE slug = 'lidwina-duval-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.lindasebillotte.fr/' ELSE website END
WHERE slug = 'linda-sebillotte-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://line-lefebvre.fr/' ELSE website END
WHERE slug = 'line-lefebvre-triel-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.etsionrenaissait.com/' ELSE website END
WHERE slug = 'line-soulie-champcueil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lisemonnerais-naturopathe.com/' ELSE website END
WHERE slug = 'lise-monnerais-eragny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.liselore-audin.com/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=5754327557404900389' ELSE website END
WHERE slug = 'liselore-audin-champs-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.liselore-audin.com/?utm_source=google&utm_medium=wix_google_business_profile&utm_campaign=17233181015168162637' ELSE website END
WHERE slug = 'liselore-audin-coulommiers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://loevanaturopathe.com/' ELSE website END
WHERE slug = 'loeva-thirion-champlan'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/lola.naturopathe/' ELSE website END
WHERE slug = 'lola-fay-charenton-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturo-irido.fr/' ELSE website END
WHERE slug = 'loredane-di-meo-montrouge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lorette-caillon.fr/' ELSE website END
WHERE slug = 'lorette-caillon-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.louisedesayve.com/' ELSE website END
WHERE slug = 'louise-de-sayve-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://healme.care/' ELSE website END
WHERE slug = 'lucia-brane-duranona-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://votreequilibre.fr/' ELSE website END
WHERE slug = 'lucia-crispino-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.maroutinenaturo.fr/' ELSE website END
WHERE slug = 'lucile-tournou-chevreuse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.ludivine-naturopathie.fr/' ELSE website END
WHERE slug = 'ludivine-claude-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.drouet.pro/' ELSE website END
WHERE slug = 'ludovic-drouet-osteopathe-do-neuilly-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.luigi-assoumaya.fr/' ELSE website END
WHERE slug = 'luigi-assoumaya-lagny-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.luigi-assoumaya.fr/' ELSE website END
WHERE slug = 'luigi-assoumaya-quincy-voisins'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/64668-lydie-grandin-naturopathe-colombes#newrdvmodal' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/64668-lydie-grandin-naturopathe-colombes#newrdvmodal' ELSE booking_url END
WHERE slug = 'lydie-grandin-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/massy-91/madeleine-touboul/22709' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/massy-91/madeleine-touboul/22709' ELSE booking_url END
WHERE slug = 'madeleine-touboul-massy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.maellenaturo.fr/' ELSE website END
WHERE slug = 'maelle-ferre-nemours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/aza.therapie_?igsh=MWNwMmo2am8wbHo1Yw==' ELSE website END
WHERE slug = 'maeva-polat-pantin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ma-naturopathie.fr/' ELSE website END
WHERE slug = 'magali-arnaudeau-saint-mande'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.magali-bagot.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://user.clicrdv.com/bagot-magali?calendar_id=677967' ELSE booking_url END
WHERE slug = 'magali-bagot-cormeilles-en-parisis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.manebilliet.fr/' ELSE website END
WHERE slug = 'magali-mane-billiet-chatou'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://rdv.terapiz.com/naturopathe/saint-maur-des-fosses/magdalena-auvray' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://rdv.terapiz.com/naturopathe/saint-maur-des-fosses/magdalena-auvray' ELSE booking_url END
WHERE slug = 'magdalena-auvray-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.magdalenanaturellement.com/' ELSE website END
WHERE slug = 'magdalena-paul-moret-loing-et-orvanne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.magicbienetre.fr/' ELSE website END
WHERE slug = 'magic-bien-etre-cbd-essonne-savigny-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://emofit.fr/?utm_source=gmb' ELSE website END
WHERE slug = 'magnetiseur-karine-richet-magnetiseur-ile-de-france-physio-breuillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://boutiqueachaiah.com/' ELSE website END
WHERE slug = 'magnetiseur-magnetiseuse-aubergenville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://boutiqueachaiah.com/' ELSE website END
WHERE slug = 'magnetiseur-magnetiseuse-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://resalib.fr/p/20711' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://resalib.fr/p/20711' ELSE booking_url END
WHERE slug = 'mala-chabanon-ollainville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.theraneo.com/malika-ternisien' ELSE website END
WHERE slug = 'malika-ternisien-montigny-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://manonhelainenaturopathie.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'manon-helaine-les-essarts-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://manontheveny.fr/' ELSE website END
WHERE slug = 'manon-theveny-clichy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.therapeutes.com/naturopathe/roissy-en-brie/margot-diouf' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.therapeutes.com/naturopathe/roissy-en-brie/margot-diouf' ELSE booking_url END
WHERE slug = 'margot-diouf-roissy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://mariam-drame.fr/' ELSE website END
WHERE slug = 'mariam-drame-mitry-mory'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mariannefauchille.com/' ELSE website END
WHERE slug = 'marianne-fauchille-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mariannethiebautnaturopathe.com/' ELSE website END
WHERE slug = 'marianne-thiebaut-moigny-sur-ecole'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/boissy-le-cutte/marie-alice-roux/3950' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/boissy-le-cutte/marie-alice-roux/3950' ELSE booking_url END
WHERE slug = 'marie-alice-roux-porri-boissy-le-cutte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://malix-naturopathe.fr/' ELSE website END
WHERE slug = 'marie-alix-des-courtils-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.espritmomiji.com/' ELSE website END
WHERE slug = 'marie-amandine-bain-jouy-en-josas'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.espritmomiji.com/' ELSE website END
WHERE slug = 'marie-amandine-bain-versailles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.maj-naturo.com/' ELSE website END
WHERE slug = 'marie-ange-jourdant-sartrouville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.bienetreetnaturo.fr/' ELSE website END
WHERE slug = 'marie-annick-borie-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://liberlo.com/profil/marie-attar/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://liberlo.com/profil/marie-attar/' ELSE booking_url END
WHERE slug = 'marie-attar-saint-michel-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cal.com/mariebeaudry-naturopathe?redirect=false' ELSE website END
WHERE slug = 'marie-beaudry-bois-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/servon-77/marie-benner/1773' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/servon-77/marie-benner/1773' ELSE booking_url END
WHERE slug = 'marie-benner-servon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://fleursdefemmesnaturo.fr/' ELSE website END
WHERE slug = 'marie-brillet-carrieres-sous-poissy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://rdv.itiaki.com/naturelsens' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://rdv.itiaki.com/naturelsens' ELSE booking_url END
WHERE slug = 'marie-christine-freire-l-isle-adam'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.marieclairemajorel.com/' ELSE website END
WHERE slug = 'marie-claire-majorel-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://mariecollignon-naturopathe.fr/' ELSE website END
WHERE slug = 'marie-collignon-le-mesnil-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://mariedefoort.com/' ELSE website END
WHERE slug = 'marie-defoort-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.mdlinonaturo.fr/' ELSE website END
WHERE slug = 'marie-desiree-lino-trilport'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://marieduhammel-naturopathe.fr/' ELSE website END
WHERE slug = 'marie-duhammel-juvisy-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mariehodynaturopat.wixsite.com/my-site' ELSE website END
WHERE slug = 'marie-hody-fresnes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.nut-reflex.fr/' ELSE website END
WHERE slug = 'marie-laure-beaussart-garches'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.visanaturo.com/' ELSE website END
WHERE slug = 'marie-mercedes-vega-fau-montfort-l-amaury'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mariepathe-reflexonaturo.fr/' ELSE website END
WHERE slug = 'marie-pathe-quincy-voisins'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturobinson.fr/' ELSE website END
WHERE slug = 'marie-robert-le-plessis-robinson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.marietamisier.com/' ELSE website END
WHERE slug = 'marie-tamisier-les-lilas'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.marilynetheodosenaturo.com/' ELSE website END
WHERE slug = 'marilyne-theodose-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/91166-marine-gonnot-naturopathe-sept-sorts' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/91166-marine-gonnot-naturopathe-sept-sorts' ELSE booking_url END
WHERE slug = 'marine-gonnot-sept-sorts'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lorangesanguine.fr/' ELSE website END
WHERE slug = 'marine-martin-breuillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mariondc-naturo.fr/' ELSE website END
WHERE slug = 'marion-de-carvalho-ozoir-la-ferriere'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://marionhardy.fr/' ELSE website END
WHERE slug = 'marion-hardy-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.marionlelong-naturopathe.com/' ELSE website END
WHERE slug = 'marion-lelong-sevres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathechatillon.fr/' ELSE website END
WHERE slug = 'marion-robert-verite-chatillon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.bergamenthe.com/' ELSE website END
WHERE slug = 'marion-vuong-massy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.passeportnaturo.fr/' ELSE website END
WHERE slug = 'marjorie-caudal-le-chesnay-rocquencourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturofeel.fr/' ELSE website END
WHERE slug = 'marjorie-sabaria-chavenay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://markshealthclub.fr/' ELSE website END
WHERE slug = 'mark-sanchez-l-isle-adam'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://marlenenaturopathe.wixsite.com/etre' ELSE website END
WHERE slug = 'marlene-dias-nanterre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.marlene-naturoenergie.fr/' ELSE website END
WHERE slug = 'marlene-frideloux-villiers-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.lesmainsdemorgane.fr/' ELSE website END
WHERE slug = 'marne-la-vallee-77-noisiel'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://martaklycinski.com/' ELSE website END
WHERE slug = 'marta-klycinski-meaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/_mangoandco/' ELSE website END
WHERE slug = 'maryline-machinet-brunoy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/115011-maryline-maze-naturopathe-boulogne-billancourt' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/115011-maryline-maze-naturopathe-boulogne-billancourt' ELSE booking_url END
WHERE slug = 'maryline-maze-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.mathildebnaturopathe.com/' ELSE website END
WHERE slug = 'mathilde-bezace-charenton-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.mathilde-boutoille-naturopathe.com/' ELSE website END
WHERE slug = 'mathilde-boutoille-acheres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/-/mathilde-lamarre/17731' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/-/mathilde-lamarre/17731' ELSE booking_url END
WHERE slug = 'mathilde-lamarre-meudon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.mayapure.fr/' ELSE website END
WHERE slug = 'maya-pure-velizy-villacoublay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://medzentorii.fr/?utm_source=gmb' ELSE website END
WHERE slug = 'med-zen-torii-le-vesinet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathie.company.site/' ELSE website END
WHERE slug = 'medecine-ayurvedique-roissy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.melanie-dalmaso.com/' ELSE website END
WHERE slug = 'melanie-dalmaso-saclay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://melanienaturo.fr/' ELSE website END
WHERE slug = 'melanie-druesne-marolles-en-hurepoix'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://melinahenry-naturopathe.com/' ELSE website END
WHERE slug = 'melina-henry-triel-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://metamorphosenaturopathie.com/' ELSE website END
WHERE slug = 'metamorphose-animale-palaiseau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://michaelpanneau-naturopathe.com/' ELSE website END
WHERE slug = 'michael-panneau-chanteloup-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://sophrologue-michel-farah.fr/' ELSE website END
WHERE slug = 'michel-farah-charenton-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://michelroudiernaturopathe.wordpress.com/' ELSE website END
WHERE slug = 'michel-roudier-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://pro.doctolib.fr/naturopathe/paris/mila-bichart?utm_source=google&utm_medium=organic&utm_term=naturopathe&utm_content=paris&utm_campaign=google-maps' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://pro.doctolib.fr/naturopathe/paris/mila-bichart?utm_source=google&utm_medium=organic&utm_term=naturopathe&utm_content=paris&utm_campaign=google-maps' ELSE booking_url END
WHERE slug = 'mila-bichart-saint-prix'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.doctolib.fr/naturopathe/pontoise/mimoun-mouh?pid=practice-134538&utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://www.doctolib.fr/naturopathe/pontoise/mimoun-mouh?pid=practice-134538&utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'mimoun-mouh-magny-en-vexin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.doctolib.fr/naturopathe/pontoise/mimoun-mouh?pid=practice-134537&utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://www.doctolib.fr/naturopathe/pontoise/mimoun-mouh?pid=practice-134537&utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'mimoun-mouh-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://mbourniche.wixsite.com/gestalt' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/110763-mireille-bourniche-psychotherapie-et-naturopathie-naturopathe-montigny-le-bretonneux?rwg_token=AFd1xnE-wGXi626MqOJugggylUcJNXuEuOvRnRsj17GF31vIFG1_En-AIfedjiuaXx3rYt_hcpaTTKiH2hI0buM5BKCfkIHIoQ%3D%3D' ELSE booking_url END
WHERE slug = 'mireille-bourniche-ei-montigny-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.miss-bio.fr/' ELSE website END
WHERE slug = 'miss-bio-melun'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/72858_mon-moment-bulle' ELSE website END
WHERE slug = 'mon-moment-bulle-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.monicavaz.fr/' ELSE website END
WHERE slug = 'monica-vaz-fontenay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.cabinetanahata.fr/' ELSE website END
WHERE slug = 'montigny-le-bretonneux-montigny-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/morane.blanchard?igsh=MXZoMGZ2eXFyZjZsYQ==' ELSE website END
WHERE slug = 'morane-blanchard-leuville-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ma-natur.fr/' ELSE website END
WHERE slug = 'muriel-anavoizat-nemours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://atmanconception.com/' ELSE website END
WHERE slug = 'muriel-chepy-avon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.theraneo.com/muriel-leroy' ELSE website END
WHERE slug = 'muriel-leroy-itteville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://myleneadico.fr/' ELSE website END
WHERE slug = 'mylene-adico-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.bloomnaturo.com/' ELSE website END
WHERE slug = 'myriam-chirzad-pecqueuse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://connectilib.fr/profil-professionnel/haute-couture-you' ELSE website END
WHERE slug = 'myriam-ortega-villebon-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://myriemonaturel.com/' ELSE website END
WHERE slug = 'myriem-o-naturel-cergy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://nacibanaturopathe.fr/' ELSE website END
WHERE slug = 'naciba-arrad-saint-denis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://nadine-naturopathe.fr/' ELSE website END
WHERE slug = 'nadine-remy-carrieres-sous-poissy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nahtural.com/' ELSE website END
WHERE slug = 'nahnaa-boutiche-ezanville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://psy-naturo.fr/' ELSE website END
WHERE slug = 'natacha-pociecka-tigery'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.oligovie.fr/' ELSE website END
WHERE slug = 'natalia-mrozec-deuil-la-barre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nathalie-alexandre-naturopathe.fr/' ELSE website END
WHERE slug = 'nathalie-alexandre-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.micronutrition-meudon.com/' ELSE website END
WHERE slug = 'nathalie-barbe-cayrel-meudon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://realisermavie.fr/' ELSE website END
WHERE slug = 'nathalie-bernard-kinesiologie-rambouillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nathaliebernhard-naturopathe.com/' ELSE website END
WHERE slug = 'nathalie-bernhard-le-chesnay-rocquencourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturospirit.fr/' ELSE website END
WHERE slug = 'nathalie-capblancq-laborde-le-tremblay-sur-mauldre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathesaintmaur.fr/' ELSE website END
WHERE slug = 'nathalie-fremont-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.elan-naturo.com/' ELSE website END
WHERE slug = 'nathalie-garrivet-elan-vaureal'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nathalieherpet.com/' ELSE website END
WHERE slug = 'nathalie-herpet-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.calmes-emois.com/' ELSE website END
WHERE slug = 'nathalie-lacroix-courbevoie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://nathalieoctobon.fr/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://nathalieoctobon.fr/prendre-rdv/' ELSE booking_url END
WHERE slug = 'nathalie-octobon-rubelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://nathaliereims.fr/parcours.php' ELSE website END
WHERE slug = 'nathalie-reims-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nathalierelier.com/' ELSE website END
WHERE slug = 'nathalie-relier-ei-rosny-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.santenaturelle-et-massage-fontainebleau.fr/' ELSE website END
WHERE slug = 'nathalie-rubio-ei-nemours'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nathalieschild.fr/' ELSE website END
WHERE slug = 'nathalie-schild-rambouillet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturodream.fr/' ELSE website END
WHERE slug = 'natur-o-dream-montevrain'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturoum-me.com/' ELSE website END
WHERE slug = 'natur-oum-me-malakoff'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturellementashle.wixsite.com/naturellement-ashley' ELSE website END
WHERE slug = 'naturellement-ashley-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturellementfahra.fr/' ELSE website END
WHERE slug = 'naturellement-fahra-livry-gargan'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://coachnutritioniste.com/' ELSE website END
WHERE slug = 'nazira-jasar-chelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nebebyalice.com/' ELSE website END
WHERE slug = 'nebe-by-alice-gomes-ormesson-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.nesterrapi.com/' ELSE website END
WHERE slug = 'nes-terra-pi-melun'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.nicolasturbin.fr/' ELSE website END
WHERE slug = 'nicolas-turbin-auvers-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.nicoleta-manolache.com/' ELSE website END
WHERE slug = 'nicoleta-manolache-brunoy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopatheherbaliste.fr/' ELSE website END
WHERE slug = 'nina-douhard-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.ninaconseil.com/' ELSE website END
WHERE slug = 'nina-ekabani-melun'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturalystherapy.squarespace.com/' ELSE website END
WHERE slug = 'noelie-pimba-thieux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopathe-pontoise.fr/' ELSE website END
WHERE slug = 'nouara-arezki-pontoise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.holitherapie.com/' ELSE website END
WHERE slug = 'nuance-de-detente-reflexologie-massage-therapeutique-antidouleur-palaiseau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://nyaraa.com/' ELSE website END
WHERE slug = 'nyara-village-sucy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.odelia-nature.fr/' ELSE website END
WHERE slug = 'odelia-nature-maisons-alfort'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://odiledavy-naturopathe.fr/' ELSE website END
WHERE slug = 'odile-davy-melun'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.entre-tes-mains.fr/' ELSE website END
WHERE slug = 'odile-soyez-martin-athis-mons'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturotherapie.paris/' ELSE website END
WHERE slug = 'olfa-barkaoui-villeneuve-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://olivia-charlet.fr/' ELSE website END
WHERE slug = 'olivia-charlet-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.osteo-oliviagrimaud.com/' ELSE website END
WHERE slug = 'olivia-grimaud-osteopathe-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.opheliesimian.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/opheliesimian-journeywithinyourself' ELSE booking_url END
WHERE slug = 'ophelie-simian-ermont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturoval.com/' ELSE website END
WHERE slug = 'oxana-valchuk-le-chesnay-rocquencourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.pascale-agazzi.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'pascale-agazzi-grasset-maisons-laffitte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.pascalegaston.fr/' ELSE website END
WHERE slug = 'pascale-gaston-vitry-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.patriciajoreau.com/contact' ELSE website END
WHERE slug = 'patricia-joreau-montreuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathelisleadam.fr/' ELSE website END
WHERE slug = 'patricia-montfort-l-isle-adam'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://gionessence.org/' ELSE website END
WHERE slug = 'patricia-nottebart-vanves'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://pharmacie-en-couleurs-eragny.com/' ELSE website END
WHERE slug = 'pharmacie-en-couleurs-eragny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.pharmaciepleinciel.fr/' ELSE website END
WHERE slug = 'pharmacie-plein-ciel-le-mee-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.philippemessager.fr/' ELSE website END
WHERE slug = 'philippe-messager-boulogne-billancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.philippinefrileux.com/' ELSE website END
WHERE slug = 'philippine-frileux-enghien-les-bains'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://pierredelune-sceaux.fr/' ELSE website END
WHERE slug = 'pierre-de-lune-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.natur-envol.fr/' ELSE website END
WHERE slug = 'pires-maria-goreti-acheres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://leolearning.fr/' ELSE website END
WHERE slug = 'pole-phoque-saint-germain-en-laye'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe92.fr/' ELSE website END
WHERE slug = 'ponsa-maria-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.prismavitalis.fr/' ELSE website END
WHERE slug = 'quentin-dauchet-montrouge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.ital-concept-institut.com/' ELSE website END
WHERE slug = 'radji-dalil-roissy-en-brie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolib.fr/prendre-rdv/20661_rania-layouni-naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.crenolib.fr/prendre-rdv/20661_rania-layouni-naturopathe' ELSE booking_url END
WHERE slug = 'rania-layouni-bourg-la-reine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.raphaellesandri.com/' ELSE website END
WHERE slug = 'raphaelle-sandri-trappes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://refletzen.com/' ELSE website END
WHERE slug = 'reflet-zen-cergy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sophronaturo78.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'regine-thomet-sartrouville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.rellas.fr/' ELSE website END
WHERE slug = 'rella-s-mantes-la-ville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.infonaturo.com/' ELSE website END
WHERE slug = 'remodeltoi-au-naturel-le-perreux-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.masanteonaturel.fr/' ELSE website END
WHERE slug = 'rousset-stephanie-ma-sante-o-naturel-franconville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.roxana-heidenreich.com/' ELSE website END
WHERE slug = 'roxana-heidenreich-pharmacien-saint-leu-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.zhangruimin.fr/' ELSE website END
WHERE slug = 'ruimin-zhang-sartrouville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturosabine.fr/' ELSE website END
WHERE slug = 'sabine-boulay-le-pecq'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://santeloumea.wixsite.com/cergy' ELSE website END
WHERE slug = 'sabine-petit-cergy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopraticien.com/' ELSE website END
WHERE slug = 'sabri-manoubi-argenteuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://le-corps-la-nature-et-soi.fr/' ELSE website END
WHERE slug = 'sabrina-benseghir-lagny-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopaatti.fr/' ELSE website END
WHERE slug = 'sabrina-cleferd-arpajon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://voyagenaturel.wixsite.com/monsite' ELSE website END
WHERE slug = 'sabrina-dussart-plaisir'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/ormesson-sur-marne/sabrina-leroyer/4295?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/ormesson-sur-marne/sabrina-leroyer/4295?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'sabrina-leroyer-ormesson-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/sabrina_meziani_naturopathe/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'sabrina-meziani-levallois-perret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.zenetnaturelle.fr/' ELSE website END
WHERE slug = 'sabrina-talot-sannois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturosab.fr/' ELSE website END
WHERE slug = 'sabrina-viard-les-essarts-le-roi'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/sabrine_naturopathe/' ELSE website END
WHERE slug = 'sabrine-mzoughi-le-chesnay-rocquencourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.safyaokba-naturopathe.fr/' ELSE website END
WHERE slug = 'safya-okba-cergy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturosam.fr/' ELSE website END
WHERE slug = 'samara-pires-arcueil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathe-guyancourt.fr/' ELSE website END
WHERE slug = 'samia-bouraoui-voisins-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sandra-allibert.com/' ELSE website END
WHERE slug = 'sandra-allibert-houilles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendar.app.google/xJ1Ua1X9N5yKtmHLA' ELSE website END
WHERE slug = 'sandra-barbereau-magny-le-hongre'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.gardelasante.fr/' ELSE website END
WHERE slug = 'sandra-godebin-lopes-coulommiers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.sandra-leal-naturopathe.fr/' ELSE website END
WHERE slug = 'sandra-leal-roussel-villemomble'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.snaturozen.fr/' ELSE website END
WHERE slug = 'sandra-marouze-mantes-la-jolie'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathecolombes.fr/' ELSE website END
WHERE slug = 'sandra-stuhlen-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturopathe-manteslajolie.fr/mlj' ELSE website END
WHERE slug = 'sandrine-borch-mantes-la-ville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sandrinebouquet-naturopathe.fr/' ELSE website END
WHERE slug = 'sandrine-bouquet-les-breviaires'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/louveciennes/sandrine-dessertenne/5988' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/louveciennes/sandrine-dessertenne/5988' ELSE booking_url END
WHERE slug = 'sandrine-dessertenne-louveciennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://surlechemindelasante.wixsite.com/sandrine-hidoux/copie-de-accueil' ELSE website END
WHERE slug = 'sandrine-hidoux-lardy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.hypnose-naturopathie-orsay.com/' ELSE website END
WHERE slug = 'sandrine-michaudel-hypnose-orsay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.sandrinenezan.com/' ELSE website END
WHERE slug = 'sandrine-nezan-malakoff'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://sandrineaunaturel77.wixsite.com/website' ELSE website END
WHERE slug = 'sandrine-prioul-coutencon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://lanaturopathiedesarah.com/' ELSE website END
WHERE slug = 'sarah-cabrol-moret-loing-et-orvanne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/aulnay-sous-bois/sarah-dehbi/3136?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/aulnay-sous-bois/sarah-dehbi/3136?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'sarah-dehbi-aulnay-sous-bois'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sarahdesvaux-naturo.fr/' ELSE website END
WHERE slug = 'sarah-desvaux-palaiseau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.helicovert.com/' ELSE website END
WHERE slug = 'sarah-nonnenmacher-montigny-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/issy-les-moulineaux/sarah-redaelli/5723' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/issy-les-moulineaux/sarah-redaelli/5723' ELSE booking_url END
WHERE slug = 'sarah-redaelli-issy-les-moulineaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://odealanaturo.wixsite.com/sbaghiestellenaturo' ELSE website END
WHERE slug = 'sbaghi-estelle-paray-vieille-poste'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.monprodubienetre.fr/professionnel/naturopathe-reflexologue/ile-de-france/argenteuil/1307-serena-favreau' ELSE website END
WHERE slug = 'serena-favreau-argenteuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://manaturobienetre.wixsite.com/manaturobienetre' ELSE website END
WHERE slug = 'severine-targowski-ozoir-la-ferriere'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/charenton-le-pont/shana-sarfati/4243?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/charenton-le-pont/shana-sarfati/4243?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'shana-sarfati-charenton-le-pont'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.shemsnaturo.com/' ELSE website END
WHERE slug = 'shems-jioua-brunoy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://shirley-naturopathe.com/?utm_source=gmb' ELSE website END
WHERE slug = 'shirley-schoelchery-ozoir-la-ferriere'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://equi-libre-sante.com/' ELSE website END
WHERE slug = 'silke-patel-conseillere-fleurs-de-bach-noisy-le-grand'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.fleurs-bach.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'silke-patel-villemareuil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://harmonie6.wix.com/harmonie' ELSE website END
WHERE slug = 'silvestre-emilia-saint-leu-la-foret'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://orientetmoi.com/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'solene-rigot-maisons-laffitte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.solennemaquerenaturopathe.fr/' ELSE website END
WHERE slug = 'solenne-maquere-clamart'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://soniajannot.fr/' ELSE website END
WHERE slug = 'sonia-jannot-bourg-la-reine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.espritsonaturo.fr/' ELSE website END
WHERE slug = 'sophie-cochet-nogent-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://sophienaturo.fr/' ELSE website END
WHERE slug = 'sophie-de-baglion-guyancourt'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sophienaturo.fr/' ELSE website END
WHERE slug = 'sophie-de-baglion-viroflay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturo92.fr/' ELSE website END
WHERE slug = 'sophie-delbos-la-garenne-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.maflorenaturo.fr/' ELSE website END
WHERE slug = 'sophie-dourado-palaiseau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://massages-naturopathie-maisons-laffitte.fr/' ELSE website END
WHERE slug = 'sophie-franciosi-maisons-laffitte'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.wellfuz.com/' ELSE website END
WHERE slug = 'sophie-laurent-croissy-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://sophielerouxnaturo.fr/' ELSE website END
WHERE slug = 'sophie-le-roux-chevreuse'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sophienaturellementnaturopathe.fr/' ELSE website END
WHERE slug = 'sophie-naturellement-morangis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://sophie-rousse.fr/' ELSE website END
WHERE slug = 'sophie-rousse-ivry-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://auroreroose.com/' ELSE website END
WHERE slug = 'sophrologue-asnieres-asnieres-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://cavalucci.setmore.com/cavalucci' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://cavalucci.setmore.com/cavalucci' ELSE booking_url END
WHERE slug = 'sophrologue-avon-carine-cavalucci-avon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.soraya-roha.fr/' ELSE website END
WHERE slug = 'soraya-roha-issy-les-moulineaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.doctolib.fr/naturopathe/ris-orangis/souad-zenaina?utm_campaign=google-maps&utm_content=ris-orangis&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://www.doctolib.fr/naturopathe/ris-orangis/souad-zenaina?utm_campaign=google-maps&utm_content=ris-orangis&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'souad-zenaina-ris-orangis'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturopathe-stephanebeauvais.fr/' ELSE website END
WHERE slug = 'stephane-beauvais-yerres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.facebook.com/share/1HghZPtXQN/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.facebook.com/share/1HghZPtXQN/' ELSE booking_url END
WHERE slug = 'stephane-clarivet-etampes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://naturoholistic.fr/' ELSE website END
WHERE slug = 'stephane-robin-saint-gratien'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopathestephanieatane.fr/' ELSE website END
WHERE slug = 'stephanie-atane-saint-fargeau-ponthierry'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://phanienaturo.fr/' ELSE website END
WHERE slug = 'stephanie-avedissian-rueil-malmaison'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.vitasantenaturelle.com/' ELSE website END
WHERE slug = 'stephanie-berruet-pontoise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://sbnaturopathe.fr/' ELSE website END
WHERE slug = 'stephanie-berthaud-saint-michel-sur-orge'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.stephanie-estrangin.fr/' ELSE website END
WHERE slug = 'stephanie-estrangin-velizy-villacoublay'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/68431-stephanie-giroux-naturopathe-chelles' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/68431-stephanie-giroux-naturopathe-chelles' ELSE booking_url END
WHERE slug = 'stephanie-giroux-chelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/108215-stephanie-giroux-renouv-elles-praticien-en-massage-bien-etre-nogent-sur-marne' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/108215-stephanie-giroux-renouv-elles-praticien-en-massage-bien-etre-nogent-sur-marne' ELSE booking_url END
WHERE slug = 'stephanie-giroux-nogent-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://xn--enbonnesantnaturellement-lfc.com/' ELSE website END
WHERE slug = 'stephanie-laniez-vincennes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.coachetsens.fr/' ELSE website END
WHERE slug = 'stephanie-laurence-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://stephanie-rolle.fr/' ELSE website END
WHERE slug = 'stephanie-rolle-saint-germain-les-arpajon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.stephanie-spira.fr/' ELSE website END
WHERE slug = 'stephanie-spira-la-garenne-colombes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/58599-svetlana-telitsine-naturopathe-saint-germain-en-laye' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/58599-svetlana-telitsine-naturopathe-saint-germain-en-laye' ELSE booking_url END
WHERE slug = 'svetlana-telitsine-les-mesnuls'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sylvie-naturo.com/' ELSE website END
WHERE slug = 'sylvie-bonhomme-beynes'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://sylvieclement-naturopathe.fr/' ELSE website END
WHERE slug = 'sylvie-clement-bruyeres-sur-oise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.sylvieguffon.com/' ELSE website END
WHERE slug = 'sylvie-guffon-noisy-le-grand'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.monterrainmasante.fr/' ELSE website END
WHERE slug = 'sylvie-guillemin-lanne-mareil-le-guyon'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.50nuancesdenaturo.com/' ELSE website END
WHERE slug = 'sylvie-mansart-vert-le-grand'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://montesino-naturopathe.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/20592_?rwg_token=AFd1xnGiSOLSirwoKiui-1mKMPOGJRIRELyl_ba9RwKsfipRGr81Ef8r7dAIT4K21-p_YCxFh-up5B-KIydozhp5iXRIBKgMAQ%3D%3D' ELSE booking_url END
WHERE slug = 'sylvie-montesino-lagny-sur-marne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://montesino-naturopathe.com/' ELSE website END
WHERE slug = 'sylvie-montesino-thiais'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/bussy-saint-georges/sylvie-popo/3890?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/bussy-saint-georges/sylvie-popo/3890?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'sylvie-popo-bailly-romainvilliers'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.medoucine.com/consultation/bussy-saint-georges/sylvie-popo/3890?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.medoucine.com/consultation/bussy-saint-georges/sylvie-popo/3890?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE booking_url END
WHERE slug = 'sylvie-popo-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/naturopathe/pontoise/sylvie-tomas?utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/naturopathe/pontoise/sylvie-tomas?utm_campaign=google-maps&utm_content=pontoise&utm_medium=organic&utm_source=google&utm_term=naturopathe' ELSE booking_url END
WHERE slug = 'sylvie-tomas-pontoise'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://tamarapissard.com/' ELSE website END
WHERE slug = 'tamara-pissard-taverny'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathesceaux.com/' ELSE website END
WHERE slug = 'tea-chanaud-de-lestang-sceaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://tennessee-pichonbraillon.fr/' ELSE website END
WHERE slug = 'tennessee-pichon-braillon-le-vesinet'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.facebook.com/profile.php?id=61583658339839' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.facebook.com/profile.php?id=61583658339839' ELSE booking_url END
WHERE slug = 'thera-nature-l-lieusaint'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/p/DV81f8DCG5J/' ELSE website END
WHERE slug = 'thera-nature-l-mennecy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://resalib.fr/p/78265' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'http://resalib.fr/p/78265' ELSE booking_url END
WHERE slug = 'tiphaine-turmeau-saraiva-saint-mande'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://naturopathe-sophrologue.com/' ELSE website END
WHERE slug = 'toinon-dehouck-puteaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://toutdoux-naturo.com/' ELSE website END
WHERE slug = 'tout-doux-alfortville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathe-chatou.fr/' ELSE website END
WHERE slug = 'tregoures-dominique-auriculotherapeute-chatou'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.instagram.com/typhaniesevrez_naturopathie/' ELSE website END
WHERE slug = 'typhanie-sevrez-pontault-combault'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.naturopathiesante.fr/' ELSE website END
WHERE slug = 'val-d-oise-l-isle-adam'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.valentine-naturopathe.com/' ELSE website END
WHERE slug = 'valentine-levi-moisson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.valerieboisrond-naturopathe.com/' ELSE website END
WHERE slug = 'valerie-boisrond-saulx-les-chartreux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.valerie-devin-cabinet-de-medecine-douce.com/?utm_source=gmb' ELSE website END
WHERE slug = 'valerie-devin-nanteuil-les-meaux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.naturoptima.fr/' ELSE website END
WHERE slug = 'valerie-gautier-ei-montigny-le-bretonneux'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.valerieleger.fr/' ELSE website END
WHERE slug = 'valerie-leger-gif-sur-yvette'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://valeriepapaud.fr/' ELSE website END
WHERE slug = 'valerie-papaud-saint-cloud'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.theraneo.com/thyrault' ELSE website END
WHERE slug = 'valerie-thyrault-conflans-sainte-honorine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/75036-vanessa-bommel-sophrologue-saint-maur-des-fosses' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/75036-vanessa-bommel-sophrologue-saint-maur-des-fosses' ELSE booking_url END
WHERE slug = 'vanessa-bommel-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://vanessanaturopathe.fr/' ELSE website END
WHERE slug = 'vanessa-schlemm-bode-bievres'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.neurofeedback-terrehappy.com/' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.neurofeedback-terrehappy.com/book-online?rwg_token=AFd1xnEBuymsZcU_zfmi6AVnIAh8kohutPedhkbUDmzsJbiFZzCxFBbwYEwh_NF3JlyNktzscBgaVNSbtVGaamLjG0mpCf8jyg%3D%3D' ELSE booking_url END
WHERE slug = 'vendramini-aurore-therapie-ollainville'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://calendly.com/veranaturopathe' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://calendly.com/veranaturopathe' ELSE booking_url END
WHERE slug = 'vera-menrath-saint-ouen-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://veroniquecappello.fr/' ELSE website END
WHERE slug = 'veronique-cappello-samoreau'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://energieetbienveillance.fr/' ELSE website END
WHERE slug = 'veronique-li-eaubonne'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.therapeutes.com/naturopathe/ville-d-avray/victoire-debay' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.therapeutes.com/naturopathe/ville-d-avray/victoire-debay' ELSE booking_url END
WHERE slug = 'victoire-debay-ville-d-avray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.doctolib.fr/osteopathe/chatou/violette-regnault' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.doctolib.fr/osteopathe/chatou/violette-regnault' ELSE booking_url END
WHERE slug = 'violette-regnault-montesson'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.resalib.fr/praticien/109065-virginie-de-forcade-naturopathe-vanves' ELSE website END,
    booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN 'https://www.resalib.fr/praticien/109065-virginie-de-forcade-naturopathe-vanves' ELSE booking_url END
WHERE slug = 'virginie-de-forcade-vanves'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.virginie-delvert.fr/?utm_campaign=gmb&utm_content=site-web&utm_medium=organic&utm_source=google' ELSE website END
WHERE slug = 'virginie-delvert-saint-ouen-sur-seine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.crenolibre.fr/prendre-rdv/20465_le-stanc-virginie-naturopathe-et-praticienne-en-massages-de-bien-etre' ELSE website END
WHERE slug = 'virginie-le-stanc-chelles'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.luangkhot-naturopathe.fr/' ELSE website END
WHERE slug = 'virginie-luangkhot-vaux-le-penil'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://virginiecourte.wixsite.com/monsite' ELSE website END
WHERE slug = 'virginie-sophrologue-andresy'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.virginiestanojkovic.fr/' ELSE website END
WHERE slug = 'virginie-stanojkovic-coupvray'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.virginiestanojkovic.fr/' ELSE website END
WHERE slug = 'virginie-stanojkovic-le-pin'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'http://www.ensoimaime.com/' ELSE website END
WHERE slug = 'virginie-trillot-bourg-la-reine'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://vitalys-paris.com/' ELSE website END
WHERE slug = 'vitalys-paris-saint-prix'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.bouge-ta-sante.com/' ELSE website END
WHERE slug = 'william-kadmiry-bussy-saint-georges'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://xanaturo.github.io/xa.naturopathe/' ELSE website END
WHERE slug = 'xavier-audebert-saint-maur-des-fosses'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://ycille-bien-etre-pour-tous.fr/' ELSE website END
WHERE slug = 'ycille-bien-etre-pour-tous-antony'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://www.yrsa-prietzel-naturopathe.com/' ELSE website END
WHERE slug = 'yrsa-prietzel-saint-germain-en-laye'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');

UPDATE practitioners
SET website = CASE WHEN COALESCE(website, '') = '' THEN 'https://hellosoins.com/pratiques/reflexologue/chevilly-larue-94550/zoulikha-guerrouj?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAQERKZleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAadC2wdgl9TVnuT6Tlplakm5MUhUP_RriP_svCwB_xLIjuz5KnG9K9FH_8VmbA_aem_PEBqlKzhttps://hellosoins.com/pratiques/reflexologie-plantaire/chevilly-larue-94550/zoulikha-guerrouj?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAQd_cBleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacnNkXe2DDllyOC8eMhMLp9-DogmitKqpg5JZYRU8hVH7zgi3jbDmCmUVdMBQ_aem_ZJHpYXeSRkKOmE80m9GWJA' ELSE website END
WHERE slug = 'zouzou-bien-etre-chevilly-larue'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');
