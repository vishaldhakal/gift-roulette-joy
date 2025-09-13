import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Play, RotateCcw } from 'lucide-react';

// Import prize images
import trophyImg from '@/assets/prize-trophy.png';
import coinsImg from '@/assets/prize-coins.png';
import diamondImg from '@/assets/prize-diamond.png';
import starImg from '@/assets/prize-star.png';
import carImg from '@/assets/prize-car.png';
import giftImg from '@/assets/prize-gift.png';

interface Prize {
  id: string;
  name: string;
  image: string;
  value: string;
}

const prizes: Prize[] = [
  { id: '1', name: 'Golden Trophy', image: trophyImg, value: '🏆 Grand Prize' },
  { id: '2', name: 'Gold Coins', image: coinsImg, value: '💰 $1000' },
  { id: '3', name: 'Diamond Ring', image: diamondImg, value: '💎 Luxury' },
  { id: '4', name: 'Lucky Star', image: starImg, value: '⭐ Bonus' },
  { id: '5', name: 'Sports Car', image: carImg, value: '🚗 Mega Prize' },
  { id: '6', name: 'Mystery Gift', image: giftImg, value: '🎁 Surprise' },
];

// Duplicate prizes to create seamless scrolling
const extendedPrizes = [...prizes, ...prizes, ...prizes, ...prizes];

export const LuckySpinner = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context for web audio
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playSpinSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const playWinSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  };

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);
    playSpinSound();
    
    if (spinnerRef.current) {
      const spinner = spinnerRef.current;
      
      // Reset position
      spinner.style.transform = 'translateY(0px)';
      spinner.style.transition = 'none';
      
      // Force reflow
      spinner.offsetHeight;
      
      // Calculate random winner
      const winnerIndex = Math.floor(Math.random() * prizes.length);
      const selectedPrize = prizes[winnerIndex];
      
      // Calculate spin distance (multiple full rotations + winner position)
      const prizeHeight = 120; // Height of each prize item
      const spinCycles = 8 + Math.random() * 4; // 8-12 full cycles
      const finalPosition = (winnerIndex * prizeHeight) + (spinCycles * prizes.length * prizeHeight);
      
      // Apply spinning animation
      spinner.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      spinner.style.transform = `translateY(-${finalPosition}px)`;
      
      // Show spinning feedback
      toast("🎰 Spinning the wheel of fortune...");
      
      // Wait for animation to complete
      setTimeout(() => {
        setWinner(selectedPrize);
        setShowWinner(true);
        setIsSpinning(false);
        playWinSound();
        toast(`🎉 Congratulations! You won: ${selectedPrize.name}!`);
      }, 4000);
    }
  };

  const reset = () => {
    setWinner(null);
    setShowWinner(false);
    setIsSpinning(false);
    
    if (spinnerRef.current) {
      spinnerRef.current.style.transform = 'translateY(0px)';
      spinnerRef.current.style.transition = 'none';
    }
    
    toast("🔄 Spinner reset - Ready to play again!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">
          🎰 Lucky Draw Spinner
        </h1>
        <p className="text-xl text-muted-foreground">
          Spin the wheel and win amazing prizes!
        </p>
      </div>

      {/* Main Spinner Container */}
      <Card className="relative w-80 h-96 overflow-hidden border-2 border-gold shadow-gold bg-gradient-purple">
        {/* Center indicator */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gold shadow-intense z-20 transform -translate-y-1/2">
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full shadow-intense animate-glow-pulse"></div>
        </div>
        
        {/* Spinner items */}
        <div 
          ref={spinnerRef}
          className="flex flex-col"
          style={{ willChange: 'transform' }}
        >
          {extendedPrizes.map((prize, index) => (
            <div
              key={`${prize.id}-${index}`}
              className="h-30 flex items-center justify-center p-4 border-b border-purple/20 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="w-16 h-16 object-contain"
                />
                <span className="text-sm font-semibold text-foreground">
                  {prize.name}
                </span>
                <span className="text-xs text-gold font-bold">
                  {prize.value}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for blur effect */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none"></div>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          onClick={spin}
          disabled={isSpinning}
          size="lg"
          className="bg-gradient-gold text-primary-foreground hover:shadow-intense transition-all duration-300 disabled:opacity-50"
        >
          <Play className="w-5 h-5 mr-2" />
          {isSpinning ? 'Spinning...' : 'Spin Now!'}
        </Button>
        
        <Button
          onClick={reset}
          variant="outline"
          size="lg"
          className="border-gold text-gold hover:bg-gold hover:text-primary-foreground transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Winner Display */}
      {showWinner && winner && (
        <Card className="mt-8 p-6 bg-gradient-winner border-2 border-gold shadow-intense animate-glow-pulse">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              🎉 WINNER! 🎉
            </h2>
            <div className="flex flex-col items-center gap-4">
              <img 
                src={winner.image} 
                alt={winner.name}
                className="w-24 h-24 object-contain animate-glow-pulse"
              />
              <div>
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {winner.name}
                </h3>
                <p className="text-lg text-primary-foreground/80">
                  {winner.value}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          Click "Spin Now!" to start the lucky draw. The spinner will accelerate and then slow down to reveal your prize!
        </p>
      </div>
    </div>
  );
};