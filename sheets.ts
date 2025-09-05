export async function sendToSheetForm(payload: {
  nombre: string; email: string; sessionId?: string; userAgent?: string;
  scoreTotal?: number; scoreEstres?: number; scoreAnimo?: number; scoreConfianza?: number;
}) {
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwSKwcsM_A4y6kltBmZqG8QEvLCCMtoomTrJFQ9A_OTv4oGSyyJ77O0X-fyY74IFFF2QA/exec';

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

  // Envío sin preflight y sin error visible por CORS
  await fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  });
}
