export default function Slide09Architecture() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary text-[#f7f3ec]">
      <div className="absolute right-[7vw] top-[16vh] h-[22vw] w-[22vw] rounded-full border border-accent/25" />
      <div className="relative flex h-full flex-col px-[7vw] py-[6vh]">
        <div className="flex items-center justify-between font-body text-[1vw] font-bold uppercase tracking-[.24em] text-[#c8d4ce]"><span>08 / Foundation</span><span>RiderLink</span></div>
        <div className="mt-[7vh]"><div className="mb-[2.2vh] font-body text-[1vw] font-bold uppercase tracking-[.24em] text-accent">A practical stack</div><h2 className="max-w-[52vw] font-display text-[4.5vw] font-extrabold leading-[.96] tracking-[-.065em]">Built for dependable operations</h2></div>
        <div className="mt-[7vh] grid flex-1 grid-cols-[.95fr_1.05fr] gap-[8vw]">
          <div className="flex flex-col justify-center gap-[1.2vw]"><div className="border border-[#c8d4ce]/30 bg-[#1d4946] p-[1.5vw]"><div className="font-body text-[.9vw] font-bold uppercase tracking-[.18em] text-accent">Frontend</div><div className="mt-[1vh] font-display text-[1.65vw] font-bold">React · JavaScript · JSX · CSS</div></div><div className="ml-[2.4vw] h-[2vw] w-[.16vw] bg-accent/70" /><div className="border border-[#c8d4ce]/30 bg-[#1d4946] p-[1.5vw]"><div className="font-body text-[.9vw] font-bold uppercase tracking-[.18em] text-accent">Backend</div><div className="mt-[1vh] font-display text-[1.65vw] font-bold">Node.js · Express.js</div></div><div className="ml-[2.4vw] h-[2vw] w-[.16vw] bg-accent/70" /><div className="border border-[#c8d4ce]/30 bg-[#1d4946] p-[1.5vw]"><div className="font-body text-[.9vw] font-bold uppercase tracking-[.18em] text-accent">Data</div><div className="mt-[1vh] font-display text-[1.65vw] font-bold">PostgreSQL · parameterized SQL</div></div></div>
          <div className="self-center border-l border-[#c8d4ce]/30 pl-[4vw]"><div className="font-body text-[1vw] font-bold uppercase tracking-[.2em] text-[#c8d4ce]">Contracts keep the edges honest</div><div className="mt-[3vh] max-w-[33vw] font-display text-[2.8vw] font-bold leading-[1.02]">React Query, OpenAPI, and Zod keep client and API behavior aligned</div><div className="mt-[5vh] flex gap-[.8vw]"><span className="bg-accent px-[1vw] py-[.65vw] font-body text-[.95vw] font-bold text-primary">React Query</span><span className="border border-[#c8d4ce]/45 px-[1vw] py-[.65vw] font-body text-[.95vw] font-bold text-[#dfe8e1]">OpenAPI</span><span className="border border-[#c8d4ce]/45 px-[1vw] py-[.65vw] font-body text-[.95vw] font-bold text-[#dfe8e1]">Zod</span></div></div>
        </div>
        <div className="flex justify-between font-body text-[1vw] text-[#c8d4ce]"><span>Simple primitives. Clear boundaries.</span><span>09 / 12</span></div>
      </div>
    </div>
  );
}