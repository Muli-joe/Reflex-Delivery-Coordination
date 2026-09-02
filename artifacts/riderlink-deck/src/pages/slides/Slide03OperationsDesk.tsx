export default function Slide03OperationsDesk() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary text-[#f7f3ec]">
      <div className="absolute inset-0 deck-dots opacity-30" />
      <div className="relative flex h-full flex-col px-[7vw] py-[6vh]">
        <div className="flex items-center justify-between font-body text-[1vw] font-bold uppercase tracking-[.24em] text-[#c8d4ce]"><span>02 / The product</span><span>RiderLink</span></div>
        <div className="mt-[7vh] flex items-end justify-between"><div><div className="mb-[2.2vh] font-body text-[1vw] font-bold uppercase tracking-[.24em] text-accent">One connected system</div><h2 className="max-w-[48vw] font-display text-[4.35vw] font-extrabold leading-[.98] tracking-[-.065em]">One operations desk for the full journey</h2></div><div className="mb-[.8vh] h-[7vw] w-[7vw] rounded-full border-[.8vw] border-accent/80" /></div>
        <div className="mt-[9vh] grid grid-cols-3 gap-[1.6vw]">
          <div className="min-h-[26vh] border border-[#c8d4ce]/25 bg-[#1d4946] p-[2.2vw]"><div className="font-display text-[3.4vw] font-extrabold text-accent">01</div><h3 className="mt-[2.4vh] font-display text-[2vw] font-bold">Create</h3><p className="mt-[1.5vh] font-body text-[1.65vw] leading-[1.16] text-[#dfe8e1]">Create delivery requests with customer and order details</p></div>
          <div className="min-h-[26vh] border border-[#c8d4ce]/25 bg-[#1d4946] p-[2.2vw]"><div className="font-display text-[3.4vw] font-extrabold text-accent">02</div><h3 className="mt-[2.4vh] font-display text-[2vw] font-bold">Coordinate</h3><p className="mt-[1.5vh] font-body text-[1.65vw] leading-[1.16] text-[#dfe8e1]">Assign riders and track every status transition</p></div>
          <div className="min-h-[26vh] border border-[#c8d4ce]/25 bg-[#1d4946] p-[2.2vw]"><div className="font-display text-[3.4vw] font-extrabold text-accent">03</div><h3 className="mt-[2.4vh] font-display text-[2vw] font-bold">Complete</h3><p className="mt-[1.5vh] font-body text-[1.65vw] leading-[1.16] text-[#dfe8e1]">Keep dispatch, rider mode, and proof of delivery connected</p></div>
        </div>
        <div className="mt-auto flex justify-between font-body text-[1vw] text-[#c8d4ce]"><span>From the first request to the final handoff</span><span>03 / 12</span></div>
      </div>
    </div>
  );
}