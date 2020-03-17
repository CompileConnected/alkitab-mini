
import fetch from "node-fetch";
const url = 'https://labs.bible.org/api/'


export function handler (req, res) {
    const { method } = req;

    if (method === 'OPTIONS') {
        console.log('preflight');
        res.send();
    } else {
        let queryParam = "";
        if (req.query) {
            const keys = Object.keys(req.query);
            for (let key of keys) {
                console.log(key)
                queryParam += encodeURIComponent(`&${key}=${req.query[key]}`);
            }
            queryParam = "?"+queryParam.substring(1);
        }
        console.log(queryParam);
        fetch(url+queryParam, { mode: 'no-cors' }).then((x) => x.json())
        .then((response) => {
            res.json(response);
            return;
        }).catch((e) => {
            console.log(e);
        })
    }
}
