import { useEffect } from 'react';
import './App.css';
import { test1, test2 } from './tool';

const App = () => {
  useEffect(() => {
    test1();
    test2();
  }, [])

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
