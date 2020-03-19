import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';

const useStyles = makeStyles({
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    grow: {
        flexGrow: 1,
    }
});

const AppbarMobile = (props) => {
    const isMobile = props.isMobile
    const classes = useStyles();
    
    if (isMobile) {
        return <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="open drawer">
                    <MenuIcon />
                </IconButton>
                <div className={classes.grow} />
                <IconButton color="inherit">
                    <SearchIcon />
                </IconButton>
                <IconButton edge="end" color="inherit">
                    <MoreIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    }
    return <div />
}

export default AppbarMobile;
