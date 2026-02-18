
const DATA = "dataset/videogames_long.csv";



// Visualization 1: Global Sales by Genre and Platform (Heatmap) 
const vis1 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "url": DATA },
  "width": 720,
  "height": 420,
  "transform": [
    { "filter": "datum.Region === 'Global'" },
    {
      "aggregate": [{ "op": "sum", "field": "Sales", "as": "TotalSales" }],
      "groupby": ["Genre", "Platform"]
    }
  ],
  "mark": "rect",
  "encoding": {
    "x": { "field": "Platform", "type": "nominal", "sort": "-color", "title": "Platform" },
    "y": { "field": "Genre", "type": "nominal", "title": "Genre" },
    "color": { "field": "TotalSales", "type": "quantitative", "title": "Total Global Sales (M)" },
    "tooltip": [
      { "field": "Genre", "type": "nominal" },
      { "field": "Platform", "type": "nominal" },
      { "field": "TotalSales", "type": "quantitative", "format": ".2f", "title": "Global Sales (M)" }
    ]
  }
};

// Visualization 2: Sales Over Time (Top 5 Platforms) 
const vis2 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "url": DATA },
  "width": 720,
  "height": 380,
  "transform": [
    { "filter": "datum.Region === 'Global' && datum.Year != null" },

    // Rank platforms by total global sales
    {
      "joinaggregate": [{ "op": "sum", "field": "Sales", "as": "PlatformTotal" }],
      "groupby": ["Platform"]
    },
    {
      "window": [{ "op": "rank", "as": "PlatformRank" }],
      "sort": [{ "field": "PlatformTotal", "order": "descending" }]
    },
    { "filter": "datum.PlatformRank <= 5" },

    // Aggregate by year/platform
    {
      "aggregate": [{ "op": "sum", "field": "Sales", "as": "YearSales" }],
      "groupby": ["Year", "Platform"]
    }
  ],
  "mark": { "type": "line", "point": true },
  "encoding": {
    "x": { "field": "Year", "type": "quantitative", "title": "Year" },
    "y": { "field": "YearSales", "type": "quantitative", "title": "Global Sales (M)" },
    "color": { "field": "Platform", "type": "nominal", "title": "Platform" },
    "tooltip": [
      { "field": "Year", "type": "quantitative" },
      { "field": "Platform", "type": "nominal" },
      { "field": "YearSales", "type": "quantitative", "format": ".2f", "title": "Sales (M)" }
    ]
  }
};

//  Visualization 3: Regional Sales vs Platform (Top 10 Platforms, stacked) 
const vis3 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "url": DATA },
  "width": 720,
  "height": 420,
  "transform": [
    { "filter": "datum.Region !== 'Global'" },

    // Rank platforms by total regional sales to keep chart readable
    {
      "joinaggregate": [{ "op": "sum", "field": "Sales", "as": "PlatformTotal" }],
      "groupby": ["Platform"]
    },
    {
      "window": [{ "op": "rank", "as": "PlatformRank" }],
      "sort": [{ "field": "PlatformTotal", "order": "descending" }]
    },
    { "filter": "datum.PlatformRank <= 10" },

    // Aggregate by platform/region
    {
      "aggregate": [{ "op": "sum", "field": "Sales", "as": "RegionSales" }],
      "groupby": ["Platform", "Region"]
    }
  ],
  "mark": "bar",
  "encoding": {
    "x": { "field": "Platform", "type": "nominal", "sort": "-y", "title": "Platform" },
    "y": { "field": "RegionSales", "type": "quantitative", "title": "Sales (M)" },
    "color": { "field": "Region", "type": "nominal", "title": "Region" },
    "tooltip": [
      { "field": "Platform", "type": "nominal" },
      { "field": "Region", "type": "nominal" },
      { "field": "RegionSales", "type": "quantitative", "format": ".2f", "title": "Sales (M)" }
    ]
  }
};

//  Visualization 4: Visual Story (JP vs NA by Genre) 
const vis4 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "url": DATA },
  "width": 720,
  "height": 420,
  "transform": [
    { "filter": "datum.Region === 'JP' || datum.Region === 'NA'" },
    {
      "aggregate": [{ "op": "sum", "field": "Sales", "as": "TotalSales" }],
      "groupby": ["Genre", "Region"]
    }
  ],
  "mark": "bar",
  "encoding": {
    "y": { "field": "Genre", "type": "nominal", "sort": "-x", "title": "Genre" },
    "x": { "field": "TotalSales", "type": "quantitative", "title": "Sales (M)" },
    "color": { "field": "Region", "type": "nominal", "title": "Region" },
    "tooltip": [
      { "field": "Genre", "type": "nominal" },
      { "field": "Region", "type": "nominal" },
      { "field": "TotalSales", "type": "quantitative", "format": ".2f", "title": "Sales (M)" }
    ]
  }
};

//  Render all charts 
vegaEmbed("#vis1", vis1, { actions: false });
vegaEmbed("#vis2", vis2, { actions: false });
vegaEmbed("#vis3", vis3, { actions: false });
vegaEmbed("#vis4", vis4, { actions: false });
