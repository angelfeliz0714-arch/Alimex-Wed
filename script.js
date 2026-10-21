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
