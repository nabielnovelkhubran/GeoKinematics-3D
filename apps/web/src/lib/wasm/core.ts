/**
 * Invokes the wasm-pack binding generated from geokinematics-core.
 * The alias keeps generated output behind this application-facing boundary.
 */
export async function readCoreBoundary(): Promise<string> {
  const wasm = await import('@geokinematics/wasm-core');
  await wasm.default();
  return wasm.boundary_probe();
}
