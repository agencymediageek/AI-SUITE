import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Repeat, Volume2, VolumeX } from "lucide-react";
import VideoTemplate, { SCENE_DURATIONS } from "./VideoTemplate";
import { useSceneControls } from "./useSceneControls";

// ── Progress bar (isolated timer) ────────────────────────────────────────────
const PROGRESS_TICK_MS = 60;

function ProgressSegments({
  sceneKeys, activeIndex, activeDuration, tick, onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const start = performance.now();
    const id = window.setInterval(() => setElapsed(performance.now() - start), PROGRESS_TICK_MS);
    return () => window.clearInterval(id);
  }, [tick]);

  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;

  return (
    <div className="flex-1 flex items-center gap-1.5">
      {sceneKeys.map((key, i) => (
        <button
          key={key}
          onClick={() => onJumpTo(i)}
          className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-4 hover:bg-white/25 transition-all relative min-h-[12px]"
          aria-label={`Jump to scene ${i + 1}`}
          aria-current={i === activeIndex ? 'true' : undefined}
        >
          <div
            className="absolute inset-y-0 left-0 bg-white/90 rounded-full transition-[width] duration-100"
            style={{ width: i === activeIndex ? `${progress * 100}%` : '0%' }}
          />
        </button>
      ))}
    </div>
  );
}

// ── Control bar ───────────────────────────────────────────────────────────────
function ControlBar({
  visible, collapsed, locked, muted,
  sceneKeys, activeIndex, activeDuration, tick,
  onToggleLock, onToggleMute, onJumpTo, onToggleCollapsed,
}: {
  visible: boolean;
  collapsed: boolean;
  locked: boolean;
  muted: boolean;
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onToggleLock: () => void;
  onToggleMute: () => void;
  onJumpTo: (i: number) => void;
  onToggleCollapsed: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-black/60 backdrop-blur-sm px-5 py-4 transition-all duration-200 ease-out border-t border-[#00FF41]/20 ${
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <button
        onClick={onToggleLock}
        className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
          locked ? 'text-[#00FF41] bg-[#00FF41]/15 hover:bg-[#00FF41]/25' : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={locked ? 'Loop current scene: on' : 'Loop current scene: off'}
        aria-pressed={locked}
      >
        <Repeat className="w-8 h-8" />
      </button>

      <button
        onClick={onToggleMute}
        className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
          muted
            ? 'text-[#00FFFF] bg-[#00FFFF]/15 hover:bg-[#00FFFF]/25 animate-pulse'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={muted ? 'Ativar som' : 'Silenciar'}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
      </button>

      <div className="w-px self-stretch bg-white/15" aria-hidden="true" />

      <ProgressSegments
        sceneKeys={sceneKeys}
        activeIndex={activeIndex}
        activeDuration={activeDuration}
        tick={tick}
        onJumpTo={onJumpTo}
      />

      <div className="text-xl text-white/60 font-mono tabular-nums shrink-0">
        {activeIndex + 1}/{sceneKeys.length}
      </div>

      <button
        onClick={onToggleCollapsed}
        className="w-14 h-14 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-lg shrink-0"
        title={collapsed ? 'Mostrar controles' : 'Ocultar controles'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronUp className="w-10 h-10" /> : <ChevronDown className="w-10 h-10" />}
      </button>
    </div>
  );
}

// ── Shared overlays (back + sound hint) ──────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-black/80 transition-all text-sm font-mono"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </button>
  );
}

function SoundHint({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      onClick={onActivate}
      className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFFF]/10 backdrop-blur-sm border border-[#00FFFF]/40 text-[#00FFFF] hover:bg-[#00FFFF]/20 transition-all text-sm font-mono animate-pulse"
    >
      <VolumeX className="w-4 h-4" />
      Toque para ativar o som
    </button>
  );
}

// ── Direct view (new tab): VideoTemplate + overlays, sem controles de pulo ───
// Preserva o fluxo original do useVideoPlayer com SCENE_DURATIONS estático.
function DirectView() {
  const [muted, setMuted] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(false);

  const handleBack = useCallback(() => {
    if (window.opener) window.close();
    else window.location.href = 'https://apex.techsites.ai';
  }, []);

  const handleActivateSound = useCallback(() => {
    setMuted(false);
    setHintDismissed(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* VideoTemplate direto — usa SCENE_DURATIONS estático, sem rotação */}
      <VideoTemplate muted={muted} />

      <BackButton onClick={handleBack} />

      {muted && !hintDismissed && (
        <SoundHint onActivate={handleActivateSound} />
      )}

      {/* Botão mudo flutuante (canto inferior direito) após hint ser dispensado */}
      {hintDismissed && (
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-black/80 transition-all"
          title={muted ? 'Ativar som' : 'Silenciar'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

// ── Main wrapper ──────────────────────────────────────────────────────────────
export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;

  // View direta (nova aba): VideoTemplate sem rotação de cenas (corrige embaralhamento)
  if (!isIframed) return <DirectView />;

  // View em iframe (embutido na landing): controles completos
  return <VideoWithControlsInner />;
}

// ── Iframe view: controles completos com jumpTo/loop ─────────────────────────
function VideoWithControlsInner() {
  const {
    sceneKeys, activeIndex, locked, mountKey, tick,
    durations, activeDuration, onSceneChange, jumpTo, toggleLock,
  } = useSceneControls(SCENE_DURATIONS);

  const [muted, setMuted] = useState(true);
  const [soundHintDismissed, setSoundHintDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);
  const sensorRef = useRef<HTMLDivElement | null>(null);

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setHovering(true);
  }, []);
  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setHovering(false);
  }, []);
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    if (collapsed) setTapPinned(true);
  }, [collapsed]);
  const handleToggleCollapsed = useCallback(() => {
    setCollapsed(c => {
      if (!c) { setHovering(false); setTapPinned(false); }
      return !c;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted(m => {
      if (m) setSoundHintDismissed(true);
      return !m;
    });
  }, []);

  useEffect(() => {
    if (!(collapsed && tapPinned)) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const sensor = sensorRef.current;
      if (sensor && !sensor.contains(e.target as Node)) setTapPinned(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [collapsed, tapPinned]);

  const barVisible = !collapsed || hovering || tapPinned;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop
        muted={muted}
        onSceneChange={onSceneChange}
      />

      {muted && !soundHintDismissed && (
        <SoundHint onActivate={() => { setMuted(false); setSoundHintDismissed(true); }} />
      )}

      <div
        ref={sensorRef}
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col justify-end"
        style={{ height: '25%' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div className="flex-1 w-full" aria-hidden="true" />
        <ControlBar
          visible={barVisible}
          collapsed={collapsed}
          locked={locked}
          muted={muted}
          sceneKeys={sceneKeys}
          activeIndex={activeIndex}
          activeDuration={activeDuration}
          tick={tick}
          onToggleLock={toggleLock}
          onToggleMute={handleToggleMute}
          onJumpTo={jumpTo}
          onToggleCollapsed={handleToggleCollapsed}
        />
      </div>
    </div>
  );
}
