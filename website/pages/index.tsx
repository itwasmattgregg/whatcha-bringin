import Head from 'next/head';
import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Screenshots from '../components/Screenshots';

export default function Home() {
  return (
    <>
      <Head>
        <title>Watcha Bringin - Plan Perfect Potluck Gatherings</title>
        <meta
          name="description"
          content="Watcha Bringin makes planning potluck gatherings with friends easy and fun. Coordinate who's bringing what, send invites, and never have duplicate dishes again!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Hero />
        <Features />
        <Screenshots />
      </main>
    </>
  );
}

