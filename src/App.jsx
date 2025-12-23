
import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './layouts/Layout';
import SpaceView from './components/SpaceView';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <AppProvider>
        <Layout>
          <SpaceView />
        </Layout>
      </AppProvider>
    </NotificationProvider>
  );
}

export default App;
