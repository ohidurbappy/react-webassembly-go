declare global {
    export interface Window {
      Go: any;
      square: (num1: number) => number;
      generateSHA256: (input: string) => string;
    }
  }
  
  export {};