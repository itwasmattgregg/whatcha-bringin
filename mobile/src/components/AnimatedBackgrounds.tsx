import React from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type AnimatedBackgroundType =
  | 'confetti'
  | 'stars'
  | 'waves'
  | 'gradient'
  | 'particles'
  | 'rainbow'
  | 'aurora'
  | 'bubbles'
  | 'sparkles'
  | 'cosmic';

interface AnimatedBackgroundProps {
  type: AnimatedBackgroundType;
  style?: any;
}

export const ANIMATED_BACKGROUNDS: AnimatedBackgroundType[] = [
  'confetti',
  'stars',
  'waves',
  'gradient',
  'particles',
  'rainbow',
  'aurora',
  'bubbles',
  'sparkles',
  'cosmic',
];

export function AnimatedBackground({ type, style }: AnimatedBackgroundProps) {
  switch (type) {
    case 'confetti':
      return <ConfettiBackground style={style} />;
    case 'stars':
      return <StarsBackground style={style} />;
    case 'waves':
      return <WavesBackground style={style} />;
    case 'gradient':
      return <GradientBackground style={style} />;
    case 'particles':
      return <ParticlesBackground style={style} />;
    case 'rainbow':
      return <RainbowBackground style={style} />;
    case 'aurora':
      return <AuroraBackground style={style} />;
    case 'bubbles':
      return <BubblesBackground style={style} />;
    case 'sparkles':
      return <SparklesBackground style={style} />;
    case 'cosmic':
      return <CosmicBackground style={style} />;
    default:
      return <View style={style} />;
  }
}

