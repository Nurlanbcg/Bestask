
import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './layouts/Layout';
import SpaceView from './components/SpaceView';

function App() {
  return (
    <AppProvider>
      <Layout>
        <SpaceView />
      </Layout>
    </AppProvider>
  );
}

export default App;
