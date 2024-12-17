import { useEffect, useState, useRef } from 'react';
import './wasm_exec.js';  // Import the wasm_exec.js file for Go-Wasm compatibility
import './wasmTypes.d.ts'
import './App.css';




function generateSHA256(n) {
  return new Promise((resolve) => {
    const res = window.generateSHA256(n);  
    resolve(res);
  });
}


const App = () => {
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);
  // const [wasmResult, setWasmResult] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const benchmarkData = useRef({ startTime: 0, hashCount: 0, totalTime: 0 });
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // useEffect hook to load WebAssembly when the component mounts
  useEffect(() => {
    // Function to asynchronously load WebAssembly
    async function loadWasm() {
      // Create a new Go object
      const goWasm = new window.Go();  

      const response = await fetch("./main.wasm");
      const buffer = await response.arrayBuffer();

      const result = await WebAssembly.instantiate(buffer ,goWasm.importObject 
      );
      // Run the Go program with the WebAssembly instance
      goWasm.run(result.instance);  
      setIsWasmLoaded(true); 
    }
    loadWasm(); 

  }, []);  

  const startBenchmark = () => {
    setIsBenchmarking(true);
    setElapsedTime(0);
    benchmarkData.current = { startTime: Date.now(), hashCount: 0, totalTime: 0 };
    
    // Timer for updating the display
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - benchmarkData.current.startTime) / 1000);
    }, 100);

    intervalRef.current = setInterval(async () => {
      const startTime = performance.now();
      const i = Math.floor(Math.random() * 100);
      await generateSHA256(i.toString());
      const endTime = performance.now();
      
      benchmarkData.current.hashCount++;
      benchmarkData.current.totalTime += (endTime - startTime);
      
      if (Date.now() - benchmarkData.current.startTime >= 20000) {
        stopBenchmark();
      }
    }, 0);
  };

  const stopBenchmark = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      setIsBenchmarking(false);
      
      const totalTime = Date.now() - benchmarkData.current.startTime;
      const hashesPerSecond = (benchmarkData.current.hashCount / totalTime) * 1000;
      const averageTimePerHash = benchmarkData.current.totalTime / benchmarkData.current.hashCount;
      
      setBenchmarkResults({
        totalHashes: benchmarkData.current.hashCount,
        hashesPerSecond: hashesPerSecond.toFixed(2),
        averageTimePerHash: averageTimePerHash.toFixed(2)
      });
    }
  };

  // Function to handle button click and initiate WebAssembly calculation
  // const handleClickButton = async () => {
  //   const n = 23;  // Choose a value for n

  //   console.log('Starting WebAssembly calculation...');
  //   const wasmStartTime = performance.now();

  //   try {
  //     // Call the wasmFibonacciSum function asynchronously
  //     const result = await generateSHA256(n);  
  //     setWasmResult(result); 
  //     console.log('WebAssembly Result:', result);
  //   } catch (error) {
  //     console.error('WebAssembly Error:', error);
  //   }

  //   const wasmEndTime = performance.now();
  //   console.log(`WebAssembly Calculation Time: ${wasmEndTime - wasmStartTime} ms`);
  // };

  // JSX markup for the React component
  return (
    <div className="container">
      <div className={`status-badge ${isWasmLoaded ? 'loaded' : 'not-loaded'}`}>
        {isWasmLoaded ? 'WASM Ready' : 'Loading WASM...'}
      </div>

      {isWasmLoaded && !isBenchmarking && (
        <button 
          className="benchmark-button start-button"
          onClick={startBenchmark}
        >
          Start<br/>Benchmark
        </button>
      )}
      
      {isBenchmarking && (
        <div className="benchmarking-progress">
          Running Benchmark...<br/>
          {elapsedTime.toFixed(1)}s / 20s
        </div>
      )}
      
      {benchmarkResults && (
        <div className="results-container">
          <h2 className="results-title">Benchmark Results</h2>
          <div className="result-item">
            <strong>Total Hashes:</strong> {benchmarkResults.totalHashes.toLocaleString()}
          </div>
          <div className="result-item">
            <strong>Hashes per second:</strong> {benchmarkResults.hashesPerSecond.toLocaleString()} h/s
          </div>
          <div className="result-item">
            <strong>Average time per hash:</strong> {benchmarkResults.averageTimePerHash} ms
          </div>
        </div>
      )}
    </div>
  );
};

export default App;