// Confetti Background - Modern colorful falling confetti
function ConfettiBackground({ style }: { style?: any }) {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    animValue: new Animated.Value(0),
    delay: i * 100,
    left: `${(i * 13.7) % 100}%`,
    color: [
      '#FF6B9D',
      '#4ECDC4',
      '#FFE66D',
      '#FF6B6B',
      '#A8E6CF',
      '#FFD93D',
      '#95E1D3',
      '#F38181',
    ][i % 8],
    size: 8 + (i % 5) * 4,
  }));

  React.useEffect(() => {
    const animations = confettiPieces.map((piece) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(piece.delay),
          Animated.timing(piece.animValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }, style]}>
      {confettiPieces.map((piece, i) => {
        const translateY = piece.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-SCREEN_HEIGHT * 0.1, SCREEN_HEIGHT * 1.1],
        });
        const rotate = piece.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '720deg'],
        });
        const opacity = piece.animValue.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                left: piece.left as any,
                borderRadius: piece.size / 4,
                transform: [{ translateY }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Stars Background - Modern twinkling stars
function StarsBackground({ style }: { style?: any }) {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    animValue: new Animated.Value(Math.random()),
    left: `${(i * 7.3) % 100}%`,
    top: `${(i * 11.7) % 100}%`,
    size: 2 + (i % 3) * 2,
    delay: i * 50,
  }));

  React.useEffect(() => {
    const animations = stars.map((star) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(star.animValue, {
            toValue: 1,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(star.animValue, {
            toValue: 0.2,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#0a0e27' }, style]}>
      {stars.map((star, i) => {
        const opacity = star.animValue;
        const scale = star.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: '#fff',
                left: star.left as any,
                top: star.top as any,
                opacity,
                transform: [{ scale }],
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 3,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Waves Background - Modern fluid gradient waves
function WavesBackground({ style }: { style?: any }) {
  const wave1 = React.useRef(new Animated.Value(0)).current;
  const wave2 = React.useRef(new Animated.Value(0)).current;
  const wave3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
    Animated.loop(
      Animated.timing(wave2, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
    Animated.loop(
      Animated.timing(wave3, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const translateX1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH],
  });
  const translateX2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, 0],
  });
  const translateX3 = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#667eea' }, style]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '35%',
            backgroundColor: '#764ba2',
            borderRadius: 200,
            bottom: '0%',
            left: '-50%',
            transform: [{ translateX: translateX1 }],
            opacity: 0.6,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '40%',
            backgroundColor: '#f093fb',
            borderRadius: 200,
            bottom: '20%',
            left: '-50%',
            transform: [{ translateX: translateX2 }],
            opacity: 0.5,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '30%',
            backgroundColor: '#4facfe',
            borderRadius: 200,
            bottom: '40%',
            left: '-50%',
            transform: [{ translateX: translateX3 }],
            opacity: 0.4,
          },
        ]}
      />
    </View>
  );
}

// Gradient Background - Modern smooth color transitions
function GradientBackground({ style }: { style?: any }) {
  const anim1 = React.useRef(new Animated.Value(0)).current;
  const anim2 = React.useRef(new Animated.Value(0)).current;
  const anim3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(anim1, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim2, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim3, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(anim1, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim2, {
            toValue: 0,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim3, {
            toValue: 0,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const color1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['#667eea', '#764ba2'],
  });
  const color2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f093fb', '#4facfe'],
  });
  const color3 = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: ['#4facfe', '#00f2fe'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            backgroundColor: color1,
            opacity: 0.8,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            backgroundColor: color2,
            opacity: 0.6,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            backgroundColor: color3,
            opacity: 0.4,
          },
        ]}
      />
    </View>
  );
}

// Particles Background - Modern floating particles
function ParticlesBackground({ style }: { style?: any }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    animX: new Animated.Value(0),
    animY: new Animated.Value(0),
    animOpacity: new Animated.Value(0.3 + Math.random() * 0.7),
    left: `${(i * 7.3) % 100}%`,
    top: `${(i * 11.7) % 100}%`,
    size: 4 + (i % 4) * 3,
    color: ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd93d'][i % 5],
    duration: 3000 + Math.random() * 4000,
  }));

  React.useEffect(() => {
    const animations = particles.flatMap((particle) => [
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(particle.animX, {
              toValue: 1,
              duration: particle.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(particle.animY, {
              toValue: 1,
              duration: particle.duration * 1.3,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.sequence([
              Animated.timing(particle.animOpacity, {
                toValue: 1,
                duration: particle.duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.timing(particle.animOpacity, {
                toValue: 0.3,
                duration: particle.duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(particle.animX, {
              toValue: 0,
              duration: particle.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(particle.animY, {
              toValue: 0,
              duration: particle.duration * 1.3,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        ])
      ),
    ]);
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#1a1a3e' }, style]}>
      {particles.map((particle, i) => {
        const translateX = particle.animX.interpolate({
          inputRange: [0, 1],
          outputRange: [0, SCREEN_WIDTH * 0.15],
        });
        const translateY = particle.animY.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -SCREEN_WIDTH * 0.15],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: particle.color,
                left: particle.left as any,
                top: particle.top as any,
                opacity: particle.animOpacity,
                transform: [{ translateX }, { translateY }],
                shadowColor: particle.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Rainbow Background - Modern subtle rainbow gradient
function RainbowBackground({ style }: { style?: any }) {
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const colors = [
    { color: '#ff6b9d', angle: 0 },
    { color: '#ff8c42', angle: 30 },
    { color: '#ffd93d', angle: 60 },
    { color: '#a8e6cf', angle: 90 },
    { color: '#4ecdc4', angle: 120 },
    { color: '#45b7d1', angle: 150 },
    { color: '#96c8fb', angle: 180 },
    { color: '#c44569', angle: 210 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }, style]}>
      {colors.map((item, i) => {
        const scale = animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.1, 1],
        });
        const opacity = animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.6, 0.9, 0.6],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: '150%',
                height: '20%',
                backgroundColor: item.color,
                top: `${i * 12.5}%`,
                left: '-25%',
                borderRadius: 200,
                opacity,
                transform: [{ rotate }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Aurora Background - Modern realistic aurora effect
function AuroraBackground({ style }: { style?: any }) {
  const aurora1 = React.useRef(new Animated.Value(0)).current;
  const aurora2 = React.useRef(new Animated.Value(0)).current;
  const aurora3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(aurora1, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(aurora2, {
            toValue: 1,
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(aurora3, {
            toValue: 1,
            duration: 10000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(aurora1, {
            toValue: 0,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(aurora2, {
            toValue: 0,
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(aurora3, {
            toValue: 0,
            duration: 10000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const opacity1 = aurora1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });
  const opacity2 = aurora2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.7, 0.4],
  });
  const opacity3 = aurora3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.6, 0.2],
  });

  const translateX1 = aurora1.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.2, SCREEN_WIDTH * 0.2],
  });
  const translateX2 = aurora2.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.2, -SCREEN_WIDTH * 0.2],
  });
  const translateX3 = aurora3.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.1, SCREEN_WIDTH * 0.1],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#0a1929' }, style]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '180%',
            height: '50%',
            backgroundColor: '#00ff88',
            borderRadius: 300,
            top: '0%',
            left: '-40%',
            opacity: opacity1,
            transform: [{ translateX: translateX1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '45%',
            backgroundColor: '#0088ff',
            borderRadius: 300,
            top: '30%',
            left: '-50%',
            opacity: opacity2,
            transform: [{ translateX: translateX2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '160%',
            height: '40%',
            backgroundColor: '#ff00ff',
            borderRadius: 300,
            top: '50%',
            left: '-30%',
            opacity: opacity3,
            transform: [{ translateX: translateX3 }],
          },
        ]}
      />
    </View>
  );
}

// Bubbles Background - Modern floating bubbles
function BubblesBackground({ style }: { style?: any }) {
  const bubbles = Array.from({ length: 20 }, (_, i) => ({
    animY: new Animated.Value(0),
    animX: new Animated.Value(0),
    animScale: new Animated.Value(1),
    left: `${(i * 13.7) % 100}%`,
    size: 20 + (i % 6) * 15,
    delay: i * 300,
    duration: 4000 + Math.random() * 3000,
  }));

  React.useEffect(() => {
    const animations = bubbles.flatMap((bubble) => [
      Animated.loop(
        Animated.sequence([
          Animated.delay(bubble.delay),
          Animated.parallel([
            Animated.timing(bubble.animY, {
              toValue: 1,
              duration: bubble.duration,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(bubble.animX, {
              toValue: 1,
              duration: bubble.duration * 1.5,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.sequence([
              Animated.timing(bubble.animScale, {
                toValue: 1.1,
                duration: bubble.duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.timing(bubble.animScale, {
                toValue: 0.9,
                duration: bubble.duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }),
            ]),
          ]),
          Animated.timing(bubble.animY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
          Animated.timing(bubble.animX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
          Animated.timing(bubble.animScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ),
    ]);
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#e0f2fe' }, style]}>
      {bubbles.map((bubble, i) => {
        const translateY = bubble.animY.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT * 1.1, -SCREEN_HEIGHT * 0.1],
        });
        const translateX = bubble.animX.interpolate({
          inputRange: [0, 1],
          outputRange: [0, SCREEN_WIDTH * 0.1],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                left: bubble.left as any,
                bottom: '0%',
                transform: [
                  { translateY },
                  { translateX },
                  { scale: bubble.animScale },
                ],
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Sparkles Background - Modern twinkling sparkles
function SparklesBackground({ style }: { style?: any }) {
  const sparkles = Array.from({ length: 60 }, (_, i) => ({
    animOpacity: new Animated.Value(Math.random() * 0.5),
    animScale: new Animated.Value(0.5 + Math.random() * 0.5),
    left: `${(i * 6.7) % 100}%`,
    top: `${(i * 8.3) % 100}%`,
    size: 3 + (i % 3) * 2,
    delay: i * 30,
    duration: 800 + Math.random() * 1200,
    color: ['#fff', '#ffd700', '#ff6b9d', '#4ecdc4'][i % 4],
  }));

  React.useEffect(() => {
    const animations = sparkles.flatMap((sparkle) => [
      Animated.loop(
        Animated.sequence([
          Animated.delay(sparkle.delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(sparkle.animOpacity, {
                toValue: 1,
                duration: sparkle.duration,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.timing(sparkle.animOpacity, {
                toValue: 0.2,
                duration: sparkle.duration,
                easing: Easing.in(Easing.ease),
                useNativeDriver: false,
              }),
            ]),
            Animated.sequence([
              Animated.timing(sparkle.animScale, {
                toValue: 1.5,
                duration: sparkle.duration,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
              }),
              Animated.timing(sparkle.animScale, {
                toValue: 0.8,
                duration: sparkle.duration,
                easing: Easing.in(Easing.ease),
                useNativeDriver: false,
              }),
            ]),
          ]),
        ])
      ),
    ]);
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#0a0a1a' }, style]}>
      {sparkles.map((sparkle, i) => (
        <Animated.View
          key={i}
          style={[
            {
              position: 'absolute',
              width: sparkle.size,
              height: sparkle.size,
              borderRadius: sparkle.size / 2,
              backgroundColor: sparkle.color,
              left: sparkle.left as any,
              top: sparkle.top as any,
              opacity: sparkle.animOpacity,
              transform: [{ scale: sparkle.animScale }],
              shadowColor: sparkle.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Cosmic Background
function CosmicBackground({ style }: { style?: any }) {
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#000428' }, style]}>
      <Animated.View
        style={[
          styles.cosmicRing,
          {
            transform: [{ rotate }, { scale }],
            borderColor: '#ff00ff',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.cosmicRing,
          {
            transform: [
              {
                rotate: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                }),
              },
              { scale },
            ],
            borderColor: '#00ffff',
            width: '60%',
            height: '60%',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cosmicRing: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 200,
    borderWidth: 3,
    top: '10%',
    left: '10%',
  },
});
