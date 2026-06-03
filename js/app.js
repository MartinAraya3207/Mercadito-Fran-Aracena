// ============================================================
// app.js — Mercadito Fran Aracena
// Funcionalidades: edición de productos, clientes y modo oscuro
// ============================================================

// ---------------------------------------------------------------
// DATOS: Arreglo de productos del mercadito
// ---------------------------------------------------------------
const productos = [
  { id: 1, nombre: "Crema corporal",  precio: 12000, descuento: 10 },
  { id: 2, nombre: "Maquillaje",      precio: 15000, descuento: 5  },
  { id: 3, nombre: "Pegamento",       precio: 2000,  descuento: 0  },
  { id: 4, nombre: "Lapicera",        precio: 1500,  descuento: 0  },
  { id: 5, nombre: "Perfume Natura",  precio: 18000, descuento: 5  },
];

// ---------------------------------------------------------------
// DATOS: Arreglo de clientes que deben pagar
// ---------------------------------------------------------------
const clientes = [
  { id: 1, nombre: "Cliente 1", total: 15000 },
  { id: 2, nombre: "Cliente 2", total: 9000  },
  { id: 3, nombre: "Cliente 3", total: 17100 },
  { id: 4, nombre: "Cliente 4", total: 14250 },
];

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------

/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} valor - Número a formatear
 * @returns {string} Precio formateado ej: $12.000
 */
function formatearPrecio(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CL");
}

/**
 * Calcula el precio final de un producto aplicando el descuento.
 * @param {number} precio - Precio base
 * @param {number} descuento - Porcentaje de descuento (0-100)
 * @returns {number} Precio con descuento aplicado
 */
function calcularPrecioFinal(precio, descuento) {
  return precio * (1 - descuento / 100);
}

/**
 * Genera un ID único para nuevos registros basado en el máximo existente.
 * @param {Array} arreglo - Arreglo de objetos con propiedad id
 * @returns {number} Nuevo ID
 */
function generarId(arreglo) {
  return arreglo.length > 0 ? Math.max(...arreglo.map((item) => item.id)) + 1 : 1;
}

// ---------------------------------------------------------------
// RENDERIZADO DE PRODUCTOS
// ---------------------------------------------------------------

/**
 * Renderiza la tabla completa de productos en el DOM.
 * Genera cada fila dinámicamente desde el arreglo `productos`.
 */
