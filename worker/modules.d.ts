// The Cloudflare Vite plugin imports .wasm files as compiled modules.
declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}
