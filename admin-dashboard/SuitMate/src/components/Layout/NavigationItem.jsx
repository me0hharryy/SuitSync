import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { motion } from 'framer-motion';

const NavigationItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <ListItem
        button
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          bgcolor: isActive ? '#669BBC' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? '#003049' : 'action.hover',
          },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isActive && (
          <motion.div
            layoutId="activeBackground"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              zIndex: 0,
            }}
          />
        )}
        
        <ListItemIcon
          sx={{
            color: isActive ? 'primary.contrastText' : 'text.secondary',
            minWidth: 40,
            zIndex: 1,
          }}
        >
          <Icon />
        </ListItemIcon>
        
        <ListItemText
          primary={item.text}
          sx={{
            zIndex: 1,
            '& .MuiListItemText-primary': {
              fontWeight: isActive ? 600 : 400,
            },
          }}
        />
        
        {isActive && (
          <Box
            sx={{
              width: 4,
              height: 20,
              bgcolor: 'primary.contrastText',
              borderRadius: 2,
              zIndex: 1,
            }}
          />
        )}
      </ListItem>
    </motion.div>
  );
};

export default NavigationItem;
