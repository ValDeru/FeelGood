/* FeelGood content: exercises, games, tips, UI strings (Italian + English). */
// Each exercise: [id, category, body part, flags, minutes, itName, itHow, itDose, enName, enHow, enDose]
// flags: s = can be done seated, c = needs a chair/counter/wall for support, f = on the floor (mat)
const EX_RAW = [
// Warm-up
["w1","warm","full","s",2,"Marcia sul posto","Seduto o in piedi vicino a una sedia, solleva le ginocchia alternandole a ritmo tranquillo. Muovi anche le braccia.","1–2 minuti","March on the spot","Seated, or standing next to a chair, lift your knees in turn at an easy pace. Swing your arms too.","1–2 minutes"],
["w2","warm","shoulders","s",1,"Rotazione delle spalle","Porta le spalle verso le orecchie, poi indietro e giù, in un cerchio lento. Respira con calma.","10 indietro, 5 in avanti","Shoulder rolls","Lift your shoulders towards your ears, then back and down in a slow circle. Breathe calmly.","10 back, 5 forward"],
["w3","warm","ankles","s",1,"Cerchi con le caviglie","Seduto, solleva un piede da terra e disegna cerchi lenti con la punta. Cambia direzione e poi piede.","10 cerchi per lato","Ankle circles","Seated, lift one foot slightly and draw slow circles with your toes. Change direction, then foot.","10 circles each way"],
["w4","warm","arms","s",1,"Polsi e dita","Apri e chiudi le mani a pugno, poi ruota i polsi. Tocca la punta di ogni dito con il pollice.","10 volte ciascuno","Wrists and fingers","Open and close your hands into fists, then circle your wrists. Touch each fingertip with your thumb.","10 times each"],
["w5","warm","back","s",1,"Allungamento verso l'alto","Seduto, intreccia le dita e porta le braccia verso il soffitto. Allunga la schiena e respira.","5 volte, tieni 5 secondi","Reach up","Seated, link your fingers and reach towards the ceiling. Lengthen your back and breathe.","5 times, hold 5 seconds"],
// Posture
["p1","posture","neck","s",2,"Retrazione del mento","Seduto dritto, guarda avanti e porta il mento indietro come per fare un doppio mento, senza abbassare la testa. Tieni e rilassa.","8–10 volte, tieni 3 secondi","Chin tucks","Sit tall, look ahead and glide your chin straight back, making a double chin, without tipping your head. Hold, then relax.","8–10 times, hold 3 seconds"],
["p2","posture","back","s",2,"Avvicinare le scapole","Seduto con la schiena staccata dallo schienale, porta le scapole indietro e verso il basso, come per stringere una matita tra di esse.","10 volte, tieni 5 secondi","Shoulder blade squeeze","Sit away from the backrest. Draw your shoulder blades back and down as if holding a pencil between them.","10 times, hold 5 seconds"],
["p3","posture","shoulders","c",2,"Angeli al muro","In piedi con schiena e testa al muro, braccia a forma di W. Fai scivolare lentamente le braccia verso l'alto e poi giù.","8 volte","Wall angels","Stand with your back and head against a wall, arms in a W shape. Slowly slide your arms up and back down.","8 times"],
["p4","posture","back","s",1,"Schiena lunga da seduti","Siedi sul bordo della sedia, piedi ben appoggiati. Immagina un filo che tira la testa verso l'alto. Respira lentamente.","1 minuto","Tall sitting","Sit near the front of the chair, feet flat. Imagine a string lifting the top of your head. Breathe slowly.","1 minute"],
["p5","posture","back","c",1,"In piedi contro il muro","Talloni a pochi centimetri dal muro; glutei, scapole e nuca appoggiati. Rilassa le spalle e respira.","30–60 secondi","Wall stand","Heels a few centimetres from the wall, with your bottom, shoulder blades and back of the head touching it. Relax your shoulders and breathe.","30–60 seconds"],
["p6","posture","back","s",2,"Gatto-mucca da seduti","Mani sulle ginocchia. Inspirando apri il petto e guarda leggermente in alto; espirando arrotonda la schiena e guarda in basso.","8 volte","Seated cat-cow","Hands on your knees. Breathing in, open your chest and look slightly up; breathing out, round your back and look down.","8 times"],
["p7","posture","neck","s",1,"Inclinazione del collo","Porta lentamente l'orecchio verso la spalla, senza alzare la spalla. Tieni, torna al centro e cambia lato.","3 per lato, tieni 10 secondi","Neck side tilt","Slowly bring your ear towards your shoulder without lifting the shoulder. Hold, come back to centre and switch sides.","3 each side, hold 10 seconds"],
["p8","posture","neck","s",1,"Rotazione del collo","Gira lentamente la testa a destra come per guardare dietro la spalla, torna al centro e gira a sinistra. Movimento piccolo e senza dolore.","5 per lato","Neck turns","Slowly turn your head to the right as if looking over your shoulder, back to centre, then left. Keep it small and pain-free.","5 each side"],
["p9","posture","shoulders","s",1,"Apertura del petto","Seduto, intreccia le mani dietro la schiena (o afferra lo schienale) e apri il petto tenendo le spalle basse.","3 volte, tieni 15 secondi","Chest opener","Seated, link your hands behind you (or hold the chair back) and open your chest, shoulders down.","3 times, hold 15 seconds"],
// Balance (fall prevention, Otago-style)
["b1","balance","ankles","c",2,"Sulle punte","In piedi dietro una sedia stabile, tenendoti con due mani. Sali lentamente sulle punte e scendi con controllo.","10 volte","Heel raises","Stand behind a sturdy chair holding it with both hands. Slowly rise onto your toes and lower with control.","10 times"],
["b2","balance","ankles","c",2,"Sui talloni","Tenendoti alla sedia, solleva le punte dei piedi restando sui talloni. Scendi lentamente.","10 volte","Toe raises","Holding the chair, lift your toes and rock back onto your heels. Lower slowly.","10 times"],
["b3","balance","hips","c",2,"Su una gamba","Tenendoti alla sedia, solleva un piede di pochi centimetri. Resta in equilibrio, poi cambia. Riduci l'appoggio solo se ti senti sicuro.","3 per lato, fino a 10 secondi","One-leg stand","Holding the chair, lift one foot a few centimetres. Balance, then switch. Lighten your grip only if you feel safe.","3 each side, up to 10 seconds"],
["b4","balance","full","c",2,"Piedi in linea","Tenendoti al piano della cucina, metti un piede davanti all'altro, tallone contro punta. Guarda avanti.","3 volte, fino a 10 secondi","Heel-to-toe stand","Holding a kitchen counter, place one foot directly in front of the other, heel to toe. Look ahead.","3 times, up to 10 seconds"],
["b5","balance","full","c",2,"Camminata tacco-punta","Lungo il piano della cucina, con una mano appoggiata, cammina mettendo il tallone subito davanti alla punta dell'altro piede.","10 passi, girati e ripeti","Heel-to-toe walk","Along a kitchen counter with one hand on it, walk placing each heel just in front of the other foot's toes.","10 steps, turn and repeat"],
["b6","balance","hips","c",2,"Gamba di lato","Tenendoti alla sedia, porta una gamba di lato con il busto dritto e la punta in avanti. Torna lentamente.","8 per lato","Side leg raise","Holding the chair, lift one leg out to the side, keeping your body upright and toes forward. Lower slowly.","8 each side"],
["b7","balance","hips","c",2,"Passi laterali","Lungo il piano della cucina, fai passi di lato lenti con i piedi rivolti in avanti. Poi torna indietro.","10 passi per lato","Sideways walking","Along the counter, take slow side steps with your feet pointing forward. Then come back.","10 steps each way"],
["b8","balance","full","c",1,"Spostare il peso","In piedi con i piedi alla larghezza dei fianchi, tenendoti alla sedia. Sposta lentamente il peso su un piede, poi sull'altro.","10 volte","Weight shifts","Stand with feet hip-width apart, holding the chair. Slowly shift your weight onto one foot, then the other.","10 times"],
// Strength
["s1","strength","knees","c",2,"Alzarsi dalla sedia","Siediti su una sedia stabile, piedi un po' indietro. Sporgiti in avanti e alzati, usando le mani se serve. Risiediti lentamente.","5–10 volte","Sit to stand","Sit on a sturdy chair, feet slightly back. Lean forward and stand up, using your hands if needed. Sit down slowly.","5–10 times"],
["s2","strength","knees","s",2,"Estensione del ginocchio","Seduto, distendi lentamente una gamba fino a raddrizzarla, punta del piede verso di te. Tieni e abbassa.","10 per gamba","Knee extension","Seated, slowly straighten one leg with your toes pointing up. Hold, then lower.","10 each leg"],
["s3","strength","arms","c",2,"Piegamenti al muro","Mani sul muro all'altezza delle spalle, a un braccio di distanza. Piega i gomiti e avvicina il petto al muro, poi spingi.","10 volte","Wall push-ups","Hands on the wall at shoulder height, an arm's length away. Bend your elbows to bring your chest towards the wall, then push back.","10 times"],
["s4","strength","hips","c",2,"Gamba indietro","Tenendoti alla sedia, porta una gamba tesa indietro senza inclinarti in avanti. Torna lentamente.","8 per lato","Back leg raise","Holding the chair, take one straight leg backwards without leaning forward. Return slowly.","8 each side"],
["s5","strength","hips","s",2,"Ginocchio in alto da seduti","Seduto dritto, solleva un ginocchio di qualche centimetro, tieni 3 secondi e abbassa. Alterna.","8 per lato","Seated knee lift","Sitting tall, lift one knee a few centimetres, hold 3 seconds, lower. Alternate.","8 each side"],
["s6","strength","arms","s",2,"Flessioni con bottiglie","Seduto, una bottiglietta d'acqua in ogni mano, gomiti vicino al corpo. Piega i gomiti portando le bottiglie alle spalle.","10 volte","Bottle curls","Seated, a small water bottle in each hand, elbows by your sides. Bend your elbows to bring the bottles to your shoulders.","10 times"],
["s7","strength","shoulders","s",2,"Spinta in alto","Seduto, bottiglie all'altezza delle spalle. Spingi verso il soffitto senza bloccare i gomiti, poi riporta giù.","8 volte","Overhead press","Seated, bottles at shoulder height. Push up towards the ceiling without locking your elbows, then lower.","8 times"],
["s8","strength","knees","c",2,"Mezzo piegamento","Dietro la sedia, tenendoti. Piega leggermente le ginocchia come per sederti, schiena dritta, poi torna su.","8 volte","Mini squat","Behind the chair, holding on. Bend your knees a little as if to sit, back straight, then rise.","8 times"],
["s9","strength","hips","s",1,"Cuscino tra le ginocchia","Seduto, stringi un cuscino tra le ginocchia per 5 secondi, poi rilassa.","10 volte","Cushion squeeze","Seated, squeeze a cushion between your knees for 5 seconds, then relax.","10 times"],
["s10","strength","arms","s",1,"Stringere la pallina","Stringi una pallina morbida o un asciugamano arrotolato con tutta la mano. Tieni 3 secondi e rilassa.","10 per mano","Grip squeeze","Squeeze a soft ball or rolled towel with your whole hand. Hold 3 seconds, relax.","10 each hand"],
["s11","strength","core","s",1,"Addominali da seduti","Seduto dritto, porta l'ombelico verso la colonna mentre espiri, senza trattenere il respiro. Rilassa.","10 volte, tieni 5 secondi","Seated tummy brace","Sitting tall, draw your belly button towards your spine as you breathe out, without holding your breath. Relax.","10 times, hold 5 seconds"],
["s12","strength","core","s",2,"Inclinarsi indietro da seduti","Seduto sul bordo, braccia incrociate sul petto. Inclinati appena indietro con la schiena dritta, tieni e torna.","8 volte, tieni 3 secondi","Seated lean back","Sit near the edge, arms crossed on your chest. Lean back slightly with a straight back, hold, return.","8 times, hold 3 seconds"],
// Stretch & mobility
["m1","stretch","back","s",1,"Torsione da seduti","Seduto dritto, ruota il busto verso destra appoggiando la mano allo schienale. Torna al centro e cambia lato.","3 per lato, tieni 10 secondi","Seated twist","Sitting tall, turn your upper body to the right with your hand on the chair back. Return and switch.","3 each side, hold 10 seconds"],
["m2","stretch","knees","s",1,"Allungamento della coscia","Seduto sul bordo, distendi una gamba con il tallone a terra. Inclinati appena in avanti con la schiena dritta.","2 per gamba, 20 secondi","Hamstring stretch","Sit near the edge, one leg straight with the heel on the floor. Lean forward slightly with a straight back.","2 each leg, 20 seconds"],
["m3","stretch","ankles","c",1,"Allungamento del polpaccio","Mani al muro, una gamba indietro con il tallone a terra, piega il ginocchio davanti.","2 per gamba, 20 secondi","Calf stretch","Hands on the wall, one leg back with the heel down, bend the front knee.","2 each leg, 20 seconds"],
["m4","stretch","back","s",1,"Flessione laterale","Seduto, alza un braccio e inclinati dolcemente dal lato opposto. Torna e cambia.","3 per lato","Side bend","Seated, raise one arm and gently lean to the opposite side. Return and switch.","3 each side"],
["m5","stretch","neck","s",1,"Allungamento collo e spalle","Seduto, tieni il bordo della sedia con la mano destra e inclina la testa a sinistra. Cambia lato.","2 per lato, 20 secondi","Neck and shoulder stretch","Seated, hold the chair edge with your right hand and tilt your head to the left. Switch sides.","2 each side, 20 seconds"],
["m6","stretch","hips","s",1,"Allungamento dell'anca","Seduto, appoggia la caviglia sul ginocchio opposto (o fin dove è comodo) e inclinati appena in avanti.","2 per lato, 20 secondi","Seated hip stretch","Seated, rest one ankle on the opposite knee (or as far as is comfortable) and lean forward a little.","2 each side, 20 seconds"],
["m7","stretch","core","s",2,"Respirazione con la pancia","Una mano sulla pancia. Inspira dal naso per 4 secondi sentendo la pancia che si gonfia, espira dalla bocca per 6 secondi.","2 minuti","Belly breathing","One hand on your belly. Breathe in through your nose for 4 seconds, feeling it rise, and out through your mouth for 6.","2 minutes"],
["m8","stretch","shoulders","s",1,"Abbraccio","Incrocia le braccia e abbraccia le spalle, allargando le scapole. Respira nella parte alta della schiena.","3 volte, 15 secondi","Self hug","Cross your arms and hug your shoulders, spreading your shoulder blades. Breathe into your upper back.","3 times, 15 seconds"],
// Pilates (beginner)
["pl1","pilates","back","f",2,"Basculamento del bacino","Supino, ginocchia piegate. Espirando appoggia la zona lombare al tappetino, inspirando torna in posizione neutra.","10 volte","Pelvic tilts","Lying on your back, knees bent. Breathing out, flatten your lower back to the mat; breathing in, return to neutral.","10 times"],
["pl2","pilates","hips","f",2,"Ponte","Supino, ginocchia piegate. Solleva il bacino una vertebra alla volta, poi scendi lentamente.","8 volte","Bridge","Lying on your back, knees bent. Peel your hips up one vertebra at a time, then roll down slowly.","8 times"],
["pl3","pilates","core","f",2,"Dead bug facile","Supino, ginocchia a 90 gradi, braccia verso il soffitto. Abbassa un piede verso terra tenendo la schiena ferma. Alterna.","6 per lato","Beginner dead bug","On your back, knees at 90 degrees, arms to the ceiling. Lower one foot towards the floor keeping your back still. Alternate.","6 each side"],
["pl4","pilates","hips","f",2,"Conchiglia","Su un fianco, ginocchia piegate, talloni uniti. Apri il ginocchio superiore senza ruotare il bacino.","10 per lato","Clam","On your side, knees bent, heels together. Open the top knee without rolling your hips back.","10 each side"],
["pl5","pilates","core","f",2,"Tocchi di punta","Supino, ginocchia a 90 gradi. Abbassa una punta a toccare il tappetino e torna su. Alterna con l'addome attivo.","8 per lato","Toe taps","On your back, knees at 90 degrees. Lower one toe to tap the mat, return. Alternate with your tummy engaged.","8 each side"],
["pl6","pilates","back","f",2,"Nuoto a terra","Prono, braccia avanti. Solleva braccio destro e gamba sinistra di pochi centimetri, poi alterna. Collo lungo.","6 per lato","Swimming prep","Face down, arms forward. Lift your right arm and left leg a few centimetres, then alternate. Keep your neck long.","6 each side"],
["pl7","pilates","back","s",2,"Spine stretch","Seduto con le gambe divaricate (o su una sedia), arrotola la colonna in avanti espirando e risali vertebra per vertebra.","5 volte","Spine stretch forward","Sit with legs apart (or on a chair), roll your spine forward as you breathe out and stack back up.","5 times"],
["pl8","pilates","shoulders","f",2,"Apertura a libro","Su un fianco, braccia distese davanti. Apri il braccio superiore verso l'altro lato seguendolo con lo sguardo.","6 per lato","Book opening","On your side, arms out in front. Open your top arm across to the other side, following it with your eyes.","6 each side"],
["pl9","pilates","core","f",2,"Chest lift","Supino, mani dietro la testa. Espirando solleva testa e spalle guardando le ginocchia, inspirando scendi.","8 volte","Chest lift","On your back, hands behind your head. Breathing out, lift head and shoulders looking at your knees; breathing in, lower.","8 times"],
["pl10","pilates","hips","f",2,"Gamba laterale a terra","Su un fianco, gambe distese. Solleva la gamba superiore di circa 20 cm e abbassa con controllo.","10 per lato","Side-lying leg lift","On your side, legs straight. Lift your top leg about 20 cm and lower it with control.","10 each side"],
// Yoga (beginner)
["y1","yoga","full","",1,"Montagna (Tadasana)","In piedi, piedi alla larghezza dei fianchi, peso distribuito. Allunga la colonna, spalle rilassate, respiro lento.","5 respiri","Mountain pose (Tadasana)","Stand with feet hip-width apart, weight even. Lengthen your spine, relax your shoulders, breathe slowly.","5 breaths"],
["y2","yoga","back","f",2,"Gatto-mucca","A quattro zampe. Inspira inarcando e guardando avanti, espira arrotondando la schiena.","8 respiri","Cat-cow","On hands and knees. Breathe in as you arch and look ahead, breathe out as you round your back.","8 breaths"],
["y3","yoga","back","f",1,"Posizione del bambino (Balasana)","In ginocchio, siediti sui talloni e porta la fronte a terra o su un cuscino, braccia avanti o lungo il corpo.","1 minuto","Child's pose (Balasana)","Kneeling, sit back on your heels and rest your forehead on the floor or a cushion, arms forward or by your sides.","1 minute"],
["y4","yoga","shoulders","c",1,"Mezzo cane al muro","Mani al muro o allo schienale di una sedia, fai qualche passo indietro e allunga la schiena parallela al pavimento.","5 respiri","Half dog at the wall","Hands on a wall or chair back, step back and lengthen your back parallel to the floor.","5 breaths"],
["y5","yoga","hips","",2,"Guerriero II (Virabhadrasana II)","Gambe larghe, piede destro ruotato in fuori, piega il ginocchio destro sopra la caviglia. Braccia aperte, sguardo oltre la mano.","5 respiri per lato","Warrior II (Virabhadrasana II)","Wide legs, right foot turned out, bend your right knee over the ankle. Arms wide, gaze past your hand.","5 breaths each side"],
["y6","yoga","ankles","c",1,"Albero al muro (Vrksasana)","Una mano al muro, appoggia la pianta del piede sulla caviglia o sul polpaccio, mai sul ginocchio.","5 respiri per lato","Tree pose at the wall (Vrksasana)","One hand on the wall, rest the sole of your foot on your ankle or calf, never on the knee.","5 breaths each side"],
["y7","yoga","back","f",1,"Cobra dolce (Bhujangasana)","Prono, mani sotto le spalle. Solleva appena il petto usando la schiena, gomiti vicini, bacino a terra.","3 volte, 3 respiri","Baby cobra (Bhujangasana)","Face down, hands under your shoulders. Lift your chest a little using your back, elbows in, hips down.","3 times, 3 breaths"],
["y8","yoga","knees","f",2,"Pinza seduta con cintura","Seduto, gambe distese, una cintura intorno ai piedi. Allunga la colonna e piegati dalle anche senza forzare.","5 respiri","Seated forward fold with strap","Seated, legs straight, a strap around your feet. Lengthen your spine and fold from the hips without forcing.","5 breaths"],
["y9","yoga","back","f",1,"Torsione da sdraiati","Supino, porta le ginocchia piegate da un lato e lo sguardo dall'altro. Spalle a terra.","5 respiri per lato","Supine twist","On your back, drop your bent knees to one side and look the other way. Shoulders down.","5 breaths each side"],
// Jivamukti-style practice (chant, breath, flow, meditation)
["j1","jivamukti","full","s",2,"Canto di apertura e intenzione","Siedi comodo. Chiudi gli occhi, canta Om tre volte e scegli un'intenzione per la pratica, per esempio la gentilezza.","2 minuti","Opening chant and intention","Sit comfortably. Close your eyes, chant Om three times and set an intention for practice, such as kindness.","2 minutes"],
["j2","jivamukti","full","",4,"Saluto al sole per principianti","Montagna, braccia in alto, piegamento in avanti con ginocchia morbide, affondo, cane a testa in giù (anche con ginocchia a terra), ritorno. Un movimento per ogni respiro.","3–5 giri","Beginner sun salutation","Mountain, arms up, fold forward with soft knees, lunge, downward dog (knees down is fine), and back. One movement per breath.","3–5 rounds"],
["j3","jivamukti","core","s",2,"Respiro Ujjayi","Respira dal naso restringendo leggermente la gola, con un suono morbido come le onde del mare. Inspira ed espira con la stessa durata.","2 minuti","Ujjayi breath","Breathe through your nose with a slight narrowing of the throat, a soft sound like ocean waves. Make the in-breath and out-breath the same length.","2 minutes"],
["j4","jivamukti","full","s",2,"Respiro a narici alterne (Nadi Shodhana)","Chiudi la narice destra con il pollice e inspira dalla sinistra; chiudi la sinistra ed espira dalla destra. Inspira dalla destra e ripeti.","5 giri","Alternate nostril breathing (Nadi Shodhana)","Close the right nostril with your thumb and breathe in through the left; close the left and breathe out through the right. Breathe in on the right and repeat.","5 rounds"],
["j5","jivamukti","hips","f",1,"Ghirlanda con supporto (Malasana)","Piedi larghi, scendi in accosciata con un blocco o un cuscino sotto il bacino, mani unite davanti al petto.","5 respiri","Supported garland (Malasana)","Feet wide, squat down with a block or cushion under your hips, palms together at your chest.","5 breaths"],
["j6","jivamukti","full","s",5,"Meditazione in silenzio","Siedi con la schiena dritta. Osserva il respiro; quando la mente si distrae, torna con gentilezza al respiro.","5 minuti","Silent meditation","Sit with a straight back. Watch your breath; when your mind wanders, gently come back to it.","5 minutes"],
["j7","jivamukti","full","f",3,"Rilassamento finale (Savasana)","Sdraiati sulla schiena, braccia lungo il corpo, occhi chiusi. Lascia andare ogni sforzo.","3–5 minuti","Final relaxation (Savasana)","Lie on your back, arms by your sides, eyes closed. Let go of all effort.","3–5 minutes"]
];

