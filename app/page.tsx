"use client";

import { CalendarIcon, FileTextIcon, GlobeIcon, InputIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { Globe } from "@/components/ui/globe";
import { Particles } from "@/components/ui/particles";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { WordRotate } from "@/components/ui/word-rotate";
import { AnimatedList } from "@/components/ui/animated-list";
import { ScrollVelocityRow } from "@/components/ui/scroll-based-velocity";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ShinyButton } from "@/components/ui/shiny-button";

const features = [
  {
    Icon: FileTextIcon,
    name: "Comprehensive Data",
    description: "Access detailed insights on thousands of US undergraduate institutions.",
    href: "/schools",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {["Harvard", "MIT", "Stanford", "Yale", "Princeton"].map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f}
                </figcaption>
              </div>
            </div>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: InputIcon,
    name: "Smart Search",
    description: "Find the perfect school with our advanced filtering system.",
    href: "/schools",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedList className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105">
         <div className="flex flex-row items-center gap-3 rounded-2xl p-3 bg-white dark:bg-black shadow-sm w-full max-w-[300px] ml-auto mr-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB800]">
              <span className="text-lg">🎓</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
                <span className="text-sm sm:text-lg">University of California</span>
                <span className="mx-1">·</span>
                <span className="text-xs text-gray-500">Just now</span>
              </figcaption>
              <p className="text-sm font-normal dark:text-white/60">
                Added to your favorites
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 rounded-2xl p-3 bg-white dark:bg-black shadow-sm w-full max-w-[300px] ml-auto mr-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00C9A7]">
              <span className="text-lg">🏫</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
                <span className="text-sm sm:text-lg">New York University</span>
                <span className="mx-1">·</span>
                <span className="text-xs text-gray-500">5m ago</span>
              </figcaption>
              <p className="text-sm font-normal dark:text-white/60">
                Application deadline approaching
              </p>
            </div>
          </div>
      </AnimatedList>
    ),
  },
  {
    Icon: GlobeIcon,
    name: "International Focus",
    description: "Resources and tools designed specifically for non-US students.",
    href: "/schools",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <Globe className="top-0 h-[600px] w-[600px] transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] group-hover:scale-105 sm:left-40" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Admission Cycles",
    description: "Stay on top of important dates and deadlines.",
    href: "/schools",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105" />
    ),
  },
];

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <header className="absolute top-0 z-50 flex w-full items-center justify-between p-6 px-4 md:px-10 lg:px-20">
        <div className="text-xl font-bold">Uni</div>
        <div className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-muted-foreground sm:inline-block">
                {user.email}
              </span>
              <ShinyButton onClick={handleSignOut} className="bg-background">
                Log out
              </ShinyButton>
              <Link href="/schools">
                <InteractiveHoverButton>Dashboard</InteractiveHoverButton>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login">
                <ShinyButton className="bg-background">Log in</ShinyButton>
              </Link>
              <Link href="/login">
                <InteractiveHoverButton>Sign up</InteractiveHoverButton>
              </Link>
            </>
          )}
        </div>
      </header>

      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color="#000000"
        refresh
      />
      
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-32 md:px-10 lg:px-20">
        {/* Hero Section */}
        <div className="mb-32 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl">
            Find your dream
            <WordRotate
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl text-primary mt-2"
              words={["University", "College", "School", "Future"]}
            />
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The ultimate platform for international students to discover and apply to 
            undergraduate universities in the United States.
          </p>
          <div className="mt-12 flex gap-4">
            <RainbowButton onClick={() => router.push(user ? '/schools' : '/login')}>
              Start Exploring
            </RainbowButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl">
          <BentoGrid>
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </div>

        {/* Trusted By Section */}
        <div className="mt-32 w-full max-w-6xl">
          <h2 className="mb-16 text-center text-2xl font-semibold text-muted-foreground">
            Empowering students from
          </h2>
          <div className="w-full">
            <ScrollVelocityRow 
              baseVelocity={1} 
              className="font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]"
            >
              {["South Korea", "China", "India", "Brazil", "Vietnam", "Canada", "Nigeria", "Japan", "Germany", "France"].map((country) => (
                <span key={country} className="mx-8 text-xl font-medium text-muted-foreground/50">
                  {country}
                </span>
              ))}
            </ScrollVelocityRow>
          </div>
        </div>
      </main>
    </div>
  );
}

