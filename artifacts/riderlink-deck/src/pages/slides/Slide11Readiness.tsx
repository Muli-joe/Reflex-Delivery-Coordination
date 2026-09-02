export default function Slide11Readiness() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#ebe9e2] text-text">
      <div className="absolute right-[8vw] top-[9vh] h-[14vw] w-[14vw] rounded-full bg-accent/55" />
      <div className="relative flex h-full flex-col px-[7vw] py-[6vh]">
        <div className="flex items-center justify-between font-body text-[1vw] font-bold uppercase tracking-[.24em] text-primary"><span>10 / Readiness</span><span className="text-muted">RiderLink</span></div>
        <div className="mt-[8vh] grid flex-1 grid-cols-[.9fr_1.1fr] gap-[8vw]">
          <div className="flex flex-col justify-center"><div className="mb-[2.2vh] font-body text-[1vw] font-bold uppercase tracking-[.24em] text-coral">The current state</div><h2 className="max-w-[36vw] font-display text-[4.7vw] font-extrabold leading-[.94] tracking-[-.07em]">Ready for the next delivery</h2><div className="mt-[4vh] flex items-center gap-[1vw] font-body text-[1.2vw] text-muted"><span className="h-[.75vw] w-[.75vw] rounded-full bg-primary" /> Build confidence is high</div></div>
          <div className="self-center space-y-[1vw]"><div className="flex items-center gap-[1.2vw] border-b border-primary/20 pb-[1.3vw]"><span className="grid h-[3.4vw] w-[3.4vw] place-items-center rounded-full bg-primary font-display text-[1.5vw] text-accent">✓</span><span className="font-body text-[1.65vw]">Frontend production build passes</span></div><div className="flex items-center gap-[1.2vw] border-b border-primary/20 pb-[1.3vw]"><span className="grid h-[3.4vw] w-[3.4vw] place-items-center rounded-full bg-primary font-display text-[1.5vw] text-accent">✓</span><span className="font-body text-[1.65vw]">API build and workspace checks pass</span></div><div className="flex items-center gap-[1.2vw] border-b border-primary/20 pb-[1.3vw]"><span className="grid h-[3.4vw] w-[3.4vw] place-items-center rounded-full bg-primary font-display text-[1.5vw] text-accent">✓</span><span className="font-body text-[1.65vw]">Web and API workflows run cleanly</span></div><div className="mt-[2vw] border border-primary/15 bg-bg p-[1.5vw]"><div className="font-body text-[.9vw] font-bold uppercase tracking-[.18em] text-muted">Next step</div><div className="mt-[1vh] font-display text-[1.8vw] font-bold">RiderLink is ready to move from preview to publishing</div></div></div>
        </div>
        <div className="flex justify-between font-body text-[1vw] text-muted"><span>Verified in the workspace</span><span>11 / 12</span></div>
      </div>
    </div>
  );
}