const EXERCISES = EX_RAW.map(r => ({
  id: r[0], cat: r[1], part: r[2], s: r[3].includes("s"), c: r[3].includes("c"), f: r[3].includes("f"), min: r[4],
  it: { n: r[5], d: r[6], r: r[7] }, en: { n: r[8], d: r[9], r: r[10] }
}));

const PARTS = ["back", "hips", "shoulders", "knees", "neck", "core", "ankles", "arms"];
const FLOOR_CATS = ["pilates", "yoga", "jivamukti"];

const GAMES = [
  { id: "memory", it: ["Memory", "Trova le coppie di carte uguali.", "Memoria visiva"], en: ["Memory", "Find the matching pairs of cards.", "Visual memory"] },
  { id: "anagram", it: ["Anagrammi", "Riordina le lettere per formare una parola.", "Linguaggio"], en: ["Anagrams", "Put the letters in order to make a word.", "Language"] },
  { id: "math", it: ["Calcolo rapido", "Semplici calcoli per una mente agile.", "Ragionamento"], en: ["Quick maths", "Simple sums to keep your mind nimble.", "Reasoning"] },
  { id: "colors", it: ["Colori", "Tocca il colore dell'inchiostro, non la parola.", "Attenzione"], en: ["Colours", "Tap the colour of the ink, not the word.", "Attention"] },
  { id: "sequence", it: ["Sequenza", "Ricorda i numeri nell'ordine giusto.", "Memoria di lavoro"], en: ["Sequence", "Remember the numbers in the right order.", "Working memory"] },
  { id: "words", it: ["Parole in un minuto", "Di' ad alta voce più parole possibili di una categoria.", "Fluidità verbale"], en: ["One-minute words", "Say out loud as many words as you can from a category.", "Verbal fluency"] }
];

