// Alimex: navegación, formulario y asistente virtual con voz del navegador.
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
if (menuToggle && nav) {
  menuToggle.setAttribute("aria-expanded","false");
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
    menuToggle.textContent = "☰";
  }));
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
if (contactForm && formStatus) contactForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!name || !email || !message) { formStatus.textContent = "Completa todos los campos."; return; }
  const text = "Hola, soy " + name + ". Mi correo es " + email + ". Consulta: " + message;
  formStatus.innerHTML = "";
  const link = document.createElement("a");
  link.href = "https://wa.me/18494684483?text=" + encodeURIComponent(text);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Abrir WhatsApp con tu mensaje preparado →";
  link.className = "contact-whatsapp-link";
  formStatus.append("Tu mensaje está listo. ");
  formStatus.append(link);
  contactForm.reset();
});

const assistantPanel = document.getElementById("assistant-panel");
const launcher = document.getElementById("assistant-launcher");
const messageBox = document.getElementById("assistant-message");
const assistantInput = document.getElementById("assistant-input");
const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const replies = {
  bienvenida: "¡Hola! Te doy la bienvenida a Alimex, una página dedicada a la distribución responsable de alimentos. Puedo orientarte sobre productos, servicios y formas de contacto. ¿Qué te gustaría conocer?",
  productos: "En Alimex encontrarás información sobre frutas y verduras, productos lácteos, granos y cereales, alimentos envasados, proteínas, congelados y bebidas. La disponibilidad puede variar, así que te recomendamos consultar directamente con el equipo.",
  servicios: "Nuestros servicios informativos incluyen recepción de productos, organización y almacenamiento, y coordinación de distribución. Para confirmar cobertura y condiciones, comunícate con nuestro equipo.",
  contacto: "Puedes contactar a Alimex por WhatsApp al ocho cuatro nueve, cuatro seis ocho, cuatro cuatro ocho tres. También puedes usar la sección de contacto para preparar tu consulta y continuar por WhatsApp.",
  horario: "Esta página ofrece información general sobre Alimex. Para confirmar horarios de atención, precios, inventario, pedidos y cobertura de entrega, consulta directamente por WhatsApp.",
  equipo: "En la sección Nuestro equipo puedes conocer a las personas que forman parte de esta presentación de Alimex.",
  ubicacion: "La página muestra Santo Domingo Este, República Dominicana, como referencia. Confirma con Alimex la dirección exacta y la cobertura de entrega.",
  gracias: "¡Gracias por visitar Alimex! Estamos aquí para orientarte. Si necesitas confirmar un pedido o disponibilidad, contacta directamente con el equipo.",
  desconocido: "Puedo ayudarte con productos, servicios, contacto, ubicación general y preguntas frecuentes. Elige una de las opciones o escribe tu pregunta de otra manera."
};
function speak(text) {
  if (!speechSupported) { messageBox.textContent = text + " (La voz no está disponible en este navegador.)"; return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  utterance.rate = 0.90;
  utterance.pitch = 1.16;
  const voices = window.speechSynthesis.getVoices();
  const spanishVoices = voices.filter(v => /^es(-|_)/i.test(v.lang));
  // Preferir una voz femenina en español cuando el navegador o el sistema la tenga instalada.
  const spanishVoice = spanishVoices.find(v => /female|sabina|helena|laura|luciana|isabela|isabella|sofia|sofía|monica|mónica|paulina|mia|elena|zira|aria|jenny/i.test(v.name))
    || spanishVoices.find(v => /google.*español|spanish.*female/i.test(v.name))
    || spanishVoices[0];
  if (spanishVoice) {
    utterance.voice = spanishVoice;
    utterance.lang = spanishVoice.lang;
  }
  window.speechSynthesis.speak(utterance);
}
function showReply(key) {
  const text = replies[key] || replies.desconocido;
  messageBox.textContent = text;
  speak(text);
}
function detectReply(question) {
  const q = question.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if (/hola|buenos dias|buenas tardes|buenas noches|bienvenid/.test(q)) return "bienvenida";
  if (/producto|catalogo|fruta|verdura|leche|arroz|bebida|alimento|disponibilidad/.test(q)) return "productos";
  if (/servicio|distribu|entrega|almacen|pedido|reparto/.test(q)) return "servicios";
  if (/contact|whatsapp|telefono|llamar|correo|cotiza|precio|comprar/.test(q)) return "contacto";
  if (/horario|abren|abierto|hora|inventario/.test(q)) return "horario";
  if (/equipo|personas|emplead/.test(q)) return "equipo";
  if (/direccion|ubicacion|donde|santo domingo/.test(q)) return "ubicacion";
  if (/gracias/.test(q)) return "gracias";
  return "desconocido";
}
function openAssistant() {
  assistantPanel.hidden = false;
  launcher.setAttribute("aria-expanded","true");
}
function closeAssistant() {
  assistantPanel.hidden = true;
  launcher.setAttribute("aria-expanded","false");
}
launcher.addEventListener("click", () => assistantPanel.hidden ? openAssistant() : closeAssistant());
document.getElementById("assistant-close").addEventListener("click",closeAssistant);
document.querySelectorAll("[data-question]").forEach(button => button.addEventListener("click",() => showReply(button.dataset.question)));
document.getElementById("assistant-form").addEventListener("submit",event => {
  event.preventDefault();
  const question = assistantInput.value.trim();
  if (!question) return;
  showReply(detectReply(question));
  assistantInput.value = "";
});
document.getElementById("assistant-speak").addEventListener("click",() => showReply("bienvenida"));
document.getElementById("assistant-stop").addEventListener("click",() => { if (speechSupported) window.speechSynthesis.cancel(); });
const nudge = document.getElementById("presentation-nudge");
document.getElementById("presentation-start").addEventListener("click",() => {
  openAssistant();
  showReply("bienvenida");
  nudge.hidden = true;
});
document.getElementById("presentation-dismiss").addEventListener("click",() => { nudge.hidden = true; });
let presented = false;
const sectionObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  if (presented) return;
  const entry = entries.find(item => item.isIntersecting && ["productos","servicios","equipo","contacto"].includes(item.target.id));
  if (entry) {
    presented = true;
    messageBox.textContent = "Estás explorando " + ({"productos":"nuestro catálogo","servicios":"nuestros servicios","equipo":"nuestro equipo","contacto":"la sección de contacto"}[entry.target.id]) + ". Abre el chat cuando quieras escuchar más información.";
    sectionObserver.disconnect();
  }
},{threshold:.45}) : null;
if (sectionObserver) ["productos","servicios","equipo","contacto"].forEach(id => { const el=document.getElementById(id); if(el) sectionObserver.observe(el); });
// Por privacidad y para evitar audio inesperado, la presentación de voz comienza cuando el visitante pulsa Escuchar.


