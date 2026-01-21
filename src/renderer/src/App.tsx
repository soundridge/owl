import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { ipcServices } from './lib/ipc-client'

function App(): React.JSX.Element {
  const [pingResult, setPingResult] = useState<string>('')

  const pingTest = async (): Promise<void> => {
    if (!ipcServices) return
    const result = await ipcServices.system.ping()
    console.log('Ping result:', result)
    setPingResult(result)
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a onClick={pingTest}>Send Ping</a>
        </div>
      </div>

      {pingResult && (
        <div
          style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '4px' }}
        >
          <strong style={{ color: '#4ade80' }}>IPC Response:</strong> {pingResult}
        </div>
      )}

      <Versions></Versions>
    </>
  )
}

export default App
