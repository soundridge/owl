import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { ipcServices } from './lib/ipc-client'

function App(): React.JSX.Element {
  const [pingResult, setPingResult] = useState<string>('')
  const [agentResult, setAgentResult] = useState<string>('')

  const pingTest = async (): Promise<void> => {
    if (!ipcServices) return
    const result = await ipcServices.system.ping()
    console.log('Ping result:', result)
    setPingResult(result)
  }

  const agentTest = async (): Promise<void> => {
    if (!ipcServices) return
    try {
      setAgentResult('Thinking...')
      const a = await ipcServices.agent.chat('hi')
      // const response = await (ipcServices.agent.chat as (message: string) => Promise<string>)('hi')
      console.log('Agent response:', response)
      setAgentResult(response)
    } catch (error) {
      console.error('Agent error:', error)
      setAgentResult(`Error: ${error}`)
    }
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
        <div className="action">
          <a onClick={agentTest}>Test Agent</a>
        </div>
      </div>

      {pingResult && (
        <div
          style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '4px' }}
        >
          <strong style={{ color: '#4ade80' }}>IPC Response:</strong> {pingResult}
        </div>
      )}

      {agentResult && (
        <div
          style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '4px' }}
        >
          <strong style={{ color: '#60a5fa' }}>Agent Response:</strong> {agentResult}
        </div>
      )}

      <Versions></Versions>
    </>
  )
}

export default App
