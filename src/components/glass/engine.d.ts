export type GlassStage = {
  snap(value: number): void;
  readonly scroll: number;
  readonly pieces: { name: string; points: number }[];
  destroy(): void;
};
export function mountGlassStage(options: {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  shapeUrl: string;
  palette: [string, string, string, string, string];
  fragments?: number;
  onReady?: () => void;
}): Promise<GlassStage>;
