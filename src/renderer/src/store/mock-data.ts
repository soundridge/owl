import type { Workspace, FileChange, BranchInfo } from '../types'

// ============================================
// Mock Workspaces with Sessions
// ============================================

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-conductor',
    name: 'conductor',
    repoPath: '/Users/dev/projects/conductor',
    sessions: [
      {
        id: 'session-1',
        name: 'archive-in-repo-details',
        workspaceId: 'ws-conductor',
        branch: 'session/20260130-archive-in-repo',
        worktreePath: '/Users/dev/projects/conductor/.worktrees/session-1',
        baseBranch: 'main',
        status: 'running',
        createdAt: new Date('2026-01-30T10:00:00'),
      },
      {
        id: 'session-2',
        name: 'system-tray-status',
        workspaceId: 'ws-conductor',
        branch: 'session/20260130-system-tray',
        worktreePath: '/Users/dev/projects/conductor/.worktrees/session-2',
        baseBranch: 'main',
        status: 'running',
        createdAt: new Date('2026-01-30T11:30:00'),
      },
      {
        id: 'session-3',
        name: 'add-agent-workspaces',
        workspaceId: 'ws-conductor',
        branch: 'session/20260129-agent-ws',
        worktreePath: '/Users/dev/projects/conductor/.worktrees/session-3',
        baseBranch: 'develop',
        status: 'stopped',
        createdAt: new Date('2026-01-29T14:00:00'),
      },
    ],
  },
  {
    id: 'ws-swipe',
    name: 'swipe',
    repoPath: '/Users/dev/projects/swipe',
    sessions: [],
  },
  {
    id: 'ws-melty',
    name: 'melty_home',
    repoPath: '/Users/dev/projects/melty',
    sessions: [
      {
        id: 'session-4',
        name: 'fix-auth-bug',
        workspaceId: 'ws-melty',
        branch: 'session/20260130-auth-fix',
        worktreePath: '/Users/dev/projects/melty/.worktrees/session-4',
        baseBranch: 'main',
        status: 'error',
        createdAt: new Date('2026-01-30T09:00:00'),
      },
    ],
  },
]

// ============================================
// Mock File Changes
// ============================================

export const mockFileChanges: FileChange[] = [
  { path: 'src/App.tsx', status: 'modified', added: 12, removed: 5 },
  { path: 'src/core/conductor/WorkspaceAPI.ts', status: 'modified', added: 53, removed: 10 },
  { path: 'src/ui/components/FileBadge.tsx', status: 'modified', added: 12, removed: 3 },
  { path: 'src/ui/components/RepositoryDetailsDialog.tsx', status: 'modified', added: 229, removed: 117 },
  { path: 'src/ui/components/ToolRenderers.tsx', status: 'modified', added: 17, removed: 2 },
  { path: 'src/ui/components/SessionCard.tsx', status: 'added', added: 88, removed: 0 },
  { path: 'src/utils/deprecated.ts', status: 'deleted', added: 0, removed: 45 },
  { path: 'README.md', status: 'untracked', added: 15, removed: 0 },
]

// ============================================
// Mock Branch Info
// ============================================

export const mockBranchInfo: BranchInfo = {
  current: 'session/20260130-archive-in-repo',
  target: 'main',
  ahead: 5,
  behind: 2,
}

// ============================================
// Empty State Data
// ============================================

export const emptyWorkspaces: Workspace[] = []
export const emptyFileChanges: FileChange[] = []
export const emptyBranchInfo: BranchInfo = {
  current: '',
  target: '',
  ahead: 0,
  behind: 0,
}
