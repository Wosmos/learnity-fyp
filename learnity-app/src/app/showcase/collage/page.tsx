'use client';

/* ─── Scaled iframe card — no chrome ─── */
function P({
  r,
  w,
  h,
  s,
}: {
  r: string;
  w: number;
  h: number;
  s?: React.CSSProperties;
}) {
  const sc = w / 1440;
  return (
    <div
      className='rounded-[14px] overflow-hidden bg-white border border-black/[0.04]'
      style={{ width: w, height: h, flexShrink: 0, ...s }}
    >
      <iframe
        src={r}
        style={{
          width: 1440,
          height: Math.ceil(h / sc),
          transform: `scale(${sc})`,
          transformOrigin: 'top left',
          border: 'none',
          pointerEvents: 'none',
          display: 'block',
        }}
        tabIndex={-1}
        loading='lazy'
      />
    </div>
  );
}

/* Banner 2 — Dense overlapping collage (dark bg) */
export default function BannerTwo() {
  return (
    <section className='min-h-screen bg-[#333] relative overflow-hidden flex items-center justify-center'>
      <div className='relative w-[1440px] h-[920px]'>
        {/* ── Top row ── */}
        <P r='/dashboard/student' w={460} h={350}
          s={{ position: 'absolute', top: -10, left: -20, zIndex: 5, transform: 'rotate(-0.8deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
        <P r='/auth/register/teacher' w={400} h={470}
          s={{ position: 'absolute', top: 10, left: 400, zIndex: 14, transform: 'rotate(0.6deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
        <P r='/dashboard/teacher' w={430} h={340}
          s={{ position: 'absolute', top: -10, left: 770, zIndex: 8, transform: 'rotate(1.2deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
        <P r='/admin' w={320} h={310}
          s={{ position: 'absolute', top: 20, right: -20, zIndex: 11, transform: 'rotate(-0.5deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />

        {/* ── Middle row ── */}
        <P r='/' w={540} h={400}
          s={{ position: 'absolute', top: 300, left: 30, zIndex: 22, transform: 'rotate(-0.4deg)',
            boxShadow: '0 35px 70px -10px rgba(0,0,0,0.55)' }} />
        <P r='/courses' w={500} h={380}
          s={{ position: 'absolute', top: 330, left: 530, zIndex: 24, transform: 'rotate(0.5deg)',
            boxShadow: '0 35px 70px -10px rgba(0,0,0,0.55)' }} />
        <P r='/auth/login' w={380} h={330}
          s={{ position: 'absolute', top: 300, right: -10, zIndex: 20, transform: 'rotate(-1deg)',
            boxShadow: '0 35px 70px -10px rgba(0,0,0,0.55)' }} />

        {/* ── Bottom row ── */}
        <P r='/teachers' w={500} h={280}
          s={{ position: 'absolute', bottom: -20, left: -10, zIndex: 30, transform: 'rotate(0.4deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
        <P r='/auth/register/student' w={460} h={290}
          s={{ position: 'absolute', bottom: -10, left: 460, zIndex: 32, transform: 'rotate(-0.3deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
        <P r='/about' w={420} h={270}
          s={{ position: 'absolute', bottom: -15, right: -10, zIndex: 28, transform: 'rotate(0.7deg)',
            boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5)' }} />
      </div>
    </section>
  );
}
