export default function Slide02CalmerCoordination() {
  return (
    <div className="deck-grid relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute -right-[8vw] -top-[12vw] h-[28vw] w-[28vw] rounded-full border-[1.2vw] border-sage/60" />
      <div className="relative flex h-full flex-col px-[7vw] py-[6vh]">
        <div className="flex items-center justify-between font-body text-[1vw] font-bold uppercase tracking-[.24em] text-primary"><span>01 / The operating gap</span><span className="text-muted">RiderLink</span></div>
        <div className="mt-[8vh] grid flex-1 grid-cols-[1.03fr_.97fr] gap-[7vw]">
          <div>
            <div className="mb-[2.5vh] font-body text-[1vw] font-bold uppercase tracking-[.24em] text-coral">The case for clarity</div>
            <h2 className="max-w-[42vw] font-display text-[4.55vw] font-extrabold leading-[.98] tracking-[-.065em] text-balance">Delivery coordination should feel calmer</h2>
            <div className="mt-[6vh] h-[.25vw] w-[7vw] bg-accent" />
          </div>
          <div className="pt-[1vh]">
            <div className="border-t-[.12vw] border-primary/20 py-[3vh]"><div className="flex gap-[1.5vw]"><span className="font-display text-[1.25vw] font-bold text-accent">01</span><p className="max-w-[29vw] font-body text-[2vw] leading-[1.12]">Dispatchers need one shared view of every delivery</p></div></div>
            <div className="border-t-[.12vw] border-primary/20 py-[3vh]"><div className="flex gap-[1.5vw]"><span className="font-display text-[1.25vw] font-bold text-accent">02</span><p className="max-w-[29vw] font-body text-[2vw] leading-[1.12]">Riders need one clear next step in the field</p></div></div>
            <div className="border-y-[.12vw] border-primary/20 py-[3vh]"><div className="flex gap-[1.5vw]"><span className="font-display text-[1.25vw] font-bold text-accent">03</span><p className="max-w-[29vw] font-body text-[2vw] leading-[1.12]">Teams need delivery state to stay consistent from queue to handoff</p></div></div>
          </div>
        </div>
        <div className="flex items-center gap-[1vw] font-body text-[1vw] text-muted"><span className="h-[.6vw] w-[.6vw] rounded-full bg-coral" /> One shared operational picture</div>
      </div>
    </div>
  );
}