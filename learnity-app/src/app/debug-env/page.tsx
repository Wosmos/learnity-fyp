'use client';

export default function DebugEnvPage() {
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_HCAPTCHA_SITE_KEY': process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? 'SET ✓' : 'MISSING ✗',
    'NEXT_PUBLIC_USE_FIREBASE_EMULATOR': process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR || 'NOT SET (good)',
    'NODE_ENV': process.env.NODE_ENV,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Variable</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(envVars).map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{key}</td>
              <td style={{ 
                padding: '10px',
                color: value.includes('MISSING') ? 'red' : 'green',
                fontWeight: 'bold'
              }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>All Firebase variables should show &quot;SET ✓&quot;</li>
          <li>If any show &quot;MISSING ✗&quot;, check your .env.local file</li>
          <li>Make sure there are no quotes around values</li>
          <li>Restart dev server after changing .env.local</li>
        </ul>
      </div>
    </div>
  );
}
