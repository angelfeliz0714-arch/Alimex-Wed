
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

// Abrir y cerrar el menú.
menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Cerrar el menú al seleccionar una sección.
nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Mostrar el año actual automáticamente.
document.getElementById("year").textContent = new Date().getFullYear();

// Formulario demostrativo: no envía datos a internet.
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        formStatus.textContent = "Completa todos los campos.";
        return;
    }

    formStatus.textContent =
        "Formulario de demostración completado. No se ha enviado ningún mensaje.";

    contactForm.reset();
});
