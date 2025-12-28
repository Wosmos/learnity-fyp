'use client';

/**
 * 100ms Video Room Component
 * Modern, sleek video conference interface
 * 
 * Features:
 * - Immersive Dark Mode
 * - Floating Control Dock (Glassmorphism)
 * - Intelligent Video Grid (Spotlight vs Grid)
 * - integrated Chat Sidebar
 * - Fullscreen Toggle
 * - Pre-join "Lobby" Screen
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    useHMSStore,
    useHMSActions,
    selectIsConnectedToRoom,
    selectPeers,
    selectIsLocalAudioEnabled,
    selectIsLocalVideoEnabled,
    selectHMSMessages,
    HMSRoomProvider,
    selectLocalPeer,
    selectRemotePeers,
} from '@100mslive/react-sdk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Video, VideoOff, Mic, MicOff, PhoneOff, Users,
    MessageCircle, Loader2, AlertCircle, Send,
    Maximize2, Minimize2, MoreVertical, LayoutGrid,
    Settings, Share2, MonitorUp, Volume2, VolumeX,
    ChevronRight, ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
interface VideoRoomProps {
    courseId: string;
    courseName: string;
    onLeave?: () => void;
    className?: string;
}

function VideoRoomContent({ courseId, courseName, onLeave, className }: VideoRoomProps) {
    const { user } = useAuthStore();
    const hmsActions = useHMSActions();
    const containerRef = useRef<HTMLDivElement>(null);

    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
    const isVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
    const messages = useHMSStore(selectHMSMessages);

    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

    // Toggle Fullscreen
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error('Error attempting to enable fullscreen:', err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    // Listen for fullscreen change (ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Join room
    const joinRoom = useCallback(async () => {
        if (!user) return;

        try {
            setIsJoining(true);
            setError(null);

            // Get token from API
            const token = await user.getIdToken();
            const response = await fetch('/api/video/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to get video token');
            }

            const data = await response.json();
            const { token: videoToken, userName } = data.data;

            // Join the room
            await hmsActions.join({
                authToken: videoToken,
                userName,
                settings: {
                    isAudioMuted: true,
                    isVideoMuted: false,
                },
            });
        } catch (err) {
            console.error('Failed to join room:', err);
            setError(err instanceof Error ? err.message : 'Failed to join video room');
        } finally {
            setIsJoining(false);
        }
    }, [user, courseId, hmsActions]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        await hmsActions.leave();
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
        onLeave?.();
    }, [hmsActions, onLeave]);

    // Toggle audio
    const toggleAudio = useCallback(async () => {
        await hmsActions.setLocalAudioEnabled(!isAudioEnabled);
    }, [hmsActions, isAudioEnabled]);

    // Toggle video
    const toggleVideo = useCallback(async () => {
        await hmsActions.setLocalVideoEnabled(!isVideoEnabled);
    }, [hmsActions, isVideoEnabled]);

    // Send chat message
    const sendMessage = useCallback(async () => {
        if (!chatMessage.trim()) return;
        await hmsActions.sendBroadcastMessage(chatMessage);
        setChatMessage('');
    }, [hmsActions, chatMessage]);

    // Use Effect to handle enter key for chat
    const handleChatKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    // Pre-join Lobby Screen
    if (!isConnected) {
        return (
            <Card className={cn(
                "overflow-hidden border-none shadow-2xl bg-slate-950 text-white relative h-full flex flex-col",
                className
            )}>
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

                {/* Lobby Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 gap-8">
                    {error ? (
                        <div className="flex flex-col items-center gap-4 max-w-md text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
                                <AlertCircle className="h-10 w-10 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Connection Issue</h3>
                                <p className="text-slate-400">{error}</p>
                            </div>
                            <Button onClick={joinRoom} disabled={isJoining} variant="secondary" className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-75 blur-lg animate-pulse" />
                                    <div className="relative h-24 w-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">
                                        <Video className="h-10 w-10 text-indigo-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">{courseName}</h3>
                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-3 py-1">
                                            Ready to join?
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                                <Button
                                    onClick={joinRoom}
                                    disabled={isJoining}
                                    size="lg"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-14 rounded-2xl shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30"
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            Join Classroom
                                            <ChevronRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={onLeave}
                                    variant="ghost"
                                    className="w-full text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer info */}
                <div className="p-4 text-center text-xs text-slate-600 relative z-10 border-t border-white/5">
                    <p>Powered by Learnity Live • Secure Connection</p>
                </div>
            </Card>
        );
    }

    // Active Session View
    return (
        <TooltipProvider>
            <div
                ref={containerRef}
                className={cn(
                    "relative flex flex-col bg-slate-950 overflow-hidden shadow-2xl transition-all duration-300",
                    isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "rounded-3xl h-[650px] border border-slate-800",
                    className
                )}
            >
                {/* Top Header Bar (Auto-hide) */}
                <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 hover:opacity-100 opacity-0 group-hover:opacity-100 flex justify-between items-start pointer-events-none hover:pointer-events-auto">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-md shadow-lg shadow-red-900/20">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                        </div>
                        <h3 className="text-white font-bold drop-shadow-md text-sm md:text-base tracking-tight truncate max-w-[300px] hidden sm:block">
                            {courseName}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto">
                        <Badge variant="outline" className="bg-black/40 border-slate-700 text-slate-300 backdrop-blur-md gap-2 h-9 px-3 rounded-full">
                            <Users className="h-3.5 w-3.5" />
                            {peers.length}
                        </Badge>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                                    onClick={toggleFullscreen}
                                >
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden relative group">

                    {/* Video Grid */}
                    <div className="flex-1 p-4 md:p-6 flex items-center justify-center transition-all duration-300">
                        <div className={cn(
                            "grid gap-4 w-full h-full max-h-full transition-all duration-500 ",
                            peers.length === 1 ? "grid-cols-1 max-w-4xl" : // Spotlight view for 1
                                peers.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                                    peers.length <= 4 ? "grid-cols-2" :
                                        peers.length <= 9 ? "grid-cols-2 md:grid-cols-3" :
                                            "grid-cols-3 md:grid-cols-4"
                        )}>
                            {peers.map((peer) => (
                                <div
                                    key={peer.id}
                                    className={cn(
                                        "relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all hover:border-slate-600 group/peer",
                                        peer.isLocal ? "ring-2 ring-indigo-500/50" : ""
                                    )}
                                >
                                    {peer.videoTrack ? (
                                        <video
                                            ref={(el) => {
                                                if (el && peer.videoTrack) {
                                                    hmsActions.attachVideo(peer.videoTrack, el);
                                                }
                                            }}
                                            autoPlay
                                            muted // Always mute to avoid echo, we handle audio separately if needed or rely on browser mixing
                                            playsInline
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover/peer:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950" />

                                            <div className={cn(
                                                "flex items-center justify-center rounded-full font-bold text-white shadow-2xl relative z-10 bg-gradient-to-br from-indigo-500 to-violet-600",
                                                peers.length > 4 ? "h-12 w-12 text-lg" : "h-24 w-24 text-4xl"
                                            )}>
                                                {peer.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Participant Label */}
                                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5 shadow-lg">
                                                {peer.isLocal && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
                                                <span className="text-xs font-semibold text-white truncate leading-none pb-0.5">
                                                    {peer.name} {peer.isLocal && '(You)'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Icons */}
                                        <div className="flex gap-2">
                                            {!peer.audioTrack && (
                                                <div className="h-8 w-8 rounded-lg bg-red-500/80 backdrop-blur-md flex items-center justify-center shadow-lg">
                                                    <MicOff className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Sidebar Overlay */}
                    <div className={cn(
                        "absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 transition-transform duration-300 ease-in-out z-40 flex flex-col shadow-2xl",
                        showChat ? "translate-x-0" : "translate-x-full",

                    )}>
                        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-white/5">
                            <h4 className="font-bold text-indigo-400 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" /> Discussion
                            </h4>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setShowChat(false)}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
                                        <MessageCircle className="h-12 w-12 mb-4" />
                                        <p className="text-sm">No messages yet</p>
                                        <p className="text-xs">Be the first to say hello!</p>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-bold text-indigo-300">{msg.senderName}</span>
                                            <span className="text-[10px] text-slate-500">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 text-sm leading-relaxed shadow-sm">
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-slate-800 bg-white/5">
                            <div className="flex gap-2 items-end">
                                <Input
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyDown={handleChatKeyDown}
                                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 min-h-[44px]"
                                />
                                <Button size="icon" onClick={sendMessage} className="h-11 w-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Floating Control Dock */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto transform transition-transform hover:scale-105 duration-300">

                        {/* Audio Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-12 w-12 rounded-xl transition-all duration-300",
                                        isAudioEnabled
                                            ? "bg-slate-800 text-white hover:bg-slate-700 hover:ring-2 hover:ring-indigo-500/50"
                                            : "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30"
                                    )}
                                    onClick={toggleAudio}
                                >
                                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700">
                                <p>{isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Video Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-12 w-12 rounded-xl transition-all duration-300",
                                        isVideoEnabled
                                            ? "bg-slate-800 text-white hover:bg-slate-700 hover:ring-2 hover:ring-indigo-500/50"
                                            : "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30"
                                    )}
                                    onClick={toggleVideo}
                                >
                                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700">
                                <p>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</p>
                            </TooltipContent>
                        </Tooltip>

                        <div className="w-px h-8 bg-white/10 mx-2" />

                        {/* Screen Share (Placeholder) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 transition-colors">
                                    <MonitorUp className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700"><p>Share Screen (Coming Soon)</p></TooltipContent>
                        </Tooltip>

                        {/* Chat Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-12 w-12 rounded-xl transition-all relative",
                                        showChat
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                            : "hover:bg-slate-800 text-slate-300"
                                    )}
                                    onClick={() => setShowChat(!showChat)}
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    {messages.length > 0 && !showChat && (
                                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-900" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700"><p>Chat</p></TooltipContent>
                        </Tooltip>

                        {/* More Options */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-slate-800 text-slate-300">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-300 mb-4 w-56 rounded-xl shadow-2xl p-2">
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Settings</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="focus:bg-indigo-600 focus:text-white rounded-lg cursor-pointer px-3 py-2.5" onClick={toggleFullscreen}>
                                    {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                                    {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-indigo-600 focus:text-white rounded-lg cursor-pointer px-3 py-2.5">
                                    <Settings className="mr-2 h-4 w-4" /> Device Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Leave Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl ml-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 hover:scale-105 transition-all"
                                    onClick={leaveRoom}
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-red-600 text-white border-red-700"><p>Leave Session</p></TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

// Wrapper with HMSRoomProvider
export function VideoRoom(props: VideoRoomProps) {
    return (
        <HMSRoomProvider>
            <VideoRoomContent {...props} />
        </HMSRoomProvider>
    );
}
