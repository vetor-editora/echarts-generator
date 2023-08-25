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

    chart.setOption(req.body.option);

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

    chart.setOption(req.body.option);

    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.end(canvas.toBuffer('image/png'));
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Error generating image");
  }
});
