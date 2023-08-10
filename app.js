const port = process.env.PORT || 5050

const bodyParser = require('body-parser')
const express = require('express')
var logger = require('morgan');
const server = express()
const cors = require('cors')

server.use(logger('dev'));
server.use(cors())
server.use( bodyParser.urlencoded({extended: true}) )
server.use( bodyParser.json() )

server.listen(port, function(){
    console.log("Listening on port: "+ port)
})

server.get("/", function(req, res){
    res.send("OK")
})

server.post("/test", function(req, res){
    console.log(req.body)
    res.send("OK")
})

server.post("/generate-svg", function(req, res){
    console.log(req.body)
    const echarts = require('echarts');

    // In SSR mode the first container parameter is not required
    const chart = echarts.init(null, null, {
      renderer: 'svg', // must use SVG rendering mode
      ssr: true, // enable SSR
      width: 400, // need to specify height and width
      height: 300
    });

    // use setOption as normal
    chart.setOption(req.body.option);

    // Output a string
    const svgStr = chart.renderToSVGString();

    res.send(svgStr)
})

server.post("/generate", function(req, res){
  console.log(req.body)
  const echarts = require('echarts');
  const { createCanvas } = require('canvas');


  const canvas = createCanvas(800, 600);
// ECharts can use the Canvas instance created by node-canvas as a container directly
  const chart = echarts.init(canvas);

  // use setOption as normal
  chart.setOption(req.body.option);

  // Output a string
  res.writeHead(200, {
    'Content-Type': 'image/png'
  });
  res.write(canvas.toBuffer('image/png'));
  res.end();
})