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

/* Banner 1 — Organized two-column (warm cream bg) */
export default function BannerOne() {
  return (
    <section className='min-h-screen bg-[#ede0d3] flex items-center justify-center p-10 overflow-hidden'>
      <div className='flex gap-4 items-start'>
        <P r='/' w={580} h={880} s={{ boxShadow: '0 16px 50px -12px rgba(0,0,0,0.12)' }} />
        <div className='flex flex-col gap-4' style={{ width: 520 }}>
          <P r='/courses' w={520} h={210} s={{ boxShadow: '0 10px 35px -8px rgba(0,0,0,0.08)' }} />
          <P r='/teachers' w={520} h={240} s={{ boxShadow: '0 10px 35px -8px rgba(0,0,0,0.08)' }} />
          <div className='flex gap-4'>
            <P r='/auth/login' w={252} h={185} s={{ boxShadow: '0 10px 35px -8px rgba(0,0,0,0.08)' }} />
            <P r='/auth/register/student' w={252} h={185} s={{ boxShadow: '0 10px 35px -8px rgba(0,0,0,0.08)' }} />
          </div>
          <P r='/about' w={520} h={193} s={{ boxShadow: '0 10px 35px -8px rgba(0,0,0,0.08)' }} />
        </div>
      </div>
    </section>
  );
}
