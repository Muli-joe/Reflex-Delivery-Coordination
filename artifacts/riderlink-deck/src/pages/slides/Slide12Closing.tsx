export default function Slide12Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary text-[#f7f3ec]">
      <div className="absolute -right-[9vw] -top-[16vw] h-[40vw] w-[40vw] rounded-full border-[1.4vw] border-accent/35" />
      <div className="absolute right-[13vw] bottom-[10vh] h-[10vw] w-[10vw] rounded-full bg-accent" />
      <div className="relative flex h-full flex-col justify-between px-[7vw] py-[6vh]">
        <div className="flex items-center gap-[1vw] font-display text-[1.25vw] font-bold tracking-[-.04em]"><span className="grid h-[2.6vw] w-[2.6vw] place-items-center rounded-[.45vw] bg-accent text-primary">R</span><span>RiderLink</span></div>
        <div className="max-w-[65vw]"><div className="mb-[2.5vh] font-body text-[1vw] font-bold uppercase tracking-[.25em] text-accent">The next handoff</div><h2 className="font-display text-[5.7vw] font-extrabold leading-[.94] tracking-[-.075em]">RiderLink</h2><p className="mt-[3vh] max-w-[55vw] font-body text-[2.3vw] leading-[1.06] text-[#dfe8e1]">A calmer way to move every delivery forward.</p><div className="mt-[5vh] h-[.2vw] w-[9vw] bg-accent" /><p className="mt-[3vh] max-w-[50vw] font-body text-[1.55vw] leading-[1.15] text-[#c8d4ce]">Publish the operations desk and give every handoff a clear next step.</p></div>
        <div className="flex items-end justify-between font-body text-[1vw] text-[#c8d4ce]"><span>Project overview · 2026</span><span>12 / 12</span></div>
      </div>
    </div>
  );
}