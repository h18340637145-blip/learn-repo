import { login, signup, signInWithGithub } from './actions';

export default function LoginPage() {
  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--canvas)' }}>
      <div className="login-box" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2rem', 
        background: 'var(--panel)', 
        border: '1px solid var(--line)', 
        boxShadow: 'var(--glow-cyan)' 
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--cyan)' }}>
          NodePath 登录
        </h1>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="email" style={{ color: 'var(--muted)', fontSize: '13px' }}>邮箱地址</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            style={{ 
              padding: '0.75rem', 
              background: 'var(--panel-2)', 
              border: '1px solid var(--line)', 
              color: 'var(--ink)', 
              outline: 'none' 
            }} 
          />
          
          <label htmlFor="password" style={{ color: 'var(--muted)', fontSize: '13px' }}>密码</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            style={{ 
              padding: '0.75rem', 
              background: 'var(--panel-2)', 
              border: '1px solid var(--line)', 
              color: 'var(--ink)', 
              outline: 'none' 
            }} 
          />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              formAction={login} 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                background: 'var(--green)', 
                color: 'var(--panel-2)', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                border: 'none'
              }}
            >
              登录
            </button>
            <button 
              formAction={signup} 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                background: 'transparent', 
                color: 'var(--green)', 
                border: '1px solid var(--green)', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              注册
            </button>
          </div>
        </form>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>
          <hr style={{ flex: 1, borderColor: 'var(--line)' }} />
          <span style={{ padding: '0 1rem', fontSize: '12px' }}>或者</span>
          <hr style={{ flex: 1, borderColor: 'var(--line)' }} />
        </div>

        <form>
          <button 
            formAction={signInWithGithub}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#24292e',
              color: '#fff',
              border: '1px solid #3e444a',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            通过 GitHub 登录
          </button>
        </form>
      </div>
    </div>
  );
}
