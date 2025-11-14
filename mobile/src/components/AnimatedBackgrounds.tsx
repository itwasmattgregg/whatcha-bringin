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
  | 'rainbowSwirl'
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
  'rainbowSwirl',
  'aurora',
  'bubbles',
  'sparkles',
  'cosmic',
];

export function AnimatedBackground({ type, style }: AnimatedBackgroundProps) {
  const Component = BACKGROUND_COMPONENTS[type];
  if (!Component) {
    return <View style={style} />;
  }
  return <Component style={style} />;
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
        duration: 14000,
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
          outputRange: [1, 1.05, 1],
        });
        const opacity = animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.45, 0.85, 0.45],
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                width: '300%',
                height: '22%',
                backgroundColor: item.color,
                top: `${i * 12.5}%`,
                left: '-100%',
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

// Rainbow Swirl Background - tie-dye cyclone
function RainbowSwirlBackground({ style }: { style?: any }) {
  const warp = React.useRef(new Animated.Value(0)).current;
  const ripple = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(warp, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(ripple, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const rotate = warp.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const rippleScale = ripple.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.08, 0.95],
  });

  const swirlColors = [
    '#ff6b6b',
    '#ffd166',
    '#06d6a0',
    '#118ab2',
    '#ef476f',
    '#a855f7',
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.swirlTieDyeBase}>
        <View style={styles.swirlTieDyeGlowOne} />
        <View style={styles.swirlTieDyeGlowTwo} />
      </View>
      <Animated.View
        style={[
          styles.swirlTieDyeCore,
          {
            transform: [{ rotate }, { scale: rippleScale }],
          },
        ]}
      >
        {swirlColors.map((color, index) => (
          <View
            key={`${color}-${index}`}
            style={[
              styles.swirlTieDyeBand,
              {
                backgroundColor: color,
                transform: [
                  { rotate: `${index * (360 / swirlColors.length)}deg` },
                  { scale: 1 + index * 0.12 },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.swirlTieDyeBlend,
                { backgroundColor: `${color}33` },
              ]}
            />
          </View>
        ))}
        <View style={styles.swirlTieDyeTexture} />
      </Animated.View>
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

// Bubbles Background - Bright airy float party
function BubblesBackground({ style }: { style?: any }) {
  const palette = [
    '#FF9AA2',
    '#FFB7B2',
    '#FFDAC1',
    '#E2F0CB',
    '#B5EAD7',
    '#C7CEEA',
  ];

  const bubbles = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const progress = new Animated.Value(Math.random());
        return {
          progress,
          size: 30 + (i % 5) * 16,
          left: (i * 17) % 100,
          drift: 12 + (i % 3) * 6,
          duration: 5200 + Math.random() * 3200,
          delay: i * 120,
          color: palette[i % palette.length],
        };
      }),
    []
  );

  React.useEffect(() => {
    const animations = bubbles.map((bubble) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(bubble.delay),
          Animated.timing(bubble.progress, {
            toValue: 1,
            duration: bubble.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(bubble.progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, [bubbles]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.bubblesBaseLight}>
        <View style={styles.bubblesSunGlow} />
        <View style={styles.bubblesShadow} />
      </View>
      {bubbles.map((bubble, index) => {
        const translateY = bubble.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT * 0.7, -SCREEN_HEIGHT * 0.2],
        });
        const translateX = bubble.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [
            -bubble.drift,
            bubble.drift * (index % 2 === 0 ? 1 : -1),
          ],
        });
        const scale = bubble.progress.interpolate({
          inputRange: [0, 0.3, 0.6, 1],
          outputRange: [0.85, 1.05, 0.95, 1.1],
        });
        const opacity = bubble.progress.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 0.9, 0.9, 0],
        });

        const rotate = bubble.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', index % 2 === 0 ? '25deg' : '-25deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.bubble,
              {
                width: bubble.size,
                height: bubble.size,
                left: `${bubble.left}%`,
                backgroundColor: `${bubble.color}55`,
                borderColor: `${bubble.color}aa`,
                shadowColor: bubble.color,
                opacity,
                transform: [
                  { translateY },
                  { translateX },
                  { scale },
                  { rotate },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.bubbleInner,
                { backgroundColor: `${bubble.color}40` },
              ]}
            />
            <View
              style={[
                styles.bubbleHighlight,
                {
                  borderColor: `${bubble.color}80`,
                },
              ]}
            />
          </Animated.View>
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

const BACKGROUND_COMPONENTS: Record<
  AnimatedBackgroundType,
  React.ComponentType<{ style?: any }>
> = {
  confetti: ConfettiBackground,
  stars: StarsBackground,
  waves: WavesBackground,
  gradient: GradientBackground,
  particles: ParticlesBackground,
  rainbow: RainbowBackground,
  rainbowSwirl: RainbowSwirlBackground,
  aurora: AuroraBackground,
  bubbles: BubblesBackground,
  sparkles: SparklesBackground,
  cosmic: CosmicBackground,
};

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
  bubble: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleInner: {
    width: '60%',
    height: '60%',
    borderRadius: 999,
  },
  bubblesHighlight: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubblesBaseLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FBFF',
  },
  bubblesSunGlow: {
    position: 'absolute',
    top: -100,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  bubblesShadow: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: 'rgba(214, 238, 255, 0.6)',
  },
  bubbleHighlight: {
    position: 'absolute',
    width: '140%',
    height: '140%',
    borderRadius: 999,
    borderWidth: 0.7,
  },
  swirlTieDyeBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fdf6f0',
  },
  swirlTieDyeGlowOne: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  swirlTieDyeGlowTwo: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  swirlTieDyeCore: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    width: '90%',
    height: '90%',
    borderRadius: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swirlTieDyeBand: {
    position: 'absolute',
    width: '320%',
    height: 120,
    borderRadius: 120,
    opacity: 0.8,
  },
  swirlTieDyeBlend: {
    flex: 1,
    borderRadius: 120,
  },
  swirlTieDyeTexture: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: SCREEN_WIDTH * 0.7,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
