(function () {

    const DATA = "dataset/videogames_long.csv";

    // ── Read CSS variables so charts always match your site's theme ─────────────
    function vegaConfig() {
        const cs    = getComputedStyle(document.documentElement);
        const muted = cs.getPropertyValue('--muted').trim()  || '#a9b4c3';
        const line  = cs.getPropertyValue('--line').trim()   || 'rgba(255,255,255,0.10)';
        return {
            background: 'transparent',
            font: cs.getPropertyValue('--font').trim() || 'system-ui, sans-serif',
            axis: {
                domainColor: line,  gridColor: line,
                labelColor:  muted, titleColor: muted,
                tickColor:   line,
                labelFontSize: 11,  titleFontSize: 11, titlePadding: 10
            },
            legend: { labelColor: muted, titleColor: muted, labelFontSize: 11, titleFontSize: 11 },
            title:  { color: muted, fontSize: 12 },
            view:   { stroke: 'transparent' }
        };
    }

    function embed(id, spec) {
        if (!document.getElementById(id)) return;
        spec.config = vegaConfig();
        vegaEmbed('#' + id, spec, { actions: false }).catch(console.error);
    }

    // Colour palette from your --accent and complementary hues
    const C = {
        accent: '#7aa2ff',
        amber:  '#fbbf24',
        green:  '#34d399',
        pink:   '#f472b6',
        red:    '#f87171',
        cyan:   '#38bdf8',
        orange: '#fb923c',
        purple: '#a78bfa',
    };

    // ── VIS 1A: Total Global Sales by Genre (horizontal bar) ─────────────────────
    embed('vis1a', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 300,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { aggregate: [{ op: 'sum', field: 'global_sales', as: 'TotalSales' }], groupby: ['genre'] }
        ],
        mark: { type: 'bar', color: C.accent, cornerRadiusEnd: 6 },
        encoding: {
            x: { field: 'TotalSales', type: 'quantitative', title: 'Total Global Sales (Millions)' },
            y: { field: 'genre', type: 'nominal', sort: '-x', title: null },
            tooltip: [
                { field: 'genre',      title: 'Genre' },
                { field: 'TotalSales', title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 1B: Genre × Platform Heatmap ─────────────────────────────────────────
    embed('vis1b', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 360,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { filter: { field: 'platform', oneOf: ['PS2','X360','PS3','Wii','DS','PS','GBA','PS4','3DS','SNES'] } },
            { aggregate: [{ op: 'sum', field: 'global_sales', as: 'TotalSales' }], groupby: ['genre','platform'] }
        ],
        mark: { type: 'rect' },
        encoding: {
            x: { field: 'platform', type: 'nominal', title: 'Platform' },
            y: { field: 'genre', type: 'nominal', title: null,
                 sort: { op: 'sum', field: 'TotalSales', order: 'descending' } },
            color: {
                field: 'TotalSales', type: 'quantitative', title: 'Sales (M)',
                scale: { scheme: 'blues' }
            },
            tooltip: [
                { field: 'genre',      title: 'Genre' },
                { field: 'platform',   title: 'Platform' },
                { field: 'TotalSales', title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 2A: Global Sales Over Time (area chart) ───────────────────────────────
    embed('vis2a', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 260,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { filter: "datum.year != '' && toNumber(datum.year) > 1979 && toNumber(datum.year) < 2017" },
            { calculate: 'toNumber(datum.year)', as: 'yearNum' },
            { aggregate: [{ op: 'sum', field: 'global_sales', as: 'YearlySales' }], groupby: ['yearNum'] }
        ],
        mark: { type: 'area', color: C.accent, fillOpacity: 0.18,
                line: { color: C.accent, strokeWidth: 2 } },
        encoding: {
            x: { field: 'yearNum', type: 'quantitative', title: 'Year',
                 axis: { format: 'd', labelAngle: -45 } },
            y: { field: 'YearlySales', type: 'quantitative', title: 'Total Global Sales (M)' },
            tooltip: [
                { field: 'yearNum',    title: 'Year',     format: 'd' },
                { field: 'YearlySales', title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 2B: Top 6 Genre Sales Trends Over Time (multi-line) ──────────────────
    // Uses joinaggregate + dense_rank to find the real top 6 genres from the data
    // instead of hardcoding names, so it always works regardless of exact CSV values.
    embed('vis2b', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 320,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { filter: "datum.year != '' && toNumber(datum.year) > 1979 && toNumber(datum.year) < 2017" },
            { aggregate: [{ op: 'sum', field: 'global_sales', as: 'GenreSales' }], groupby: ['year','genre'] },
            { joinaggregate: [{ op: 'sum', field: 'GenreSales', as: 'TotalByGenre' }], groupby: ['genre'] },
            { window: [{ op: 'dense_rank', as: 'genreRank' }],
              sort: [{ field: 'TotalByGenre', order: 'descending' }] },
            { filter: 'datum.genreRank <= 6' }
        ],
        mark: { type: 'line', strokeWidth: 2, point: true },
        encoding: {
            x: { field: 'year', type: 'ordinal', title: 'Year', axis: { labelAngle: -45 } },
            y: { field: 'GenreSales', type: 'quantitative', title: 'Sales (Millions)' },
            color:  { field: 'genre', type: 'nominal', scale: { scheme: 'tableau10' } },
            detail: { field: 'genre', type: 'nominal' },
            tooltip: [
                { field: 'year',       title: 'Year' },
                { field: 'genre',      title: 'Genre' },
                { field: 'GenreSales', title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 3A: Regional Sales Share by Platform (100% normalized stacked bar) ────
    embed('vis3a', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 380,
        data: { url: DATA },
        transform: [
            { filter: { field: 'platform', oneOf: ['PS2','X360','PS3','Wii','DS','PS','GBA','3DS','NES','GB'] } },
            { aggregate: [{ op: 'sum', field: 'sales_amount', as: 'RegSales' }], groupby: ['platform','sales_region'] }
        ],
        mark: { type: 'bar' },
        encoding: {
            x: { field: 'RegSales', type: 'quantitative', stack: 'normalize',
                 axis: { format: '%' }, title: 'Regional Share' },
            y: { field: 'platform', type: 'nominal', title: null,
                 sort: { op: 'sum', field: 'RegSales', order: 'descending' } },
            color: {
                field: 'sales_region', type: 'nominal', title: 'Region',
                scale: {
                    domain: ['na_sales','eu_sales','jp_sales','other_sales'],
                    range:  [C.accent, C.green, C.amber, '#9ca3af']
                },
                legend: {
                    labelExpr: "{'na_sales':'North America','eu_sales':'Europe','jp_sales':'Japan','other_sales':'Other'}[datum.label]"
                }
            },
            tooltip: [
                { field: 'platform',     title: 'Platform' },
                { field: 'sales_region', title: 'Region' },
                { field: 'RegSales',     title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 3B: NA vs Japan Total Sales by Platform (scatter) ────────────────────
    embed('vis3b', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 360,
        data: { url: DATA },
        transform: [
            { filter: { field: 'platform', oneOf: ['PS2','X360','PS3','Wii','DS','PS','GBA','3DS','NES','GB','SNES','N64'] } },
            { filter: "datum.sales_region === 'na_sales' || datum.sales_region === 'jp_sales'" },
            { aggregate: [{ op: 'sum', field: 'sales_amount', as: 'Total' }], groupby: ['platform','sales_region'] },
            { pivot: 'sales_region', value: 'Total', groupby: ['platform'] }
        ],
        mark: { type: 'point', filled: true, size: 130 },
        encoding: {
            x: { field: 'na_sales', type: 'quantitative', title: 'Total NA Sales (Millions)' },
            y: { field: 'jp_sales', type: 'quantitative', title: 'Total Japan Sales (Millions)' },
            color: {
                field: 'platform', type: 'nominal',
                scale: { range: [C.accent, C.amber, C.green, C.pink, C.red,
                                 C.cyan, C.orange, C.purple,
                                 '#f9a8d4','#6ee7b7','#fde68a','#bfdbfe'] }
            },
            tooltip: [
                { field: 'platform', title: 'Platform' },
                { field: 'na_sales', title: 'NA Sales (M)',  format: '.1f' },
                { field: 'jp_sales', title: 'JP Sales (M)', format: '.1f' }
            ]
        }
    });

    // ── VIS 4A: Top 15 Publishers by Total Sales (Nintendo highlighted) ───────────
    embed('vis4a', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 320,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { aggregate: [{ op: 'sum', field: 'global_sales', as: 'PubSales' }], groupby: ['publisher'] },
            { window: [{ op: 'rank', as: 'rank' }], sort: [{ field: 'PubSales', order: 'descending' }] },
            { filter: 'datum.rank <= 15' }
        ],
        mark: { type: 'bar', cornerRadiusEnd: 6 },
        encoding: {
            x: { field: 'PubSales',  type: 'quantitative', title: 'Total Global Sales (Millions)' },
            y: { field: 'publisher', type: 'nominal', sort: '-x', title: null },
            color: {
                condition: { test: "datum.publisher === 'Nintendo'", value: C.amber },
                value: C.accent
            },
            tooltip: [
                { field: 'publisher', title: 'Publisher' },
                { field: 'PubSales',  title: 'Sales (M)', format: '.2f' }
            ]
        }
    });

    // ── VIS 4B: Top 20 Best-Selling Games of All Time ─────────────────────────────
    embed('vis4b', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container', height: 480,
        data: { url: DATA },
        transform: [
            { filter: "datum.sales_region === 'na_sales'" },
            { window: [{ op: 'rank', as: 'rank' }], sort: [{ field: 'global_sales', order: 'descending' }] },
            { filter: 'datum.rank <= 20' }
        ],
        mark: { type: 'bar', cornerRadiusEnd: 6 },
        encoding: {
            x: { field: 'global_sales', type: 'quantitative', title: 'Global Sales (Millions)' },
            y: { field: 'name', type: 'nominal', sort: '-x', title: null },
            color: {
                field: 'publisher', type: 'nominal',
                scale: { scheme: 'tableau10' }
            },
            tooltip: [
                { field: 'name',         title: 'Game' },
                { field: 'publisher',    title: 'Publisher' },
                { field: 'platform',     title: 'Platform' },
                { field: 'global_sales', title: 'Global Sales (M)', format: '.2f' }
            ]
        }
    });

})();