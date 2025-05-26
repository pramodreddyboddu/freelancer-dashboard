import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Gig Matches', path: '/gig-matches' },
    { text: 'Payments', path: '/payments' },
    { text: 'Messages', path: '/messages' },
    { text: 'Profile', path: '/profile' },
    { text: 'Pitch Details', path: '/pitch-details' },
  ];

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ [theme.breakpoints.up('md')]: { display: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="permanent"
        sx={{
          [theme.breakpoints.down('md')]: { display: 'none' },
          '& .MuiDrawer-paper': { width: 250 },
        }}
      >
        <Box sx={{ width: 250, mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          [theme.breakpoints.up('md')]: { display: 'none' },
          '& .MuiDrawer-paper': { width: 250 },
        }}
      >
        <Box sx={{ width: 250, mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
