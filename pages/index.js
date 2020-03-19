import React, { useEffect, useState } from 'react';
import Head from '../components/head';
import AppbarMobile from '../components/AppBar';
import { isMobile } from "react-device-detect"
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

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
  container: {
    flexGrow: 1
  },
  verse: {
    textAlign: 'center',
    fontSize: '1.2rem'
  },

});



const Home = () => {
  const [verse, setVerse] = useState(null);
  const classes = useStyles();


  useEffect(() => {
    async function getVerse () {
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
          <div className={classes.container}>
            <Grid container spacing={3}>
              <Grid item xs={12} className={classes.verse}>
                {verse}
              </Grid>
            </Grid>
          </div>
        </Paper>
      </div>
      <AppbarMobile isMobile={isMobile}/>
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
