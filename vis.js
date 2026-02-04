(function () {
    // ---- Helpers ---- 
    const NS = "http://www.w3.org/2000/svg";

    function el(name, attrs = {}) { 
        const node = document.createElementNS(NS, name);
        for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
        return node;
    }

    function mountSvg(containerId, width, height, viewBoxPadding = 0) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = "";
        const svg = el("svg",  {
            width: "100%",
            height: height,
            viewBox: `${-viewBoxPadding} ${-viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`,
            role: "img",
        });
        container.appendChild(svg);
        return svg;
    }

    // ======== VIZ 1: SVG BAR CHART =======
    function drawBarChart() {
    const svg = mountSvg("viz1", 900, 420, 0);
    if (!svg) return;

    // Example dataset — change these categories/values to be your own.
    const data = [
      { label: "School", value: 18 },
      { label: "Studying", value: 12 },
      { label: "Projects", value: 8 },
      { label: "Gym", value: 5 },
      { label: "Gaming", value: 4 },
    ];

    const W = 900, H = 420;
    const margin = { top: 30, right: 20, bottom: 70, left: 60 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const maxVal = Math.max(...data.map(d => d.value));
    const xStep = innerW / data.length;
    const barW = Math.min(90, xStep * 0.70);

    // Background
    svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" }));

    const g = el("g", { transform: `translate(${margin.left},${margin.top})` });
    svg.appendChild(g);

    // Axes
    g.appendChild(el("line", { x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: "currentColor", "stroke-opacity": "0.35" }));
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: innerH, stroke: "currentColor", "stroke-opacity": "0.35" }));

    // Y ticks
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const tVal = (maxVal * i) / ticks;
      const y = innerH - (tVal / maxVal) * innerH;

      g.appendChild(el("line", {
        x1: 0, y1: y, x2: innerW, y2: y,
        stroke: "currentColor", "stroke-opacity": "0.10"
      }));

      const t = el("text", {
        x: -10, y: y + 4, "text-anchor": "end",
        "font-size": "12", fill: "currentColor", "fill-opacity": "0.70"
      });
      t.textContent = Math.round(tVal);
      g.appendChild(t);
    }

    // Title
    const title = el("text", {
      x: 0, y: -8,
      "font-size": "14",
      fill: "currentColor",
      "fill-opacity": "0.85"
    });
    title.textContent = "Hours per week (example data)";
    g.appendChild(title);

    // Bars + tooltips
    data.forEach((d, i) => {
      const xCenter = i * xStep + xStep / 2;
      const barH = (d.value / maxVal) * innerH;
      const x = xCenter - barW / 2;
      const y = innerH - barH;

      const bar = el("rect", {
        x, y, width: barW, height: barH,
        rx: 10,
        fill: "rgba(122,162,255,0.55)",
        stroke: "rgba(122,162,255,0.85)",
        "stroke-width": "1"
      });

      // SVG <title> shows tooltip on hover
      const tooltip = el("title");
      tooltip.textContent = `${d.label}: ${d.value} hours`;
      bar.appendChild(tooltip);

      // Value label
      const valText = el("text", {
        x: xCenter,
        y: y - 8,
        "text-anchor": "middle",
        "font-size": "12",
        fill: "currentColor",
        "fill-opacity": "0.8"
      });
      valText.textContent = d.value;

      // X label
      const xText = el("text", {
        x: xCenter,
        y: innerH + 40,
        "text-anchor": "middle",
        "font-size": "12",
        fill: "currentColor",
        "fill-opacity": "0.75"
      });
      xText.textContent = d.label;

      g.appendChild(bar);
      g.appendChild(valText);
      g.appendChild(xText);
    });
}

// ======= viz 2: creative svg art ======
  function drawConstellation() {
    const svg = mountSvg("viz2", 900, 460, 0);
    if (!svg) return;

    const W = 900, H = 460;
    const pad = 30;

    const state = {
      points: [],
      target: { x: W / 2, y: H / 2 },
      strength: 0.08
    };

    function rand(min, max) { return min + Math.random() * (max - min); }

    function seedPoints(n = 70) {
      state.points = Array.from({ length: n }, () => ({
        x: rand(pad, W - pad),
        y: rand(pad, H - pad),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.6, 0.6),
      }));
    }

    const bg = el("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" });
    svg.appendChild(bg);

    const lineLayer = el("g");
    const dotLayer = el("g");
    svg.appendChild(lineLayer);
    svg.appendChild(dotLayer);

    function render() {
      lineLayer.innerHTML = "";
      dotLayer.innerHTML = "";

      // Connect each point to its nearest neighbors (simple approach)
      for (let i = 0; i < state.points.length; i++) {
        const p = state.points[i];

        // Find 2 nearest neighbors
        let best = [];
        for (let j = 0; j < state.points.length; j++) {
          if (i === j) continue;
          const q = state.points[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          best.push({ j, dist });
        }
        best.sort((a, b) => a.dist - b.dist);
        best = best.slice(0, 2);

        best.forEach(({ j, dist }) => {
          if (dist > 130) return;
          const q = state.points[j];
          const opacity = Math.max(0, 0.25 - dist / 600);

          lineLayer.appendChild(el("line", {
            x1: p.x, y1: p.y, x2: q.x, y2: q.y,
            stroke: "currentColor",
            "stroke-opacity": String(opacity),
            "stroke-width": "1"
          }));
        });

        dotLayer.appendChild(el("circle", {
          cx: p.x, cy: p.y, r: 2.2,
          fill: "rgba(233,238,246,0.85)"
        }));
      }
    }

    function step() {
      for (const p of state.points) {
        // attraction to mouse target
        const dx = state.target.x - p.x;
        const dy = state.target.y - p.y;
        p.vx += dx * state.strength * 0.001;
        p.vy += dy * state.strength * 0.001;

        // move
        p.x += p.vx;
        p.y += p.vy;

        // friction
        p.vx *= 0.985;
        p.vy *= 0.985;

        // bounce
        if (p.x < pad) { p.x = pad; p.vx *= -1; }
        if (p.x > W - pad) { p.x = W - pad; p.vx *= -1; }
        if (p.y < pad) { p.y = pad; p.vy *= -1; }
        if (p.y > H - pad) { p.y = H - pad; p.vy *= -1; }
      }

      render();
      requestAnimationFrame(step);
    }

    // Interactions
    svg.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      state.target.x = ((e.clientX - rect.left) / rect.width) * W;
      state.target.y = ((e.clientY - rect.top) / rect.height) * H;
      state.strength = 0.10;
    });

    svg.addEventListener("mouseleave", () => {
      state.target.x = W / 2;
      state.target.y = H / 2;
      state.strength = 0.04;
    });

    const btn = document.getElementById("randomizeArt");
    if (btn) {
      btn.addEventListener("click", () => {
        seedPoints(70);
      });
    }

    seedPoints(70);
    render();
    requestAnimationFrame(step);
  }

  // Run both
  drawBarChart();
  drawConstellation();
})();
