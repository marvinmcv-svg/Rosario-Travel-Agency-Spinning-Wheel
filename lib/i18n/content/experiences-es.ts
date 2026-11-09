import type { ActivityText } from "@/lib/experiences";

/* Spanish "Things to do". Keys: destination slug → activity id (lib/experiences.ts). */
const experiencesEs: Record<string, Record<string, ActivityText>> = {
  "salar-de-uyuni": {
    "mirror-sunrise": { title: "Amanecer sobre el espejo", text: "Salimos del hotel de sal a oscuras hacia un tramo inundado al que no llega ningún tour del día. Cuando el sol asoma, el cielo aparece dos veces: sobre ti y bajo tus botas." },
    incahuasi: { title: "Caminata por la isla Incahuasi", text: "Una isla de coral varada en un mar de sal. Un sendero corto sube entre cactus cardón gigantes, algunos de más de mil años, hasta una cima con toda la llanura blanca a tus pies." },
    perspective: { title: "Travesía en Land Cruiser y picnic en la sal", text: "Land Cruisers restaurados, un conductor que creció en el Salar y nada en ninguna dirección. Paramos para un largo picnic sobre la costra hexagonal y las fotos de perspectiva que todos quieren en secreto." },
    "train-cemetery": { title: "El cementerio de trenes", text: "Locomotoras de vapor oxidadas que llevaban plata y estaño al Pacífico, abandonadas a las afueras de Uyuni en los años cuarenta. Ve temprano, antes de la gente, cuando la luz baja ilumina el hierro." },
    "salt-sunset": { title: "Atardecer con los salineros", text: "De regreso de Colchani, donde las cooperativas aún rastrillan la sal a mano, esperamos en el salar mientras la luz tiñe el agua de cobre y violeta. A bordo hay api morado caliente y una manta." },
    "salt-stars": { title: "Estrellas sobre la sal", text: "A 3.656 metros y sin pueblos en kilómetros, la Vía Láctea proyecta sombra. En temporada de lluvias se refleja en el agua a tus pies. El guía trae un puntero láser y los nombres andinos de las constelaciones oscuras." },
  },
  "lake-titicaca": {
    "isla-del-sol": { title: "La Isla del Sol a pie", text: "Desembarca en Yumani, sube la escalinata inca junto a la Fuente de la Juventud y recorre el lomo de la isla hacia el norte, entre terrazas, burros y caseríos aymaras, hasta la roca sagrada donde nació el sol." },
    uros: { title: "Las islas flotantes de los uros", text: "Pisa un suelo tejido con totora y conoce a una familia que lo renueva cada pocas semanas. Un constructor de balsas te enseña cómo se amarra una, y cruzas a la isla vecina en ella." },
    "dawn-kayak": { title: "Kayak con la primera luz", text: "Al amanecer el lago es un cristal. Rema en kayak junto a los totorales con un guía local, viendo despegar zambullidores e ibis mientras los nevados de la Cordillera Real se tiñen de rosa." },
    "pachamama-sunset": { title: "Ofrenda a la Pachamama al atardecer", text: "Sobre Copacabana, un yatiri (guía espiritual aymara) prepara un despacho de coca, dulces y lana de llama y lo quema mientras el sol se hunde en el lago. Después, cena de trucha fresca con la familia que te recibe." },
  },
  "machu-picchu": {
    "first-entry": { title: "Primera entrada al amanecer", text: "El primer bus, el primer torniquete. Subimos a la Casa del Guardián mientras las nubes se levantan de la cresta y la ciudadela aparece abajo, antes de que la mayoría haya salido de Aguas Calientes." },
    "huayna-picchu": { title: "Cumbre del Huayna Picchu", text: "La montaña de todas las postales. Escalones incas empinados, un cable de apoyo y un túnel estrecho llevan a las terrazas del Templo de la Luna y a una vista de pájaro de la ciudadela, 300 metros más abajo. Los permisos son limitados y los reservamos con tiempo." },
    archaeologist: { title: "Leer el sitio con un arqueólogo", text: "El Templo del Sol, el Intihuatana y las terrazas explicados como los diseñaron los incas: un calendario solar, un observatorio y una granja experimental al borde del bosque nuboso." },
    "sun-gate": { title: "Caminata a la Puerta del Sol", text: "Recorre el último tramo del Camino Inca al revés hasta el Inti Punku, donde los peregrinos veían la ciudad por primera vez. Por la tarde la luz es cálida y el sendero está casi vacío." },
  },
  "rainbow-mountain": {
    ridge: { title: "Cumbre de la cresta pintada", text: "Una subida constante hasta los 5.200 metros, con caballos y oxígeno a mano. Calculamos el horario para que llegues cuando los grupos del día ya bajan, y las catorce franjas de color mineral sean solo tuyas." },
    "red-valley": { title: "Travesía del Valle Rojo", text: "Desde la cumbre, baja por el otro lado a un cañón de tierra rojo óxido que casi nadie ve. Los glaciares del Ausangate cuelgan sobre ti y solo se oyen el viento y las campanas de los rebaños." },
    herders: { title: "Almuerzo con una familia pastora", text: "En Pitumarca, una familia quechua que gestiona los senderos cocina papas en huatia (horno de tierra) y te muestra cómo la fibra de alpaca se vuelve textil cusqueño, de la esquila a los tintes naturales." },
  },
  "laguna-colorada": {
    flamingos: { title: "Flamencos en el lago carmesí", text: "Flamencos de James, chilenos y andinos alimentándose en agua roja a 4.278 metros. Con el viento de la tarde el lago pasa del óxido al escarlata; un naturalista trae un telescopio terrestre y la historia del ave que se creyó extinta hasta 1956." },
    "sol-de-manana": { title: "Géiseres Sol de Mañana al amanecer", text: "A 4.900 metros la tierra hierve. Burbujean las ollas de barro, rugen las fumarolas y al amanecer las columnas de vapor brillan doradas. Después, un baño en las termas de Polques con flamencos en la otra orilla." },
    "stone-tree": { title: "El Árbol de Piedra y el desierto de Dalí", text: "Rocas talladas por el viento en el desierto de Siloli, incluido el famoso Árbol de Piedra, y luego el surrealista desierto de Dalí, donde las rocas parecen puestas a mano sobre arena pastel. Las vizcachas te miran desde las piedras." },
    "lagoon-walk": { title: "La orilla de la laguna en la hora dorada", text: "Un paseo lento sobre la laguna mientras las islas de bórax se vuelven rosadas y los flamencos llegan a dormir. En el refugio: guiso de llama, estufa a leña y el cielo nocturno más claro de Bolivia." },
  },
  cusco: {
    "stone-walk": { title: "Paseo por la piedra inca", text: "De la piedra de los doce ángulos en Hatun Rumiyoc al Qorikancha, el Templo del Sol revestido de oro, y luego a los muros en zigzag de Sacsayhuamán. La ciudad inca sigue en pie bajo la colonial." },
    "san-blas": { title: "Mesa del chef en San Blas", text: "Una velada con un chef cusqueño que cocina con las 3.000 variedades de papa de los Andes, pescado amazónico y chicha morada. Primero una cata de pisco; después, el paseo de vuelta por la plaza iluminada." },
    chinchero: { title: "Tejedoras de Chinchero", text: "Sobre el Valle Sagrado, una cooperativa de mujeres lava la lana de alpaca con raíces, la tiñe con cochinilla y plantas, y teje diseños que se leen como una historia familiar. Las llamas pastan en el patio." },
  },
  tiwanaku: {
    "gate-of-the-sun": { title: "La Puerta del Sol con un arqueólogo", text: "Un arqueólogo aymara lee el calendario tallado en el bloque único de andesita y te guía por la plataforma de Kalasasaya y la pirámide de Akapana, alineadas con los solsticios." },
    templete: { title: "El templo hundido de las cabezas", text: "Desciende al Templete Semisubterráneo, con sus muros sembrados de cabezas de piedra, todas distintas. Después, Pumapunku, cuyos bloques en H tallados con precisión aún desconciertan a los ingenieros." },
    willkakuti: { title: "Willkakuti, el Año Nuevo Andino", text: "Cada 21 de junio, miles de aymaras se reúnen en la oscuridad helada y alzan las palmas para recibir los primeros rayos del nuevo sol a través de la puerta del templo. Te llevamos con una familia local." },
  },
  atacama: {
    "valle-de-la-luna": { title: "Valle de la Luna al atardecer", text: "Recorre las cuevas de sal y la cresta del Anfiteatro en un valle tallado por el viento, y mira cómo los Andes se vuelven rojos y luego violetas desde lo alto de la Duna Mayor. La NASA prueba sus robots marcianos cerca de aquí." },
    sandboarding: { title: "Sandboard en el Valle de la Muerte", text: "Tablas, cera y una lección rápida, y luego las largas dunas del Valle de la Muerte. Los principiantes bajan con calma; los atrevidos toman la cara de 150 metros. Terminamos con algo frío mientras cae el sol." },
    tatio: { title: "Géiseres del Tatio", text: "Salida a las 5 de la mañana para llegar a 4.320 metros al amanecer, cuando más de ochenta géiseres humean en el aire helado. Desayuno junto a las fumarolas, un baño en la poza termal y vicuñas en la bajada." },
    astronomy: { title: "Sesión privada de astronomía", text: "Los cielos más claros de la Tierra a través de un telescopio de 16 pulgadas: los anillos de Saturno, las Nubes de Magallanes y el cúmulo del Joyero, con un astrónomo y las historias lickanantay del cielo." },
  },
  "torres-del-paine": {
    "base-towers": { title: "Base de las Torres", text: "El clásico. Por el valle del Ascencio, a través del bosque de lenga y un último pedregal, hasta el lago glaciar bajo las tres torres de granito. Sal a oscuras para ver el amanecer en la roca y una cumbre tranquila." },
    "grey-glacier": { title: "El lago y el glaciar Grey en barco", text: "Navega entre témpanos azules hasta el frente del glaciar Grey, parte del Campo de Hielo Patagónico Sur. Hielo glaciar en tu pisco sour al volver, con los Cuernos alzándose sobre el lago Pehoé." },
    pumas: { title: "Rastreo de pumas con un naturalista", text: "La Patagonia tiene hoy una de las poblaciones de pumas más densas del planeta. Camina con un rastreador que lee la estepa por las alarmas de los guanacos y las huellas frescas y, con suerte, ve a una madre con sus crías al amanecer." },
  },
  iguazu: {
    "devils-throat": { title: "Pasarela de la Garganta del Diablo", text: "Un kilómetro de pasarela sobre el río superior termina en el borde de la Garganta del Diablo, donde la mitad del Iguazú cae a un solo abismo. Entramos antes de que abra el parque: la bruma y el estruendo son solo tuyos." },
    "boat-under-falls": { title: "Lancha bajo las cataratas", text: "Una lancha por los rápidos del cañón inferior y directo a la espuma del salto San Martín. Saldrás empapado y con ganas de repetir." },
    "brazil-panorama": { title: "El panorama brasileño", text: "Cruza la frontera para la vista amplia: un sendero junto al cañón que muestra las cataratas como un solo muro curvo de agua y termina en una pasarela dentro de la espuma del salto Floriano." },
    circuits: { title: "Circuitos superior e inferior", text: "Pasarelas que serpentean sobre y bajo decenas de saltos en plena Selva Atlántica. Tucanes toco, coatíes, monos capuchinos y nubes de mariposas te acompañan; un naturalista los nombra a todos." },
  },
  amazon: {
    "clay-lick": { title: "Collpa de guacamayos al amanecer", text: "Desde un escondite en la orilla, mira cientos de guacamayos escarlata, azul y amarillo y rojo y verde bajar a un barranco de arcilla para comer minerales. Una explosión de color y ruido, y uno de los grandes espectáculos de la Amazonía." },
    "oxbow-lake": { title: "Lobos de río en la cocha", text: "Deslízate por un lago quieto en catamarán o canoa buscando a la familia de lobos de río que pesca aquí, junto a shanshos, caimanes y algún mono de cabeza negra." },
    canopy: { title: "Torre de dosel", text: "Sube 30 metros hasta las copas, donde vive casi toda la vida del bosque. Tucanes, tangaras y monos aulladores a la altura de los ojos, y un mar verde hasta el horizonte al atardecer." },
    "night-walk": { title: "Caminata nocturna en la selva", text: "Con linterna frontal y un guía ese'eja que creció aquí: ranas arborícolas, tarántulas, mariposas de alas de cristal y el brillo de los ojos de los caimanes. Luego, a dormir arrullado por la selva." },
  },
};

export default experiencesEs;
