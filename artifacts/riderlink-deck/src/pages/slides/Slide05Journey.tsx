export default function Slide05Journey() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#ebe9e2] text-text">
      <div className="absolute right-[5vw] top-[5vh] h-[17vw] w-[17vw] rounded-full bg-sage/45" />
      <div className="relative flex h-full flex-col px-[7vw] py-[6vh]">
        <div className="flex items-center justify-between font-body text-[1vw] font-bold uppercase tracking-[.24em] text-primary"><span>04 / The lifecycle</span><span className="text-muted">RiderLink</span></div>
        <div className="mt-[8vh]"><div className="mb-[2.2vh] font-body text-[1vw] font-bold uppercase tracking-[.24em] text-coral">State, made visible</div><h2 className="max-w-[60vw] font-display text-[4.5vw] font-extrabold leading-[.98] tracking-[-.065em]">From request to completed delivery</h2></div>
        <div className="mt-[12vh] flex items-start justify-between px-[1vw]">
          <div className="flex w-[15vw] flex-col items-center text-center"><div className="grid h-[6vw] w-[6vw] place-items-center rounded-full border-[.45vw] border-accent bg-bg font-display text-[1.3vw] font-bold text-primary">01</div><div className="mt-[2vh] font-display text-[1.7vw] font-bold">Pending</div></div>
          <div className="mt-[2.7vw] h-[.22vw] w-[10vw] bg-primary/25" />
          <div className="flex w-[15vw] flex-col items-center text-center"><div className="grid h-[6vw] w-[6vw] place-items-center rounded-full border-[.45vw] border-primary bg-bg font-display text-[1.3vw] font-bold text-primary">02</div><div className="mt-[2vh] font-display text-[1.7vw] font-bold">Assigned</div></div>
          <div className="mt-[2.7vw] h-[.22vw] w-[10vw] bg-primary/25" />
          <div className="flex w-[15vw] flex-col items-center text-center"><div className="grid h-[6vw] w-[6vw] place-items-center rounded-full border-[.45vw] border-coral bg-bg font-display text-[1.3vw] font-bold text-primary">03</div><div className="mt-[2vh] font-display text-[1.7vw] font-bold">Picked up</div></div>
          <div className="mt-[2.7vw] h-[.22vw] w-[10vw] bg-primary/25" />
          <div className="flex w-[15vw] flex-col items-center text-center"><div className="grid h-[6vw] w-[6vw] place-items-center rounded-full border-[.45vw] border-primary bg-primary font-display text-[1.3vw] font-bold text-accent">04</div><div className="mt-[2vh] font-display text-[1.7vw] font-bold">Delivered</div></div>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-[2vw] border-t border-primary/20 pt-[3vh] font-body text-[1.45vw] leading-[1.15]"><div className="flex gap-[1vw]"><span className="font-display font-bold text-coral">+</span><span>Cancellation is available when a delivery cannot continue</span></div><div className="flex gap-[1vw]"><span className="font-display font-bold text-coral">+</span><span>Invalid transitions are blocked instead of silently changing state</span></div></div>
      </div>
    </div>
  );
}