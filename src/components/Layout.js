import React from 'react';
import { styled } from '@mui/material/styles';
import Header from './Header';
import Footer from './Footer';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

function Layout({ children }) {
  return (
    <Root>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </Root>
  );
}

export default Layout;