// Cierra la entrada de bienvenida aunque la animación CSS se quede congelada.
(() => {
  const intro = document.querySelector(".alimex-intro");
  if (!intro) return;
  const closeIntro = () => {
    intro.classList.add("intro-hidden");
    window.setTimeout(() => { if (intro.isConnected) intro.remove(); }, 600);
  };
  window.setTimeout(closeIntro, 3000);
  intro.addEventListener("click", closeIntro, { once: true });
})();


// Mini juego Alimex: preguntas de alimentación equilibrada.
(() => {
  const questions = [
    {emoji:"🥗",q:"¿Qué ayuda a tener una alimentación variada?",a:["Comer distintos grupos de alimentos","Comer siempre lo mismo","Evitar todas las frutas"],correct:0,why:"Combinar frutas, vegetales, cereales, proteínas y otros alimentos adecuados ayuda a variar los nutrientes."},
    {emoji:"🍎",q:"¿Cuál es una buena opción para una merienda?",a:["Fruta fresca","Solo caramelos todos los días","Bebida energética como costumbre"],correct:0,why:"La fruta aporta fibra y vitaminas. Puedes combinarla con otros alimentos según tus necesidades."},
    {emoji:"💧",q:"¿Qué conviene beber con frecuencia para hidratarse?",a:["Agua","Refresco azucarado todo el día","Bebidas energéticas en lugar de agua"],correct:0,why:"El agua suele ser la opción principal para hidratarse."},
    {emoji:"🥦",q:"¿Qué hábito puede ayudar a cuidar la salud?",a:["Incluir frutas y vegetales regularmente","Eliminar todos los carbohidratos sin orientación","Saltarse todas las comidas"],correct:0,why:"Frutas y vegetales aportan fibra y distintos nutrientes; una alimentación equilibrada también incluye otros grupos."},
    {emoji:"🍟",q:"¿Qué conviene limitar si se consume muy a menudo?",a:["Productos con mucho azúcar, sal o grasas poco saludables","Agua potable","Vegetales variados"],correct:0,why:"Es recomendable limitar alimentos muy altos en azúcar, sodio o grasas poco saludables y priorizar variedad."},
    {emoji:"🧊",q:"¿Cómo se deben manejar los alimentos que necesitan frío?",a:["Mantenerlos refrigerados según la etiqueta","Dejarlos todo el día al sol","Descongelarlos sobre la mesa durante horas"],correct:0,why:"Seguir las indicaciones de refrigeración y conservación ayuda a reducir el riesgo de enfermedades transmitidas por alimentos."}
  ];
  const root=document.querySelector(".food-game");
  if(!root)return;
  let index=0,score=0,answered=false;
  const $=id=>document.getElementById(id);
  const render=()=>{
    answered=false;const item=questions[index];
    $("game-progress").textContent="Pregunta "+(index+1)+" de "+questions.length;
    $("game-score").textContent=score;
    $("game-progress-bar").style.width=(index/questions.length*100)+"%";
    $("game-emoji").textContent=item.emoji;$("game-question").textContent=item.q;
    $("game-feedback").textContent="";$("game-feedback").className="game-feedback";
    $("game-next").hidden=true;$("game-answers").hidden=false;
    $("game-kicker").textContent="ELIGE LA MEJOR RESPUESTA";
    $("game-answers").innerHTML=item.a.map((answer,i)=>'<button type="button" class="game-answer" data-answer="'+i+'"><span class="answer-letter">'+String.fromCharCode(65+i)+'</span>'+answer+'</button>').join("");
    $("game-answers").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>choose(Number(btn.dataset.answer),btn)));
  };
  const choose=(choice,btn)=>{
    if(answered)return;answered=true;const item=questions[index];const correct=choice===item.correct;
    if(correct)score++;
    $("game-score").textContent=score;
    $("game-answers").querySelectorAll("button").forEach(b=>{b.disabled=true;if(Number(b.dataset.answer)===item.correct)b.classList.add("answer-correct");});
    if(!correct)btn.classList.add("answer-wrong");
    $("game-feedback").className="game-feedback "+(correct?"feedback-good":"feedback-try");
    $("game-feedback").textContent=(correct?"¡Muy bien! ":"¡Casi! ")+item.why;
    $("game-kicker").textContent=correct?"¡RESPUESTA CORRECTA!":"APRENDE ALGO NUEVO";
    $("game-progress-bar").style.width=((index+1)/questions.length*100)+"%";
    $("game-next").hidden=false;$("game-next").textContent=index===questions.length-1?"Ver resultado 🏆":"Siguiente pregunta →";
  };
  $("game-next").addEventListener("click",()=>{
    if(!answered)return;
    if(index<questions.length-1){index++;render();return;}
    $("game-answers").hidden=true;$("game-next").hidden=true;$("game-emoji").textContent="🏆";$("game-kicker").textContent="RESULTADO FINAL";
    $("game-question").textContent="¡Terminaste el reto!";
    $("game-feedback").textContent="";
    $("game-result").textContent="Conseguiste "+score+" de "+questions.length+" puntos. "+(score===questions.length?"¡Perfecto! Eres un campeón de los buenos hábitos.":score>=4?"¡Buen trabajo! Sigue aprendiendo sobre alimentación saludable.":"¡Buen comienzo! Juega otra vez para practicar.");
    $("game-finish").hidden=false;$("game-progress").textContent="Reto completado";$("game-progress-bar").style.width="100%";
  });
  $("game-restart").addEventListener("click",()=>{index=0;score=0;$("game-finish").hidden=true;render();});
  render();
})();


// Respaldo por si el servidor externo de imágenes no responde.
document.querySelectorAll("img").forEach(img => {
  if (img.complete && img.naturalWidth === 0 && img.src) img.dispatchEvent(new Event("error"));
});
