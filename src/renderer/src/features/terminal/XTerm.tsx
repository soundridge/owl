import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useCallback, useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { ipcServices } from '../../lib/ipcClient'
import 'xterm/css/xterm.css'

export interface XTermProps {
  ptyId: string | null
  onReady?: () => void
}

/**
 * XTerm terminal component
 * Renders a real terminal using xterm.js connected to a PTY backend
 */
export function XTerm({ ptyId, onReady }: XTermProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const currentPtyIdRef = useRef<string | null>(null)

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current)
      return

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
      lineHeight: 1.2,
      theme: {
        background: '#1c1c1e',
        foreground: '#e5e5e5',
        cursor: '#e5e5e5',
        cursorAccent: '#1c1c1e',
        selectionBackground: 'rgba(255, 255, 255, 0.2)',
        black: '#1c1c1e',
        red: '#ff5f56',
        green: '#27c93f',
        yellow: '#ffbd2e',
        blue: '#0a84ff',
        magenta: '#bf5af2',
        cyan: '#5ac8fa',
        white: '#e5e5e5',
        brightBlack: '#6e6e73',
        brightRed: '#ff6961',
        brightGreen: '#4cd964',
        brightYellow: '#ffcc00',
        brightBlue: '#5ac8fa',
        brightMagenta: '#ff2d55',
        brightCyan: '#64d2ff',
        brightWhite: '#ffffff',
      },
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())

    terminal.open(containerRef.current)

    // Initial fit after a small delay to ensure container has dimensions
    requestAnimationFrame(() => {
      fitAddon.fit()
    })

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    // Handle terminal input -> send to PTY
    const dataDisposable = terminal.onData((data) => {
      if (currentPtyIdRef.current && ipcServices) {
        ipcServices.terminal.write(currentPtyIdRef.current, data)
      }
    })

    onReady?.()

    return () => {
      dataDisposable.dispose()
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [onReady])

  // Handle PTY ID changes - update ref and clear terminal for new connection
  useEffect(() => {
    const prevPtyId = currentPtyIdRef.current
    currentPtyIdRef.current = ptyId

    // If PTY ID changed and we have a terminal, clear it for new session
    if (prevPtyId !== ptyId && ptyId && terminalRef.current) {
      terminalRef.current.clear()
    }
  }, [ptyId])

  // Listen for PTY data and exit events
  useEffect(() => {
    if (!ptyId)
      return

    const handleData = (_event: unknown, id: string, data: string) => {
      if (id === ptyId && terminalRef.current) {
        terminalRef.current.write(data)
      }
    }

    const handleExit = (_event: unknown, id: string, code: number) => {
      if (id === ptyId && terminalRef.current) {
        terminalRef.current.writeln(`\r\n\x1B[90m[Process exited with code ${code}]\x1B[0m`)
      }
    }

    // Subscribe to IPC events - on() returns cleanup function
    const unsubData = window.electron.ipcRenderer.on('terminal:data', handleData)
    const unsubExit = window.electron.ipcRenderer.on('terminal:exit', handleExit)

    return () => {
      unsubData()
      unsubExit()
    }
  }, [ptyId])

  // Handle terminal resize
  const handleResize = useCallback(() => {
    if (!fitAddonRef.current || !terminalRef.current || !currentPtyIdRef.current)
      return

    fitAddonRef.current.fit()

    const { cols, rows } = terminalRef.current
    if (cols > 0 && rows > 0 && ipcServices) {
      ipcServices.terminal.resize(currentPtyIdRef.current, cols, rows)
    }
  }, [])

  // ResizeObserver for container size changes
  useEffect(() => {
    if (!containerRef.current)
      return

    const observer = new ResizeObserver(() => {
      // Debounce resize to avoid excessive calls
      requestAnimationFrame(handleResize)
    })

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [handleResize])

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#1c1c1e]"
      style={{ padding: '4px 0 0 8px' }}
    />
  )
}
