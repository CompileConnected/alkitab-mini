import React, { useEffect, useState } from 'react';
import Head from '../components/head';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FolderIcon from '@material-ui/icons/Folder';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AppBar from '@material-ui/core/AppBar';
import HomeIcon from '../components/HomeIcon';

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
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    container: {
        flexGrow: 1
    },
    verse: {
        textAlign: 'center',
        fontSize: '1.2rem'
    },
    hero: {
        width: '100%',
        color: "#333"
    },
    title: {
        margin: "0",
        width: "100%",
        paddingTop: "80px",
        lineHeight: "1.15",
        fontSize: "48px",
        textAlign: 'center'
    },
    description: {
        textAlign: "center"
    }
});

const Home = () => {
    const [verse, setVerse] = useState(null);
    const [menu, setMenu] = React.useState("");

    const classes = useStyles();

    const handleChange = (event, newValue) => {
        setMenu(newValue);
    };

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
            <div className={classes.hero}>
                <h1 className={classes.title}>Welcome to Alkitab Mini!</h1>
                <p className={classes.description}>
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
            <AppBar position="fixed" color="default" className={classes.appBar}>
                <BottomNavigation value={menu} onChange={handleChange}>
                    <BottomNavigationAction label="Home" value="" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Favorites" value="favorites" icon={<FavoriteIcon />} />
                    <BottomNavigationAction label="Nearby" value="nearby" icon={<LocationOnIcon />} />
                    <BottomNavigationAction label="Folder" value="folder" icon={<FolderIcon />} />
                </BottomNavigation>
            </AppBar>

        </div>
    );
};

export default Home;
