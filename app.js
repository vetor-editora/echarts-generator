const port = process.env.PORT || 5050;

const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.listen(port, () => {
  console.log("Listening on port: " + port);
});

const CHART_JS_PATTERN = /"ECHART_JS:(.*?):ECHART_JS_END"/m;

function extractMatches(obj, parentKey, matches) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      extractMatches(obj[key], parentKey ? `${parentKey}.${key}` : key, matches);
    } else if (typeof obj[key] === 'string') {
      const match = CHART_JS_PATTERN.exec(`"${obj[key]}"`);
      if (match) {
        const [, captured] = match;
        const decodedData = Buffer.from(captured, 'base64').toString('utf-8');
        matches.push({ key: parentKey ? `${parentKey}.${key}` : key, value: decodedData });
      }
    }
  }
}

function getDataByKeyString(data, keyString) {
  const keys = keyString.split('.');
  let currentData = data;

  for (const key of keys) {
    if (currentData.hasOwnProperty(key)) {
      currentData = currentData[key];
    } else {
      return undefined;
    }
  }

  return currentData;
}

function setDataByKeyString(data, keyString, value) {
  const keys = keyString.split('.'); // Split the key string into an array of keys
  let currentData = data;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!currentData.hasOwnProperty(key)) {
      const nextKey = keys[i + 1];
      currentData[key] = Number.isNaN(Number(nextKey)) ? {} : [];
    }

    currentData = currentData[key];
  }

  currentData[keys[keys.length - 1]] = value;
}

const GRAPH_FUNCTIONS = {
  'tol_br': function (value) {
    if (value < 1) return '<1';
    if (value > 99) return '>99';
    return value;
  }
}

app.get("/ping", (req, res) => {
  res.status(200).send("pong!");
});

app.post("/generate-svg", (req, res) => {
  try {
    const echarts = require('echarts');

    const chart = echarts.init(null, null, {
      renderer: 'svg',
      ssr: true,
      width: 400,
      height: 300
    });

    chart_data = req.body.option

    var matches = []
    extractMatches(chart_data, '', matches)
    matches.forEach(function (hash) {
      setDataByKeyString(chart_data, hash.key, GRAPH_FUNCTIONS[hash.value]);
    })

    chart.setOption(chart_data);

    const svgStr = chart.renderToSVGString();

    res.send(svgStr);
  } catch (error) {
    console.error("Error generating SVG:", error);
    res.status(500).send("Error generating SVG");
  }
});

app.post("/generate", (req, res) => {
  try {
    const echarts = require('echarts');
    const { createCanvas } = require('canvas');

    const canvas = createCanvas(1280, 720);
    const chart = echarts.init(canvas);

    chart_data = req.body.option;

    echarts.registerTransform(ecStat.transform.clustering);

    var matches = []
    extractMatches(chart_data, '', matches)
    matches.forEach(function (hash) {
      setDataByKeyString(chart_data, hash.key, GRAPH_FUNCTIONS[hash.value]);
    })
    
    chart.setOption(chart_data);

    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.end(canvas.toBuffer('image/png'));
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Error generating image");
  }
});
