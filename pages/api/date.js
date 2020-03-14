import Cors from 'micro-cors'

const cors = Cors({
  allowMethods: ['GET', 'HEAD'],
})

function handler (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    var targetURL = req.header('Target-URL');
    if (!targetURL) {
      res.send(500, { error: 'There is no Target-Endpoint header in the request' });
      return;
    }
    console.log("REQUEST", req);
    request({ url: targetURL + req.url + req.query},
      function (error, response, body) {
        if (error) {
          console.error('error: ' + response.statusCode)
        }
      }).pipe(res);
  }
}
