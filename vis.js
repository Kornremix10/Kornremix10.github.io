const DATA = "dataset/videogames_long.csv";

// Shared theme config 
const BASE_CONFIG = {
  background: "transparent",
  axis: {
    labelFontSize: 11,
    titleFontSize: 11,
    titlePadding: 10
  },
  legend: { labelFontSize: 11, titleFontSize: 11 },
  view: { stroke: "transparent" }
};

// Helper to embed with consistent settings
function embed(id, spec) {
  spec.config = { ...BASE_CONFIG, ...(spec.config || {}) };
  vegaEmbed("#" + id, spec, { actions: false }).catch(console.error);
}

/* VIS 1A — Total Global Sales by Genre */
embed("vis1a", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 300,
  data: { url: DATA },
  transform: [
    { aggregate: [{ op: "sum", field: "global_sales", as: "TotalSales" }], groupby: ["genre"] }
  ],
  mark: { type: "bar", cornerRadiusEnd: 6 },
  encoding: {
    y: { field: "genre", type: "nominal", sort: "-x", title: null },
    x: { field: "TotalSales", type: "quantitative", title: "Total Global Sales (Millions)" },
    tooltip: [
      { field: "genre", type: "nominal", title: "Genre" },
      { field: "TotalSales", type: "quantitative", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/* IS 1B — Genre × Platform Heatmap (Top 10 platforms by global sales)*/
embed("vis1b", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 360,
  data: { url: DATA },
  transform: [
    // Rank platforms by total global sales
    {
      joinaggregate: [{ op: "sum", field: "global_sales", as: "PlatformTotal" }],
      groupby: ["platform"]
    },
    {
      window: [{ op: "rank", as: "PlatformRank" }],
      sort: [{ field: "PlatformTotal", order: "descending" }]
    },
    { filter: "datum.PlatformRank <= 10" },

    // Aggregate to genre x platform
    {
      aggregate: [{ op: "sum", field: "global_sales", as: "TotalSales" }],
      groupby: ["genre", "platform"]
    }
  ],
  mark: "rect",
  encoding: {
    x: { field: "platform", type: "nominal", title: "Platform" },
    y: { field: "genre", type: "nominal", title: null, sort: "-color" },
    color: { field: "TotalSales", type: "quantitative", title: "Sales (M)" },
    tooltip: [
      { field: "genre", title: "Genre" },
      { field: "platform", title: "Platform" },
      { field: "TotalSales", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/* VIS 2A — Total Global Sales Per Year */
embed("vis2a", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 260,
  data: { url: DATA },
  transform: [
    { filter: "isValid(datum.year) && datum.year != null" },
    { aggregate: [{ op: "sum", field: "global_sales", as: "YearlySales" }], groupby: ["year"] }
  ],
  mark: { type: "line", point: true },
  encoding: {
    x: { field: "year", type: "quantitative", title: "Year" },
    y: { field: "YearlySales", type: "quantitative", title: "Total Global Sales (M)" },
    tooltip: [
      { field: "year", title: "Year" },
      { field: "YearlySales", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/*VIS 2B — Genre Sales Trends (Top 6 genres by global sales)*/
embed("vis2b", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 320,
  data: { url: DATA },
  transform: [
    { filter: "isValid(datum.year) && datum.year != null" },

    // Rank genres by total global sales
    {
      joinaggregate: [{ op: "sum", field: "global_sales", as: "GenreTotal" }],
      groupby: ["genre"]
    },
    {
      window: [{ op: "rank", as: "GenreRank" }],
      sort: [{ field: "GenreTotal", order: "descending" }]
    },
    { filter: "datum.GenreRank <= 6" },

    // Aggregate per year + genre
    {
      aggregate: [{ op: "sum", field: "global_sales", as: "GenreSales" }],
      groupby: ["year", "genre"]
    }
  ],
  mark: { type: "line", point: false },
  encoding: {
    x: { field: "year", type: "quantitative", title: "Year" },
    y: { field: "GenreSales", type: "quantitative", title: "Sales (M)" },
    color: { field: "genre", type: "nominal", title: "Genre" },
    tooltip: [
      { field: "year", title: "Year" },
      { field: "genre", title: "Genre" },
      { field: "GenreSales", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/*  VIS 3A — Regional Sales Share by Platform (normalized stacked)
   Uses sales_region + sales_amount*/
embed("vis3a", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 380,
  data: { url: DATA },
  transform: [
    { filter: "datum.sales_region != null && datum.sales_amount != null" },

    // Rank platforms by total regional sales to keep chart readable
    {
      joinaggregate: [{ op: "sum", field: "sales_amount", as: "PlatformTotal" }],
      groupby: ["platform"]
    },
    {
      window: [{ op: "rank", as: "PlatformRank" }],
      sort: [{ field: "PlatformTotal", order: "descending" }]
    },
    { filter: "datum.PlatformRank <= 10" },

    // Aggregate platform + region
    {
      aggregate: [{ op: "sum", field: "sales_amount", as: "RegSales" }],
      groupby: ["platform", "sales_region"]
    }
  ],
  mark: "bar",
  encoding: {
    y: { field: "platform", type: "nominal", sort: "-x", title: null },
    x: {
      field: "RegSales",
      type: "quantitative",
      stack: "normalize",
      axis: { format: "%" },
      title: "Regional Share"
    },
    color: { field: "sales_region", type: "nominal", title: "Region" },
    tooltip: [
      { field: "platform", title: "Platform" },
      { field: "sales_region", title: "Region" },
      { field: "RegSales", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/*  VIS 3B — NA vs JP Sales by Platform (scatter) */
embed("vis3b", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 360,
  data: { url: DATA },
  transform: [
    { filter: "datum.sales_region === 'na_sales' || datum.sales_region === 'jp_sales'" },
    {
      aggregate: [{ op: "sum", field: "sales_amount", as: "Total" }],
      groupby: ["platform", "sales_region"]
    },
    { pivot: "sales_region", value: "Total", groupby: ["platform"] }
  ],
  mark: { type: "point", filled: true, size: 120 },
  encoding: {
    x: { field: "na_sales", type: "quantitative", title: "Total NA Sales (M)" },
    y: { field: "jp_sales", type: "quantitative", title: "Total Japan Sales (M)" },
    tooltip: [
      { field: "platform", title: "Platform" },
      { field: "na_sales", title: "NA Sales (M)", format: ".2f" },
      { field: "jp_sales", title: "JP Sales (M)", format: ".2f" }
    ]
  }
});

/* VIS 4A — Top 15 Publishers by Total Global Sales */
embed("vis4a", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 320,
  data: { url: DATA },
  transform: [
    {
      aggregate: [{ op: "sum", field: "global_sales", as: "PubSales" }],
      groupby: ["publisher"]
    },
    { window: [{ op: "rank", as: "rank" }], sort: [{ field: "PubSales", order: "descending" }] },
    { filter: "datum.rank <= 15" }
  ],
  mark: { type: "bar", cornerRadiusEnd: 6 },
  encoding: {
    y: { field: "publisher", type: "nominal", sort: "-x", title: null },
    x: { field: "PubSales", type: "quantitative", title: "Total Global Sales (M)" },
    tooltip: [
      { field: "publisher", title: "Publisher" },
      { field: "PubSales", title: "Sales (M)", format: ".2f" }
    ]
  }
});

/* VIS 4B — Top 20 Best-selling games (global) */
embed("vis4b", {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 480,
  data: { url: DATA },
  transform: [
    // Keep one row per game; global_sales repeats across regions, so take max per name/platform/publisher
    {
      aggregate: [{ op: "max", field: "global_sales", as: "Global" }],
      groupby: ["name", "publisher", "platform"]
    },
    { window: [{ op: "rank", as: "rank" }], sort: [{ field: "Global", order: "descending" }] },
    { filter: "datum.rank <= 20" }
  ],
  mark: { type: "bar", cornerRadiusEnd: 6 },
  encoding: {
    y: { field: "name", type: "nominal", sort: "-x", title: null },
    x: { field: "Global", type: "quantitative", title: "Global Sales (M)" },
    color: { field: "publisher", type: "nominal", title: "Publisher" },
    tooltip: [
      { field: "name", title: "Game" },
      { field: "publisher", title: "Publisher" },
      { field: "platform", title: "Platform" },
      { field: "Global", title: "Global Sales (M)", format: ".2f" }
    ]
  }
});
