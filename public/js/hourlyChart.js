/**
 * 24-Hour Visual Temperature Curve Renderer
 * Renders smooth cubic Bezier temperature trend curve with gradient fill on HTML5 Canvas
 */

export function renderHourlyCurve(canvasId, hourlyData, unit = 'C') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !hourlyData || hourlyData.length === 0) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Set crisp canvas dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  // Convert temperatures if unit is Fahrenheit
  const temps = hourlyData.map(h => unit === 'F' ? Math.round((h.temp * 9/5) + 32) : h.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const availableWidth = width - (paddingX * 2);
  const availableHeight = height - paddingTop - paddingBottom;

  const points = temps.map((temp, index) => {
    const x = paddingX + (index / (temps.length - 1)) * availableWidth;
    const y = paddingTop + availableHeight - ((temp - minTemp) / tempRange) * availableHeight;
    return { x, y, temp, raw: hourlyData[index] };
  });

  // Draw Gradient Fill under Bezier Curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, height - paddingBottom);
  ctx.lineTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
  }

  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.closePath();

  const fillGradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  fillGradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  fillGradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
  ctx.fillStyle = fillGradient;
  ctx.fill();

  // Draw Main Bezier Curve Stroke
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
  }

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Point Nodes & Labels (Every 3 hours to avoid clutter)
  points.forEach((p, i) => {
    if (i % 3 === 0 || i === points.length - 1) {
      // Glow Circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Temperature Text Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.temp}°`, p.x, p.y - 10);

      // Time Text Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 11px Outfit, sans-serif';
      ctx.fillText(p.raw.time, p.x, height - 12);
    }
  });
}
