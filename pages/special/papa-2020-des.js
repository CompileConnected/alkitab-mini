import React, { useEffect, useState } from "react";
import Head from "../../components/head";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import FolderIcon from "@material-ui/icons/Folder";
import RestoreIcon from "@material-ui/icons/Restore";
import FavoriteIcon from "@material-ui/icons/Favorite";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import AppBar from "@material-ui/core/AppBar";
import HomeIcon from "../../components/HomeIcon";

const useStyles = makeStyles({
  rootA: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    maxWidth: "calc(100% - 32px)",
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
  },
  root: {
    height: "100vh",
  },
  appBar: {
    top: "auto",
    bottom: 0,
  },
  container: {
    flexGrow: 1,
    marginTop: "20px",
  },
  verse: {
    textAlign: "center",
    fontSize: "1.2rem",
  },
  hero: {
    width: "100%",
    color: "#333",
  },
  title: {
    margin: "0",
    marginBottom: "20px",
    width: "100%",
    lineHeight: "1.15",
    fontSize: "48px",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  rootMessageContainer: {
    height: "100vh",
    fontSize: "1.2rem",
    fontFamily: "Poppins, sans-serif",
    maxWidth: "calc(100% - 32px)",
    margin: "auto",
  },
  rootMessageNewYear: {
    fontSize: "3rem",
    fontStyle: "bold",
  },
  rootMessageTitle: {
    fontSize: "4.4rem",
    fontStyle: "bold",
  },
  rootMessageTuhan: {
    fontSize: "4rem",
    fontStyle: "bold",
  },
  rootMessageBelieve: {
    paddingTop: "12px",
    fontStyle: "bold",
  },
});

const WebRendering = () => {
  const [verse, setVerse] = useState(null);
  const [menu, setMenu] = React.useState("");

  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setMenu(newValue);
  };

  useEffect(() => {
    async function getVerse() {
      const res = await fetch("/api/bible?passage=John%203:16&type=json");
      const newVerse = await res.json();
      setVerse(newVerse[0].text);
    }
    getVerse();
  }, []);

  return (
    <div>
      <Head title="Buat Papa" />
      <div className={classes.hero}>
        <div className={classes.root}>
          <h1 className={classes.title}>Welcome to Alkitab Mini!</h1>

          <Paper className={classes.rootA}>
            <div className={classes.container}>
              <Grid
                container
                spacing={0}
                justify="center"
                align="center"
                direction="column"
              >
                <Grid item xs={12} className={classes.verse}>
                  {verse}
                </Grid>
              </Grid>
            </div>
          </Paper>
        </div>
        <div className={classes.rootMessageContainer}>
          <div className={classes.rootMessageTitle}>Papa</div>
          <div>Natal ini mungkin berbeda bagi seluruh Indonesia.</div>
          <div>
            Tapi natal ini sama seperti sebelumnya, kita dak bisa rayain bareng
            sama cece atau sama mama
          </div>
        </div>
        <div className={classes.rootMessageContainer}>
          <div className={classes.rootMessageTitle}>Wish</div>
          <div>1. Selalu berdoa</div>
          <div>2. Selalu sehat.</div>
          <div>3. Selalu diberkati</div>
          <div>4. Selalu memberkati</div>
          <div>5. Selalu mengampuni</div>
          <div>6. Selalu kuat</div>
          <div>7. Diberikan hikmat dan pernyertaan Tuhan</div>
        </div>
        <div className={classes.rootMessageContainer}>
          <div className={classes.rootMessageTitle}>Maybe</div>
          <div>
            Mungkin han2 blom bisa jadi apa yang papa doakan waktu itu, tapi
            yang papa harus tau Tuhan selalu menjaga han2, cece, mama, dan
            keluarga yang lain
          </div>
        </div>
        <div className={classes.rootMessageContainer}>
          <div className={classes.rootMessageTitle}>Believe</div>
          <div>
            Terkadang kita sendiri yang menghambat berkat dan janji Tuhan.
          </div>
          <div>
            - yang mungkin <b>lalai</b>
          </div>
          <div>
            - yang mungkin <b>gak melakukan aksi</b>
          </div>
          <div>
            - yang mungkin <b>keras kepala</b>
          </div>
          <div>
            - yang mungkin <b>keras hati</b> nya
          </div>
          <div>
            - yang mungkin <b>kecewa sama Tuhan</b>
          </div>
          <div>
            - yang mungkin <b>gak peka terhadap suara Tuhan</b>
          </div>
          <div className={classes.rootMessageBelieve}>
            Tapi Papa percayalah{" "}
            <b>
              janji Tuhan <u>selalu ditepati</u>.
            </b>
          </div>
        </div>
        <div className={classes.rootMessageContainer}>
          <div className={classes.rootMessageTuhan}>
            {"Tuhan\nSelalu\nMenyertai\nKita"}
          </div>
        </div>
        <div className={classes.rootMessageContainer}>
          <Paper className={classes.rootA}>
            <div className={classes.container}>
              <Grid container spacing={3}>
                <Grid item xs={12} className={classes.verse}>
                  {"Selamat\nNatal\nDan\nTahun\nBaru"}
                </Grid>
                <Grid item xs={12} className={classes.verse}>
                  <FavoriteIcon />
                </Grid>
                <Grid item xs={12} className={classes.verse}>
                  {"han2 dan keluarga"}
                </Grid>
              </Grid>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default WebRendering;
