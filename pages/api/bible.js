import Cors from 'micro-cors'

const GET = Cors({
  allowMethods: ['GET', 'HEAD'],
})

export default GET(require('../../controller/BibleController').handler);
