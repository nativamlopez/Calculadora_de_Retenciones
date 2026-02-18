// ============================
// Calculadora basada en tu lógica Python
// ============================

const $ = (id) => document.getElementById(id);

function round2(x){
  // redondeo normal a 2 decimales
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
}

function ceil2(x){
  // redondeo hacia arriba a 2 decimales (evita efectos raros por float)
  return Math.ceil((Number(x) - 1e-12) * 100) / 100;
}

function calcularMontos({ tipo, bien, liquido }) {
  const liq = Number(liquido);
  if (!Number.isFinite(liq) || liq < 0) return [0,0,0,0,0,0];

  if (tipo === "Factura" || tipo === "Peaje") {
    const mn = round2(liq);
    return [mn, 0, 0, 0, 0, mn];
  }

  if (tipo === "Recibo") {
    const porcentaje = (bien === "SI") ? 92 : 84;

    const mn = round2(liq * 100 / porcentaje);

    // 👇 CLAVE para que te dé 3.27 como tu captura
    const it = ceil2(mn * 0.03);

    const iue   = (bien === "SI")  ? round2(mn * 0.05) : 0;
    const rciva = (bien !== "SI")  ? round2(mn * 0.13) : 0;

    const total = round2(it + iue + rciva);
    return [mn, it, iue, rciva, total, round2(liq)];
  }

  if (tipo === "Viatico" || tipo === "Viático") {
    const mn = round2(liq * 100 / 87);
    const rciva = round2(mn * 0.13);
    return [mn, 0, 0, rciva, rciva, round2(liq)];
  }

  if (tipo === "Planilla" || tipo === "DJ") {
    const mn = round2(liq * 100 / 84);
    const it = round2(mn * 0.03);
    const rciva = round2(mn * 0.13);
    const total = round2(it + rciva);
    return [mn, it, 0, rciva, total, round2(liq)];
  }

  return [0,0,0,0,0,0];
}


function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setCells([mn, it, iue, rciva, total, liq]) {
  $("mn").textContent = money(mn);
  $("it").textContent = money(it);
  $("iue").textContent = money(iue);
  $("rciva").textContent = money(rciva);
  $("total").textContent = money(total);
  $("liqOut").textContent = money(liq);
}

function updateBienVisibility() {
  const tipo = $("tipo").value;
  const wrap = $("bienWrap");
  const isRecibo = (tipo === "Recibo");
  wrap.style.display = isRecibo ? "flex" : "none";
}

function buildHint(tipo, bien) {
  if (tipo === "Recibo") {
    return `Recibo: porcentaje ${bien === "SI" ? "92%" : "84%"}; IT 3%; ${bien === "SI" ? "IUE 5%" : "RC-IVA 13%"}.`;
  }
  if (tipo === "Viatico" || tipo === "Viático") return "Viático: MN = líquido * 100 / 87; RC-IVA 13%.";
  if (tipo === "Planilla") return "Planilla: MN = líquido * 100 / 84; IT 3%; RC-IVA 13%.";
  if (tipo === "DJ") return "DJ: MN = líquido * 100 / 84; IT 3%; RC-IVA 13%.";
  return "Factura/Peaje: MN = líquido; sin retenciones.";
}

// Init
updateBienVisibility();

$("tipo").addEventListener("change", () => {
  updateBienVisibility();
  const tipo = $("tipo").value;
  const bien = $("bien").checked ? "SI" : "NO";
  $("hint").textContent = buildHint(tipo, bien);
});

$("bien").addEventListener("change", () => {
  const tipo = $("tipo").value;
  const bien = $("bien").checked ? "SI" : "NO";
  $("hint").textContent = buildHint(tipo, bien);
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const tipo = $("tipo").value;
  const bien = $("bien").checked ? "SI" : "NO";
  const liquido = $("liquido").value;

  const res = calcularMontos({ tipo, bien, liquido });
  setCells(res);
  $("hint").textContent = buildHint(tipo, bien);
});

$("limpiar").addEventListener("click", () => {
  $("liquido").value = "";
  $("bien").checked = false;
  updateBienVisibility();
  setCells([NaN, NaN, NaN, NaN, NaN, NaN]);
  $("hint").textContent = "Selecciona el tipo y escribe el líquido.";
});
