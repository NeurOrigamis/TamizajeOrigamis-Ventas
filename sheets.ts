// src/lib/sheets.ts
export async function sendToSheetForm(payload: {
  nombre: string; email: string; sessionId?: string; userAgent?: string;
  scoreTotal?: number; scoreEstres?: number; scoreAnimo?: number; scoreConfianza?: number;
}) {
  const WEB_APP_URL =
    'https://script.google.com/macros/s/AKfycbwSKwcsM_A4y6kltBmZqG8QEvLCCMtoomTrJFQ9A_OTv4oGSyyJ77O0X-fyY74IFFF2QA/exec';

  const body = new URLSearchParams({
    nombre: payload.nombre ?? '',
    email: payload.email ?? '',
    sessionId: payload.sessionId ?? '',
    userAgent: payload.userAgent ?? '',
    scoreTotal: String(payload.scoreTotal ?? ''),
    scoreEstres: String(payload.scoreEstres ?? ''),
    scoreAnimo: String(payload.scoreAnimo ?? ''),
    scoreConfianza: String(payload.scoreConfianza ?? '')
  }).toString();

  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // ← clave para no mostrar error de CORS en el navegador
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
    // Nota: en 'no-cors' la respuesta es opaca; no intentes leer res.status ni res.json()
  } catch (e) {
    // Opcional: solo log local; no afecta el guardado en la hoja
    console.error('[sendToSheetForm] (no-cors) error no bloqueante:', e);
  }
}
