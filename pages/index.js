import React, { useEffect, useState } from 'react';
import Head from '../components/head';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    maxWidth: 'calc(100% - 32px)',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    padding: '0 30px',
  },
});

const Home = () => {
  const [verse, setVerse] = useState(null);
  const classes = useStyles();


  useEffect(() => {
    async function getVerse() {
      const res = await fetch('/api/bible?passage=John%203:16&type=json');
      const newVerse = await res.json();
      setVerse(newVerse[0].text);
    }
    getVerse();
  }, []);

  return (
    <div>
      <Head title="Home" />
      <div className="hero">
        <h1 className="title">Welcome to Alkitab Mini!</h1>
        <p className="description">
          this project still on progress.. so you will see some changes
        </p>

        <Paper className={classes.root}>
          <div className="verses">
            <div className="verse">
              {verse}
            </div>
          </div>
        </Paper>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

        <p className="description">
          <h2><b>Capablities</b></h2>
          <br /> 1. instalable -> it's means that you can install to your android or ios
          <br /> 2. Small and fast
        </p>
        <p className="description">
          <h2><b>Road map and features it will be here</b></h2>
          <br />1. verses and author
          <br />2. search verse
          <br />3. polishing ui
          <br />4. dark mode
          <br />5. fullscreen verse
          <br />6. offline verse or bible
          <br />7. verse of the day
          <br />8. other bible language
          <br />9. shareable verse
          <br />10. text to speech 
        </p>
        <p className="description">
          This project is develop by one person only, myself
          <br /> some feature will be slow release because day by day im working 
          <br /> why am i doing this, when there's so many people already develop this kinda like
          <br /> Alkitab it's mean Bible in english
          <br /> Alkitab is how in Bahasa Indonesia say it
          <br /> the true purpose i make this is to make every people in Indonesia
          <br /> is able to access Alkitab in such low internet with some good ui
          <br /> people may debate this good ui is not necessary
          <br /> some people may say don't need all this features
          <br /> I would say i agree
          <br /> But that's all other bible website do, the job is done.
          <br /> What I want is to use all of capablities and features that web has provided
          <br /> in very very cheap data usage, just to spread bible verse
        </p>
        {/* <p className="description">
          back to the start, bible i provided is in english
          <br />if someone able provided me Alkitab terjemahan baru in json/csv/(free)api not in pdf or documents 
          <br /> please contact me @yokho95@gmail.com
        </p> */}
      </div>

      <style jsx>{`
        .hero {
          width: 100%;
          color: #333;
        }
        .title {
          margin: 0;
          width: 100%;
          padding-top: 80px;
          line-height: 1.15;
          font-size: 48px;
        }
        .title,
        .description {
          text-align: center;
        }
        .row {
          max-width: 880px;
          margin: 80px auto 40px;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
        }
        .verse {
          max-width: calc(100% - 32px)
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          text-align: center;
          font-size:24px;
        }
        @media only screen and (min-device-width : 320px) and (max-device-width : 480px) {
          .verses {
            width:80%;
            padding:0px;
          }
        }
        .verses{
          background-color:#1a9ee6;
          width:50%;
          margin-left:auto;
          margin-right:auto;
          background:transparent;
          padding:20px;
        }
      `}</style>
    </div>
  );
};

export default Home;
