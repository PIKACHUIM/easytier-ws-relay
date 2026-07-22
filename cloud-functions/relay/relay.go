package relay

import (
	"encoding/binary"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Constants matching the JS implementation
const (
	Magic    = 0xd1e1a5e1
	Version  = 1
	MyPeerID = 10000001 // Server Peer ID
	HeaderSize = 16
)

// PacketType enum
const (
	PacketTypeInvalid              = 0
	PacketTypeData                 = 1
	PacketTypeHandShake            = 2
	PacketTypeRoutePacket          = 3 // deprecated
	PacketTypePing                 = 4
	PacketTypePong                 = 5
	PacketTypeTaRpc                = 6 // deprecated
	PacketTypeRoute                = 7 // deprecated
	PacketTypeRpcReq               = 8
	PacketTypeRpcResp              = 9
	PacketTypeForeignNetworkPacket = 10
	PacketTypeKcpSrc               = 11
	PacketTypeKcpDst               = 12
)

// Peer represents a connected EasyTier peer
type Peer struct {
	PeerID   uint32
	GroupKey string
	Conn     *websocket.Conn
	mu       sync.Mutex
}

// Room manages all peers in the same room
type Room struct {
	mu     sync.RWMutex
	peers  map[uint32]*Peer
	groups map[string]map[uint32]*Peer // groupKey -> peerID -> Peer
}

var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
)

func getOrCreateRoom(roomID string) *Room {
	roomsMu.Lock()
	defer roomsMu.Unlock()

	if room, ok := rooms[roomID]; ok {
		return room
	}

	room := &Room{
		peers:  make(map[uint32]*Peer),
		groups: make(map[string]map[uint32]*Peer),
	}
	rooms[roomID] = room
	return room
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
}

// HandleWebSocket handles incoming WebSocket connections
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	roomID := c.Query("room")
	if roomID == "" {
		roomID = "default"
	}

	room := getOrCreateRoom(roomID)

	log.Printf("New WebSocket connection in room: %s", roomID)
	handleConnection(conn, room)
}

// handleConnection processes messages from a WebSocket connection
func handleConnection(conn *websocket.Conn, room *Room) {
	defer conn.Close()

	peer := &Peer{
		PeerID: 0, // Will be set after handshake
		Conn:   conn,
	}

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			removePeer(room, peer)
			return
		}

		if len(msg) < HeaderSize {
			log.Printf("Message too short: %d bytes", len(msg))
			continue
		}

		// Parse header
		header := ParseHeader(msg[:HeaderSize])
		payload := msg[HeaderSize:]

		switch header.PacketType {
		case PacketTypeHandShake:
			handleHandshake(conn, peer, room, header, payload)
		case PacketTypePing:
			handlePing(conn, header)
		case PacketTypeData, PacketTypeRpcReq, PacketTypeRpcResp:
			handleForwarding(room, peer, header, msg)
		default:
			log.Printf("Unknown packet type: %d from peer %d", header.PacketType, header.FromPeerID)
		}
	}
}

// Header represents the 16-byte EasyTier packet header
type Header struct {
	FromPeerID     uint32
	ToPeerID       uint32
	PacketType     uint16
	Flags          uint8
	ForwardCounter uint8
	Reserved       uint16
	Length         uint16
}

// ParseHeader parses a 16-byte EasyTier header from raw bytes
func ParseHeader(data []byte) Header {
	return Header{
		FromPeerID:     binary.BigEndian.Uint32(data[0:4]),
		ToPeerID:       binary.BigEndian.Uint32(data[4:8]),
		PacketType:     binary.BigEndian.Uint16(data[8:10]),
		Flags:          data[10],
		ForwardCounter: data[11],
		Reserved:       binary.BigEndian.Uint16(data[12:14]),
		Length:         binary.BigEndian.Uint16(data[14:16]),
	}
}