const WORDS = {
  it: ["CASA","MARE","SOLE","PANE","LUNA","MELA","PERA","ROSA","NAVE","VINO","FIORE","GATTO","CANE","LIBRO","TRENO","LATTE","PORTA","SEDIA","NONNO","PIZZA","BARCA","TAVOLO","CUCINA","ESTATE","LIMONE","PATATA","CHIESA","PIAZZA","ARANCIA","INVERNO","CAVALLO","MERCATO","FINESTRA","GIARDINO","FARFALLA","CASTELLO","MONTAGNA","OMBRELLO","TELEFONO","CAMPAGNA","FORMAGGIO","BICICLETTA"],
  en: ["SUN","SEA","CAT","DOG","MOON","BOOK","MILK","DOOR","ROSE","SHIP","WINE","PEAR","HOUSE","BREAD","APPLE","TRAIN","CHAIR","TABLE","HORSE","LEMON","FLOWER","GARDEN","WINDOW","SUMMER","WINTER","CASTLE","CHEESE","ORANGE","POTATO","CHURCH","MARKET","KITCHEN","BICYCLE","MOUNTAIN","UMBRELLA","TELEPHONE","BUTTERFLY"]
};

const CATEGORIES = {
  it: ["animali","frutta e verdura","città italiane","nomi di persona","cose che si trovano in cucina","mestieri","cose che si trovano al mare","paesi del mondo","fiori e piante","cibi italiani","strumenti musicali","parti del corpo"],
  en: ["animals","fruit and vegetables","cities","first names","things in a kitchen","jobs","things at the seaside","countries","flowers and plants","foods","musical instruments","parts of the body"]
};
const LETTERS = { it: "ABCDFGLMNPRST", en: "ABCDFGHLMPRST" };

