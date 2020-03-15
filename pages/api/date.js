import Cors from 'micro-cors'
import fetch from "node-fetch";

const cors = Cors({
  allowMethods: ['GET', 'HEAD'],
})

function handler (req, res) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  // res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    console.log('preflight')
    res.send();
  } else {
    // var targetURL = req.header('Target-URL');
    // if (!targetURL) {
    //   res.send(500, { error: 'There is no Target-Endpoint header in the request' });
    //   return;
    // }
    // console.log("REQUEST", req);
    fetch (`https://labs.bible.org/api/?passage=John%203:16&type=json`, { mode: 'no-cors' }).then((x) => {
      return x.json();
    }).then((response) => {
      res.json(response);
      // console.log("Final Response", res);
      return;
    })
    .catch((e) => {
      console.log(e)
    });
  }
}

export default cors(handler);
