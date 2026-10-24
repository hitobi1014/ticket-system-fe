import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import router from '@/router.tsx';
import ServerWakeupBanner from '@/components/common/ServerWakeupBanner.tsx';
import useServerStatusStore from '@/store/serverStatusStore.ts';

function App() {
  const wakeUp = useServerStatusStore((state) => state.wakeUp);

  useEffect(() => {
    wakeUp();
  }, [wakeUp]);

  return (
    <>
      <ServerWakeupBanner />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