const TIPS = {
  it: [
    ["Udito", "Se fai fatica a sentire, fai un controllo dell'udito. Usare l'apparecchio acustico è uno dei modi più efficaci per proteggere la memoria."],
    ["Amici e famiglia", "Telefona oggi a un amico o a un parente. Parlare con gli altri tiene il cervello attivo."],
    ["Cammina dopo pranzo", "Dieci minuti di camminata dopo i pasti aiutano cuore, glicemia e digestione."],
    ["Dieta mediterranea", "Verdura, legumi, pesce, frutta secca e olio d'oliva: è l'alimentazione più studiata per il cervello."],
    ["Bevi acqua", "Con l'età si sente meno la sete. Tieni un bicchiere d'acqua sempre a portata di mano."],
    ["Pressione", "Misura la pressione regolarmente. Tenerla sotto controllo protegge cuore e cervello."],
    ["Sonno", "Cerca di andare a letto e alzarti sempre alla stessa ora. Un buon sonno aiuta la memoria."],
    ["Impara qualcosa di nuovo", "Una ricetta, una canzone, qualche parola in un'altra lingua: le cose nuove allenano il cervello più di quelle che sappiamo già."],
    ["Alzati spesso", "Ogni 30–60 minuti alzati dalla sedia e fai qualche passo. Stare seduti a lungo fa male anche se poi si fa ginnastica."],
    ["Casa sicura", "Una luce notturna, niente tappeti scivolosi e un maniglione in bagno riducono molto il rischio di cadute."],
    ["Vista", "Controlla la vista ogni anno. Vedere bene aiuta l'equilibrio e la mente."],
    ["Racconta un ricordo", "Racconta a qualcuno una storia della tua giovinezza. Ricordare e raccontare è un ottimo esercizio."],
    ["Musica", "Canta o ascolta la musica che ami. La musica mette di buon umore e stimola la memoria."],
    ["Fumo e alcol", "Non fumare e limita l'alcol: sono due dei fattori di rischio per la demenza che si possono cambiare."]
  ],
  en: [
    ["Hearing", "If you struggle to hear, get your hearing checked. Using a hearing aid is one of the most effective ways to protect your memory."],
    ["Friends and family", "Call a friend or relative today. Talking with others keeps the brain active."],
    ["Walk after lunch", "Ten minutes of walking after meals helps your heart, blood sugar and digestion."],
    ["Mediterranean diet", "Vegetables, beans, fish, nuts and olive oil: the most studied way of eating for brain health."],
    ["Drink water", "We feel less thirsty as we age. Keep a glass of water within reach."],
    ["Blood pressure", "Check your blood pressure regularly. Keeping it in range protects your heart and brain."],
    ["Sleep", "Try to go to bed and get up at the same time every day. Good sleep helps memory."],
    ["Learn something new", "A recipe, a song, a few words of another language: new things train the brain more than familiar ones."],
    ["Get up often", "Every 30–60 minutes, get up and take a few steps. Long sitting is harmful even if you exercise later."],
    ["Safe home", "A night light, no slippery rugs and a grab bar in the bathroom greatly reduce the risk of falls."],
    ["Eyesight", "Have your eyes checked every year. Seeing well helps balance and the mind."],
    ["Tell a memory", "Tell someone a story from when you were young. Remembering and telling is great exercise."],
    ["Music", "Sing or listen to music you love. It lifts your mood and stirs memory."],
    ["Smoking and alcohol", "Don't smoke and keep alcohol low: both are dementia risk factors you can change."]
  ]
};