// BuildHeader creates a 16-byte EasyTier header
func BuildHeader(fromPeerID, toPeerID uint32, packetType uint16, dataLen uint16) []byte {
	buf := make([]byte, HeaderSize)
	binary.BigEndian.PutUint32(buf[0:4], fromPeerID)
	binary.BigEndian.PutUint32(buf[4:8], toPeerID)
	binary.BigEndian.PutUint16(buf[8:10], packetType)
	binary.BigEndian.PutUint16(buf[14:16], dataLen)
	return buf
}

func handleHandshake(conn *websocket.Conn, peer *Peer, room *Room, header Header, payload []byte) {
	// Simple handshake: register the peer
	if len(payload) >= 4 {
		peer.PeerID = binary.BigEndian.Uint32(payload[:4])
	} else {
		peer.PeerID = header.FromPeerID
	}

	log.Printf("Handshake from peer %d", peer.PeerID)

	room.mu.Lock()
	room.peers[peer.PeerID] = peer
	room.mu.Unlock()

	// Send handshake response
	respHeader := BuildHeader(MyPeerID, peer.PeerID, PacketTypeHandShake, 4)
	respPayload := make([]byte, 4)
	binary.BigEndian.PutUint32(respPayload, MyPeerID)

	resp := append(respHeader, respPayload...)
	if err := conn.WriteMessage(websocket.BinaryMessage, resp); err != nil {
		log.Printf("Handshake response failed: %v", err)
		return
	}

	// Broadcast route update to room
	broadcastRouteUpdate(room, peer.PeerID)
}

func handlePing(conn *websocket.Conn, header Header) {
	respHeader := BuildHeader(MyPeerID, header.FromPeerID, PacketTypePong, 0)
	if err := conn.WriteMessage(websocket.BinaryMessage, respHeader); err != nil {
		log.Printf("Ping response failed: %v", err)
	}
}

func handleForwarding(room *Room, sender *Peer, header Header, rawMsg []byte) {
	room.mu.RLock()
	target, ok := room.peers[header.ToPeerID]
	room.mu.RUnlock()

	if !ok {
		log.Printf("Target peer %d not found (from peer %d)", header.ToPeerID, sender.PeerID)
		return
	}

	target.mu.Lock()
	defer target.mu.Unlock()

	if err := target.Conn.WriteMessage(websocket.BinaryMessage, rawMsg); err != nil {
		log.Printf("Failed to forward to peer %d: %v", header.ToPeerID, err)
	}
}

func broadcastRouteUpdate(room *Room, exceptPeerID uint32) {
	room.mu.RLock()
	defer room.mu.RUnlock()

	peerIDs := make([]uint32, 0, len(room.peers))
	for id := range room.peers {
		if id != exceptPeerID && id != MyPeerID {
			peerIDs = append(peerIDs, id)
		}
	}

	if len(peerIDs) == 0 {
		return
	}

	// Build route info payload
	payload := make([]byte, len(peerIDs)*4)
	for i, id := range peerIDs {
		binary.BigEndian.PutUint32(payload[i*4:(i+1)*4], id)
	}

	// Send to requesting peer
	if peer, ok := room.peers[exceptPeerID]; ok {
		header := BuildHeader(MyPeerID, exceptPeerID, PacketTypeRpcResp, uint16(len(payload)))
		msg := append(header, payload...)
		peer.mu.Lock()
		if err := peer.Conn.WriteMessage(websocket.BinaryMessage, msg); err != nil {
			log.Printf("Route update broadcast failed: %v", err)
		}
		peer.mu.Unlock()
	}
}

func removePeer(room *Room, peer *Peer) {
	if peer.PeerID == 0 {
		return
	}

	log.Printf("Peer %d disconnected", peer.PeerID)

	room.mu.Lock()
	delete(room.peers, peer.PeerID)
	room.mu.Unlock()

	// Broadcast removal to remaining peers
	broadcastRouteUpdate(room, peer.PeerID)
}
