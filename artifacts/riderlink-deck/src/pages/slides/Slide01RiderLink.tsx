const base = import.meta.env.BASE_URL;

export default function Slide01RiderLink() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary text-[#f7f3ec]">
      <img src={base + 'hero-riderlink.jpg'} crossOrigin="anonymous" alt="Delivery rider moving through Nairobi" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#102f2e] via-[#173d3c]/90 to-[#173d3c]/15" />
      <div className="absolute inset-y-0 right-0 w-[33vw] bg-gradient-to-l from-[#102f2e]/45 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between px-[7vw] py-[6vh]">
        <div className="flex items-center gap-[1vw] font-display text-[1.25vw] font-bold tracking-[-0.04em]"><span className="grid h-[2.6vw] w-[2.6vw] place-items-center rounded-[.45vw] bg-accent text-primary">R</span><span>RiderLink</span><span className="ml-[.6vw] font-body text-[.82vw] font-semibold uppercase tracking-[.24em] text-[#c8d4ce]">Project overview</span></div>
        <div className="max-w-[48vw]">
          <div className="mb-[2.4vh] flex items-center gap-[1vw] font-body text-[1vw] font-bold uppercase tracking-[.25em] text-accent"><span className="h-[.15vw] w-[3.5vw] bg-accent" /> Operations, clarified.</div>
          <h1 className="max-w-[43vw] font-display text-[6.8vw] font-extrabold leading-[.93] tracking-[-.075em] text-balance">RiderLink</h1>
          <p className="mt-[3vh] max-w-[30vw] font-body text-[2.15vw] leading-[1.08] text-[#e2e8e2]">Clear handoffs for Kenyan retail deliveries.</p>
        </div>
        <div className="flex items-end justify-between font-body text-[1vw] text-[#c8d4ce]"><span>Delivery coordination platform</span><span>01 / 12</span></div>
      </div>
      <div className="absolute bottom-[9vh] right-[7vw] h-[11vw] w-[11vw] rounded-full border border-accent/70" />
      <div className="absolute bottom-[11.5vh] right-[9.5vw] h-[6vw] w-[6vw] rounded-full border border-[#f7f3ec]/35" />
    </div>
  );
}