const T = {
  it: {
    today: "Oggi", exercises: "Esercizi", brain: "Mente", progress: "Progressi", family: "Famiglia",
    hello: ["Buongiorno", "Buon pomeriggio", "Buonasera"], whoUses: "Scegli il tuo gruppo", whoSub: "Gli esercizi cambiano in base all'età. Puoi cambiare gruppo quando vuoi.", grp50: "Esercizi completi: postura, forza, pilates, yoga e Jivamukti.", grp70: "Esercizi dolci e sicuri, da seduti o con appoggio, con equilibrio ogni giorno.",
    focus: "Oggi ci concentriamo su", done: "Fatto", markDone: "Segna come fatto", swap: "Cambia", open: "Come si fa",
    ofDone: "di {n} fatti", planTitle: "Il tuo programma di oggi", walk: "Camminata", walkGoal: "Obiettivo di oggi: {n} minuti all'aperto o in casa, a passo svelto ma comodo.",
    walked: "Hai camminato {n} minuti", gameOfDay: "Gioco della mente di oggi", play: "Gioca", tip: "Consiglio del giorno",
    safetyTitle: "Prima di iniziare", safetyBody: "Questa app non sostituisce il medico o il fisioterapista. Se hai problemi di cuore o di pressione, osteoporosi, dolori, un intervento o una caduta recente, chiedi al medico quali esercizi fanno per te.",
    safetyStop: "Fermati subito se senti dolore al petto, forte mancanza di fiato, capogiri, nausea o un dolore acuto. In emergenza chiama il 112.",
    safetyHow: "Per gli esercizi in piedi tieniti sempre a una sedia stabile o al piano della cucina, con scarpe chiuse e senza tappeti scivolosi.",
    understood: "Ho capito, iniziamo", holdOn: "Tieniti a una sedia stabile o al piano della cucina.", floorNote: "Si fa su un tappetino a terra.", seatedOk: "Si può fare da seduti",
    readAloud: "Leggi ad alta voce", timer: "Timer 1 minuto", stopTimer: "Ferma", back: "Indietro", dose: "Quanto",
    allParts: "Tutto", allCats: "Tutti i tipi", hiddenFloor: "Yoga, pilates ed esercizi a terra sono nascosti per questo profilo. Si possono attivare in Famiglia.",
    level: "Livello", bestToday: "Fatto oggi", again: "Gioca ancora", backToGames: "Tutti i giochi", score: "Punteggio",
    great: "Bravissimo! Il prossimo livello sarà un po' più difficile.", good: "Bene! Continua così.", easier: "Ottimo allenamento. La prossima volta sarà un po' più facile.",
    moves: "Mosse", correct: "Giuste", clear: "Cancella", hint: "Aiuto", skip: "Salta", tryAgain: "Non è giusto, riprova",
    whichInk: "Di che colore è scritta la parola?", watch: "Guarda i numeri...", typeSeq: "Ora tocca i numeri nello stesso ordine", length: "Numeri ricordati",
    sayWords: "Di' ad alta voce", startingWith: "che iniziano con la lettera", start: "Inizia", words: "Parole", tapEach: "Tocca +1 per ogni parola che dici.",
    weekTitle: "Questa settimana", minutesActive: "Minuti di attività", strengthDays: "Giorni con esercizi di forza", balanceDays: "Giorni con esercizi di equilibrio", brainSessions: "Giochi della mente",
    streak: "Giorni di fila", target: "obiettivo", guideTitle: "Cosa dicono le linee guida",
    guide1: "L'Organizzazione Mondiale della Sanità consiglia agli adulti più anziani almeno 150 minuti a settimana di attività moderata (come camminare a passo svelto), esercizi di forza almeno 2 giorni a settimana e, dai 65 anni, esercizi di equilibrio e forza almeno 3 giorni a settimana per prevenire le cadute. Qualsiasi attività è meglio di niente: si comincia poco e si aumenta piano piano.",
    guide2: "Per ridurre il rischio di demenza l'OMS indica attività fisica, alimentazione mediterranea, niente fumo, poco alcol e il controllo di pressione, peso, colesterolo e diabete. Anche l'allenamento della mente, la vita sociale, l'udito e la vista contano.",
    switchUser: "Cambia gruppo", textSize: "Grandezza del testo", language: "Lingua", caregiver: "Area familiare",
    caregiverSub: "Qui puoi impostare i gruppi e aggiungere gli esercizi della fisioterapista.", setPin: "Scegli un PIN di 4 cifre per proteggere l'area familiare", pin: "PIN", unlock: "Apri", savePin: "Salva PIN", wrongPin: "PIN non corretto.", lock: "Chiudi area familiare",
    profiles: "Gruppi", edit: "Modifica", name: "Nome", age: "Età", mobility: "Come si muove", save: "Salva", saved: "Salvato",
    mob_independent: "Autonomo, senza problemi di equilibrio", mob_support: "Ha bisogno di appoggio per gli esercizi in piedi", mob_seated: "Solo esercizi da seduti",
    allowFloor: "Mostra yoga, pilates ed esercizi a terra", allowFloorSub: "Di solito nascosti dai 70 anni o con bisogno di appoggio.",
    manageEx: "Esercizi familiari e nascosti", manageSub: "Gli esercizi con la stella compaiono più spesso nel programma. Quelli nascosti non compaiono mai.", familiar: "Familiare", hide: "Nascondi", hidden: "Nascosto",
    addEx: "Aggiungi un esercizio della fisioterapista", exName: "Nome dell'esercizio", exHow: "Come si fa", exDose: "Quanto (es. 10 volte)", exPart: "Parte del corpo", exPos: "Posizione", forWho: "Per chi",
    pos_s: "Da seduti", pos_c: "In piedi con appoggio", pos_f: "A terra", pos_free: "In piedi", add: "Aggiungi", added: "Esercizio aggiunto.", del: "Elimina", confirmDel: "Conferma eliminazione",
    custom: "Della fisioterapista", newProfile: "Aggiungi una persona", transfer: "Trasferisci i dati su un altro telefono",
    transferSub: "Copia questo codice e incollalo nell'app sull'altro telefono. Così puoi preparare tutto sul tuo e passarlo a un familiare.", copy: "Copia codice", copied: "Copiato", importLabel: "Incolla qui un codice", importBtn: "Importa e sostituisci i dati", importOk: "Dati importati.", importBad: "Il codice non è valido.",
    exampleNote: "Questi sono profili di esempio. Modificali nell'Area familiare.", minutes: "min", reset: "Ricomincia da zero", confirmReset: "Conferma: cancella tutto",
    parts: { back: "Schiena", hips: "Anche e gambe", shoulders: "Spalle", knees: "Ginocchia", neck: "Collo", core: "Addome", ankles: "Caviglie e piedi", arms: "Braccia e mani", full: "Tutto il corpo" },
    cats: { warm: "Riscaldamento", posture: "Posturale", balance: "Equilibrio", strength: "Forza", stretch: "Mobilità", pilates: "Pilates", yoga: "Yoga principianti", jivamukti: "Jivamukti", custom: "Della fisioterapista" },
    days: ["D", "L", "M", "M", "G", "V", "S"], sizes: ["Normale", "Grande", "Molto grande"]
  },
  en: {
    today: "Today", exercises: "Exercises", brain: "Mind", progress: "Progress", family: "Family",
    hello: ["Good morning", "Good afternoon", "Good evening"], whoUses: "Choose your group", whoSub: "Exercises change with age. You can switch group at any time.", grp50: "Full range: posture, strength, pilates, yoga and Jivamukti.", grp70: "Gentle, safe exercises, seated or with support, with balance work every day.",
    focus: "Today's focus", done: "Done", markDone: "Mark as done", swap: "Swap", open: "How to do it",
    ofDone: "of {n} done", planTitle: "Your plan for today", walk: "Walk", walkGoal: "Today's goal: {n} minutes, indoors or out, brisk but comfortable.",
    walked: "You walked {n} minutes", gameOfDay: "Today's mind game", play: "Play", tip: "Tip of the day",
    safetyTitle: "Before you start", safetyBody: "This app does not replace your doctor or physiotherapist. If you have heart or blood pressure problems, osteoporosis, pain, recent surgery or a recent fall, ask your doctor which exercises suit you.",
    safetyStop: "Stop straight away if you feel chest pain, severe breathlessness, dizziness, nausea or sharp pain. In an emergency call 112 (EU) or 999 (UK).",
    safetyHow: "For standing exercises always hold a sturdy chair or kitchen counter, wear closed shoes and avoid slippery rugs.",
    understood: "I understand, let's start", holdOn: "Hold on to a sturdy chair or kitchen counter.", floorNote: "Done on a mat on the floor.", seatedOk: "Can be done seated",
    readAloud: "Read aloud", timer: "1-minute timer", stopTimer: "Stop", back: "Back", dose: "How much",
    allParts: "All", allCats: "All types", hiddenFloor: "Yoga, pilates and floor exercises are hidden for this profile. They can be turned on under Family.",
    level: "Level", bestToday: "Done today", again: "Play again", backToGames: "All games", score: "Score",
    great: "Excellent! The next level will be a little harder.", good: "Well done! Keep it up.", easier: "Good practice. Next time will be a little easier.",
    moves: "Moves", correct: "Correct", clear: "Delete", hint: "Hint", skip: "Skip", tryAgain: "Not quite, try again",
    whichInk: "What colour is the word written in?", watch: "Watch the numbers...", typeSeq: "Now tap the numbers in the same order", length: "Numbers remembered",
    sayWords: "Say out loud", startingWith: "starting with the letter", start: "Start", words: "Words", tapEach: "Tap +1 for each word you say.",
    weekTitle: "This week", minutesActive: "Active minutes", strengthDays: "Days with strength exercises", balanceDays: "Days with balance exercises", brainSessions: "Mind games",
    streak: "Days in a row", target: "goal", guideTitle: "What the guidelines say",
    guide1: "The World Health Organization recommends older adults get at least 150 minutes a week of moderate activity (such as brisk walking), muscle-strengthening on at least 2 days a week and, from 65, balance and strength work on at least 3 days a week to prevent falls. Any activity is better than none: start small and build up slowly.",
    guide2: "To reduce dementia risk the WHO points to physical activity, a Mediterranean-style diet, not smoking, limiting alcohol and managing blood pressure, weight, cholesterol and diabetes. Mental training, social life, hearing and eyesight matter too.",
    switchUser: "Switch group", textSize: "Text size", language: "Language", caregiver: "Family area",
    caregiverSub: "Set up the groups and add exercises from the physio here.", setPin: "Choose a 4-digit PIN to protect the family area", pin: "PIN", unlock: "Open", savePin: "Save PIN", wrongPin: "Wrong PIN.", lock: "Close family area",
    profiles: "Groups", edit: "Edit", name: "Name", age: "Age", mobility: "How they move", save: "Save", saved: "Saved",
    mob_independent: "Independent, no balance problems", mob_support: "Needs support for standing exercises", mob_seated: "Seated exercises only",
    allowFloor: "Show yoga, pilates and floor exercises", allowFloorSub: "Usually hidden from 70 or when support is needed.",
    manageEx: "Familiar and hidden exercises", manageSub: "Starred exercises appear more often in the plan. Hidden ones never appear.", familiar: "Familiar", hide: "Hide", hidden: "Hidden",
    addEx: "Add an exercise from the physio", exName: "Exercise name", exHow: "How to do it", exDose: "How much (e.g. 10 times)", exPart: "Body part", exPos: "Position", forWho: "For whom",
    pos_s: "Seated", pos_c: "Standing with support", pos_f: "On the floor", pos_free: "Standing", add: "Add", added: "Exercise added.", del: "Delete", confirmDel: "Confirm delete",
    custom: "From the physio", newProfile: "Add a person", transfer: "Move data to another phone",
    transferSub: "Copy this code and paste it into the app on the other phone. You can set everything up on yours and pass it to a family member.", copy: "Copy code", copied: "Copied", importLabel: "Paste a code here", importBtn: "Import and replace data", importOk: "Data imported.", importBad: "That code is not valid.",
    exampleNote: "These are example profiles. Edit them in the Family area.", minutes: "min", reset: "Start from scratch", confirmReset: "Confirm: erase everything",
    parts: { back: "Back", hips: "Hips and legs", shoulders: "Shoulders", knees: "Knees", neck: "Neck", core: "Tummy", ankles: "Ankles and feet", arms: "Arms and hands", full: "Whole body" },
    cats: { warm: "Warm-up", posture: "Posture", balance: "Balance", strength: "Strength", stretch: "Mobility", pilates: "Pilates", yoga: "Beginner yoga", jivamukti: "Jivamukti", custom: "From the physio" },
    days: ["S", "M", "T", "W", "T", "F", "S"], sizes: ["Normal", "Large", "Extra large"]
  }
};
