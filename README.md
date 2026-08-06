# amarwave-react-native

React Native SDK for [AmarWave](https://amarwave.com) — real-time WebSocket client with built-in React hooks and AppState handling.

## Installation

```bash
npm install amarwave-react-native
# or
yarn add amarwave-react-native
```

`react` and `react-native` are peer dependencies — they must already be in your project.

---

## Quick Start

### 1. Wrap your app with the provider

```tsx
// App.tsx
import { AmarWaveProvider } from 'amarwave-react-native';

export default function App() {
  return (
    <AmarWaveProvider config={{ appKey: 'YOUR_APP_KEY', cluster: 'local' }}>
      <RootNavigator />
    </AmarWaveProvider>
  );
}
```

### 2. Subscribe to events anywhere

```tsx
import { useEvent } from 'amarwave-react-native';

function ChatScreen() {
  const [messages, setMessages] = useState([]);

  useEvent('public-chat', 'message', (data) => {
    setMessages(prev => [...prev, data]);
  });

  return <MessageList messages={messages} />;
}
```

---

## Hooks

### `useEvent(channelName, event, handler)`

Bind to a channel event. Automatically subscribes and cleans up on unmount.

```tsx
useEvent<{ user: string; text: string }>('public-chat', 'message', (data) => {
  console.log(data.user, data.text);
});
```

### `useChannel(channelName)`

Get the channel instance and subscription state.

```tsx
const { channel, subscribed } = useChannel('private-orders');

useEffect(() => {
  if (!channel) return;
  channel.bind('status', (data) => console.log(data));
}, [channel]);
```

### `useAmarWave(config)`

Create a standalone client instance (not from a provider).

```tsx
const { client, state, socketId } = useAmarWave({
  appKey: 'YOUR_APP_KEY',
  cluster: 'local',
});
```

### `useAmarWaveClient()`

Access the client from the nearest `<AmarWaveProvider>`.

```tsx
const client = useAmarWaveClient();
await client.publish('public-chat', 'message', { text: 'Hello!' });
```

---

## Manual usage (no hooks)

```ts
import AmarWave from 'amarwave-react-native';

const aw = new AmarWave({ appKey: 'KEY', appSecret: 'SECRET', cluster: 'local' });

const ch = aw.subscribe('public-chat');
ch.bind('message', (data) => console.log(data));

// Publish via HTTP API
ch.publish('message', { user: 'Ali', text: 'Hello!' });

// Clean up
aw.destroy();
```

---

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appKey` | `string` | **required** | Your app key |
| `appSecret` | `string` | — | App secret for client-side HMAC auth |
| `cluster` | `string` | `"default"` | Named cluster (`local`, `ap1`, `eu`, `us`) |
| `wsHost` | `string` | `"localhost"` | WebSocket host |
| `wsPort` | `number` | `3001` | WS port |
| `wssPort` | `number` | `443` | WSS port |
| `apiHost` | `string` | same as wsHost | HTTP API host |
| `apiPort` | `number` | `8000` | HTTP API port |
| `forceTLS` | `boolean` | `false` | Use WSS + HTTPS |
| `authEndpoint` | `string` | `"/broadcasting/auth"` | Server auth URL for private/presence channels |
| `reconnectDelay` | `number` | `1000` | Base reconnect delay (ms) |
| `maxReconnectDelay` | `number` | `30000` | Max reconnect delay (ms) |
| `maxRetries` | `number` | `5` | Max reconnect attempts (0 = infinite) |
| `activityTimeout` | `number` | `120000` | Ping interval when idle (ms) |
| `pongTimeout` | `number` | `30000` | Pong wait before reconnecting (ms) |
| `handleAppState` | `boolean` | `true` | Disconnect on background, reconnect on foreground |

---

## Channel types

| Prefix | Description | Auth |
|--------|-------------|------|
| `public-` | Open to all | None |
| `private-` | Restricted | HMAC or `authEndpoint` |
| `presence-` | Like private + member list | HMAC or `authEndpoint` |

---

## AppState handling

By default (`handleAppState: true`) the SDK will:
- **Background** — close the WebSocket to save battery and bandwidth
- **Foreground** — reconnect automatically if channels are active

Set `handleAppState: false` to manage this yourself.

---

## Notes

- **No native modules required** — pure JavaScript, works with Expo and bare React Native.
- **Pure-JS HMAC-SHA256** — no `crypto.subtle` dependency, safe on Hermes and JSC.
- **WebSocket** — uses React Native's built-in global `WebSocket`.
- **fetch** — uses React Native's built-in `fetch`.

---

## License

MIT
