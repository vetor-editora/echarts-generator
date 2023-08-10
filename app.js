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

server.post("/generate", function(req, res){
    console.log(req.body)
    const echarts = require('echarts');

    // In SSR mode the first container parameter is not required
    const chart = echarts.init(null, null, {
      renderer: 'svg', // must use SVG rendering mode
      ssr: true, // enable SSR
      width: 400, // need to specify height and width
      height: 300
    });

    option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar'
        }
      ]
    };

    // use setOption as normal
    chart.setOption(req.body.option);

    // Output a string
    const svgStr = chart.renderToSVGString();

    res.send(svgStr)
})