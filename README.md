<table>
    <tr>
        <td>
            <h2>⚠️ Attention ⚠️</h2>
            <h1>AI Generated Code (also known as slop)</h1>
            <p>The code in this repository was completely AI generated and does not follow best practises in any form.</p>
        </td>
    </tr>
</table>

# Peer Chat

A decentralized peer-to-peer chat application built with React, TypeScript, PeerJS, and Material UI. No servers, no accounts system — just direct browser-to-browser connections.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Format code
npm run format
```

---

## 🧱 Tech Stack

| Tool                   | Purpose                        |
| ---------------------- | ------------------------------ |
| React 19               | UI framework                   |
| TypeScript             | Type safety                    |
| Vite                   | Build tool & dev server        |
| @tanstack/react-router | File-based routing             |
| Zustand                | Global state management        |
| Zod                    | Schema validation              |
| @mui/material          | UI component library (GitHub/ShadCN-inspired theme) |
| @emotion/react/styled  | CSS-in-JS (MUI dependency)     |
| PeerJS                 | WebRTC peer-to-peer messaging  |
| uuid                   | Unique ID generation           |
| qrcode.react           | QR code generation for sharing |
| vite-plugin-pwa        | PWA support (installable)      |
| ESLint + Prettier      | Code quality & formatting      |

---

## 📁 Project Structure

```
src/
  App.tsx                 # Router creation & provider
  Root.tsx                # Theme + notification providers
  main.tsx                # Entry point (render)
  theme.ts                # MUI theme (GitHub/ShadCN-inspired, light + dark)
  index.css               # Global CSS reset
  routeTree.gen.ts        # Auto-generated route tree (TanStack Router)

  routes/                 # File-based routes (TanStack Router)
    __root.tsx            # Root layout (NavRail / mobile bars, auth guard, CallOverlay)
    index.tsx             # / → redirect to /chats
    register.tsx          # Account registration with avatar picker + redirect
    chats.tsx             # Chats layout (sidebar + outlet)
    chats/
      index.tsx           # Empty state when no chat selected
      $chatId.tsx         # Individual chat view
    calls.tsx             # Call history page
    connect/
      $peerId.tsx         # Add contact via shared link
    profile.tsx           # Profile page (name, avatar, peer ID, QR share)
    settings.tsx          # Settings page (theme toggle, version)

  schemas/                # Zod schemas & TypeScript types
    account.ts            # Account schema (id, name, avatar, privateKey)
    callRecord.ts         # CallRecord schema (id, peerId, type, status, timestamps)
    contact.ts            # Contact schema (id, name, nickname, avatar, publicKey)
    message.ts            # Message + FileAttachment schemas
    peerMessage.ts        # PeerJS protocol (discriminated union, call signaling)

  store/                  # Zustand global state
    chatStore.ts          # Account, contacts, messages, calls, online peers, sync
    themeStore.ts         # Theme mode (light/dark) with localStorage persistence

  storage/                # Storage adapter pattern
    StorageAdapter.ts     # Generic interface
    LocalStorageAdapter.ts# LocalStorage implementation (account)
    IndexedDBAdapter.ts   # IndexedDB implementation (messages, contacts, calls)
    storageInstances.ts   # Pre-configured adapter instances

  connection/             # PeerJS connection layer
    ConnectionManager.ts  # Peer lifecycle, messaging, calls (audio/video),
                          # ping with avatar, reconnect, resend undelivered

  hooks/                  # Custom React hooks
    notificationContext.ts# Notification context + useNotification hook
    useNotification.tsx   # NotificationProvider component (snackbar queue)
    useConnection.ts      # PeerJS connection lifecycle hook
    useTabLeader.ts       # Multi-tab leader election via BroadcastChannel

  components/             # Reusable UI components
    UserAvatar.tsx        # Avatar with initials fallback + color generation
    OnlineAvatar.tsx      # Avatar with online/offline badge dot
    CallOverlay.tsx       # Active call UI (ringing, connected, video)
    MessageBubble.tsx     # Message bubble with attachments, context menu, info
    MessageInput.tsx      # Text input + file attachment picker
    MessageList.tsx       # Scrollable message list with auto-scroll
    ContactListItem.tsx   # Sidebar contact row (last msg preview, unread count)
    AddContactDialog.tsx  # Dialog to add contact by Peer ID
    ContactInfoDialog.tsx # Contact info dialog (nickname editing, peer ID, status)
    ShareDialog.tsx       # QR code + connect link sharing dialog
    ChatArea.tsx          # Full chat view (header + call buttons + messages + input)
    EmptyChatArea.tsx     # Empty state placeholder
    Sidebar.tsx           # Contact list sidebar (sorted by last message)
    NavRail.tsx           # Desktop left navigation rail (chats, calls, settings, profile)
    MobileTopBar.tsx      # Mobile top app bar (title + settings)
    MobileBottomBar.tsx   # Mobile bottom navigation bar (chats, calls, profile)

  utils/
    avatar.ts             # getInitials() + stringToColor() helpers
```

---

## 📡 Message Protocol

All PeerJS messages follow a strict **discriminated union** validated with Zod:

| Type                      | Content                              |
| ------------------------- | ------------------------------------ |
| `PING_SEND`               | `{ peerId, name, avatar? }`          |
| `PING_RECEIVE`            | `{ peerId, name, avatar? }`          |
| `MESSAGE_SEND`            | Full `Message` schema (with optional attachments) |
| `MESSAGE_RETURN_RECEIVED` | `{ messageId, receivedTimestamp }`    |
| `MESSAGE_RETURN_READ`     | `{ messageId, readTimestamp }`        |
| `MESSAGE_RETURN_INVALID`  | `{ reason? }`                        |
| `CALL_OFFER`              | `{ callId, callType }`               |
| `CALL_ANSWER`             | `{ callId }`                         |
| `CALL_REJECT`             | `{ callId }`                         |
| `CALL_END`                | `{ callId }`                         |

---

## 🔑 Key Features

- **Peer-to-peer messaging** via PeerJS (WebRTC)
- **Audio & video calls** — WhatsApp-style calling with call history stored in IndexedDB
- **File attachments** — images rendered inline, other files downloadable (up to 5MB)
- **File-based routing** with TanStack Router
- **Strict Zod validation** on all incoming/outgoing messages (discriminated union)
- **Avatar support** with base64 sharing via pings
- **Auto-add contacts** from incoming messages/pings
- **Resend undelivered messages** after successful ping reconnection
- **Profile page** with editable name, avatar upload, QR code sharing
- **Settings page** with theme toggle and version display
- **Calls page** with full call history (missed, answered, outgoing)
- **Register redirect** — redirects back to original page after account creation
- **GitHub/ShadCN-inspired theme** (light + dark mode)
- **PWA installable** on desktop and mobile
- **Responsive design** (desktop nav rail + mobile top/bottom bars)
- **Multi-tab support** via BroadcastChannel leader election
- **Global snackbar notifications** for all important errors and actions
- **No barrel/index files** — all imports use direct file paths

---

## 🚫 Non-Goals

- No backend server
- No authentication system
- No automated testing (yet)