function renderizarProductos() {
  const tbody = document.querySelector("#productos table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  productos.forEach((producto) => {
    const precioFinal = calcularPrecioFinal(producto.precio, producto.descuento);
    const fila = document.createElement("tr");
    fila.dataset.id = producto.id;

    fila.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${formatearPrecio(producto.precio)}</td>
      <td>${producto.descuento}%</td>
      <td>${formatearPrecio(precioFinal)}</td>
      <td>${formatearPrecio(precioFinal)}</td>
      <td>
        <button class="btn-editar-prod" data-id="${producto.id}" aria-label="Editar ${producto.nombre}">✏️ Editar</button>
        <button class="btn-eliminar-prod" data-id="${producto.id}" aria-label="Eliminar ${producto.nombre}">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  // Fila de total general
  const totalGeneral = productos.reduce(
    (sum, p) => sum + calcularPrecioFinal(p.precio, p.descuento), 0
  );
  const filaTotalExistente = tbody.querySelector(".fila-total");
  if (filaTotalExistente) filaTotalExistente.remove();

  const filaTotal = document.createElement("tr");
  filaTotal.className = "fila-total";
  filaTotal.innerHTML = `
    <td><strong>Total general</strong></td>
    <td></td><td></td><td></td>
    <td><strong>${formatearPrecio(totalGeneral)}</strong></td>
    <td></td>
  `;
  tbody.appendChild(filaTotal);

  // Agregar eventos a botones editar y eliminar producto
  tbody.querySelectorAll(".btn-editar-prod").forEach((btn) => {
    btn.addEventListener("click", abrirModalProducto);
  });
  tbody.querySelectorAll(".btn-eliminar-prod").forEach((btn) => {
    btn.addEventListener("click", eliminarProducto);
  });
}

// ---------------------------------------------------------------
// MODAL EDITAR PRODUCTO
// ---------------------------------------------------------------

/**
 * Abre el modal en modo "agregar nuevo producto" con campos vacíos.
 */
function abrirModalNuevoProducto() {
  document.getElementById("modal-prod-titulo").textContent = "Agregar producto";
  document.getElementById("modal-prod-nombre").value = "";
  document.getElementById("modal-prod-precio").value = "";
  document.getElementById("modal-prod-descuento").value = "0";
  document.getElementById("modal-prod-id").value = "";
  document.getElementById("error-prod").textContent = "";

  abrirModal("modal-producto");
}

/**
 * Abre el modal para editar nombre, precio y descuento de un producto.
 * @param {Event} evento - Evento click del botón editar
 */
function abrirModalProducto(evento) {
  const id = parseInt(evento.currentTarget.dataset.id);
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  document.getElementById("modal-prod-titulo").textContent = "Editar: " + producto.nombre;
  document.getElementById("modal-prod-nombre").value = producto.nombre;
  document.getElementById("modal-prod-precio").value = producto.precio;
  document.getElementById("modal-prod-descuento").value = producto.descuento;
  document.getElementById("modal-prod-id").value = producto.id;
  document.getElementById("error-prod").textContent = "";

  abrirModal("modal-producto");
}

/**
 * Guarda los cambios del producto (nuevo o editado) y actualiza el DOM.
 */
function guardarProducto() {
  const idRaw = document.getElementById("modal-prod-id").value;
  const nombre = document.getElementById("modal-prod-nombre").value.trim();
  const precio = parseFloat(document.getElementById("modal-prod-precio").value);
  const descuento = parseFloat(document.getElementById("modal-prod-descuento").value);
  const errorEl = document.getElementById("error-prod");

  // Validaciones
  if (!nombre) {
    errorEl.textContent = "El nombre del producto no puede estar vacío.";
    return;
  }
  if (isNaN(precio) || precio < 0) {
    errorEl.textContent = "El precio debe ser un número mayor o igual a 0.";
    return;
  }
  if (isNaN(descuento) || descuento < 0 || descuento > 100) {
    errorEl.textContent = "El descuento debe estar entre 0 y 100.";
    return;
  }

  if (idRaw === "") {
    // Nuevo producto
    productos.push({ id: generarId(productos), nombre, precio, descuento });
  } else {
    // Editar existente
    const producto = productos.find((p) => p.id === parseInt(idRaw));
    if (producto) {
      producto.nombre = nombre;
      producto.precio = precio;
      producto.descuento = descuento;
    }
  }

  cerrarModal("modal-producto");
  renderizarProductos();
}

/**
 * Elimina un producto del arreglo y actualiza el DOM.
 * @param {Event} evento - Evento click del botón eliminar
 */
function eliminarProducto(evento) {
  const id = parseInt(evento.currentTarget.dataset.id);
  const indice = productos.findIndex((p) => p.id === id);
  if (indice !== -1) {
    productos.splice(indice, 1);
    renderizarProductos();
  }
}

// ---------------------------------------------------------------
// RENDERIZADO DE CLIENTES
// ---------------------------------------------------------------

/**
 * Renderiza la tabla de clientes que deben pagar en el DOM.
 */
function renderizarClientes() {
  const tbody = document.querySelector("#deben-pagar table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  clientes.forEach((cliente) => {
    const fila = document.createElement("tr");
    fila.dataset.id = cliente.id;
    fila.innerHTML = `
      <td>${cliente.nombre}</td>
      <td>${formatearPrecio(cliente.total)}</td>
      <td>
        <button class="btn-editar-cli" data-id="${cliente.id}" aria-label="Editar ${cliente.nombre}">✏️</button>
        <button class="btn-eliminar-cli" data-id="${cliente.id}" aria-label="Eliminar ${cliente.nombre}">🗑️</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  // Fila total
  const totalClientes = clientes.reduce((sum, c) => sum + c.total, 0);
  const filaTotal = document.createElement("tr");
  filaTotal.className = "fila-total";
  filaTotal.innerHTML = `
    <td><strong>Total general</strong></td>
    <td><strong>${formatearPrecio(totalClientes)}</strong></td>
    <td></td>
  `;
  tbody.appendChild(filaTotal);

  // Eventos editar y eliminar
  tbody.querySelectorAll(".btn-editar-cli").forEach((btn) => {
    btn.addEventListener("click", abrirModalCliente);
  });
  tbody.querySelectorAll(".btn-eliminar-cli").forEach((btn) => {
    btn.addEventListener("click", eliminarCliente);
  });
}

/**
 * Abre el modal para editar o agregar un cliente.
 * @param {Event} evento - Evento click del botón editar
 */
function abrirModalCliente(evento) {
  const id = parseInt(evento.currentTarget.dataset.id);
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;

  document.getElementById("modal-cli-titulo").textContent = "Editar cliente";
  document.getElementById("modal-cli-nombre").value = cliente.nombre;
  document.getElementById("modal-cli-total").value = cliente.total;
  document.getElementById("modal-cli-id").value = cliente.id;
  document.getElementById("error-cli").textContent = "";

  abrirModal("modal-cliente");
}

/**
 * Abre el modal en modo "agregar nuevo cliente" con campos vacíos.
 */
function abrirModalNuevoCliente() {
  document.getElementById("modal-cli-titulo").textContent = "Agregar cliente";
  document.getElementById("modal-cli-nombre").value = "";
  document.getElementById("modal-cli-total").value = "";
  document.getElementById("modal-cli-id").value = "";
  document.getElementById("error-cli").textContent = "";

  abrirModal("modal-cliente");
}

/**
 * Guarda los cambios del cliente (nuevo o editado) y actualiza el DOM.
 */
function guardarCliente() {
  const idRaw = document.getElementById("modal-cli-id").value;
  const nombre = document.getElementById("modal-cli-nombre").value.trim();
  const total = parseFloat(document.getElementById("modal-cli-total").value);
  const errorEl = document.getElementById("error-cli");

  if (!nombre) {
    errorEl.textContent = "El nombre no puede estar vacío.";
    return;
  }
  if (isNaN(total) || total < 0) {
    errorEl.textContent = "El total debe ser un número mayor o igual a 0.";
    return;
  }

  if (idRaw === "") {
    // Nuevo cliente
    clientes.push({ id: generarId(clientes), nombre, total });
  } else {
    // Editar existente
    const cliente = clientes.find((c) => c.id === parseInt(idRaw));
    if (cliente) {
      cliente.nombre = nombre;
      cliente.total = total;
    }
  }

  cerrarModal("modal-cliente");
  renderizarClientes();
}

/**
 * Elimina un cliente del arreglo y actualiza el DOM.
 * @param {Event} evento - Evento click del botón eliminar
 */
function eliminarCliente(evento) {
  const id = parseInt(evento.currentTarget.dataset.id);
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice !== -1) {
    clientes.splice(indice, 1);
    renderizarClientes();
  }
}

// ---------------------------------------------------------------
// CONTROL DE MODALES
// ---------------------------------------------------------------

/**
 * Abre un modal por su ID y gestiona el foco para accesibilidad.
 * @param {string} idModal - ID del elemento modal
 */
function abrirModal(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;
  modal.removeAttribute("hidden");
  modal.setAttribute("aria-hidden", "false");
  // Foco al primer input del modal
  const primerInput = modal.querySelector("input");
  if (primerInput) primerInput.focus();
}

/**
 * Cierra un modal por su ID.
 * @param {string} idModal - ID del elemento modal
 */
function cerrarModal(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;
  modal.setAttribute("hidden", "");
  modal.setAttribute("aria-hidden", "true");
}

// ---------------------------------------------------------------
// MODO OSCURO / CLARO
// ---------------------------------------------------------------

/**
 * Alterna entre modo oscuro y claro, y guarda la preferencia en localStorage.
 */
function toggleModoOscuro() {
  const estaOscuro = document.body.classList.toggle("modo-oscuro");
  localStorage.setItem("modoOscuro", estaOscuro ? "1" : "0");
  actualizarBotonModo(estaOscuro);
}

/**
 * Actualiza el texto e icono del botón de modo según el estado actual.
 * @param {boolean} estaOscuro - true si el modo oscuro está activo
 */
function actualizarBotonModo(estaOscuro) {
  const btn = document.getElementById("btn-modo");
  if (!btn) return;
  btn.textContent = estaOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
  btn.setAttribute("aria-pressed", estaOscuro ? "true" : "false");
}

/**
 * Restaura el modo oscuro/claro desde localStorage al cargar la página.
 */
function restaurarModo() {
  const guardado = localStorage.getItem("modoOscuro");
  const estaOscuro = guardado === "1";
  if (estaOscuro) document.body.classList.add("modo-oscuro");
  actualizarBotonModo(estaOscuro);
}

// ---------------------------------------------------------------
// INYECCIÓN DE ELEMENTOS EN EL HTML
// ---------------------------------------------------------------

/**
 * Agrega el botón de modo oscuro al header del sitio.
 */
function inyectarBotonModo() {
  const header = document.querySelector("header");
  if (!header) return;
  const btn = document.createElement("button");
  btn.id = "btn-modo";
  btn.setAttribute("aria-pressed", "false");
  btn.textContent = "🌙 Modo oscuro";
  btn.addEventListener("click", toggleModoOscuro);
  header.appendChild(btn);
}

/**
 * Agrega el botón "Agregar producto" sobre la tabla de productos.
 */
function inyectarBotonNuevoProducto() {
  const seccion = document.getElementById("productos");
  if (!seccion) return;
  const btn = document.createElement("button");
  btn.id = "btn-nuevo-producto";
  btn.textContent = "➕ Agregar producto";
  btn.addEventListener("click", abrirModalNuevoProducto);
  seccion.insertBefore(btn, seccion.querySelector("table"));
}

function inyectarBuscadorProductos() {
    const seccion = document.getElementById("productos");
    if (!seccion) return;

    const input = document.createElement("input");
    input.id = "buscador-productos";
    input.type = "text";
    input.placeholder = "Buscar producto...";

    input.addEventListener("input", filtrarProductos);

    seccion.insertBefore(input, seccion.querySelector("table"));
}

function filtrarProductos() {
    const texto = document
        .getElementById("buscador-productos")
        .value
        .toLowerCase();

    const filas = document.querySelectorAll("#productos tbody tr");

    filas.forEach((fila) => {
        const nombre = fila.querySelector("td");

        if (!nombre) return;

        if (nombre.textContent.toLowerCase().includes(texto)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}
/**
 * Agrega el botón "Agregar cliente" sobre la tabla de clientes.
 */
function inyectarBotonNuevoCliente() {
  const seccion = document.getElementById("deben-pagar");
  if (!seccion) return;
  const btn = document.createElement("button");
  btn.id = "btn-nuevo-cliente";
  btn.textContent = "➕ Agregar cliente";
  btn.addEventListener("click", abrirModalNuevoCliente);
  seccion.insertBefore(btn, seccion.querySelector("table"));
}

/**
 * Agrega una columna de acciones al encabezado de la tabla de productos.
 */
function inyectarColumnaAccionesProductos() {
  const thead = document.querySelector("#productos table thead tr");
  if (!thead) return;
  const th = document.createElement("th");
  th.textContent = "Acciones";
  thead.appendChild(th);
}

/**
 * Agrega una columna de acciones al encabezado de la tabla de clientes.
 */
function inyectarColumnaAccionesClientes() {
  const thead = document.querySelector("#deben-pagar table thead tr");
  if (!thead) return;
  const th = document.createElement("th");
  th.textContent = "Acciones";
  thead.appendChild(th);
}

/**
 * Crea e inyecta el modal de edición de productos en el body.
 */
function inyectarModalProducto() {
  const modal = document.createElement("div");
  modal.id = "modal-producto";
  modal.className = "modal-overlay";
  modal.setAttribute("hidden", "");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "modal-prod-titulo");

  modal.innerHTML = `
    <div class="modal-caja">
      <h3 id="modal-prod-titulo">Producto</h3>
      <label for="modal-prod-nombre">Nombre del producto</label>
      <input type="text" id="modal-prod-nombre" maxlength="60" />
      <label for="modal-prod-precio">Precio ($)</label>
      <input type="number" id="modal-prod-precio" min="0" step="100" />
      <label for="modal-prod-descuento">Descuento (%)</label>
      <input type="number" id="modal-prod-descuento" min="0" max="100" step="1" />
      <input type="hidden" id="modal-prod-id" />
      <p id="error-prod" class="error-msg" aria-live="polite"></p>
      <div class="modal-botones">
        <button id="btn-guardar-prod">💾 Guardar</button>
        <button id="btn-cancelar-prod">✖ Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("btn-guardar-prod").addEventListener("click", guardarProducto);
  document.getElementById("btn-cancelar-prod").addEventListener("click", () => cerrarModal("modal-producto"));
}

/**
 * Crea e inyecta el modal de edición/creación de clientes en el body.
 */
function inyectarModalCliente() {
  const modal = document.createElement("div");
  modal.id = "modal-cliente";
  modal.className = "modal-overlay";
  modal.setAttribute("hidden", "");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "modal-cli-titulo");

  modal.innerHTML = `
    <div class="modal-caja">
      <h3 id="modal-cli-titulo">Cliente</h3>
      <label for="modal-cli-nombre">Nombre</label>
      <input type="text" id="modal-cli-nombre" maxlength="60" />
      <label for="modal-cli-total">Total que debe ($)</label>
      <input type="number" id="modal-cli-total" min="0" step="100" />
      <input type="hidden" id="modal-cli-id" />
      <p id="error-cli" class="error-msg" aria-live="polite"></p>
      <div class="modal-botones">
        <button id="btn-guardar-cli">💾 Guardar</button>
        <button id="btn-cancelar-cli">✖ Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("btn-guardar-cli").addEventListener("click", guardarCliente);
  document.getElementById("btn-cancelar-cli").addEventListener("click", () => cerrarModal("modal-cliente"));
}

// ---------------------------------------------------------------
// ESTILOS DINÁMICOS (modo oscuro + modales)
// Inyectados desde JS para mantener el HTML limpio
// ---------------------------------------------------------------

/**
 * Inyecta los estilos CSS necesarios para los modales y el modo oscuro.
 */
function inyectarEstilos() {
  const style = document.createElement("style");
  style.textContent = `
    /* Botón modo oscuro */
    #btn-modo {
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(0,0,0,0.15);
      border: 1px solid rgba(0,0,0,0.3);
      border-radius: 20px;
      padding: 6px 14px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    #btn-modo:hover { background: rgba(0,0,0,0.25); }

    /* Botón agregar producto */
    #btn-nuevo-producto {
      display: block;
      margin-bottom: 12px;
      background: #1abc9c;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      font-weight: 600;
    }
    #btn-nuevo-producto:hover { background: #17a589; }

    /* Botón agregar cliente */
    #btn-nuevo-cliente {
      display: block;
      margin-bottom: 12px;
      background: #1abc9c;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      font-weight: 600;
    }
    #btn-nuevo-cliente:hover { background: #17a589; }

    /* Botones editar/eliminar en tablas */
    .btn-editar-prod, .btn-editar-cli, .btn-eliminar-cli {
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 13px;
      cursor: pointer;
      margin: 2px;
    }
    .btn-editar-prod, .btn-editar-cli { background: #f0f0f0; }
    .btn-editar-prod:hover, .btn-editar-cli:hover { background: #ddd; }
    .btn-eliminar-prod, .btn-eliminar-cli { background: #fdecea; }
    .btn-eliminar-prod:hover, .btn-eliminar-cli:hover { background: #f5b5b0; }

    /* Modal overlay */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-overlay[hidden] { display: none; }

    /* Caja del modal */
    .modal-caja {
      background: #fff;
      border-radius: 12px;
      padding: 28px 32px;
      min-width: 300px;
      max-width: 420px;
      width: 90%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    }
    .modal-caja h3 { margin-bottom: 4px; font-size: 18px; }
    .modal-caja label { font-size: 14px; font-weight: 600; margin-top: 4px; }
    .modal-caja input[type="number"],
    .modal-caja input[type="text"] {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px 10px;
      font-family: inherit;
      font-size: 15px;
      width: 100%;
    }
    .modal-caja input:focus { outline: 2px solid #1abc9c; border-color: transparent; }
    .modal-botones { display: flex; gap: 10px; margin-top: 6px; }
    .modal-botones button {
      flex: 1;
      padding: 9px;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      font-weight: 600;
    }
    .modal-botones button:first-child { background: #1abc9c; }
    .modal-botones button:first-child:hover { background: #17a589; }
    .modal-botones button:last-child { background: #eee; }
    .modal-botones button:last-child:hover { background: #ddd; }
    .error-msg { color: #c0392b; font-size: 13px; min-height: 18px; }

    /* ── MODO OSCURO ── */
    body.modo-oscuro {
      background-color: #111 !important;
      color: #e0e0e0 !important;
    }
    body.modo-oscuro header {
      background-color: #1a1a1a !important;
      color: #e0e0e0 !important;
    }
    body.modo-oscuro .hero {
      background-color: #000 !important;
    }
    body.modo-oscuro section {
      background-color: #1e1e1e !important;
      color: #e0e0e0 !important;
    }
    body.modo-oscuro footer {
      background-color: #1a1a1a !important;
      color: #e0e0e0 !important;
    }
    body.modo-oscuro table { color: #e0e0e0; }
    body.modo-oscuro th { background-color: #2a2a2a !important; color: #e0e0e0; }
    body.modo-oscuro td { border-bottom-color: #333 !important; }
    body.modo-oscuro tr:last-child { background-color: #2a2a2a !important; }
    body.modo-oscuro .modal-caja { background: #1e1e1e; color: #e0e0e0; }
    body.modo-oscuro .modal-caja input { background: #2a2a2a; color: #e0e0e0; border-color: #444; }
    body.modo-oscuro .btn-editar-prod,
    body.modo-oscuro .btn-editar-cli { background: #2a2a2a; color: #e0e0e0; }
    body.modo-oscuro .btn-eliminar-prod,
    body.modo-oscuro .btn-eliminar-cli { background: #3a1f1f; color: #f5b5b0; }
    body.modo-oscuro #btn-modo { border-color: rgba(255,255,255,0.2); color: #e0e0e0; }
    body.modo-oscuro a { color: #1abc9c; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------------------------

/**
 * Punto de entrada principal. Inicializa todos los componentes
 * cuando el DOM está completamente cargado.
 */
function init() {
  inyectarEstilos();
  inyectarBotonModo();
  inyectarModalProducto();
  inyectarModalCliente();
  inyectarColumnaAccionesProductos();
  inyectarColumnaAccionesClientes();
  inyectarBotonNuevoProducto();
  inyectarBotonNuevoCliente();
  renderizarProductos();
  renderizarClientes();
  restaurarModo();
  inyectarBuscadorProductos();
}

document.addEventListener("DOMContentLoaded", init);

const botonMenu = document.getElementById("btn-menu");
const menuNav = document.getElementById("menu-nav");

botonMenu.addEventListener("click", () => {
    menuNav.classList.toggle("activo");
});